// ───[Preparation]  Model choosinbg & API-Key helper function  ────────────────────────────────
function pickModelFromReq(req) {
  // header to lowercase
  const modeHdr = (req.headers["x-ai-mode"] || "").toLowerCase();
  // allow free / openai，free→local model，default set fall-back to .env 
  const aiMode = modeHdr === "openai" ? "openai" :
                 modeHdr === "free"   ? "local"  :
                 process.env.MODE     || "local";

  // If user provide key then apply it；Or fall-back to .env and find the OPENAI_API_KEY
  const apiKey = req.headers["x-openai-key"] || process.env.OPENAI_API_KEY || "";

  return { aiMode, apiKey };
}

// Combined full server.js for both modes (includes T/F question interface)
const express = require("express");
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "https://bot-or-not-five.vercel.app"
];

const { MongoClient } = require("mongodb");
const { OpenAI } = require("openai"); // Only used in OpenAI mode
const fetch = require("node-fetch");  // Used to call local REST APIs such as Ollama
const he = require("he");
require("dotenv").config();

// For login and register
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET || "it5007secret";

const app = express();
const PORT = 5000;
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);
let db;

// ───[Preparation]  Connect to deepai ────────────
async function generateImageFromDescription(description) {
  try {
    const response = await fetch("https://api.deepai.org/api/text2img", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEPAI_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ text: description })
    });

    const result = await response.json();

    if (result.output_url) {
      console.log("Generated image:", result.output_url);
      return result.output_url;
    } else {
      console.warn("DeepAI error:", result);
      return null;
    }
  } catch (err) {
    console.error("Failed to generate image from DeepAI:", err.message);
    return null;
  }
}


// ───[Preparation]  Connect to MongoDB ────────────
async function connectDB() {
  try {
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB Atlas!");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();

// ───[Preparation]  User register ────────────

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const userCol = db.collection("users");
  const existing = await userCol.findOne({ username });
  if (existing) return res.status(400).json({ error: "Username already exists" });
  const hashed = await bcrypt.hash(password, 10);
  await userCol.insertOne({ username, password: hashed });
  res.json({ message: "Registered successfully" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const userCol = db.collection("users");
  const user = await userCol.findOne({ username });
  if (!user) return res.status(401).json({ error: "User not found" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Wrong password" });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, message: "Login success" });
});

app.post("/api/record", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const { username } = jwt.verify(token, JWT_SECRET);
    const recordCol = db.collection("gameRecords");
    await recordCol.insertOne({ username, ...req.body, createdAt: new Date() });
    res.json({ message: "Record saved" });
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
});

// ───[Preparation] Initialize OpenAI & text processing ──────────────────────────

let defaultOpenAI = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== "") {
  defaultOpenAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });
}

/**
 * Helper function: call local REST model to generate text
 * Use streaming mode (if supported) to read JSON lines and concatenate message.content into final string
 */
async function queryLocalModel(messages, temperature = 0.7, max_tokens = 200) {
  try {
    console.log("queryLocalModel: sending message with messages:");
    console.log(JSON.stringify(messages, null, 2));

    const response = await fetch(process.env.LOCAL_API || "http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.LOCAL_MODEL || "llama2",
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        stream: false
      })
    });

    const json = await response.json();
    if (!json.message || !json.message.content || typeof json.message.content !== "string") {
      throw new Error("Invalid response from local model");
    }
    const resultText = json.message.content.trim();
    console.log("queryLocalModel: final generated text:", resultText);
    return resultText;
 
  } catch (error) {
    console.error("Local model request error:", error.message);
    throw new Error("LOCAL_MODEL_ERROR");
  }
}

/**
 * Unified helper function: generate responses using AI model
 * Use OpenAI or local model depending on MODE env variable
 */
