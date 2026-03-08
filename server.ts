import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Gemini API client (Server-side, secure)
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // AI Builder API route
  app.post("/api/build", async (req, res) => {
    const { prompt, type } = req.body;
    try {
      const systemInstruction = type === 'web-app' 
        ? "You are an expert Web App Builder. Provide complete, clean, and professional HTML/CSS/JS code for the requested website."
        : "You are an expert App Builder. Provide complete, clean, and professional code for the requested mobile/desktop app.";
        
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview", // Best for coding tasks
        contents: prompt,
        config: { systemInstruction }
      });

      if (!response.text) throw new Error("No response from AI");

      res.json({ code: response.text });
    } catch (error: any) {
      console.error("AI Builder Error:", error);
      res.status(500).json({ error: "Failed to build. Please try again." });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV === "development") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(3000, "0.0.0.0", () => console.log(`Server running on http://localhost:3000`));
}
startServer();
