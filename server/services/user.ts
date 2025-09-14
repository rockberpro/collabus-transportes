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
      }) as UserDocument;
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

  async findUserWithPersonByToken(token: string): Promise<any> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      const result = await users.aggregate([
        { $match: { token: token } },
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

  async findUserWithPerson(id: string): Promise<any> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      const result = await users.aggregate([
        { $match: { _id: new ObjectId(id) } },
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

  async authenticateUser(email: string, password: string): Promise<any> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      
      const user = await users.findOne({ email });
      
      if (!user) {
        throw createError({
          statusCode: 401,
          statusMessage: "Email ou senha incorretos",
        });
      }

      if (!user.active) {
        throw createError({
          statusCode: 403,
          statusMessage: "Conta não ativada! Verifique seu email para ativar a conta.",
        });
      }

      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw createError({
          statusCode: 401,
          statusMessage: "Email ou senha incorretos.",
        });
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        type: user.type,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: user.token,
      };
    } finally {
      await client.close();
    }
  }

  async createUserWithPerson(signUpData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: any; activationToken: string }> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const users = db.collection("users");
      const persons = db.collection("persons");

      const existingUser = await users.findOne({ email: signUpData.email });
      if (existingUser) {
        throw createError({
          statusCode: 409,
          statusMessage: "Usuário já existe com este email",
        });
      }

      const bcrypt = await import('bcryptjs');
      const { randomUUID } = await import('crypto');
      
      const hashedPassword = await bcrypt.hash(signUpData.password, 12);
      const activationToken = randomUUID();

      const userDocument = {
        name: signUpData.name,
        email: signUpData.email,
        password: hashedPassword,
        type: 'passenger' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: false,
        token: activationToken,
      };

      const userResult = await users.insertOne(userDocument);
      const userId = userResult.insertedId;

      const personDocument = {
        name: signUpData.name,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await persons.insertOne(personDocument);

      return {
        user: {
          id: userId.toString(),
          name: userDocument.name,
          email: userDocument.email,
          type: userDocument.type,
          createdAt: userDocument.createdAt,
          updatedAt: userDocument.updatedAt,
          token: userDocument.token,
        },
        activationToken,
      };
    } finally {
      await client.close();
    }
  }
}
