#requires -Version 7.0
[CmdletBinding()]
param(
    [ValidateRange(60, 1800)]
    [int]$SessionTimeoutSeconds = 300
)

$ErrorActionPreference = 'Stop'

# This is a test-only supervisor. It passes fixed prompts to Codex, waits for
# each child, saves stdout/stderr, and checks filesystem checkpoints. It never
# evaluates or executes text returned by a model.
$expectedProjectRoot = 'C:\Users\brand\OneDrive\Documents\d-day-omaha-beach-audioguide_TESTv1\d-day-omaha-beach-audioguide_TESTv1'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if (-not [string]::Equals($projectRoot.TrimEnd('\'), $expectedProjectRoot.TrimEnd('\'), [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to run outside the TESTv1 project: $projectRoot"
}

$branch = (& git -C $projectRoot branch --show-current 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0) { throw "Could not read the current Git branch: $branch" }
if ($branch -ne 'codex/overnight-audio-highlight') {
    throw "Expected branch codex/overnight-audio-highlight; found '$branch'. No test session was started."
}

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this test from a normal, non-elevated PowerShell window.'
}

$groups = (& whoami.exe /groups 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0) { throw "Could not inspect the PowerShell integrity level: $groups" }
if ($groups -match 'S-1-16-4096') {
    throw 'This PowerShell process has Low integrity and is still sandboxed. Open a normal PowerShell window and rerun.'
}
if ($groups -notmatch 'S-1-16-8192') {
    throw 'Could not confirm a normal Medium-integrity PowerShell process. No child session was started.'
}
if ($env:CODEX_SANDBOX_NETWORK_DISABLED -eq '1') {
    throw 'This shell inherited the Codex sandbox environment. Open a normal PowerShell window and rerun.'
}

$codexCommand = Get-Command codex -CommandType Application -ErrorAction Stop
$codexPath = $codexCommand.Source
if (-not $codexPath -or [IO.Path]::GetExtension($codexPath) -ine '.exe' -or -not (Test-Path -LiteralPath $codexPath -PathType Leaf)) {
    throw "Get-Command codex did not resolve to a directly launchable .exe: '$codexPath'. No child session was started."
}
$versionOutput = (& $codexPath --version 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0) { throw "codex --version failed: $versionOutput" }
$execHelp = (& $codexPath exec --help 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0) { throw 'codex exec --help failed.' }
foreach ($requiredOption in @('--approve-for-me', '--cd', '--skip-git-repo-check', '--json', '--output-last-message')) {
    if ($execHelp -notmatch [regex]::Escape($requiredOption)) {
        throw "This CLI help does not list required option $requiredOption. No child session was started."
    }
}

# Keep all model-visible files in a fresh temporary workspace. --approve-for-me
# implicitly selects on-request + workspace-write, so --sandbox is intentionally
# omitted (the two flags conflict in this CLI).
$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('Codex Loop Test ' + [guid]::NewGuid().ToString('N'))
$logRoot = Join-Path $testRoot 'logs'
New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
$eventLog = Join-Path $logRoot 'parent-events.jsonl'
$summaryPath = Join-Path $testRoot 'summary.json'
$script:sessionResults = [Collections.Generic.List[object]]::new()
$script:codexPath = $codexPath
$script:testRoot = $testRoot
$script:logRoot = $logRoot
$script:eventLog = $eventLog
$script:timeoutMs = $SessionTimeoutSeconds * 1000

function Write-ParentEvent([hashtable]$Event) {
    $Event.timestampUtc = [DateTimeOffset]::UtcNow.ToString('o')
    Add-Content -LiteralPath $script:eventLog -Value ($Event | ConvertTo-Json -Compress -Depth 5) -Encoding utf8
}

function Test-CheckpointContent([string]$Path, [string]$ExpectedContent) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }

    $bytes = [IO.File]::ReadAllBytes($Path)
    $byteOffset = 0
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $byteOffset = 3
    }
    $utf8 = [Text.UTF8Encoding]::new($false, $true)
    $actualContent = $utf8.GetString($bytes, $byteOffset, $bytes.Length - $byteOffset)
    return [string]::Equals($actualContent, $ExpectedContent, [StringComparison]::Ordinal) -or
        [string]::Equals($actualContent, ($ExpectedContent + "`n"), [StringComparison]::Ordinal) -or
        [string]::Equals($actualContent, ($ExpectedContent + "`r`n"), [StringComparison]::Ordinal)
}

