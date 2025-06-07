import express from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "../connectMongo";
import { ImageProvider } from "../ImageProvider";
import { CredentialsProvider } from "./CredentialsProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes } from "./routes/authRoutes";
import { verifyAuthToken } from "./middleware/verifyAuthToken";
import { imageMiddlewareFactory, handleImageFileErrors } from "./middleware/imageUploadMiddleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const IMAGE_UPLOAD_DIR = process.env.IMAGE_UPLOAD_DIR || "uploads";
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
    console.log("- IMAGE_UPLOAD_DIR:", IMAGE_UPLOAD_DIR);
    console.log("- JWT_SECRET:", JWT_SECRET ? "✅" : "❌");
    console.log("- MONGO_USER:", process.env.MONGO_USER ? "✅" : "❌");
    console.log("- DB_NAME:", process.env.DB_NAME);
    console.log("- CREDS_COLLECTION_NAME:", process.env.CREDS_COLLECTION_NAME);

    // Store JWT secret in app locals for middleware access
    app.locals.JWT_SECRET = JWT_SECRET;

    // Setup middleware
    app.use(express.static(STATIC_DIR));
    app.use("/uploads", express.static(IMAGE_UPLOAD_DIR)); // Serve uploaded images
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

    // Auth routes (public - no authentication required)
    console.log("🔐 Setting up auth routes...");
    registerAuthRoutes(app, credentialsProvider);
    console.log("✅ Auth routes registered");

    type UploadRequest = express.Request & {
      file?: Express.Multer.File;
      user?: { username: string };
    };
    
    app.post(
      "/api/images",
      imageMiddlewareFactory.single("image"),
      handleImageFileErrors,
      verifyAuthToken,
      (async (req: UploadRequest, res: express.Response) => {
        console.log("📸 Image upload request received");
    
        try {
          if (!req.file) {
            return void res.status(400).json({
              error: "Bad Request",
              message: "No image file provided",
            });
          }
    
          const imageName = req.body.name;
          if (!imageName || typeof imageName !== "string") {
            return void res.status(400).json({
              error: "Bad Request",
              message: "Image name is required",
            });
          }
    
          const username = req.user?.username;
          if (!username) {
            return void res.status(401).json({
              error: "Unauthorized",
              message: "Invalid authentication token",
            });
          }
    
          const imageSrc = `/uploads/${req.file.filename}`;
          await imageProvider.createImage(imageSrc, imageName, username);
    
          console.log(`✅ Image uploaded successfully: ${req.file.filename}`);
          res.status(201).send();
        } catch (error) {
          console.error("❌ Image upload error:", error);
          return void res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to save image",
          });
        }
      }) as express.RequestHandler
    );
    
    
    

    // Apply authentication middleware to all other /api/images routes
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
      console.log(`🌐 Frontend: http://localhost:5173`);
      console.log(`🔍 Test API: http://localhost:3000/api/hello`);
      console.log(`📸 Upload images: POST http://localhost:3000/api/images`);
      console.log(`🖼️ View uploads: http://localhost:3000/uploads/`);
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