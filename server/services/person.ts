import { MongoClient, ObjectId } from "mongodb";
import type { 
  PersonDocument, 
  CreatePersonDocument,
  Person 
} from "../../types/person";

export class PersonService {
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

  async findPersonById(personId: string): Promise<PersonDocument | null> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const persons = db.collection("persons");
      
      return await persons.findOne({ 
        _id: new ObjectId(personId) 
      }) as PersonDocument | null;
    } finally {
      await client.close();
    }
  }

  async findPersonsByUserId(userId: string): Promise<PersonDocument[]> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const persons = db.collection("persons");
      
      return await persons.find({ 
        userId: new ObjectId(userId) 
      }).next() as unknown as PersonDocument[];
    } finally {
      await client.close();
    }
  }

  async findPersonByNameAndUserId(name: string, userId: string): Promise<PersonDocument | null> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const persons = db.collection("persons");
      
      return await persons.findOne({
        name: name,
        userId: new ObjectId(userId),
      }) as PersonDocument | null;
    } finally {
      await client.close();
    }
  }

  async createPerson(personDocument: CreatePersonDocument): Promise<string> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const persons = db.collection("persons");
      
      const result = await persons.insertOne(personDocument);
      return result.insertedId.toString();
    } finally {
      await client.close();
    }
  }

  async updatePerson(personId: string, updateData: Partial<PersonDocument>): Promise<void> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const persons = db.collection("persons");
      
      await persons.updateOne(
        { _id: new ObjectId(personId) },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      );
    } finally {
      await client.close();
    }
  }

  async deletePerson(personId: string): Promise<void> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const persons = db.collection("persons");
      
      await persons.deleteOne({ 
        _id: new ObjectId(personId) 
      });
    } finally {
      await client.close();
    }
  }

  async findPersonWithUser(personId: string): Promise<any> {
    const client = await this.getClient();
    try {
      const db = client.db(this.dbName);
      const persons = db.collection("persons");
      
      const result = await persons.aggregate([
        { $match: { _id: new ObjectId(personId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" }
      ]).next();

      return result;
    } finally {
      await client.close();
    }
  }
}