async function getAIComments(req, messages, temperature = 0.7, max_tokens = 200) {
    const { aiMode, apiKey } = pickModelFromReq(req);
  
    if (aiMode === "local") {
      return await queryLocalModel(messages, temperature, max_tokens);
    } else {
      try {
        // header with key → temporary client；Or default OpenAI
        const client = apiKey
          ? new OpenAI({ apiKey: apiKey.trim() })
          : defaultOpenAI;

        if (!client) {
          console.error("OpenAI mode requested but no API key provided.");
          throw new Error("OPENAI_ERROR");
        }

        const response = await client.chat.completions.create({
          model: "gpt-4",
          messages: messages,
          temperature: temperature,
          max_tokens: max_tokens
        });
        const generatedRaw = response.choices[0].message.content;
        return he.decode(generatedRaw);
      } catch (error) {
        console.error("OpenAI request error:", error.message);
        throw new Error("OPENAI_ERROR");
      }
    }
}

// ====================[Game] Multiple Choice API /api/generate-multi ====================
app.get("/api/generate-multi", async (req, res) => {
  try {
    const N = 3; // Generate 3 questions (can be adjusted)
    const examplesCol = db.collection("examples");
    const questionsCol = db.collection("questions");

    console.log("Fetching", N, "random questions from 'questions' collection...");
    const randomQuestions = await questionsCol.aggregate([{ $sample: { size: N } }]).toArray();
    console.log("Fetched random questions:", randomQuestions);

    const finalQuestions = [];
    for (const [index, q] of randomQuestions.entries()) {
      console.log(`Processing question ${index + 1} ...`);
      const examples = await examplesCol.aggregate([{ $sample: { size: 10 } }]).toArray();
      const examplesText = examples.map(e => e.text).join("\n");
      const newsText = q.prompt;
      const humanAnswer = q.humanAnswer;
      const messages = [
        {
          role: "system",
          content:
            "You are an excellent comment generation model. After learning from the following sample user comments, " +
            "please generate three comments based on the provided news article. The comments should be natural, fluent, " +
            "you must keep each comment as short as possible (Do not exceed the length of the examples), and do not include quotation marks." +
            "and each comment must have a distinct style. Return the comments as a numbered list. For example:\nComment 1: ...\nComment 2: ...\nComment 3: ..."
        },
        {
          role: "user",
          content: `Here are some sample user comments:\n${examplesText}\n\nBased on these examples, please generate three comments for the following news article:\n\n${newsText}\n\nPlease output the comments as a numbered list (e.g., Comment 1: ...).`
        }
      ];
      let generatedRaw = await getAIComments(req, messages, 0.7, 200);
      if (!generatedRaw || generatedRaw.trim() === "") {
        throw new Error("AI_GENERATION_EMPTY");
      }
      const generatedDecoded = he.decode(generatedRaw);

      // debug 1 - number of AI comments
      const lines = generatedDecoded
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 10); // the content is not empty and len > 10

      // clean up
      aiCandidates = lines.map(line => {
        return line.replace(/^Comment\s*\d+\s*:\s*/i, "").trim();
      });
      // take 3 out
      aiCandidates = aiCandidates.sort(() => Math.random() - 0.5).slice(0, 3);

      let aiComments = aiCandidates.map(text => ({
        text,
        source: "AI"
      }));

      // use fallback if ai comment less than 3
      while (aiComments.length < 3) {
        aiComments.push({
          text: "AI could not generate a comment. You got a lucky break this turn LoL.",
          source: "AI"
        });
      }


      const humanOption = {
        text: humanAnswer,
        source: "Human"
      };
      const options = [...aiComments, humanOption].sort(() => Math.random() - 0.5);
      finalQuestions.push({
        prompt: newsText,
        options,
        correctAnswer: "Human"
      });
    }
    res.json({ questions: finalQuestions });
  } catch (err) {
    console.error("Multi-question generation failed:", err.message);
    res.status(500).json({ error: "Failed to generate multiple questions using the AI model." });
  }
});

