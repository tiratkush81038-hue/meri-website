import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Gemini API client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // Chat/Builder API route
  app.post("/api/chat", async (req, res) => {
    const { message, type } = req.body;
    try {
      const systemInstruction = type === 'web-app' 
        ? "You are an expert Web App Builder. Write clean, professional HTML/CSS/JS code."
        : "You are an expert App Builder. Write clean, professional code for mobile/desktop apps.";
        
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
        config: { systemInstruction }
      });

      // Agar response.text nahi hai, toh error throw karein
      if (!response.text) {
        throw new Error("Model returned no text response (possibly blocked by safety filters)");
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to call Gemini" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware
  if (process.env.NODE_ENV === "development" || !fs.existsSync(path.join(__dirname, "dist"))) {
    if (process.env.NODE_ENV === "development") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.join(__dirname, "src")));
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "index.html"));
      });
    }
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:3000`);
  });
}

startServer();
