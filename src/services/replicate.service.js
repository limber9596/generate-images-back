const fs = require("node:fs");
const Replicate = require("replicate");
const Jimp = require("jimp");
const path = require("path");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateImageFromBoceto_s(bocetoPath, prompt, tempDir = "/tmp") {
  const buffer_img = await fs.promises.readFile(bocetoPath);
  const image = await Jimp.read(buffer_img);

  // image.invert();
  const bocetoBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

  // Convertir a base64
  const base64Image = `data:image/png;base64,${bocetoBuffer.toString(
    "base64"
  )}`;

  // Ejecutar el modelo con Replicate
  const output = await replicate.run(
    "fofr/realvisxl-v3-multi-controlnet-lora:90a4a3604cd637cb9f1a2bdae1cfa9ed869362ca028814cdce310a78e27daade",
    {
      input: {
        width: 512,
        height: 512,
        prompt,
        refine: "no_refiner",
        scheduler: "K_EULER",
        lora_scale: 0.8,
        num_outputs: 1,
        controlnet_1: "soft_edge_hed",
        controlnet_1_image: base64Image,
        controlnet_1_start: 0,
        controlnet_1_end: 1,
        controlnet_1_conditioning_scale: 0.7,
        guidance_scale: 7,
        num_inference_steps: 30,
        apply_watermark: false,
        prompt_strength: 0.6,
        sizing_strategy: "width_height",
        controlnet_2: "none",
        controlnet_3: "none",
        controlnet_2_start: 0,
        controlnet_2_end: 1,
        controlnet_3_start: 0,
        controlnet_3_end: 1,
        controlnet_2_conditioning_scale: 0.8,
        controlnet_3_conditioning_scale: 0.75,
        negative_prompt: "blurry, sketch, cartoon, low quality",
      },
    }
  );

  const imageUrl = output[1].url();
  // const res = await fetch(imageUrl);
  // const buffer = await res.arrayBuffer();

  // // Guardar en /tmp
  // const fileName = path.join(tempDir, "output_img2img.png");
  // await fs.promises.writeFile(fileName, Buffer.from(buffer));

  return { imageUrl };
}

/////////////////////////////////////////////////////////////
async function generateImageFromText_s(prompt, tempDir = "/tmp") {
  if (!prompt) throw new Error("No se recibió prompt");

  const output = await replicate.run(
    "fofr/realvisxl-v3:33279060bbbb8858700eb2146350a98d96ef334fcf817f37eb05915e1534aa1c",
    {
      input: {
        width: 512,
        height: 512,
        prompt,
        refine: "no_refiner",
        scheduler: "K_EULER",
        lora_scale: 0.6,
        num_outputs: 1,
        guidance_scale: 7.5,
        apply_watermark: false,
        high_noise_frac: 0.8,
        negative_prompt:
          "worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch",
        prompt_strength: 0.8,
        num_inference_steps: 15,
      },
    }
  );

  const imageUrl = output[0].url();
  // const res = await fetch(imageUrl);
  // const buffer = await res.arrayBuffer();

  // // Guardar en /tmp
  // const fileName = path.join(tempDir, "output_text2img.png");
  // await fs.promises.writeFile(fileName, Buffer.from(buffer));

  return { imageUrl };
}

// Exportar todas las funciones como módulo CommonJS
module.exports = {
  generateImageFromBoceto_s,
  generateImageFromText_s,
};
