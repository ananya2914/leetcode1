const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [16, 48, 128];
const svgPath = path.join(__dirname, '../public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generateIcons() {
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../public/icon${size}.png`));
    console.log(`Generated icon${size}.png`);
  }
}

generateIcons().catch(console.error); 