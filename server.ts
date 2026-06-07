import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Custom devotion generator utilizing Gemini 3.5 Flash server-side
  app.post("/api/inspiration", async (req: express.Request, res: express.Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(200).json({
          error: "Gemini Key Not Configured",
          useFallback: true
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const { mood, userName } = req.body;
      const moodPrompt = mood ? `The user's current work state/mood: ${mood}.` : "";
      const namePrompt = userName ? `The user's name is ${userName}` : "the user";

      const prompt = `You are an uplifting and warm workspace spiritual guide for RAMSWORKDAY employees.
Generate a custom devotional block for ${namePrompt} to ease their rigorous weekly shift (which runs Monday-Thursday).
${moodPrompt}
You must return only a valid JSON object matching this schema:
{
  "motivation": "A strong, warm work encouragement/focus quote (1-2 sentences).",
  "bibleVerse": "An inspiring Bible verse with book/chapter/verse citation, relevant to work, perseverance, strength, or peace.",
  "prayer": "A brief, heartwarming prayer (2-3 sentences) that requests focus, endurance, peace of mind, and a grateful hand during tasks today."
}
Return only the json output. Do not include markdown wraps or code formatting blocks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8,
        }
      });

      if (!response || !response.text) {
        throw new Error("Empty response from AI engine");
      }

      const cleanedText = response.text.trim();
      const data = JSON.parse(cleanedText);
      res.json(data);
    } catch (err: any) {
      console.error("Gemini API Error details:", err);
      res.status(500).json({ error: "AI dispatch failed. Please use offline-fallback cards." });
    }
  });

  // Vite or Static Asset Handler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support modern SPA routing
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RAMSWORKDAY] server running at host 0.0.0.0 on port ${PORT}`);
  });
}

startServer();
