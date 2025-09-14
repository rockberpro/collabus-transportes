import { MongoClient } from "mongodb";
import type { CreatePersonData } from "../../../types/person";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreatePersonData>(event);

    if (!body.name || !body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nome e ID do usuário são obrigatórios",
      });
    }

    const mongoUri = process.env.MONGODB_URI || "";
    const dbName = process.env.MONGODB_DB_NAME || "";
    const authSource = process.env.MONGODB_AUTH_SOURCE || "";

    const client = new MongoClient(mongoUri, {
      authSource,
    });

    logger.databaseAction("Connecting to MongoDB", "persons");
    await client.connect();
    const db = client.db(dbName);
    const persons = db.collection("persons");

    const existingPerson = await persons.findOne({
      name: body.name,
      userId: body.userId,
    });

    if (existingPerson) {
      await client.close();
      throw createError({
        statusCode: 409,
        statusMessage: "Já existe uma pessoa com este nome para este usuário",
      });
    }

    const { mapCreatePersonDataToPersonDocument } = await import(
      "../../../types/person"
    );
    const personDocument = mapCreatePersonDataToPersonDocument(body);

    const result = await persons.insertOne(personDocument);
    await client.close();

    const { mapPersonDocumentToPerson } = await import("../../../types/person");
    const createdPerson = mapPersonDocumentToPerson({
      _id: result.insertedId.toString(),
      ...personDocument,
    });

    return {
      success: true,
      person: createdPerson,
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor",
    });
  }
});
