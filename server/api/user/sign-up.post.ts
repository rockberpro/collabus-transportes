import { MongoClient } from "mongodb";
import type { SignUpData } from "../../../types/user";
import {
  mapSignUpDataToUserDocument,
  mapUserDocumentToUser,
} from "../../../types/user";
import { EmailService } from "../../services/email";

function isErrorWithStatusCode(
  error: unknown
): error is Error & { statusCode: number } {
  return (
    error instanceof Error &&
    "statusCode" in error &&
    typeof (error as any).statusCode === "number"
  );
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<SignUpData>(event);

    if (!body.name || !body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nome, email e senha são obrigatórios",
      });
    }

    if (body.password !== body.passwordConfirm) {
      throw createError({
        statusCode: 400,
        statusMessage: "As senhas não coincidem",
      });
    }

    const mongoUri = process.env.MONGODB_URI || "";
    const dbName = process.env.MONGODB_DB_NAME || "";
    const authSource = process.env.MONGODB_AUTH_SOURCE || "";

    const client = new MongoClient(mongoUri, {
      authSource,
    });

    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const existingUser = await users.findOne({ email: body.email });
    if (existingUser) {
      await client.close();
      logger.warn("Sign-up failed: user already exists", { email: body.email });
      throw createError({
        statusCode: 409,
        statusMessage: "Usuário já existe com este email",
      });
    }

    const userDocument = await mapSignUpDataToUserDocument(body);

    const result = await users.insertOne(userDocument);
    const userId = result.insertedId.toString();

    try {
      const persons = db.collection("persons");
      const { mapCreatePersonDataToPersonDocument } = await import(
        "../../../types/person"
      );

      const personData = {
        name: body.name,
        userId: userId,
      };

      const personDocument = mapCreatePersonDataToPersonDocument(personData);

      await persons.insertOne(personDocument);

      logger.databaseAction("Person entry created successfully", "persons", {
        name: body.name,
        userId,
      });
    } catch (personError) {
      logger.logError(personError as Error, "PERSON_CREATION", {
        userId,
        email: body.email,
        name: body.name,
      });
    }

    await client.close();

    const createdUser = mapUserDocumentToUser({
      _id: userId,
      ...userDocument,
    });

    try {
      const emailService = new EmailService();
      await emailService.sendActivationEmail(
        body.email,
        body.name,
        userDocument.token
      );
    } catch (emailError) {}

    return {
      success: true,
      user: createdUser,
    };
  } catch (error: unknown) {
    if (isErrorWithStatusCode(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor",
    });
  }
});