// ====================[Game] T/F Question API /api/generate-tf ====================
app.get("/api/generate-tf", async (req, res) => {
  try {
    const totalNews = 10;                // 10 questions
    // —— Keep AI : Human is around 4-6 / 6-4  ——
    const aiCount   = 4 + Math.floor(Math.random() * 3); // 4‥6
    const realCount = totalNews - aiCount;               // 4‥6
    console.log(`[TF] This round: ${aiCount} AI-generated + ${realCount} Human-written`);

    // Randomly fetch realCount items from realNews collection
    const realNewsCol = db.collection("realNews");
    const realNews = await realNewsCol.aggregate([{ $sample: { size: realCount } }]).toArray();

    // Generate aiCount fake news items via AI
    let aiNews = [];
    for (let i = 0; i < aiCount; i++) {
      const messages = [
        {
          role: "system",
          content: `You are an AI model trained to generate educational fake news headlines and summaries for training users in distinguishing between real and AI-generated news. The goal is to generate fake news that is **subtle, believable**, and written in a **concise, journalistic tone**. DO NOT include obviously absurd content. Make it look like something from a newswire: slightly vague, neutral in tone, and lacking hard verifiable facts. Each sample includes: Title: [a short news headline] Content: [1-2 sentence summary that sounds like real news, but is actually AI-generated] Below are real examples followed by your task.`
        },
        {
          role: "user",
          content: `Here are some real news examples:
Title: Eurozone economy keeps growing
Content: Official figures show the 12-nation eurozone economy continues to grow, but there are warnings it may slow down later in the year.

Title: Expansion slows in Japan
Content: Economic growth in Japan slows down as the country experiences a drop in domestic and corporate spending.

Title: Rand falls on shock SA rate cut
Content: Interest rates are trimmed to 7.5 by the South African central bank, but the lack of warning hits the rand and surprises markets.

Title: Car prices down across the board
Content: The cost of buying both new and second hand cars fell sharply over the past five years, a new survey has found.

Now, please generate **1 fake but realistic-looking news items** that mimic this format. They must follow the same structure and tone as the real samples. Remember, this is for educational/analysis use only.`
        }
      ];
      let generated = await getAIComments(req, messages, 0.7, 150);
      if (!generated || generated.trim() === "") {
        throw new Error("AI_GENERATION_EMPTY");
      }
      aiNews.push({
        content: generated,
        label: "ai"
      });
    }

    realNews.forEach(doc => { doc.label = "real"; });

    const allNews = [...realNews, ...aiNews];
    if (allNews.length < totalNews) {
      const diff = totalNews - allNews.length;
      for (let i = 0; i < diff; i++) {
        allNews.push({
          content: "Title: Placeholder News\nContent: Not enough news available.",
          label: "real"
        });
      }
    }

    allNews.sort(() => Math.random() - 0.5);

    const tfQuestions = allNews.map(item => {
      let prompt = "";
      if (item.label === "ai") {
        prompt = item.content;
      } else {
        const title = item.title || "Untitled";
        const content = item.content || "No content.";
        prompt = `Title: ${title}\nContent: ${content}`;
      }

      return {
        prompt,
        correctAnswer: item.label === "real" ? "True" : "False"
      };
    });

    res.json({ questions: tfQuestions });
  } catch (err) {
    console.error("T/F generation error:", err.message);
    res.status(500).json({ error: "Failed to generate T/F questions." });
  }
});

