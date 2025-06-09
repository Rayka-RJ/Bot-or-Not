// This is for image diagosis game; to resize the picture into standard size

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const inputDir = path.join(__dirname, "original"); 
const outputDir = path.join(__dirname, "resized");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdirSync(inputDir).forEach((file) => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  sharp(inputPath)
    .resize(512, 512)
    .toFile(outputPath)
    .then(() => {
      console.log(`Resized: ${file}`);
    })
    .catch((err) => {
      console.error(`Failed to resize ${file}:`, err);
    });
});
