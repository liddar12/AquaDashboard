import express from "express";
import { createServer as createViteServer } from "vite";
import { serve } from "inngest/express";
import { inngest } from "./src/inngest/client";
import { pollIAquaLink } from "./src/inngest/functions";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Inngest endpoint
  app.use(
    "/api/inngest",
    serve({
      client: inngest,
      functions: [pollIAquaLink],
    })
  );

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Inngest endpoint available at http://localhost:${PORT}/api/inngest`);
  });
}

startServer();
