const pool = require("./src/config/db.js"); // ajusta la ruta

async function testConnection() {
  try {
    // Hacemos una consulta simple
    const res = await pool.query("SELECT NOW()");
    console.log("Conexión exitosa!");
    console.log("Hora actual de la base de datos:", res.rows[0].now);
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
  } finally {
    // Cerramos la conexión
    await pool.end();
  }
}

testConnection();
