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
    const { prompt } = req.body;
    const boceto = req.file; // Multer guarda el archivo en req.file
    // Procesar el boceto → buffer aclarado
    const maskBuffer = await moreLigth(await fs.promises.readFile(boceto.path));

    // Crear carpeta temp si no existe
    // const tempDir = path.join(__dirname, "../temp");
    // await fs.promises.mkdir(tempDir, { recursive: true });

    // // Guardar buffer como archivo temporal
    // const tempPath = path.join(tempDir, `${Date.now()}-mask.png`);
    // await fs.promises.writeFile(tempPath, maskBuffer);
    const tempDir = "/tmp"; // carpeta temporal en Vercel
    await fs.promises.mkdir(tempDir, { recursive: true });

    const tempPath = path.join(tempDir, `${Date.now()}-mask.png`);
    await fs.promises.writeFile(tempPath, maskBuffer);
    ////////////////////////////////////////////////////////7
    if (!prompt) {
      console.error("No se recibió prompt");
      return res.status(400).json({ error: "No se recibió prompt" });
    }
    if (!boceto) {
      console.error("No se recibió boceto");
      return res.status(400).json({ error: "No se recibió boceto" });
    }

    const result = await generateImageFromBoceto_s(tempPath, prompt);
    console.log("Resultado de img2img: ", result);
    res.json(result);
  } catch (error) {
    console.error("Error en generateImageWithMask:", error);
    res.status(500).json({ error: error.message });
  }
}

// Exportar todas las funciones de una sola vez
module.exports = { generateImageFromText, generateImageWithMask };
