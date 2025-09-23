import { MongoClient, Db } from "mongodb";

export class MongoDBFactory {
  private static instance: MongoDBFactory;
  private client: MongoClient | null = null;
  private clientPromise: Promise<MongoClient> | null = null;
  private mongoUri: string;
  private dbName: string;
  private authSource: string;

  private constructor() {
    this.mongoUri = process.env.MONGODB_URI || "";
    this.dbName = process.env.MONGODB_DB_NAME || "";
    this.authSource = process.env.MONGODB_AUTH_SOURCE || "";
  }

  public static getInstance(): MongoDBFactory {
    if (!MongoDBFactory.instance) {
      MongoDBFactory.instance = new MongoDBFactory();
    }
    return MongoDBFactory.instance;
  }

  public async getClient(): Promise<MongoClient> {
    if (!this.clientPromise) {
      this.clientPromise = this.createConnection();
    }
    return this.clientPromise;
  }

  private async createConnection(): Promise<MongoClient> {
    if (!this.client) {
      this.client = new MongoClient(this.mongoUri, {
        authSource: this.authSource,
      });
      await this.client.connect();
      await this.client.db('admin').command({ ping: 1 });
      console.log('MongoDB conectado com sucesso');
    }
    return this.client;
  }

  public async getDatabase(): Promise<Db> {
    const client = await this.getClient();
    return client.db(this.dbName);
  }

  public async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        console.error("Error closing MongoDB client:", error);
      } finally {
        this.client = null;
        this.clientPromise = null;
      }
    }
  }

  public getDatabaseName(): string {
    return this.dbName;
  }
}
