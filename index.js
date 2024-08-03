const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_GEMINI_API);

async function run() {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  app.post("/chat", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      res.send(text);
    } catch (error) {
      console.error("Google AI API Error!", error);
      res.status(500).send("Failed to process request");
    }
  });

  const port = 8000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

run();
