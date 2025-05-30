import express from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { IMAGES } from "./common/ApiImageData";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

app.use(express.static(STATIC_DIR));

// Example endpoint
app.get("/api/hello", (_req, res) => {
  res.send("Hello world");
});

// SPA fallback for all valid frontend routes
for (const route of Object.values(ValidRoutes)) {
  app.get(route as string, (_req, res) => {
    res.sendFile(path.resolve(STATIC_DIR, "index.html"));
  });
}

  

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// lab 20
function waitDuration(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  app.get("/api/images", async (_req, res) => {
    await waitDuration(1000); // Delay 1 second
    res.json(IMAGES);
  });