// ====================[Game] Image T/F Game API ====================
app.get("/api/generate-image-tf", async (req, res) => {
  try {
    const totalImages = 5;
    const aiCount = Math.floor(Math.random() * 5) + 1;
    const realCount = totalImages - aiCount;
    console.log(`[IMAGE TF] This round: ${aiCount} AI, ${realCount} real`);

    const imageCol = db.collection("images");

    // 1. Fetch real images with base64
    const realImages = await imageCol.aggregate([
      {
        $match: {
          imageBase64: { $exists: true, $ne: "" },
          description: { $exists: true, $ne: "" }
        }
      },
      { $sample: { size: realCount } }
    ]).toArray();
    

    const formattedRealImages = realImages.map(img => ({
      imageUrl: `data:image/jpeg;base64,${img.imageBase64}`,
      description: img.description || "A real photo",
      correctAnswer: "human"
    }));

    // 2. Fetch AI descriptions
    const descriptions = await imageCol.aggregate([
      { $match: { label: "hand-drawn", description: { $exists: true, $ne: "" } } },
      { $sample: { size: aiCount * 2 } }
    ]).toArray();

    const usedDescriptions = new Set();
    const aiImages = [];

    for (const img of descriptions) {
      if (aiImages.length >= aiCount) break;
      const desc = img.description.trim();
      if (usedDescriptions.has(desc)) continue;

      const url = await generateImageFromDescription(desc);
      if (url) {
        aiImages.push({
          imageUrl: url,
          description: desc,
          correctAnswer: "ai"
        });
        usedDescriptions.add(desc);
      }
    }

    // 3. If we still have fewer than totalImages, fill with fallback
    while ((formattedRealImages.length + aiImages.length) < totalImages) {
      aiImages.push({
        imageUrl: "https://via.placeholder.com/512x512?text=Image+Unavailable",
        description: "Image failed to load. This is a placeholder.",
        correctAnswer: "ai"
      });
    }

    // 4. Combine and shuffle
    const allQuestions = [...formattedRealImages, ...aiImages].sort(() => Math.random() - 0.5);

    res.json({ questions: allQuestions });
  } catch (err) {
    console.error("Image TF generation failed:", err.message);
    res.status(500).json({ error: "Failed to generate image T/F questions" });
  }
});


// ====================[Community] Leaderboard API ====================
app.get("/api/leaderboard", async (req, res) => {
  try {
    const recordCol = db.collection("gameRecords");

    const modes = ["text", "image", "T/F"];
    const results = {};

    for (const mode of modes) {
      const topPerUser = await recordCol.aggregate([
        { $match: { mode } },
        { $sort: { score: -1, createdAt: 1 } },
        {
          $group: {
            _id: "$username",
            username: { $first: "$username" },
            score: { $first: "$score" },
            total: { $first: "$total" }
          }
        },
        { $sort: { score: -1 } },
        { $limit: 10 }
      ]).toArray();

      results[mode] = topPerUser;
    }

    // get best record from user (if login)
    const token = req.headers.authorization?.split(" ")[1];
    let myBest = {};
    if (token) {
      try {
        const { username } = jwt.verify(token, JWT_SECRET);
        for (const mode of modes) {
          const best = await recordCol.find({ username, mode })
            .sort({ score: -1 })
            .limit(1)
            .next();
          if (best) myBest[mode] = best;
        }
      } catch (err) {
        // ignore
      }
    }

    res.json({ top10ByMode: results, myBest });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});


// ====================[Community] Add comments API ====================

app.post("/api/add-comment", async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 5) {
    return res.status(400).json({ error: "Comment too short or empty." });
  }

  try {
    const examplesCol = db.collection("examples");
    const result = await examplesCol.insertOne({
      text: text.trim(),
      createdAt: new Date()
    });
    res.json({ message: "Comment added successfully!", id: result.insertedId });
  } catch (err) {
    console.error("Failed to add comment:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ====================[Community]  Add news API ====================
app.post("/api/add-news", async (req, res) => {
  const { news, comment } = req.body;
  if (!news || !comment) {
    return res.status(400).json({ error: "Missing news or comment." });
  }

  try {
    const questionsCol = db.collection("questions");
    await questionsCol.insertOne({
      mode: "text",
      prompt: news.trim(),
      humanAnswer: comment.trim(),
      createdAt: new Date()
    });
    res.json({ message: "News added successfully!" });
  } catch (err) {
    console.error("Failed to add news:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});
