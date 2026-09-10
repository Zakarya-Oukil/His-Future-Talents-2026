const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const whiteSrc = 'C:/Users/Zakar/.gemini/antigravity-ide/brain/130b6564-d7bf-4840-aaab-3f1c41a2b909/.user_uploaded/media_1789037831114.png';
const blueSrc = 'C:/Users/Zakar/.gemini/antigravity-ide/brain/130b6564-d7bf-4840-aaab-3f1c41a2b909/.user_uploaded/media_1789037831131.png';

async function processLogos() {
  console.log('Processing logos...');

  // 1. Process White Logo: trim transparent borders slightly if any, keep clean
  const whiteBuffer = await sharp(whiteSrc).png().toBuffer();
  
  // Save white variant
  fs.writeFileSync('public/brand/his-logo-white.png', whiteBuffer);
  fs.writeFileSync('public/logo-his-white.png', whiteBuffer);
  console.log('Saved white logos.');

  // 2. Process High-Res Blue Logo from the 1024x266 master asset
  // HIS Blue is RGB (0, 56, 118) / #003876 or (11, 60, 110)
  // Let's tint the white image into #003876 while preserving exact alpha antialiasing!
  const { data, info } = await sharp(whiteSrc).raw().toBuffer({ resolveWithObject: true });
  
  // Create a new buffer with same dimensions
  const blueData = Buffer.from(data);
  for (let i = 0; i < blueData.length; i += 4) {
    const alpha = blueData[i + 3];
    if (alpha > 0) {
      blueData[i] = 0;     // R: 0
      blueData[i + 1] = 56; // G: 56
      blueData[i + 2] = 118; // B: 118
      // alpha stays unchanged!
    }
  }

  const blueBuffer = await sharp(blueData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  }).png().toBuffer();

  fs.writeFileSync('public/brand/his-logo-blue.png', blueBuffer);
  fs.writeFileSync('public/brand/his-official-logo.png', blueBuffer);
  fs.writeFileSync('public/logo-his-blue.png', blueBuffer);
  fs.writeFileSync('public/logo-his.png', blueBuffer);
  console.log('Saved blue logos.');

  console.log('Logos processed successfully!');
}

processLogos().catch((err) => {
  console.error('Error processing logos:', err);
  process.exit(1);
});
