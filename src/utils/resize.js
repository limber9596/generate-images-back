const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

async function resizeTo512(filePath) {
  if (!filePath) return null;

  const uploadDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const ext = path.extname(filePath) || ".png";
  const tempName = `resized_${crypto.randomBytes(8).toString("hex")}${ext}`;
  const tempPath = path.join(uploadDir, tempName);

  await sharp(filePath)
    .resize(1024, 1024, {
      fit: "contain", // mantiene proporciones
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // fondo transparente
    })
    .toFile(tempPath);

  return tempPath;
}

module.exports = resizeTo512;
