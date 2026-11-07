import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertFixtureOutputIsSafe } from '../scripts/generate-audio.js';

const temporaryParent = realpathSync(os.tmpdir());
const temporaryRoot = mkdtempSync(path.join(temporaryParent, 'dday-audio-fixtures-'));
const script = fileURLToPath(new URL('../scripts/generate-audio.js', import.meta.url));
const applicationAudio = fileURLToPath(new URL('../public/audio/', import.meta.url));
const fixtureName = 'fixture-non-narration-fr-stop-22.mp3';
const run = (...args: string[]) => spawnSync(process.execPath, [script, ...args], { cwd: temporaryRoot, encoding: 'utf8' });

after(() => {
  assert.equal(path.dirname(realpathSync(temporaryRoot)), temporaryParent, 'cleanup stays inside the uniquely created temporary directory');
  rmSync(temporaryRoot, { recursive: true });
});

test('no arguments and help create no files', () => {
  const initial = readdirSync(temporaryRoot);
  const missing = run();
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /no files were created/);
  const help = run('--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /non-narration/);
  assert.deepEqual(readdirSync(temporaryRoot), initial);
});

test('incomplete or unsafe options are rejected before any output directory is created', () => {
  const target = path.join(temporaryRoot, 'invalid-output');
  for (const args of [
    ['--output-dir', target],
    ['--output-dir', target, '--lang', 'fr', '--id', '../22'],
    ['--output-dir', target, '--lang', 'unknown', '--id', '22'],
    ['--output-dir', target, '--lang', 'fr', '--id', '22', '--id', '01'],
  ]) assert.equal(run(...args).status, 2);
  assert.equal(existsSync(target), false);
});

test('the real application audio directory and descendants are refused without running a generation there', () => {
  assert.throws(() => assertFixtureOutputIsSafe(applicationAudio), /Protected audio directory/);
  assert.throws(() => assertFixtureOutputIsSafe(path.join(applicationAudio, 'fr')), /Protected audio directory/);
  assert.throws(() => assertFixtureOutputIsSafe(path.join(applicationAudio, 'future-fixtures')), /Protected audio directory/);
  const neighbor = `${path.resolve(applicationAudio)}-fixtures`;
  assert.equal(assertFixtureOutputIsSafe(neighbor), neighbor, 'a directory with a similar name is outside the protected boundary');
});

test('directory aliases and missing descendants cannot bypass the protected directory check', (context) => {
  const protectedPath = path.join(temporaryRoot, 'simulated-public-audio');
  const alias = path.join(temporaryRoot, 'audio-alias');
  mkdirSync(protectedPath);
  try { symlinkSync(protectedPath, alias, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes((error as NodeJS.ErrnoException).code ?? '')) {
      context.skip('The current OS sandbox refuses directory-link creation; no permission change is attempted.');
      return;
    }
    throw error;
  }
  assert.throws(() => assertFixtureOutputIsSafe(alias, protectedPath), /Protected audio directory/);
  assert.throws(() => assertFixtureOutputIsSafe(path.join(alias, 'new-directory'), protectedPath), /Protected audio directory/);
});

test('explicit French station22 output produces only a clearly named temporary non-narration fixture', () => {
  const output = path.join(temporaryRoot, 'explicit-fixture');
  const result = run('--output-dir', output, '--lang', 'fr', '--id', '22');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /NON-NARRATION TEST FIXTURE ONLY/);
  assert.deepEqual(readdirSync(output), [fixtureName]);
  const generated = readFileSync(path.join(output, fixtureName));
  assert.equal(generated.length, 239358);
  assert.deepEqual([...generated.subarray(0, 4)], [0xff, 0xfb, 0x90, 0x64]);
  assert.equal(existsSync(path.join(output, 'stop-22.mp3')), false);
});

test('an existing file is never overwritten', () => {
  const output = path.join(temporaryRoot, 'already-existing');
  mkdirSync(output);
  const target = path.join(output, fixtureName);
  const original = 'USER CONTENT MUST REMAIN EXACT';
  writeFileSync(target, original);
  const result = run('--output-dir', output, '--lang', 'fr', '--id', '22');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /EEXIST/);
  assert.equal(readFileSync(target, 'utf8'), original);
  assert.deepEqual(readdirSync(output), [fixtureName]);
});
