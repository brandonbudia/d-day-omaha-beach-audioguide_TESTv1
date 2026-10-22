import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const publicDir = path.resolve('public');
const iconsDir = path.resolve('public/icons');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function createBadgeIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;
  const outerR = isMaskable ? size * 0.42 : size * 0.46;
  const innerR = outerR * 0.90;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #10141a (r: 16, g: 20, b: 26)
      let r = 16;
      let g = 20;
      let b = 26;
      let a = 255;

      if (!isMaskable && dist > outerR + 1) {
        // Transparent outside circular badge if not maskable
        a = 0;
      } else if (dist <= outerR && dist >= innerR) {
        // Brass gold ring #d4af37 (r: 212, g: 175, b: 55)
        const t = (dist - innerR) / (outerR - innerR);
        r = Math.round(212 + t * 30);
        g = Math.round(175 + t * 25);
        b = Math.round(55 + t * 20);
      } else if (dist < innerR) {
        // Inner badge: rich sepia slate #1c2026
        r = 28;
        g = 32;
        b = 38;

        // Draw star or headphone shape in brass #f2ca50
        const angle = Math.atan2(dy, dx);
        const rNorm = dist / innerR;

        // 5-pointed star geometry
        const armAngle = (angle + Math.PI / 2 + Math.PI * 2) % ((Math.PI * 2) / 5);
        const starHalfStep = Math.PI / 5;
        const diff = Math.abs(armAngle - starHalfStep);
        const starRadius = 0.55 * (Math.cos(starHalfStep) / Math.cos(diff - starHalfStep * 0.3));

        if (rNorm < 0.52 && rNorm < starRadius) {
          // Inside emblem: Golden brass
          r = 242;
          g = 202;
          b = 80;
        } else if (rNorm < 0.65 && rNorm >= 0.52 && Math.abs(dy) < innerR * 0.15 && Math.abs(dx) > innerR * 0.4) {
          // Headphones side earcups
          r = 212;
          g = 175;
          b = 55;
        } else if (rNorm < 0.72 && rNorm >= 0.55 && dy < 0) {
          // Headband arc
          r = 212;
          g = 175;
          b = 55;
        }
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return PNG.sync.write(png);
}

// Generate icons
const sizes = [
  { file: 'public/icons/icon-192x192.png', size: 192, maskable: false },
  { file: 'public/icons/icon-512x512.png', size: 512, maskable: false },
  { file: 'public/icons/icon-maskable-512x512.png', size: 512, maskable: true },
  { file: 'public/pwa-192x192.png', size: 192, maskable: false },
  { file: 'public/pwa-512x512.png', size: 512, maskable: false },
  { file: 'public/pwa-maskable-512x512.png', size: 512, maskable: true },
  { file: 'public/apple-touch-icon.png', size: 180, maskable: false },
  { file: 'public/icons/apple-touch-icon.png', size: 180, maskable: false },
];

for (const item of sizes) {
  const buf = createBadgeIcon(item.size, item.maskable);
  fs.writeFileSync(path.resolve(item.file), buf);
  console.log(`Generated ${item.file}`);
}

// Also create SVG icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#10141a"/>
  <circle cx="256" cy="256" r="220" fill="#1c2026" stroke="#d4af37" stroke-width="16"/>
  <path d="M256 120 L288 215 L388 215 L307 274 L338 370 L256 310 L174 370 L205 274 L124 215 L224 215 Z" fill="#f2ca50"/>
  <path d="M150 256 A106 106 0 0 1 362 256" fill="none" stroke="#d4af37" stroke-width="20" stroke-linecap="round"/>
  <rect x="130" y="240" width="36" height="60" rx="12" fill="#d4af37"/>
  <rect x="346" y="240" width="36" height="60" rx="12" fill="#d4af37"/>
</svg>`;
fs.writeFileSync(path.resolve('public/icon.svg'), svg);
fs.writeFileSync(path.resolve('public/icons/icon.svg'), svg);
console.log('Icon generation complete.');
