import { MongoClient, Collection } from "mongodb";
import { ObjectId } from "mongodb";


interface IImageDocument {
    _id: ObjectId;
    src: string;
    name: string;
    author: string;  // This is the user ID (reference)
}

interface IUserDocument {
    _id: string;
    username: string;
}

export class ImageProvider {
    private imageCollection: Collection<IImageDocument>;
    private userCollection: Collection<IUserDocument>;

    constructor(private readonly mongoClient: MongoClient) {
        const db = this.mongoClient.db(process.env.DB_NAME);
        this.imageCollection = db.collection(process.env.IMAGES_COLLECTION_NAME!);
        this.userCollection = db.collection(process.env.USERS_COLLECTION_NAME!);
    }

    async getAllImagesDenormalized(search?: string) {
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
      

      async updateImageName(imageId: string, newName: string): Promise<number> {
        const result = await this.imageCollection.updateOne(
          { _id: new ObjectId(imageId) },
          { $set: { name: newName } }
        );
        return result.matchedCount; 
      }
      
      
}
