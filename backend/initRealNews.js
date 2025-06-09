const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// reaf JSON 
const realNewsData = JSON.parse(fs.readFileSync(path.join(__dirname, "real_news.json"), "utf-8"));

// break content into title and content (for LLM format)
const realNews = realNewsData.map((item) => {
  const match = item.news.match(/^Title:\s*(.*?)\s*Content:\s*(.*)/s);
  return {
    title: match ? match[1] : "Unknown Title",
    content: match ? match[2] : item.news,
    label: item.label || "real",
    createdAt: new Date()
  };
});

async function resetAndInsertRealNews() {
  try {
    await client.connect();
    const db = client.db();
    const realNewsCol = db.collection("realNews");

    // Clean the old news
    await realNewsCol.drop().catch((err) => {
      if (err.codeName === "NamespaceNotFound") {
        console.log("realNews collection does not exist");
      } else {
        throw err;
      }
    });

    // Insert news
    const result = await realNewsCol.insertMany(realNews);
    console.log(`✅ Successfully inserted ${result.insertedCount} real news items`);
  } catch (err) {
    console.error("❌ Initialization of real news failed:", err);
  } finally {
    await client.close();
  }
}

resetAndInsertRealNews();
