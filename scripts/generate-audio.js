import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Test fixture only. This does not synthesize speech or provide a usable narration.
const FRAME_SIZE = 417;
const PROJECT_AUDIO_DIRECTORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/audio');
const LANGUAGES = new Set(['fr', 'en', 'de', 'it', 'pl', 'nl', 'es']);
const USAGE = 'Usage: node scripts/generate-audio.js --output-dir <fixture-directory> --lang <fr|en|de|it|pl|nl|es> --id <01-22>\nCreates one explicitly named non-narration MP3 fixture. Existing files and public/audio are protected.';

export function generateMp3Buffer(seconds = 15) {
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 15) throw new Error('Fixture duration must be greater than 0 and no more than 15 seconds.');
  const frameCount = Math.round(seconds / (1152 / 44100));
  const buffer = Buffer.alloc(frameCount * FRAME_SIZE);

  for (let i = 0; i < frameCount; i++) {
    const offset = i * FRAME_SIZE;
    buffer[offset] = 0xff;
    buffer[offset + 1] = 0xfb;
    buffer[offset + 2] = 0x90;
    buffer[offset + 3] = 0x64;
    for (let j = 4; j < FRAME_SIZE; j++) {
      buffer[offset + j] = (j % 17 === 0) ? 0x01 : 0x00;
    }
  }
  return buffer;
}

function canonicalPathIncludingMissingDirectories(directory) {
  const missing = [];
  let ancestor = path.resolve(directory);
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) throw new Error('Cannot resolve the output directory.');
    missing.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  return path.join(fs.realpathSync(ancestor), ...missing);
}

function isWithin(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

/** Refuse lexical paths and directory aliases into the application's real audio tree. */
export function assertFixtureOutputIsSafe(directory, protectedDirectory = PROJECT_AUDIO_DIRECTORY) {
  const output = path.resolve(directory);
  const protectedPath = path.resolve(protectedDirectory);
  if (isWithin(protectedPath, output) || isWithin(canonicalPathIncludingMissingDirectories(protectedPath), canonicalPathIncludingMissingDirectories(output))) {
    throw new Error('Protected audio directory: fixtures must be outside public/audio.');
  }
  return output;
}

function main(args) {
  if (args.length === 1 && args[0] === '--help') { console.log(USAGE); return 0; }
  const options = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const option = args[index], value = args[index + 1];
    if (!['--output-dir', '--lang', '--id'].includes(option) || !value || value.startsWith('--') || options.has(option)) {
      console.error(`Invalid or duplicate option.\n${USAGE}`);
      return 2;
    }
    options.set(option, value);
  }
  if (!options.has('--output-dir') || !LANGUAGES.has(options.get('--lang')) || !/^(0[1-9]|1\d|2[0-2])$/.test(options.get('--id') ?? '')) {
    console.error(`Explicit output directory, language and station are required; no files were created.\n${USAGE}`);
    return 2;
  }

  try {
    const outputDirectory = assertFixtureOutputIsSafe(options.get('--output-dir'));
    fs.mkdirSync(outputDirectory, { recursive: true });
    // Check again after creation so an existing junction cannot redirect into the audio tree.
    assertFixtureOutputIsSafe(outputDirectory);
    const name = `fixture-non-narration-${options.get('--lang')}-stop-${options.get('--id')}.mp3`;
    const output = path.join(outputDirectory, name);
    fs.writeFileSync(output, generateMp3Buffer(), { flag: 'wx' });
    console.log(`NON-NARRATION TEST FIXTURE ONLY: ${output}`);
    return 0;
  } catch (error) {
    console.error(`Fixture not created: ${error instanceof Error ? error.message : 'unknown error'}`);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
