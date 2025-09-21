require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Crear app
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Importar archivo de rutas
const imageRoutes = require("./src/routes/image.routes");
app.use("/api", imageRoutes);

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
