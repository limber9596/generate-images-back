// middlewares/auth.js
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Traer usuario real de la BD (para tener role e image_count actualizados)
    const result = await pool.query(
      "SELECT * FROM images.users WHERE id = $1",
      [payload.id]
    );
    if (!result.rows.length)
      return res.status(401).json({ error: "User not found" });

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error("authMiddleware error", err);
    res.status(500).json({ error: "Server error" });
  }
}

function isAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ error: "No tienes permisos de administrador" });
  next();
}

module.exports = { authMiddleware, isAdmin };
