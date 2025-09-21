const {
  generateImageFromText_s,
  generateImageFromBoceto_s,
} = require("../services/replicate.service");
const translateToEnglish = require("../utils/translate");
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

    if (!prompt) {
      console.error("No se recibió prompt");
      return res.status(400).json({ error: "No se recibió prompt" });
    }
    if (!boceto) {
      console.error("No se recibió boceto");
      return res.status(400).json({ error: "No se recibió boceto" });
    }

    const result = await generateImageFromBoceto_s(boceto.path, prompt);
    console.log("Resultado de img2img: ", result);
    res.json(result);
  } catch (error) {
    console.error("Error en generateImageWithMask:", error);
    res.status(500).json({ error: error.message });
  }
}

// Exportar todas las funciones de una sola vez
module.exports = { generateImageFromText, generateImageWithMask };
