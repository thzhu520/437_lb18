"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProvider = void 0;
const mongodb_1 = require("mongodb");
class ImageProvider {
    mongoClient;
    imageCollection;
    userCollection;
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const db = this.mongoClient.db(process.env.DB_NAME);
        this.imageCollection = db.collection(process.env.IMAGES_COLLECTION_NAME);
        this.userCollection = db.collection(process.env.USERS_COLLECTION_NAME);
    }
    async getAllImagesDenormalized(search) {
        const filter = search ? { name: { $regex: search, $options: "i" } } : {};
        const images = await this.imageCollection.find(filter).toArray();
        const authorIds = images.map(img => img.author);
        const users = await this.userCollection
            .find({ _id: { $in: authorIds } })
            .toArray();
        const userMap = Object.fromEntries(users.map(u => [u._id, u.username]));
        return images.map(img => ({
            id: img._id,
            src: img.src,
            name: img.name,
            author: {
                id: img.author,
                username: userMap[img.author] || "unknown"
            }
        }));
    }
    async updateImageName(imageId, newName) {
        const result = await this.imageCollection.updateOne({ _id: new mongodb_1.ObjectId(imageId) }, { $set: { name: newName } });
        return result.matchedCount;
    }
}
exports.ImageProvider = ImageProvider;
