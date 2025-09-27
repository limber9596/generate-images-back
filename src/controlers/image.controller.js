const {
  generateImageFromText_s,
  generateImageFromBoceto_s,
} = require("../services/replicate.service");
const translateToEnglish = require("../utils/translate");
const moreLigth = require("../utils/moreLigth");
const fs = require("fs");
const path = require("path");
// Controlador text2img
async function generateImageFromText(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No se recibió prompt" });
    const translatePrompt = await translateToEnglish(prompt);
    console.log("propmt traducida: ", translatePrompt);
    const result = await generateImageFromText_s(translatePrompt);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function generateImageWithMask(req, res) {
  try {
    console.log("=== Inicia generateImageWithMask ===");

    const { prompt } = req.body;
    const boceto = req.file;

    console.log("Prompt recibido:", prompt);
    console.log("Archivo recibido:", boceto);

    if (!prompt) {
      console.error("No se recibió prompt");
      return res.status(400).json({ error: "No se recibió prompt" });
    }
    if (!boceto) {
      console.error("No se recibió boceto");
      return res.status(400).json({ error: "No se recibió boceto" });
    }

    // Procesar el boceto → buffer aclarado
    console.log("Leyendo archivo del boceto...");
    const bocetoBuffer = await fs.promises.readFile(boceto.path);
    console.log("Archivo leído, tamaño:", bocetoBuffer.length);

    const maskBuffer = await moreLigth(bocetoBuffer);
    console.log("Buffer aclarado listo, tamaño:", maskBuffer.length);

    // Crear carpeta temporal si no existe
    const tempDir = "/tmp";
    await fs.promises.mkdir(tempDir, { recursive: true });

    const tempPath = path.join(tempDir, `${Date.now()}-mask.png`);
    await fs.promises.writeFile(tempPath, maskBuffer);
    console.log("Archivo temporal guardado en:", tempPath);

    // Llamada a la función que genera la imagen final
    console.log("Llamando a generateImageFromBoceto_s...");
    const result = await generateImageFromBoceto_s(tempPath, prompt);
    console.log("Resultado de img2img:", result);

    res.json(result);
    console.log("=== Termina generateImageWithMask ===");
  } catch (error) {
    console.error("Error en generateImageWithMask:", error);
    res.status(500).json({ error: error.message });
  }
}

// Exportar todas las funciones de una sola vez
module.exports = { generateImageFromText, generateImageWithMask };
