import express from "express";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

let openRouterClient: OpenAI | null = null;

function getOpenRouterClient() {
  if (!openRouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("OPENROUTER_API_KEY is missing. Please add your OpenRouter API key in the Secrets panel.");
    }
    openRouterClient = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Bible Scholar AI",
      },
    });
  }
  return openRouterClient;
}

app.post("/api/explain", async (req, res) => {
  const { query } = req.body;

  try {
    const client = getOpenRouterClient();
    const response = await client.chat.completions.create({
      model: "deepseek/deepseek-r1", // Using DeepSeek R1 via OpenRouter
      messages: [
        {
          role: "system",
          content: `You are an expert Bible scholar. 
          Your goal is to provide a structured explanation of Bible verses in Bengali.
          Please structure your response exactly with the following headings in Bengali:
          1. **পদ:** (The verse text in Bengali)
          2. **ঐতিহাসিক প্রেক্ষাপট:** (Historical and literary context of the verse)
          3. **তাত্ত্বিক অর্থ:** (Theological depth and spiritual meaning)
          4. **ব্যবহারিক শিক্ষা:** (Practical application for life)
          
          IMPORTANT: Everything must be in Bengali. Use a respectful and scholarly tone.`
        },
        { role: "user", content: query }
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error: any) {
    console.error("OpenRouter API Error:", error);
    const status = error.message?.includes("OPENROUTER_API_KEY is missing") ? 401 : 500;
    res.status(status).json({ error: error.message || "Failed to fetch explanation from OpenRouter." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
