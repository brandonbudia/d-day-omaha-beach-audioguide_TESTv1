#requires -Version 7.0
[CmdletBinding()]
param(
    [ValidateRange(1, 8)]
    [int]$MaxRuntimeHours = 8,

    [ValidateRange(5, 180)]
    [int]$SessionTimeoutMinutes = 45,

    [ValidateRange(1, 5)]
    [int]$MaxRecoverableFailures = 2,

    [string]$ResumeRunDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$expectedBranch = 'codex/overnight-audio-highlight'
$expectedRemote = 'https://github.com/brandonbudia/d-day-omaha-beach-audioguide_TESTv1.git'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$stateRoot = Join-Path $env:LOCALAPPDATA 'D-Day-Omaha-Beach-Audioguide\overnight'
$codexCommand = Get-Command codex -CommandType Application -ErrorAction Stop
$codexPath = $codexCommand.Source

$missions = @(
    [ordered]@{ id = '01-inventory'; title = 'Audit des 22 stations, audios, textes et langues'; instruction = 'Inspecter individuellement les 22 stations et les ressources des sept langues. Produire un inventaire factuel des textes, audios, images et traductions. Signaler toute ressource absente ou factice.'; acceptanceCriteria = @('Les 22 stations sont identifiees individuellement dans un inventaire.', 'Les ressources audio, transcription et langue sont relevees depuis le depot.', 'Les lacunes et incertitudes sont documentees sans extrapolation.') },
    [ordered]@{ id = '02-french-transcripts'; title = 'Verification et corrections des transcriptions francaises'; instruction = 'Priorite majeure : examiner chacune des 22 stations francaises. Chercher les textes sources, anciennes versions consultables en lecture seule dans Git, documents de reference, transcriptions completes, audios reels et sources externes deja referencees. Comparer chaque passage. Corriger uniquement ce qui est confirme par une source fiable, documenter chaque correction avec sa source et signaler les passages non verifies. Ne jamais declarer une station verifiee sans source fiable; ne jamais inventer ou completer un texte. Si les sources manquent, conserver la mission bloquee avec la liste exacte des fichiers ou informations requis et continuer les autres missions.'; acceptanceCriteria = @('Chaque station francaise est examinee individuellement avec ses sources disponibles.', 'Chaque correction est accompagnee de la source et de sa justification.', 'Aucune formulation non verifiee n est ajoutee.', 'Toute station ou tout passage restant non verifie est explicitement liste et la mission n est pas declaree terminee tant qu une station reste non verifiee.') },
    [ordered]@{ id = '03-word-sync'; title = 'Synchronisation audio mot par mot'; instruction = 'Examiner les timestamps existants, audios reels, transcriptions fiables et outils deja disponibles. Ajouter des reperes uniquement lorsqu ils correspondent de maniere fiable a la prononciation reelle. Ne jamais repartir artificiellement les timestamps. Signaler les passages impossibles a aligner.'; acceptanceCriteria = @('Les sources audio et transcription de chaque alignement sont identifiees.', 'Les reperes ne sont ajoutes que s ils sont fiables et verifiables.', 'Les divergences et passages non synchronises sont documentes.') },
    [ordered]@{ id = '04-other-languages'; title = 'Audit des six autres langues'; instruction = 'Verifier les ressources anglaises, allemandes, italiennes, polonaises, neerlandaises et espagnoles pour les 22 stations. Identifier audios factices, traductions absentes et incoherences sans inventer de traduction.'; acceptanceCriteria = @('Les six langues sont examinees station par station.', 'Les ressources absentes ou factices sont documentees.', 'Aucune traduction non verifiee n est inventee.') },
    [ordered]@{ id = '05-qr'; title = 'Experience QR code'; instruction = 'Verifier les parcours QR code, leur destination, leur lisibilite et leur utilisation mobile. Corriger uniquement les problemes constates sans supprimer de contenu existant.'; acceptanceCriteria = @('Les QR codes et destinations presents sont inventoriees.', 'Les parcours utiles sont verifies ou leurs limites documentees.', 'Les corrections sont verifiees sur les formats concernes.') },
    [ordered]@{ id = '06-quality'; title = 'Qualite, accessibilite et compatibilite'; instruction = 'Verifier les problemes concrets de fonctionnement, responsive design, accessibilite clavier et lecteur d ecran, performances et compatibilite. Prioriser les corrections utiles sans refactorisation hors sujet.'; acceptanceCriteria = @('Les controles pertinents sont executes et leurs resultats consignes.', 'Les regressions introduites sont corrigees ou documentees comme bloquees.', 'Les changements restent limites aux problemes constates.') },
    [ordered]@{ id = '07-documentation'; title = 'Documentation et verification finale'; instruction = 'Documenter le travail reellement effectue, ses sources, validations, incertitudes et taches restantes. Ne pas presenter une verification non executee comme reussie.'; acceptanceCriteria = @('Les modifications et sources sont documentees.', 'Les tests executes et non executes sont distingues.', 'Les incertitudes et taches restantes sont explicites.') }
)

if (-not ('CodexOvernight.NativeJob' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace CodexOvernight {
    public static class NativeJob {
        [StructLayout(LayoutKind.Sequential)]
        private struct BasicLimitInformation {
            public long PerProcessUserTimeLimit;
            public long PerJobUserTimeLimit;
            public uint LimitFlags;
            public UIntPtr MinimumWorkingSetSize;
            public UIntPtr MaximumWorkingSetSize;
            public uint ActiveProcessLimit;
            public UIntPtr Affinity;
            public uint PriorityClass;
            public uint SchedulingClass;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct IoCounters {
            public ulong ReadOperationCount;
            public ulong WriteOperationCount;
            public ulong OtherOperationCount;
            public ulong ReadTransferCount;
            public ulong WriteTransferCount;
            public ulong OtherTransferCount;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct ExtendedLimitInformation {
            public BasicLimitInformation BasicLimitInformation;
            public IoCounters IoInfo;
            public UIntPtr ProcessMemoryLimit;
            public UIntPtr JobMemoryLimit;
            public UIntPtr PeakProcessMemoryUsed;
            public UIntPtr PeakJobMemoryUsed;
        }

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern IntPtr CreateJobObject(IntPtr attributes, string name);
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool SetInformationJobObject(IntPtr job, int infoClass, ref ExtendedLimitInformation info, uint length);
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool CloseHandle(IntPtr handle);

        public static IntPtr CreateKillOnClose() {
            IntPtr job = CreateJobObject(IntPtr.Zero, null);
            if (job == IntPtr.Zero) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
            ExtendedLimitInformation info = new ExtendedLimitInformation();
            info.BasicLimitInformation.LimitFlags = 0x00002000; // JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
            if (!SetInformationJobObject(job, 9, ref info, (uint)Marshal.SizeOf(typeof(ExtendedLimitInformation)))) {
                int error = Marshal.GetLastWin32Error();
                CloseHandle(job);
                throw new System.ComponentModel.Win32Exception(error);
            }
            return job;
        }

        public static void Assign(IntPtr job, IntPtr process) {
            if (!AssignProcessToJobObject(job, process))
                throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        }

        public static void Close(IntPtr job) {
            if (job != IntPtr.Zero) CloseHandle(job);
        }
    }
}
'@
}

function Invoke-FixedGit([string[]]$Arguments, [switch]$AllowNonZero) {
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = 'git.exe'
    $startInfo.WorkingDirectory = $projectRoot
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    foreach ($argument in $Arguments) {
        [void]$startInfo.ArgumentList.Add($argument)
    }
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    if (-not $process.Start()) { throw "Could not start fixed Git inspection: $($Arguments -join ' ')" }
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    if (-not $process.WaitForExit(30000)) {
        $process.Kill($true)
        throw "Timed out running fixed Git inspection: $($Arguments -join ' ')"
    }
    $stdout = $stdoutTask.GetAwaiter().GetResult()
    $stderr = $stderrTask.GetAwaiter().GetResult()
    $exitCode = $process.ExitCode
    $process.Dispose()
    if ($AllowNonZero) {
        return [pscustomobject]@{ exitCode = $exitCode; stdout = $stdout.TrimEnd(); stderr = $stderr.TrimEnd() }
    }
    if ($exitCode -ne 0) { throw "Git inspection failed ($exitCode): $stderr" }
    return $stdout.TrimEnd()
}

function Write-RunEvent([string]$Kind, [hashtable]$Data) {
    $event = [ordered]@{
        timestampUtc = [DateTimeOffset]::UtcNow.ToString('o')
        kind = $Kind
        data = $Data
    }
    Add-Content -LiteralPath $script:eventLog -Value ($event | ConvertTo-Json -Compress -Depth 8) -Encoding utf8
}

function Save-RunState {
    $script:state.updatedAtUtc = [DateTimeOffset]::UtcNow.ToString('o')
    $json = $script:state | ConvertTo-Json -Depth 12
    [IO.File]::WriteAllText($script:statePath, $json, [Text.UTF8Encoding]::new($false))
}

function Get-NextMission {
    $catalog = @($script:state.missionCatalog)
    if ($catalog.Count -eq 0) { return $null }
    for ($offset = 0; $offset -lt $catalog.Count; $offset++) {
        $index = ($script:state.missionCursor + $offset) % $catalog.Count
        $id = $catalog[$index].id
        if ($script:state.missionStates[$id] -ne 'completed' -and $script:state.missionStates[$id] -ne 'blocked') {
            $script:state.missionCursor = $index
            return $catalog[$index]
        }
    }
    return $null
}

function Invoke-CodexSession([string]$Prompt, [int]$Sequence) {
    $stdoutPath = Join-Path $script:runDirectory ('session-{0:D3}.stdout.jsonl' -f $Sequence)
    $stderrPath = Join-Path $script:runDirectory ('session-{0:D3}.stderr.log' -f $Sequence)
    $answerPath = Join-Path $script:runDirectory ('session-{0:D3}.answer.json' -f $Sequence)

    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $codexPath
    $startInfo.WorkingDirectory = $projectRoot
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    foreach ($argument in @(
        'exec',
        '--approve-for-me',
        '--cd', $projectRoot,
        '--json',
        '--output-schema', $script:schemaPath,
        '--output-last-message', $answerPath,
        $Prompt
    )) {
        [void]$startInfo.ArgumentList.Add([string]$argument)
    }

    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    $startedAt = [DateTimeOffset]::UtcNow
    $timedOut = $false
    $started = $false
    $exitCode = $null
    $stdout = ''
    $stderr = ''
    $stdoutTask = $null
    $stderrTask = $null
    $jobHandle = [CodexOvernight.NativeJob]::CreateKillOnClose()
    try {
        if (-not $process.Start()) { throw 'Codex process did not start.' }
        $started = $true
        [CodexOvernight.NativeJob]::Assign($jobHandle, $process.Handle)
        $script:state.activeChild = [ordered]@{
            processId = $process.Id
            startedAtUtc = $process.StartTime.ToUniversalTime().ToString('o')
            missionId = $script:state.currentMissionId
            sessionType = $script:state.currentSessionType
        }
        Save-RunState
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        $remainingMs = [Math]::Max(1, [int]($script:deadlineUtc - [DateTimeOffset]::UtcNow).TotalMilliseconds)
        $timeoutMs = [Math]::Min($script:sessionTimeoutMs, $remainingMs)
        if (-not $process.WaitForExit($timeoutMs)) {
            $timedOut = $true
            $process.Kill($true)
            $process.WaitForExit()
        } else {
            $exitCode = $process.ExitCode
        }
        $stdout = $stdoutTask.GetAwaiter().GetResult()
        $stderr = $stderrTask.GetAwaiter().GetResult()
    } catch {
        $stderr += "`nSUPERVISOR_ERROR: $($_.Exception.Message)"
        if ($started -and -not $process.HasExited) {
            try { $process.Kill($true); $process.WaitForExit() } catch { }
        }
        if ($null -eq $exitCode) { $exitCode = 125 }
    } finally {
        if ($stdoutTask) { try { $stdout = $stdoutTask.GetAwaiter().GetResult() } catch { } }
        if ($stderrTask) { try { $stderr = $stderrTask.GetAwaiter().GetResult() } catch { } }
        $script:state.activeChild = $null
        try { Save-RunState } catch { }
        [CodexOvernight.NativeJob]::Close($jobHandle)
        $process.Dispose()
    }

    $header = "startedUtc=$($startedAt.ToString('o'))`r`n"
    [IO.File]::WriteAllText($stdoutPath, $header + $stdout, [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText($stderrPath, $header + $stderr, [Text.UTF8Encoding]::new($false))
    return [pscustomobject]@{
        started = $started
        timedOut = $timedOut
        exitCode = $exitCode
        elapsedSeconds = [Math]::Round(([DateTimeOffset]::UtcNow - $startedAt).TotalSeconds, 1)
        stdoutPath = $stdoutPath
        stderrPath = $stderrPath
        answerPath = $answerPath
    }
}

if ([Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Use a normal, non-elevated PowerShell 7 window.'
}
if ($env:CODEX_SANDBOX_NETWORK_DISABLED -eq '1') {
    throw 'This parent inherited a Codex sandbox marker. Start it from a normal PowerShell window.'
}
if ([IO.Path]::GetExtension($codexPath) -ine '.exe' -or -not (Test-Path -LiteralPath $codexPath -PathType Leaf)) {
    throw "Codex must resolve to a directly launchable .exe: $codexPath"
}

$gitRoot = Invoke-FixedGit @('rev-parse', '--show-toplevel')
$branch = Invoke-FixedGit @('branch', '--show-current')
$remote = Invoke-FixedGit @('remote', 'get-url', 'origin')
$head = Invoke-FixedGit @('rev-parse', 'HEAD')
$gitRootNormalized = [IO.Path]::GetFullPath($gitRoot.Trim()).TrimEnd([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar))
$projectRootNormalized = [IO.Path]::GetFullPath($projectRoot).TrimEnd([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar))
if (-not [string]::Equals($gitRootNormalized, $projectRootNormalized, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Unexpected repository root: $gitRoot"
}
if ($branch -ne $expectedBranch -or $remote -ne $expectedRemote) {
    throw "Refusing to run on an unexpected branch or remote. branch=$branch remote=$remote"
}

$codexHelp = (& $codexPath exec --help 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0) { throw 'Could not read codex exec help.' }
foreach ($option in @('--approve-for-me', '--cd', '--json', '--output-schema', '--output-last-message')) {
    if ($codexHelp -notmatch [regex]::Escape($option)) { throw "Installed Codex CLI lacks required option $option." }
}

New-Item -ItemType Directory -Path $stateRoot -Force | Out-Null
$normalizedProject = $projectRoot.TrimEnd('\', '/').ToUpperInvariant()
$projectHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($normalizedProject)))
$globalLockPath = Join-Path $stateRoot ("project-$projectHash.lock")
try {
    $script:globalLock = [IO.File]::Open($globalLockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
} catch {
    throw "Another supervisor already holds the project-wide lock '$globalLockPath'."
}

if ($ResumeRunDirectory) {
    $stateRootFull = [IO.Path]::GetFullPath($stateRoot).TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
    $runDirectory = [IO.Path]::GetFullPath((Resolve-Path -LiteralPath $ResumeRunDirectory).Path).TrimEnd('\', '/')
    if (-not $runDirectory.StartsWith($stateRootFull, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Resume directory must be a descendant of the expected state directory.'
    }
    $script:runDirectory = $runDirectory
    $script:statePath = Join-Path $runDirectory 'run-state.json'
    $script:eventLog = Join-Path $runDirectory 'events.jsonl'
    $script:schemaPath = Join-Path $runDirectory 'result-schema.json'
    if (-not (Test-Path -LiteralPath $script:statePath -PathType Leaf)) { throw 'Resume checkpoint is missing run-state.json.' }
    $script:state = Get-Content -LiteralPath $script:statePath -Raw | ConvertFrom-Json -AsHashtable
    if ($script:state.projectRoot -ne $projectRoot -or $script:state.branch -ne $branch -or $script:state.initialHead -ne $head) {
        throw 'Resume context differs from the checkpoint (project, branch, or HEAD). No session started.'
    }
    $script:deadlineUtc = [DateTimeOffset]::Parse($script:state.deadlineUtc)
    if (-not $script:state.Contains('missionCatalog')) { $script:state.missionCatalog = @($missions) }
    if (-not $script:state.Contains('missionBlockers')) { $script:state.missionBlockers = @{} }
    if (-not $script:state.Contains('nextDynamicMissionNumber')) { $script:state.nextDynamicMissionNumber = 1 }
    if (-not $script:state.Contains('stagnantSessionCount')) { $script:state.stagnantSessionCount = 0 }
    if (-not $script:state.Contains('noUsefulWorkCount')) { $script:state.noUsefulWorkCount = 0 }
    if (-not $script:state.Contains('activeChild')) { $script:state.activeChild = $null }
    foreach ($mission in $script:state.missionCatalog) {
        if (-not $script:state.missionStates.Contains($mission.id)) { $script:state.missionStates[$mission.id] = 'pending' }
    }
    foreach ($mission in $missions) {
        if (-not ($script:state.missionCatalog | Where-Object id -eq $mission.id)) {
            $script:state.missionCatalog += $mission
        }
        if (-not $script:state.missionStates.Contains($mission.id)) { $script:state.missionStates[$mission.id] = 'pending' }
    }
    if ($script:state.activeChild) {
        $oldChild = Get-Process -Id ([int]$script:state.activeChild.processId) -ErrorAction SilentlyContinue
        if ($oldChild) {
            $oldChildStart = $oldChild.StartTime.ToUniversalTime().ToString('o')
            if ($oldChildStart -eq $script:state.activeChild.startedAtUtc) {
                throw "A previous Codex child (PID $($oldChild.Id)) is still active. Refusing to start a second session in this repository."
            }
        }
        $script:state.activeChild = $null
    }
} else {
    $script:runDirectory = Join-Path $stateRoot ([DateTimeOffset]::UtcNow.ToString('yyyyMMdd-HHmmss-fffZ'))
    New-Item -ItemType Directory -Path $script:runDirectory -Force | Out-Null
    $script:statePath = Join-Path $script:runDirectory 'run-state.json'
    $script:eventLog = Join-Path $script:runDirectory 'events.jsonl'
    $script:schemaPath = Join-Path $script:runDirectory 'result-schema.json'
    $script:deadlineUtc = [DateTimeOffset]::UtcNow.AddHours($MaxRuntimeHours)
    $script:state = [ordered]@{
        projectRoot = $projectRoot
        branch = $branch
        initialHead = $head
        initialGitStatus = Invoke-FixedGit @('status', '--porcelain=v1', '--untracked-files=all')
        initialStagedChanges = Invoke-FixedGit @('diff', '--cached', '--name-status')
        initialUnstagedChanges = Invoke-FixedGit @('diff', '--name-status')
        startedUtc = [DateTimeOffset]::UtcNow.ToString('o')
        deadlineUtc = $script:deadlineUtc.ToString('o')
        missionCursor = 0
        missionCatalog = @($missions)
        missionStates = @{}
        missionBlockers = @{}
        sessions = @()
        consecutiveFailures = 0
        maxRecoverableFailures = $MaxRecoverableFailures
        nextDynamicMissionNumber = 1
        stagnantSessionCount = 0
        noUsefulWorkCount = 0
        activeChild = $null
    }
    foreach ($mission in $script:state.missionCatalog) { $script:state.missionStates[$mission.id] = 'pending' }
}
$script:sessionTimeoutMs = $SessionTimeoutMinutes * 60 * 1000

$schema = @{
    type = 'object'
    additionalProperties = $false
    required = @('sessionType', 'missionId', 'outcome', 'missionTitle', 'missionInstruction', 'acceptanceCriteria', 'summary', 'blocker', 'criteriaResults', 'tests', 'changedPaths', 'verifiedFrenchStations', 'unverifiedFrenchStations', 'reopenMissionIds')
    properties = @{
        sessionType = @{ type = 'string'; enum = @('discovery', 'execution') }
        missionId = @{ type = 'string'; minLength = 1 }
        outcome = @{ type = 'string'; enum = @('mission_discovered', 'no_useful_work', 'completed', 'in_progress', 'blocked') }
        missionTitle = @{ type = 'string' }
        missionInstruction = @{ type = 'string' }
        acceptanceCriteria = @{ type = 'array'; items = @{ type = 'string' } }
        summary = @{ type = 'string' }
        blocker = @{ type = 'string' }
        criteriaResults = @{
            type = 'array'
            items = @{
                type = 'object'
                additionalProperties = $false
                required = @('criterion', 'passed', 'evidence')
                properties = @{
                    criterion = @{ type = 'string' }
                    passed = @{ type = 'boolean' }
                    evidence = @{ type = 'string' }
                }
            }
        }
        tests = @{
            type = 'array'
            items = @{
                type = 'object'
                additionalProperties = $false
                required = @('name', 'result', 'details')
                properties = @{
                    name = @{ type = 'string' }
                    result = @{ type = 'string'; enum = @('passed', 'failed', 'not_run') }
                    details = @{ type = 'string' }
                }
            }
        }
        changedPaths = @{ type = 'array'; items = @{ type = 'string' } }
        verifiedFrenchStations = @{ type = 'integer'; minimum = 0; maximum = 22 }
        unverifiedFrenchStations = @{ type = 'array'; items = @{ type = 'string' } }
        reopenMissionIds = @{ type = 'array'; items = @{ type = 'string' } }
    }
}
if (-not (Test-Path -LiteralPath $script:schemaPath)) {
    $schema | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $script:schemaPath -Encoding utf8
}

$script:sessionTimeoutMs = $SessionTimeoutMinutes * 60 * 1000
$criticalFailure = $null
$stopReason = 'time-limit-reached'

try {
    # Persist the initial checkpoint before the first Codex process can start.
    Save-RunState
    Write-RunEvent 'run-started' @{ branch = $branch; head = $head; deadlineUtc = $script:deadlineUtc.ToString('o'); globalLock = $globalLockPath }

    while ([DateTimeOffset]::UtcNow -lt $script:deadlineUtc) {
        $mission = Get-NextMission
        $sessionType = if ($null -eq $mission -or $script:state.stagnantSessionCount -ge 3) { 'discovery' } else { 'execution' }
        $discoveryMissionId = 'DYN-{0:D4}' -f $script:state.nextDynamicMissionNumber
        if ($sessionType -eq 'discovery') {
            $mission = [ordered]@{
                id = $discoveryMissionId
                title = 'Discover next actionable project improvement'
                instruction = 'Review the remaining and blocked mission states, inspect the relevant project evidence, and propose one concrete, verifiable next mission. Do not invent work. If no useful work remains, explain why.'
                acceptanceCriteria = @('A proposed mission is concrete, evidence-based, and has measurable acceptance criteria, or the response documents why no useful work remains.')
            }
        }

        $statusBefore = Invoke-FixedGit @('status', '--porcelain=v1', '--untracked-files=all')
        $stagedBefore = Invoke-FixedGit @('diff', '--cached', '--name-status')
        $unstagedBefore = Invoke-FixedGit @('diff', '--name-status')
        $prompt = @"
You are working only in the TESTv1 checkout on branch $expectedBranch.
Current mission: $($mission.id) â€” $($mission.title)
$($mission.instruction)

Initial user changes to preserve (porcelain status includes index and working-tree columns):
$($script:state.initialGitStatus)
Initially staged changes:
$($script:state.initialStagedChanges)
Initially unstaged tracked changes:
$($script:state.initialUnstagedChanges)
Current status:
$statusBefore
Current staged changes:
$stagedBefore
Current unstaged tracked changes:
$unstagedBefore

Inspect the repository and relevant files before editing. Preserve existing features and content; do not overwrite user work blindly. Do not read secrets, .env files, credentials, or Codex configuration. Do not install dependencies. Do not switch branches or run git commit, push, reset, clean, stash, or rebase.
Never invent historical facts, transcript text, translations, or audio timestamps. Keep blocked work reported and choose useful verifiable work. After edits, run relevant project checks, especially npm run lint and npm run build when applicable, and fix regressions you introduce.
Do not deploy. Do not execute or create a PowerShell supervisor. Work only on this mission and related validation.
Return only the JSON object required by the output schema. Mark completed only when acceptance criteria and relevant checks are satisfied. Report unverifiable resources and remaining blockers explicitly.
"@

        if ($sessionType -eq 'discovery') {
            $catalogSummary = @($script:state.missionCatalog | ForEach-Object {
                "- $($_.id): $($script:state.missionStates[$_.id]); title=$($_.title); blocker=$($script:state.missionBlockers[$_.id])"
            }) -join "`n"
            $prompt += @"

DISCOVERY ONLY: do not edit files in this session. Re-examine the 22 stations, source texts, old versions available read-only in the repository, real audio and timing data, all seven languages, QR codes, application behavior, mobile and desktop UX, accessibility, performance, bugs, tests, and documentation. Do not read secrets, .env files, credentials, or Codex configuration. Do not install dependencies, change branch, commit, push, reset, clean, stash, rebase, deploy, or execute/create a PowerShell supervisor.
Current task states:
$catalogSummary
Return sessionType=discovery. If useful work is available, return outcome=mission_discovered, missionId='$discoveryMissionId', a specific missionTitle, precise missionInstruction, and concrete acceptanceCriteria. If no useful verifiable work remains, return outcome=no_useful_work with evidence and the specific missing resources. A discovery session never completes a mission.
"@
        } else {
            $criteriaText = @($mission.acceptanceCriteria | ForEach-Object { "- $_" }) -join "`n"
            $priorBlocker = $script:state.missionBlockers[$mission.id]
            $prompt += @"

MISSION CRITERIA:
$criteriaText
Previous blocker, if any: $priorBlocker
Return sessionType=execution and missionId='$($mission.id)'. Return a criteriaResults entry for every acceptance criterion with evidence. Report tests actually run, not intended tests. Do not mark a partially verified task completed. For French transcripts inspect all 22 stations, search existing sources and prior versions read-only, record the source for every correction, and never invent text. A French transcript mission cannot be completed unless all 22 stations are verified; give verifiedFrenchStations and list unresolved stations. For word synchronization use only reliable evidence from the real audio and never invent or spread timestamps.
"@
        }

        $sequence = $script:state.sessions.Count + 1
        $script:state.currentMissionId = $mission.id
        $script:state.currentSessionType = $sessionType
        $script:state.sessions += [ordered]@{ sequence = $sequence; sessionType = $sessionType; missionId = $mission.id; status = 'starting'; startedUtc = [DateTimeOffset]::UtcNow.ToString('o') }
        Save-RunState
        Write-RunEvent 'session-started' @{ sequence = $sequence; sessionType = $sessionType; missionId = $mission.id; remainingSeconds = [Math]::Floor(($script:deadlineUtc - [DateTimeOffset]::UtcNow).TotalSeconds) }
        $result = Invoke-CodexSession $prompt $sequence

        $currentBranch = Invoke-FixedGit @('branch', '--show-current')
        $currentHead = Invoke-FixedGit @('rev-parse', 'HEAD')
        if ($currentBranch -ne $expectedBranch -or $currentHead -ne $script:state.initialHead) {
            throw "Critical Git invariant changed during the session. branch=$currentBranch HEAD=$currentHead"
        }
        $statusAfter = Invoke-FixedGit @('status', '--porcelain=v1', '--untracked-files=all')
        $stagedAfter = Invoke-FixedGit @('diff', '--cached', '--name-status')
        $unstagedAfter = Invoke-FixedGit @('diff', '--name-status')
        $unstagedCheck = Invoke-FixedGit -Arguments @('diff', '--check') -AllowNonZero
        $stagedCheck = Invoke-FixedGit -Arguments @('diff', '--cached', '--check') -AllowNonZero

        $answer = $null
        if ($result.started -and -not $result.timedOut -and $result.exitCode -eq 0 -and (Test-Path -LiteralPath $result.answerPath -PathType Leaf)) {
            $answer = Get-Content -LiteralPath $result.answerPath -Raw | ConvertFrom-Json -AsHashtable
        }
        $record = [ordered]@{
            sequence = $sequence
            sessionType = $sessionType
            missionId = $mission.id
            started = $result.started
            timedOut = $result.timedOut
            exitCode = $result.exitCode
            elapsedSeconds = $result.elapsedSeconds
            stdoutPath = $result.stdoutPath
            stderrPath = $result.stderrPath
            answer = $answer
            gitStatusBefore = $statusBefore
            gitStatusAfter = $statusAfter
            stagedBefore = $stagedBefore
            stagedAfter = $stagedAfter
            unstagedBefore = $unstagedBefore
            unstagedAfter = $unstagedAfter
            stagedDiffCheck = $stagedCheck
            unstagedDiffCheck = $unstagedCheck
            finishedUtc = [DateTimeOffset]::UtcNow.ToString('o')
        }
        $script:state.sessions[-1] = $record

        $gitWhitespaceChecksPassed = $stagedCheck.exitCode -eq 0 -and $unstagedCheck.exitCode -eq 0
        if (-not $result.started -or $result.timedOut -or $result.exitCode -ne 0 -or $null -eq $answer -or -not $gitWhitespaceChecksPassed) {
            $script:state.consecutiveFailures++
            Write-RunEvent 'recoverable-session-failure' @{ sequence = $sequence; missionId = $mission.id; exitCode = $result.exitCode; timedOut = $result.timedOut; stagedDiffCheckExitCode = $stagedCheck.exitCode; unstagedDiffCheckExitCode = $unstagedCheck.exitCode }
            if ($script:state.consecutiveFailures -ge $script:state.maxRecoverableFailures) {
                throw 'Maximum consecutive recoverable failures reached.'
            }
        } elseif ($answer.missionId -ne $mission.id) {
            throw 'Codex final result named a different mission than the active mission.'
        } else {
            $script:state.consecutiveFailures = 0
            if ($answer.outcome -eq 'completed') {
                $script:state.missionStates[$mission.id] = 'completed'
                $script:state.missionCursor = ($script:state.missionCursor + 1) % $missions.Count
            } elseif ($answer.outcome -eq 'blocked') {
                $script:state.missionStates[$mission.id] = 'blocked'
                $script:state.missionCursor = ($script:state.missionCursor + 1) % $missions.Count
                Write-RunEvent 'mission-blocked' @{ missionId = $mission.id; reason = $answer.blocker }
            } else {
                $script:state.missionStates[$mission.id] = 'in_progress'
            }
            Write-RunEvent 'session-finished' @{ sequence = $sequence; missionId = $mission.id; outcome = $answer.outcome; summary = $answer.summary }
        }
        Save-RunState
    }
} catch {
    $criticalFailure = $_.Exception.Message
    $stopReason = 'critical-error'
    Write-RunEvent 'critical-stop' @{ reason = $criticalFailure }
} finally {
    try {
        $summary = [ordered]@{
            stoppedUtc = [DateTimeOffset]::UtcNow.ToString('o')
            deadlineUtc = $script:deadlineUtc.ToString('o')
            stopReason = $stopReason
            projectRoot = $projectRoot
            branch = $branch
            initialHead = $script:state.initialHead
            finalHead = Invoke-FixedGit @('rev-parse', 'HEAD')
            initialGitStatus = $script:state.initialGitStatus
            initialStagedChanges = $script:state.initialStagedChanges
            initialUnstagedChanges = $script:state.initialUnstagedChanges
            finalGitStatus = Invoke-FixedGit @('status', '--porcelain=v1', '--untracked-files=all')
            finalStagedChanges = Invoke-FixedGit @('diff', '--cached', '--name-status')
            finalUnstagedChanges = Invoke-FixedGit @('diff', '--name-status')
            finalStagedDiffCheck = Invoke-FixedGit -Arguments @('diff', '--cached', '--check') -AllowNonZero
            finalUnstagedDiffCheck = Invoke-FixedGit -Arguments @('diff', '--check') -AllowNonZero
            missionStates = $script:state.missionStates
            sessions = $script:state.sessions
            criticalFailure = $criticalFailure
            logsDirectory = $script:runDirectory
        }
        $summaryPath = Join-Path $script:runDirectory 'final-summary.json'
        $summary | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $summaryPath -Encoding utf8
        Save-RunState
        Write-Host "SUMMARY=$summaryPath"
        Write-Host "LOGS=$script:runDirectory"
        Write-Host "STOP_REASON=$stopReason"
    } catch {
        Write-Host "FINAL_SUMMARY_ERROR=$($_.Exception.Message)"
    }
    if ($script:globalLock) { $script:globalLock.Dispose() }
}
