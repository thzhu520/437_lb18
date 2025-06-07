import express from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "../connectMongo";
import { ImageProvider } from "../ImageProvider";
import { CredentialsProvider } from "./CredentialsProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes } from "routes/authRoutes";
import { verifyAuthToken } from "./middleware/verifyAuthToken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing from .env");
  process.exit(1);
}

async function main() {
  try {
    console.log("🔄 Starting server...");
    console.log("Environment check:");
    console.log("- PORT:", PORT);
    console.log("- STATIC_DIR:", STATIC_DIR);
    console.log("- JWT_SECRET:", JWT_SECRET ? "✅" : "❌");
    console.log("- MONGO_USER:", process.env.MONGO_USER ? "✅" : "❌");
    console.log("- DB_NAME:", process.env.DB_NAME);
    console.log("- CREDS_COLLECTION_NAME:", process.env.CREDS_COLLECTION_NAME);

    // Store JWT secret in app locals for middleware access
    app.locals.JWT_SECRET = JWT_SECRET;

    // Setup middleware
    app.use(express.static(STATIC_DIR));
    app.use(express.json());

    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    const mongoClient = connectMongo();
    await mongoClient.connect();
    console.log("✅ MongoDB connected successfully!");

    const imageProvider = new ImageProvider(mongoClient);
    const credentialsProvider = new CredentialsProvider(mongoClient);
    console.log("✅ Providers created");

    // Test endpoint (no auth required)
    app.get("/api/hello", (_req, res) => {
      console.log("📞 /api/hello called");
      res.send("Hello world");
    });

    app.post("/test-register", (req, res) => {
      res.json({ message: "Test route works", body: req.body });
    });

    // Auth routes (public - no authentication required)
    console.log("🔐 Setting up auth routes...");
    registerAuthRoutes(app, credentialsProvider);
    console.log("✅ Auth routes registered");

    // Apply authentication middleware to all /api/images routes
    console.log("🛡️ Setting up authentication middleware...");
    app.use("/api/images", (req, res, next) => {
      verifyAuthToken(req, res, next);
    });
    
    // Protected image routes (require authentication)
    registerImageRoutes(app, imageProvider);
    console.log("✅ Protected image routes registered");

    // SPA fallback routes
    console.log("🎯 Setting up SPA fallback routes...");
    for (const route of Object.values(ValidRoutes)) {
      app.get(route as string, (_req, res) => {
        res.sendFile(path.resolve(STATIC_DIR, "index.html"));
      });
    }
    console.log("✅ SPA routes configured");

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running successfully at http://localhost:${PORT}`);
      console.log(`🌐 Visit: https://thzhu.csse.dev`);
      console.log(`🔍 Test API: https://thzhu.csse.dev/api/hello`);
      console.log(`📝 Register: POST https://thzhu.csse.dev/auth/register`);
      console.log(`🔐 Login: POST https://thzhu.csse.dev/auth/login`);
      console.log(`📷 Images API: https://thzhu.csse.dev/api/images (requires auth)`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    console.error("Stack trace:", err instanceof Error ? err.stack : err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("💥 Critical error:", err);
  process.exit(1);
});