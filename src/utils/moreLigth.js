const sharp = require("sharp");

/**
 * Mejora un dibujo a lápiz tomado con cámara, eliminando el fondo gris.
 * @param {Buffer} imageBuffer - La imagen enviada desde el frontend.
 * @returns {Promise<Buffer>} - La imagen procesada en buffer PNG.
 */
async function moreLigth(imageBuffer) {
  const processedBuffer = await sharp(imageBuffer)
    .greyscale() // Escala de grises
    .normalise() // Normaliza contraste
    .linear(1.5, -50) // Ajusta brillo y contraste (intensifica trazos)
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // Fondo blanco
    .toFormat("png")
    .toBuffer();

  return processedBuffer;
}

module.exports = moreLigth;
