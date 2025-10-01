const { OAuth2Client } = require("google-auth-library");
const pool = require("../config/db");
const { signToken } = require("../utils/jwt");
const { DateTime } = require("luxon");
require("dotenv").config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function loginWithGoogle(req, res) {
  console.log("Entró al endpoint loginWithGoogle");
  try {
    const { idToken } = req.body;
    console.log("ID Token recibido:", idToken);
    if (!idToken) return res.status(400).json({ error: "No idToken provided" });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let result = await pool.query(
      "SELECT * FROM images.users WHERE google_id = $1",
      [googleId]
    );
    let now = DateTime.now().setZone("America/Guayaquil").toISO();
    let user;
    if (result.rows.length) {
      // Si ya existe, actualizamos foto y nombre (por si cambiaron)
      const updateRes = await pool.query(
        `UPDATE images.users
     SET name = $1, picture = $2, last_activity = $3
     WHERE google_id = $4
     RETURNING *`,
        [name, picture, now, googleId]
      );
      user = updateRes.rows[0];
    } else {
      // Determinar el rol según el correo
      const role = email === "limbermolina9596@gmail.com" ? "dev" : "user";
      // Hora actual en Ecuador

      const insertRes = await pool.query(
        `INSERT INTO images.users 
     (google_id, email, name, role, picture, created_at, last_activity) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
        [googleId, email, name, role, picture, now, now]
      );
      user = insertRes.rows[0];
    }

    const token = signToken(user);

    res.json({ user, token });
  } catch (err) {
    console.error("loginWithGoogle error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { loginWithGoogle };
