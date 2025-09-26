const fs = require("fs");
const moreLigth = require("./moreLigth.js");

// Simulando que recibes la imagen del frontend como Buffer
const inputBuffer = fs.readFileSync("cajonera.jpeg");

async function test() {
  const outputBuffer = await moreLigth(inputBuffer);
  fs.writeFileSync("dibujo_lapiz_limpio.png", outputBuffer);
  console.log("✅ Imagen procesada y lista para enviar a Replicate");
}

test();
