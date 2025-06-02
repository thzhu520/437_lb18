import express from "express";
import { ImageProvider } from "../../ImageProvider";
import { ObjectId } from "mongodb";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  // Delay for UX
  function waitDuration(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET /api/images — supports optional ?name= query param
  app.get("/api/images", (async (req: express.Request, res: express.Response) => {
    try {
      await waitDuration(1000);
      const query = typeof req.query.name === "string" ? req.query.name : undefined;
      const images = await imageProvider.getAllImagesDenormalized(query);
      res.json(images);
    } catch (err) {
      console.error("Error in GET /api/images:", err);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  }) as any);

  // PATCH /api/images/:imageId — update image name
  app.patch("/api/images/:imageId", (async (req: express.Request, res: express.Response) => {
    const { imageId } = req.params;
    const { newName } = req.body;
    const MAX_LENGTH = 100;

    // Error: missing name
    if (typeof newName !== "string") {
      return res.status(400).send({
        error: "Bad Request",
        message: "Missing or invalid name",
      });
    }

    // Error: too long
    if (newName.length > MAX_LENGTH) {
      return res.status(422).send({
        error: "Unprocessable Entity",
        message: `Image name exceeds ${MAX_LENGTH} characters`,
      });
    }

    // Error: invalid ObjectId
    if (!ObjectId.isValid(imageId)) {
      return res.status(404).send({
        error: "Not Found",
        message: "Image does not exist",
      });
    }

    try {
      const matchedCount = await imageProvider.updateImageName(imageId, newName);
      if (matchedCount === 0) {
        return res.status(404).send({
          error: "Not Found",
          message: "Image does not exist",
        });
      }
      res.status(204).send(); // Success, no content
    } catch (err) {
      console.error("Failed to update image name", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }) as any);
}