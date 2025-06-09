const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const commentData = JSON.parse(fs.readFileSync(path.join(__dirname, "comment.json"), "utf-8"));


const examples = commentData.map((text) => ({
    text: text,
    createdAt: new Date()
  }));
  
  async function resetAndInsertExamples() {
    try {
      await client.connect();
      const db = client.db();
      const examplesCol = db.collection("examples");

      await examplesCol.drop().catch((err) => {
        if (err.codeName === "NamespaceNotFound") {
          console.log("examples does not exist");
        } else {
          throw err;
        }
      });

      const result = await examplesCol.insertMany(examples);
      console.log(`Successfullly inserted ${result.insertedCount} examples`);
    } catch (err) {
      console.error("Examples initialization failed:", err);
    } finally {
      await client.close();
    }
  }
  
  resetAndInsertExamples();