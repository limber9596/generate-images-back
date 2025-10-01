const express = require("express");
const multer = require("multer");
const {
  generateImageFromText,
  generateImageWithMask,
} = require("../controlers/image.controller");
const { authMiddleware } = require("../middlewares/auth.js");
const { loginWithGoogle } = require("../controlers/loginGoogle.controller");
const {
  getAllUsers,
  resetImageCount,
} = require("../controlers/user.controller");
const updateLastActivity = require("../middlewares/updateLastActivity");

const router = express.Router();
const upload = multer({ dest: "/tmp" });

// Login con Google (JWT + guardar usuario en DB)
router.post("/auth/google", loginWithGoogle);

// Proteger las rutas de imágenes
router.post(
  "/generate-image-text",
  authMiddleware,
  updateLastActivity,
  upload.none(),
  generateImageFromText
);

router.post(
  "/generate-image-mask",
  authMiddleware,
  updateLastActivity,
  upload.single("boceto"),
  generateImageWithMask
);

// --- Ruta de ping para mantener al usuario activo ---
router.post("/ping", authMiddleware, updateLastActivity, (req, res) => {
  res.json({ message: "pong" });
});

router.get("/users", authMiddleware, getAllUsers);
router.post("/reset-image-count", authMiddleware, resetImageCount);
module.exports = router;
