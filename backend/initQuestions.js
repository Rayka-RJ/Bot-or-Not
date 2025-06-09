const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const newsData = JSON.parse(fs.readFileSync(path.join(__dirname, "news.json"), "utf-8"));

const questions = newsData.map((item) => {
    return {
      mode: "text",
      prompt: item.news,
      humanAnswer: item.comments[0] || "No human comment available.",
      createdAt: new Date()
    };
  });

  async function resetAndInsertQuestions() {
    try {
      await client.connect();
      const db = client.db();
      const questionsCol = db.collection("questions");

      await questionsCol.drop().catch((err) => {
        if (err.codeName === "NamespaceNotFound") {
          console.log("questions is not existing");
        } else {
          throw err;
        }
      });

      const result = await questionsCol.insertMany(questions);
      console.log(`successfully reinitialized the questions and inserted ${result.insertedCount} questions`);
    } catch (err) {
      console.error("initialization failed", err);
    } finally {
      await client.close();
    }
  }
  
  resetAndInsertQuestions();