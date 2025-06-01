import express from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { ObjectId } from "mongodb";

// LAB 21: Import Mongo connector and image provider
import { connectMongo } from "../connectMongo";
import { ImageProvider } from "../ImageProvider";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

app.use(express.static(STATIC_DIR));
app.use(express.json()); 

// LAB 21: Mongo connection and image provider setup
const mongoClient = connectMongo();
const imageProvider = new ImageProvider(mongoClient);

// lab 20 delay
function waitDuration(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===== ALL API ROUTES SHOULD GO HERE, BEFORE SPA FALLBACK =====

// Example endpoint
app.get("/api/hello", (_req, res) => {
  res.send("Hello world");
});

// LAB 21: Replace with Mongo-backed image response
app.get("/api/images", async (_req, res) => {
  try {
    await waitDuration(1000); // Delay 1 second for UI loading effect
    const images = await imageProvider.getAllImagesDenormalized(); // Fetch from DB
    res.json(images); // Send JSON
  } catch (err) {
    console.error("Error in /api/images:", err);
    res.status(500).json({ error: "Failed to fetch images from MongoDB" });
  }
});

app.patch("/api/images/:imageId", async (req, res) => {
  const { imageId } = req.params;
  const { newName } = req.body;

  console.log("Updating", imageId, "to", newName);

  try {
    const result = await imageProvider.updateImageName(imageId, newName);
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Failed to update image name", err);
    res.status(500).json({ error: "Failed to update name" });
  }
});

// Optional: log collections for verification
// (async () => {
//   const collections = await mongoClient.db().listCollections().toArray();
//   console.log("Collections:", collections);
// })();

// ===== SPA FALLBACK ROUTES GO LAST =====
// SPA fallback for all valid frontend routes
for (const route of Object.values(ValidRoutes)) {
  app.get(route as string, (_req, res) => {
    res.sendFile(path.resolve(STATIC_DIR, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});