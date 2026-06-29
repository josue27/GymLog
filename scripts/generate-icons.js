// Generate PWA icons: amber dumbbell on dark background
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG dumbbell icon — amber (#f59e0b) on dark (#0a0a0a) background
function buildSvg(size) {
  const half = size / 2;
  const barThick = size * 0.08;       // 8% of size = bar thickness
  const barLen = size * 0.5;          // bar length
  const barY = half - barThick / 2;
  const barX = (size - barLen) / 2;

  const weightW = size * 0.18;        // weight plate width
  const weightH = size * 0.35;        // weight plate height
  const weightY = half - weightH / 2;
  const outerGap = size * 0.1;        // gap from edge

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.12}" fill="#0a0a0a"/>

  <!-- Horizontal bar -->
  <rect x="${barX}" y="${barY}" width="${barLen}" height="${barThick}" rx="${barThick / 2}" fill="#f59e0b"/>

  <!-- Left weight plates -->
  <rect x="${outerGap}" y="${weightY}" width="${weightW}" height="${weightH}" rx="${size * 0.03}" fill="#f59e0b"/>
  <rect x="${outerGap + weightW + size * 0.02}" y="${weightY + size * 0.06}" width="${weightW * 0.6}" height="${weightH - size * 0.12}" rx="${size * 0.02}" fill="#f59e0b"/>

  <!-- Right weight plates -->
  <rect x="${size - outerGap - weightW}" y="${weightY}" width="${weightW}" height="${weightH}" rx="${size * 0.03}" fill="#f59e0b"/>
  <rect x="${size - outerGap - weightW - weightW * 0.6 - size * 0.02}" y="${weightY + size * 0.06}" width="${weightW * 0.6}" height="${weightH - size * 0.12}" rx="${size * 0.02}" fill="#f59e0b"/>
</svg>`;
}

async function generate() {
  const sizes = [192, 512];

  for (const size of sizes) {
    const svg = buildSvg(size);
    const outputPath = path.join(iconsDir, `icon-${size}.png`);

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✅ icon-${size}.png (${size}×${size}) generated`);
  }

  // Remove old README placeholder
  const readmePath = path.join(iconsDir, 'README.txt');
  if (fs.existsSync(readmePath)) {
    fs.unlinkSync(readmePath);
    console.log('🧹 Removed placeholder README.txt');
  }

  console.log('🎨 PWA icons ready for production.');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
