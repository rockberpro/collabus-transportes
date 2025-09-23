import { ObjectId } from "mongodb";
import { MongoDBFactory } from "../factories/mongoFactory";

export class TokenService {
  private dbFactory: MongoDBFactory;

  constructor() {
    this.dbFactory = MongoDBFactory.getInstance();
  }

  async setToken(token: string, userId: string): Promise<void> {
    const db = await this.dbFactory.getDatabase();
    const tokens = db.collection("tokens");

    const existingToken = await tokens.findOne({ 
      userId: new ObjectId(userId), 
      revokedAt: { $exists: false } 
    });
    
    if (!existingToken) {
      // No existing token, insert a new one
      await tokens.insertOne({
        userId: new ObjectId(userId),
        token: token,
        createdAt: new Date(),
        // revokedAt não existe para tokens ativos
      });
      return;
    }

    // Revoke existing token
    await tokens.updateOne(
      { _id: existingToken._id },
      { $set: { revokedAt: new Date() } }
    );

    // Insert a new token
    await tokens.insertOne({
      userId: new ObjectId(userId),
      token: token,
      createdAt: new Date(),
      // revokedAt: active tokens don't have this field
    });
  }

  async revokeToken(userId: string): Promise<void> {
    const db = await this.dbFactory.getDatabase();
    const tokens = db.collection("tokens");

    await tokens.updateMany(
      { userId: new ObjectId(userId), revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    );
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const db = await this.dbFactory.getDatabase();
    const tokens = db.collection("tokens");

    const tokenDoc = await tokens.findOne({ token: token });
    return !!(tokenDoc && tokenDoc.revokedAt);
  }
}
