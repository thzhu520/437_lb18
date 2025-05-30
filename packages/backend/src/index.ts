import express from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

app.use(express.static(STATIC_DIR));

// Example endpoint
app.get("/hello", (_req, res) => {
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
