import { MongoClient, ObjectId } from "mongodb";
import type { 
  UserDocument, 
  CreateUserDocument,
  User 
} from "../../types/user";

export class UserService {
  private mongoUri: string;
  private dbName: string;
  private authSource: string;

  constructor() {
    this.mongoUri = process.env.MONGODB_URI || "";
    this.dbName = process.env.MONGODB_DB_NAME || "";
    this.authSource = process.env.MONGODB_AUTH_SOURCE || "";
  }

  private async getClient(): Promise<MongoClient> {
    const client = new MongoClient(this.mongoUri, {
      authSource: this.authSource,
    });
    await client.connect();
    return client;
  }

  async findUserByToken(token: string): Promise<UserDocument | null> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      return await users.findOne({ 
        token: token, 
        active: false 
      }) as UserDocument | null;
    } finally {
      await client.close();
    }
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      return await users.findOne({ email }) as UserDocument | null;
    } finally {
      await client.close();
    }
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      return await users.findOne({ 
        _id: new ObjectId(userId) 
      }) as UserDocument | null;
    } finally {
      await client.close();
    }
  }

  async createUser(userDocument: CreateUserDocument): Promise<string> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      const result = await users.insertOne(userDocument);
      return result.insertedId.toString();
    } finally {
      await client.close();
    }
  }

  async activateUser(userId: ObjectId): Promise<void> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      await users.updateOne(
        { _id: userId },
        {
          $set: { active: true },
          $unset: { token: "" },
        }
      );
    } finally {
      await client.close();
    }
  }

  async updateUser(userId: string, updateData: Partial<UserDocument>): Promise<void> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
      );
    } finally {
      await client.close();
    }
  }

  async findUserWithPerson(token: string): Promise<any> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      const result = await users.aggregate([
        { $match: { token: token, active: false } },
        {
          $lookup: {
            from: "persons",
            localField: "_id",
            foreignField: "userId",
            as: "person"
          }
        },
        { $unwind: "$person" }
      ]).next();

      return result;
    } finally {
      await client.close();
    }
  }
}
