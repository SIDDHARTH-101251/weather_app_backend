const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// CORS configuration
const allowedOrigins = [process.env.REACT_APP_FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin, e.g. mobile apps or curl requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Google Generative AI configuration
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ensure your API key is set in the environment variables
const apiKey = process.env.REACT_APP_GOOGLE_GEMINI_API;
if (!apiKey) {
  console.error("API key for Google Generative AI is missing.");
  process.exit(1); // Exit if API key is not provided
}

const genAI = new GoogleGenerativeAI(apiKey);

// Define the AI model and API endpoint
async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Define a simple route for the root URL
  app.get("/", (req, res) => {
    res.send("Backend deployed successfully!");
  });

  // Define the chat endpoint
  app.post("/chat", async (req, res) => {
    const { prompt } = req.body;
    console.log("Received prompt:", prompt);

    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text(); // Ensure response.text() is awaited
      console.log("Generated text:", text);
      res.send(text);
    } catch (error) {
      console.error("Google AI API Error:", error.message);
      res.status(500).send("Failed to process request");
    }
  });

  const port = process.env.PORT || 8000; // Use environment port or default to 8000
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

run();
