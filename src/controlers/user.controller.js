// controllers/user.controller.js
const pool = require("../config/db"); // tu conexión a PostgreSQL

// Obtener todos los usuarios (solo para dev)
async function getAllUsers(req, res) {
  try {
    const userRole = req.user.role;

    if (userRole !== "dev") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const result = await pool.query(
      "SELECT id, name, email, role, image_count, last_activity FROM images.users ORDER BY id ASC"
    );

    // Calculamos status: activo si last_active < 5 min
    const users = result.rows.map((u) => ({
      ...u,
      status:
        (new Date() - new Date(u.last_activity)) / 1000 < 15
          ? "Activo"
          : "Inactivo",
    }));

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// Endpoint para resetear image_count (solo dev)
async function resetImageCount(req, res) {
  try {
    const userRole = req.user.role;
    const { userId } = req.body;

    if (userRole !== "dev") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    await pool.query("UPDATE images.users SET image_count = 0 WHERE id = $1", [
      userId,
    ]);

    res.json({ message: "Contador reseteado.." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllUsers,
  resetImageCount,
};
