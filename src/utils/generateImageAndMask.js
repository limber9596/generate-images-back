const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");
const AdmZip = require("adm-zip");

async function generateImageAndMask(imageFilePath) {
  try {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imageFilePath));

    // Llamar al microservicio Python
    const response = await axios.post(
      "http://localhost:5000/remove-background",
      formData,
      {
        headers: formData.getHeaders(),
        responseType: "arraybuffer",
      }
    );

    // Guardar el zip recibido temporalmente
    const zipPath = path.join(__dirname, "test_images.zip");
    fs.writeFileSync(zipPath, response.data);

    // Descomprimir zip
    const zip = new AdmZip(zipPath);
    const outputDir = path.join(__dirname, "output_test");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    zip.extractAllTo(outputDir, true);

    // Obtener los paths de los archivos extraídos
    const extractedFiles = zip
      .getEntries()
      .map((entry) => path.join(outputDir, entry.entryName));

    // Retornar los paths de la imagen sin fondo y la máscara
    const [imageWithoutBackgroundPath, maskPath] = extractedFiles;

    return { imageWithoutBackgroundPath, maskPath };
  } catch (error) {
    console.error("Error en el flujo de prueba:", error.message);
    throw error;
  }
}

module.exports = generateImageAndMask;
