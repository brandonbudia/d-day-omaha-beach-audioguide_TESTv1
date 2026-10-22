import fs from 'fs';
import path from 'path';

// Valid MPEG-1 Layer 3 silent frame template (128kbps, 44100Hz)
const FRAME_SIZE = 417;

function generateMp3Buffer(seconds = 15) {
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

const languages = ['fr', 'en', 'de', 'it', 'pl', 'nl', 'es'];
const stops = [];
for (let i = 1; i <= 22; i++) {
  stops.push(i.toString().padStart(2, '0'));
  stops.push(i.toString());
}

const audioDir = path.resolve('public/audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const sampleMp3 = generateMp3Buffer(15);

for (const lang of languages) {
  const langDir = path.join(audioDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

  for (const stopId of stops) {
    const filePath = path.join(langDir, `stop-${stopId}.mp3`);
    fs.writeFileSync(filePath, sampleMp3);
  }
}

console.log('Generated audio files for 7 languages and 22 stops in /public/audio/[lang]/stop-[id].mp3');
