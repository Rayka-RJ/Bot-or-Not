const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const resizedDir = path.join(__dirname, "resized");

const imageFiles = [
    { filename: "h1.jpg", label: "hand-drawn", description: "A traditional Japanese building with wooden walls and sloped roof" },
    { filename: "h2.jpg", label: "hand-drawn", description: "A close-up portrait of a smiling anime girl with big eyes" },
    { filename: "h3.jpg", label: "hand-drawn", description: "A muscular man with defined abs painted in oil on a dark background" },
    { filename: "h4.jpg", label: "photo", description: "A wild leopard walking across a sandy terrain in daylight" },
    { filename: "h5.jpg", label: "photo", description: "A man in a red jacket sitting with his dog at sunset overlooking a city" },
    { filename: "h6.jpg", label: "photo", description: "A modern city skyline with tall skyscrapers beside a river" },
    { filename: "h7.png", label: "photo", description: "Close-up of three purple pompom-shaped flowers in a garden" },
    { filename: "h8.jpg", label: "photo", description: "A football player from Real Madrid celebrating after scoring a goal" },
    { filename: "h9.jpg", label: "hand-drawn", description: "A still life painting of apples, vases and a seashell on a green tablecloth" },
    { filename: "h10.jpg", label: "hand-drawn", description: "A simplified reinterpretation of the Mona Lisa in pastel colors" },
    { filename: "h11.jpg", label: "hand-drawn", description: "A woman in a white dress sleeping on a red couch with a cat standing above" },
    { filename: "h12.jpg", label: "hand-drawn", description: "An oil painting of a brown horse running through a grassy field" },
    { filename: "h13.jpg", label: "hand-drawn", description: "An impressionist-style painting of a stone building surrounded by flowers and a stream" }

];

async function insertImagesWithLabels() {
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("images");

    const imageDocs = imageFiles.map(({ filename, label, description }) => {
      const filePath = path.join(resizedDir, filename);
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString("base64");

      return {
        imageBase64: base64Image,
        label,
        description
      };
    });

    const result = await collection.insertMany(imageDocs);
    console.log(`Successfully inserted ${result.insertedCount} images with labels.`);
  } catch (err) {
    console.error("Failed to insert images:", err);
  } finally {
    await client.close();
  }
}

insertImagesWithLabels();
