const express = require("express");
const multer = require("multer");
const {
  generateImageFromText,
  generateImageWithMask,
} = require("../controlers/image.controller");

const router = express.Router();

// Configuración de Multer directamente en la ruta
const upload = multer({ dest: "/tmp" });

// Endpoint para generar imagen desde texto
router.post("/generate-image-text", upload.none(), generateImageFromText);

// Endpoint para generar imagen desde boceto (img2img) sin máscara
router.post(
  "/generate-image-mask",
  upload.single("boceto"),
  generateImageWithMask
);

module.exports = router;
