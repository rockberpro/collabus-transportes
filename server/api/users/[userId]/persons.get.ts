import { MongoClient } from "mongodb";

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "userId");

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID do usuário é obrigatório",
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
    const persons = db.collection("persons");

    const personDocs = await persons.find({ userId: userId }).toArray();
    await client.close();

    const { mapPersonDocumentToPerson } = await import("../../../../types/person");
    const mappedPersons = personDocs.map((doc) =>
      mapPersonDocumentToPerson({
        _id: doc._id?.toString(),
        name: doc.name,
        userId: doc.userId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })
    );

    return {
      success: true,
      persons: mappedPersons,
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
