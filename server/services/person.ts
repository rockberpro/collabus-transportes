import { ObjectId } from "mongodb";
import type {
  Person,
  PersonDocument,
  PersonWithUser,
  PersonWithUserNoPassword,
} from "../../types/person";
import { MongoDBFactory } from "../factories/mongoFactory";

export class PersonService {
  private dbFactory: MongoDBFactory;

  constructor() {
    this.dbFactory = MongoDBFactory.getInstance();
  }

  async findPersonById(personId: string): Promise<PersonDocument | null> {
    const db = await this.dbFactory.getDatabase();
    const persons = db.collection("persons");

    return (await persons.findOne({
      _id: new ObjectId(personId),
    })) as PersonDocument | null;
  }

  async findPersonsByUserId(userId: ObjectId): Promise<Person> {
    const db = await this.dbFactory.getDatabase();
    const persons = db.collection("persons");

    return (await persons
      .find({
        userId: userId,
      })
      .next()) as unknown as Person;
  }

  async createPerson(personDocument: PersonDocument): Promise<string> {
    const db = await this.dbFactory.getDatabase();
    const persons = db.collection("persons");

    const result = await persons.insertOne(personDocument);
    return result.insertedId.toString();
  }

  async updatePerson(
    personId: string,
    updateData: Partial<PersonDocument>
  ): Promise<void> {
    const db = await this.dbFactory.getDatabase();
    const persons = db.collection("persons");

    await persons.updateOne(
      { _id: new ObjectId(personId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );
  }

  async deletePerson(personId: string): Promise<void> {
    const db = await this.dbFactory.getDatabase();
    const persons = db.collection("persons");

    await persons.deleteOne({
      _id: new ObjectId(personId),
    });
  }

  async findPersonWithUser(
    personId: string
  ): Promise<PersonWithUserNoPassword | null> {
    const db = await this.dbFactory.getDatabase();
    const persons = db.collection("persons");

    const personWithUser = (await persons
      .aggregate([
        { $match: { _id: new ObjectId(personId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .next()) as PersonWithUser | null;
    if (!personWithUser) {
      return null;
    }

    const { user, ...personWithoutUserNoPassword } =
      personWithUser as PersonWithUser;

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;

    return { ...personWithoutUserNoPassword, user: userWithoutPassword };
  }
}
