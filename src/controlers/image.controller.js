const {
  generateImageFromText_s,
  generateImageFromBoceto_s,
} = require("../services/replicate.service");
const translateToEnglish = require("../utils/translate");
const moreLigth = require("../utils/moreLigth");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
// Controlador text2img
async function generateImageFromText(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { prompt } = req.body;
    console.log("UserId recibido:", userId);
    console.log("User role recibido:", userRole);

    if (!prompt) {
      return res.status(400).json({ error: "No se recibió prompt" });
    }

    // Solo limitamos a usuarios "user"
    if (userRole === "user") {
      const userResult = await pool.query(
        "SELECT image_count FROM images.users WHERE id = $1",
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const imageCount = userResult.rows[0].image_count;

      if (imageCount >= 2) {
        return res.status(403).json({
          error: "Has alcanzado el limite!.",
        });
      }
    }
    const translatePrompt = await translateToEnglish(prompt);
    const result = await generateImageFromText_s(translatePrompt);

    // Incrementamos contador solo para "user"
    if (userRole === "user" || userRole === "dev") {
      await pool.query(
        "UPDATE images.users SET image_count = image_count + 1 WHERE id = $1",
        [userId]
      );
    }
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

async function generateImageWithMask(req, res) {
  try {
    console.log("=== Inicia generateImageWithMask ===");

    const { prompt } = req.body;
    const boceto = req.file;
    const userRole = req.user.role;
    const userId = req.user.id;

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

    // Leer el archivo enviado
    console.log("Leyendo archivo del boceto...");
    const bocetoBuffer = await fs.promises.readFile(boceto.path);
    console.log("Archivo leído, tamaño:", bocetoBuffer.length);

    if (userRole === "user") {
      const userResult = await pool.query(
        "SELECT image_count FROM images.users WHERE id = $1",
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const imageCount = userResult.rows[0].image_count;

      if (imageCount >= 2) {
        return res.status(403).json({
          error: "Has alcanzado el limite!.",
        });
      }
    }
    // Procesar el boceto (aclarar bordes)
    const maskBuffer = await moreLigth(bocetoBuffer);
    console.log("Buffer aclarado listo, tamaño:", maskBuffer.length);

    // Guardar en carpeta temporal de Vercel
    const tempDir = "/tmp";
    await fs.promises.mkdir(tempDir, { recursive: true });

    const maskPath = path.join(tempDir, `${Date.now()}-mask.png`);
    await fs.promises.writeFile(maskPath, maskBuffer);
    console.log("Archivo temporal guardado en:", maskPath);

    // Aquí asegúrate de que generateImageFromBoceto_s también use /tmp para cualquier archivo
    console.log("Llamando a generateImageFromBoceto_s...");
    const result = await generateImageFromBoceto_s(maskPath, prompt, tempDir);
    console.log("Resultado de img2img:", result);
    if (userRole === "user" || userRole === "dev") {
      await pool.query(
        "UPDATE images.users SET image_count = image_count + 1 WHERE id = $1",
        [userId]
      );
    }
    res.json(result);
    console.log("=== Termina generateImageWithMask ===");
  } catch (error) {
    console.error("Error en generateImageWithMask:", error);
    res.status(500).json({ error: error.message });
  }
}

// Exportar todas las funciones de una sola vez
module.exports = { generateImageFromText, generateImageWithMask };
