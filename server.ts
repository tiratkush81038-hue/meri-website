import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: any;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  console.log("Starting server on port", PORT);

  try {
    console.log("Initializing database...");
    const Database = (await import("better-sqlite3")).default;
    db = new Database("data.db");
    
    // Initialize database tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS proofs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        caption TEXT,
        image TEXT,
        date TEXT,
        single TEXT,
        jodi TEXT,
        panel TEXT,
        is_locked INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS markets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT,
        utr TEXT,
        amount TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/proofs", (req, res) => {
    const proofs = db.prepare("SELECT * FROM proofs ORDER BY id DESC").all();
    res.json(proofs);
  });

  // Vite middleware for production/fallback
  if (process.env.NODE_ENV === "production") {
    console.log("Serving static files from dist");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    console.log("Using Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
