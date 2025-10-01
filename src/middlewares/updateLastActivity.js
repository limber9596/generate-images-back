const db = require("../config/db"); // tu conexión a la DB
const { DateTime } = require("luxon");

const updateLastActivity = async (req, res, next) => {
  try {
    if (req.user) {
      // Hora actual en Ecuador
      const now = DateTime.now().setZone("America/Guayaquil").toISO();

      await db.query(
        "UPDATE images.users SET last_activity = $1 WHERE id = $2",
        [now, req.user.id]
      );
    }
  } catch (err) {
    console.error("Error updating last_activity:", err);
  }
  next();
};

module.exports = updateLastActivity;