function Invoke-CodexTestSession([string]$Name, [string]$Prompt, [switch]$ForceFinalOutputError) {
    $stdoutPath = Join-Path $script:logRoot ($Name + '.stdout.jsonl')
    $stderrPath = Join-Path $script:logRoot ($Name + '.stderr.log')
    $lastMessagePath = Join-Path $script:logRoot ($Name + '.last-message.txt')
    $lastMessageTarget = if ($ForceFinalOutputError) { $script:testRoot } else { $lastMessagePath }

    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $script:codexPath
    $startInfo.WorkingDirectory = $script:testRoot
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true

    foreach ($argument in @(
        'exec',
        '--approve-for-me',
        '--cd', $script:testRoot,
        '--skip-git-repo-check',
        '--json',
        '--output-last-message', $lastMessageTarget,
        $Prompt
    )) {
        [void]$startInfo.ArgumentList.Add([string]$argument)
    }

    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    $startedAt = [DateTimeOffset]::UtcNow
    $timedOut = $false
    $processStarted = $false
    $exitCode = $null
    $failureText = $null
    $stdout = ''
    $stderr = ''
    $stdoutTask = $null
    $stderrTask = $null

    try {
        if (-not $process.Start()) { throw "Could not start Codex child '$Name'." }
        $processStarted = $true
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()

        if (-not $process.WaitForExit($script:timeoutMs)) {
            $timedOut = $true
            $process.Kill($true)
            $process.WaitForExit()
        }
        $stdout = $stdoutTask.GetAwaiter().GetResult()
        $stderr = $stderrTask.GetAwaiter().GetResult()
        if (-not $timedOut) { $exitCode = $process.ExitCode }
    }
    catch {
        $failureText = $_.Exception.Message
        if ($processStarted -and $process -and -not $process.HasExited) {
            try { $process.Kill($true); $process.WaitForExit() } catch { }
        }
        $exitCode = 125
    }
    finally {
        if ($stdoutTask) { try { $stdout = $stdoutTask.GetAwaiter().GetResult() } catch { } }
        if ($stderrTask) { try { $stderr = $stderrTask.GetAwaiter().GetResult() } catch { } }
        $process.Dispose()
    }

    [IO.File]::WriteAllText($stdoutPath, $stdout, [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText($stderrPath, $stderr, [Text.UTF8Encoding]::new($false))
    $elapsedSeconds = [Math]::Round(([DateTimeOffset]::UtcNow - $startedAt).TotalSeconds, 1)
    $combinedOutput = "$stdout`n$stderr`n$failureText"
    $controlledOutputErrorObserved = $false
    if ($ForceFinalOutputError) {
        foreach ($stderrLine in ($stderr -split "`r?`n")) {
            $normalizedStderrLine = $stderrLine
            while ($normalizedStderrLine.Contains('\\')) {
                $normalizedStderrLine = $normalizedStderrLine.Replace('\\', '\')
            }
            if ($normalizedStderrLine -match '(?i)Failed to write last message file' -and
                $normalizedStderrLine -match '(?i)os error\s*5\b' -and
                $normalizedStderrLine.IndexOf($lastMessageTarget, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $controlledOutputErrorObserved = $true
                break
            }
        }
    }
    $failureClass = if (-not $processStarted) {
        'process-start'
    } elseif ($combinedOutput -match '(?i)(authentication failed|not authenticated|unauthorized|\b401\b|login required|access token|api key)') {
        'authentication'
    } elseif ($combinedOutput -match '(?i)(failed to initialize in-process app-server|failed to open state db|sqlite|state db|database is locked|os error: 5)') {
        'sqlite-or-app-server-initialization'
    } elseif ($timedOut) {
        'timed-out'
    } elseif ($controlledOutputErrorObserved) {
        'controlled-final-output-error-confirmed'
    } elseif ($exitCode -eq 0) {
        'none'
    } elseif ($failureText) {
        'process-runtime-error'
    } else {
        'child-nonzero'
    }
    $result = [pscustomobject]@{
        name = $Name
        exitCode = $exitCode
        timedOut = $timedOut
        processStarted = $processStarted
        failureClass = $failureClass
        elapsedSeconds = $elapsedSeconds
        expectedFinalOutputError = [bool]$ForceFinalOutputError
        lastMessageTarget = $lastMessageTarget
        controlledOutputErrorObserved = [bool]$controlledOutputErrorObserved
        stdoutLog = $stdoutPath
        stderrLog = $stderrPath
        lastMessage = $(if ($ForceFinalOutputError) { $null } elseif (Test-Path -LiteralPath $lastMessagePath) { $lastMessagePath } else { $null })
        failure = $failureText
    }
    $script:sessionResults.Add($result)
    Write-ParentEvent @{ kind = 'child-exit'; session = $Name; exitCode = $exitCode; timedOut = $timedOut; processStarted = $processStarted; failureClass = $failureClass; elapsedSeconds = $elapsedSeconds; failure = $failureText }
    return $result
}

$control1 = Join-Path $testRoot 'checkpoint 1.txt'
$control2 = Join-Path $testRoot 'checkpoint 2.txt'
$continuity = Join-Path $testRoot 'continuity.txt'
$failureConfirmation = Join-Path $testRoot 'controlled failure confirmation.txt'
$recovery = Join-Path $testRoot 'recovery.txt'
$runSucceeded = $false
$mainFailure = $null
$exitStatus = 0

try {
    Write-ParentEvent @{ kind = 'preflight'; codexVersion = $versionOutput; branch = $branch; processIntegrity = 'Medium'; childSandbox = 'approve-for-me (on-request + workspace-write)'; workingRoot = $testRoot }

    $s1 = Invoke-CodexTestSession '01-checkpoint-one' "In this temporary workspace, create only the file '$control1' containing exactly CHECKPOINT 1 OK. Do not modify any other file. Do not run unrelated commands. Reply briefly when done."
    if ($s1.exitCode -ne 0 -or $s1.timedOut -or -not (Test-CheckpointContent $control1 'CHECKPOINT 1 OK')) {
        throw 'Session 1 did not create the expected checkpoint with exit code 0.'
    }

    $s2 = Invoke-CodexTestSession '02-checkpoint-two' "Read '$control1' and confirm it contains exactly CHECKPOINT 1 OK. Then create only '$control2' containing exactly CHECKPOINT 2 OK. Do not modify any other file. Reply briefly when done."
    if ($s2.exitCode -ne 0 -or $s2.timedOut -or -not (Test-CheckpointContent $control2 'CHECKPOINT 2 OK')) {
        throw 'Session 2 did not resume from checkpoint 1 and create checkpoint 2.'
    }

    $s3 = Invoke-CodexTestSession '03-check-continuity-and-logs' "Read '$control1' and '$control2'. Confirm they contain CHECKPOINT 1 OK and CHECKPOINT 2 OK respectively. Also confirm that '$($s1.stdoutLog)' and '$($s2.stdoutLog)' exist and are non-empty logs. After these checks, write '$continuity' using exactly this statement: [System.IO.File]::WriteAllText((Join-Path (Get-Location) 'continuity.txt'), 'THREE SESSIONS AND LOGS VERIFIED', [System.Text.UTF8Encoding]::new(`$false)). Then reread the file and verify its content is strictly identical to the expected string, with no punctuation and no trailing newline. Do not append a period or any other character. Do not modify any other file. Reply briefly when done."
    if ($s3.exitCode -ne 0 -or $s3.timedOut -or -not (Test-CheckpointContent $continuity 'THREE SESSIONS AND LOGS VERIFIED')) {
        throw 'Session 3 did not verify continuity and the first two session logs.'
    }
    foreach ($log in @($s1.stdoutLog, $s2.stdoutLog)) {
        if (-not (Test-Path -LiteralPath $log) -or (Get-Item -LiteralPath $log).Length -le 0) {
            throw "Expected non-empty child stdout log missing: $log"
        }
    }

    # Controlled child-process failure: use the documented output path option,
    # but point it at the existing workspace directory. Codex can complete its
    # read-only turn; writing its final-message file to a directory should fail.
    # The parent records the nonzero exit and continues only from the last
    # verified checkpoint. No shell command from the model is ever re-executed.
    $failed = Invoke-CodexTestSession '04-controlled-final-output-error' "Read '$continuity' and verify it contains exactly THREE SESSIONS AND LOGS VERIFIED. Then create only '$failureConfirmation' containing exactly CONTROLLED FAILURE CHECKPOINT VERIFIED. Do not change any other file. Reply briefly." -ForceFinalOutputError
    $confirmationIsValid = Test-CheckpointContent $failureConfirmation 'CONTROLLED FAILURE CHECKPOINT VERIFIED'
    if (-not $failed.processStarted) {
        throw 'Session 4 did not start; its controlled failure cannot be confirmed.'
    }
    if ($failed.timedOut) {
        throw 'Session 4 timed out; its controlled failure cannot be confirmed.'
    }
    if (-not $confirmationIsValid) {
        throw 'Session 4 did not verify continuity and write the exact confirmation checkpoint.'
    }
    if (-not $failed.controlledOutputErrorObserved -or $failed.failureClass -ne 'controlled-final-output-error-confirmed') {
        throw "Session 4 stderr does not prove the expected last-message write failure for '$($failed.lastMessageTarget)'. See $($failed.stderrLog)."
    }
    Write-ParentEvent @{ kind = 'controlled-failure-verified'; session = $failed.name; exitCode = $failed.exitCode; timedOut = $failed.timedOut; failureClass = $failed.failureClass; confirmationFile = $failureConfirmation; confirmationText = 'CONTROLLED FAILURE CHECKPOINT VERIFIED' }

    $s5 = Invoke-CodexTestSession '05-recovery-from-checkpoint' "Verify '$control1' contains exactly CHECKPOINT 1 OK, '$control2' contains exactly CHECKPOINT 2 OK, '$continuity' contains exactly THREE SESSIONS AND LOGS VERIFIED, and '$failureConfirmation' contains exactly CONTROLLED FAILURE CHECKPOINT VERIFIED. Only if all four checks pass, create only '$recovery' containing exactly RECOVERY AFTER CONTROLLED FAILURE OK. Do not modify any other file. Reply briefly when done."
    $recoveryFilesAreValid =
        (Test-CheckpointContent $control1 'CHECKPOINT 1 OK') -and
        (Test-CheckpointContent $control2 'CHECKPOINT 2 OK') -and
        (Test-CheckpointContent $continuity 'THREE SESSIONS AND LOGS VERIFIED') -and
        (Test-CheckpointContent $failureConfirmation 'CONTROLLED FAILURE CHECKPOINT VERIFIED')
    if (-not $s5.processStarted -or $s5.exitCode -ne 0 -or $s5.timedOut -or -not $recoveryFilesAreValid -or -not (Test-CheckpointContent $recovery 'RECOVERY AFTER CONTROLLED FAILURE OK')) {
        throw 'Session 5 did not verify all four checkpoints and create the expected recovery file.'
    }

    if ($script:sessionResults.Count -ne 5) {
        throw "Expected five validated sessions; found $($script:sessionResults.Count)."
    }
    $runSucceeded = $true
}
catch {
    $mainFailure = $_.Exception.Message
    $exitStatus = 1
    try {
        Write-ParentEvent @{ kind = 'test-failure'; message = $mainFailure }
    }
    catch {
        $mainFailure = "$mainFailure (parent event log also failed: $($_.Exception.Message))"
    }
}
finally {
    $summary = [ordered]@{
        result = $(if ($runSucceeded) { 'SUCCESS' } else { 'FAIL' })
        codexVersion = $versionOutput
        branch = $branch
        parentIntegrity = 'Medium; non-administrator; Codex network-sandbox marker absent'
        childInvocation = 'codex exec --approve-for-me --cd <temporary workspace> --skip-git-repo-check --json --output-last-message <path> <prompt-as-final-argument>'
        explicitSandboxFlag = $false
        expectedChildSandbox = 'workspace-write (selected by --approve-for-me)'
        timeoutSecondsPerChild = $SessionTimeoutSeconds
        testWorkspace = $testRoot
        checkpoints = @($control1, $control2, $continuity, $recovery)
        controlledFailureConfirmation = $failureConfirmation
        eventsLog = $eventLog
        sessions = @($script:sessionResults)
        failure = $mainFailure
        note = 'The supervisor only launches codex.exe and records its exit/output. It never executes model-produced text. Codex child processes may update their own state database during normal startup; the supervisor does not access SQLite directly.'
    }
    try {
        $summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $summaryPath -Encoding utf8
        Write-Host "SUMMARY=$summaryPath"
        Write-Host "TEST_WORKSPACE=$testRoot"
        Write-Host "RESULT=$($summary.result)"
    }
    catch {
        $exitStatus = 2
        Write-Host "SUMMARY_WRITE_FAILED=$($_.Exception.Message)"
        Write-Host "TEST_WORKSPACE=$testRoot"
    }
}

if (-not $runSucceeded -and $exitStatus -eq 0) { $exitStatus = 1 }
exit $exitStatus
