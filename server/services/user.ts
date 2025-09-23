import { ObjectId } from "mongodb";
import type { UserDocumentNoPassword, UserDocument } from "../../types/user";
import { MongoDBFactory } from "../factories/mongoFactory";
import { UserWithPerson, UserWithPersonNoPassword } from "~~/types/person";

export class UserService {
  private dbFactory: MongoDBFactory;

  constructor() {
    this.dbFactory = MongoDBFactory.getInstance();
  }

  async findUserByToken(token: string): Promise<UserDocumentNoPassword | null> {
    const db = await this.dbFactory.getDatabase();
    const users = db.collection("users");

    const user = (await users.findOne({
      token: token,
      active: false,
    })) as UserDocument | null;
    if (!user) {
      return null;
    }
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async findUserByEmail(email: string): Promise<UserDocumentNoPassword | null> {
    const db = await this.dbFactory.getDatabase();
    const users = db.collection("users");

    const user = (await users.findOne({ email })) as UserDocument | null;
    if (!user) {
      return null;
    }
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async findUserById(userId: string): Promise<UserDocumentNoPassword | null> {
    const db = await this.dbFactory.getDatabase();
    const users = db.collection("users");

    const user = (await users.findOne({
      _id: new ObjectId(userId),
    })) as UserDocument | null;
    if (!user) {
      return null;
    }
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async activateUser(userId: ObjectId): Promise<void> {
    const db = await this.dbFactory.getDatabase();
    const users = db.collection("users");

    await users.updateOne(
      { _id: userId },
      {
        $set: { active: true },
        $unset: { token: "" },
      }
    );
  }

  async updateUser(
    userId: string,
    updateData: Partial<UserDocument>
  ): Promise<void> {
    const db = await this.dbFactory.getDatabase();
    const users = db.collection("users");

    await users.updateOne({ _id: new ObjectId(userId) }, { $set: updateData });
  }

  async findUserWithPerson(
    id: string
  ): Promise<UserWithPersonNoPassword | null> {
    const db = await this.dbFactory.getDatabase();
    const users = db.collection("users");

    const userWithPerson = (await users
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "persons",
            localField: "_id",
            foreignField: "userId",
            as: "person",
          },
        },
        { $unwind: "$person" },
      ])
      .next()) as UserWithPerson | null;
    if (!userWithPerson) {
      return null;
    }
    const { password, ...userWithoutPassword } = userWithPerson;

    return userWithoutPassword;
  }

  async authenticateUser(email: string, password: string): Promise<any> {
    const db = await this.dbFactory.getDatabase();
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
        statusMessage:
          "Conta não ativada! Verifique seu email para ativar a conta.",
      });
    }

    const bcrypt = await import("bcryptjs");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Email ou senha incorretos.",
      });
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token: user.token,
    };
  }

  async createUserWithPerson(signUpData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: any; activationToken: string }> {
    const db = await this.dbFactory.getDatabase();
    const users = db.collection("users");
    const persons = db.collection("persons");

    const existingUser = await users.findOne({ email: signUpData.email });
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "Usuário já existe com este email",
      });
    }

    const bcrypt = await import("bcryptjs");
    const { randomUUID } = await import("crypto");

    const hashedPassword = await bcrypt.hash(signUpData.password, 12);
    const activationToken = randomUUID();

    const userDocument = {
      email: signUpData.email,
      password: hashedPassword,
      role: "passenger" as const,
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
        email: userDocument.email,
        role: userDocument.role,
        createdAt: userDocument.createdAt,
        updatedAt: userDocument.updatedAt,
        token: userDocument.token,
      },
      activationToken,
    };
  }
}
