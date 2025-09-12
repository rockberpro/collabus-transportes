import { MongoClient } from "mongodb";
import type { CreatePersonData } from "../../../types/person";
import { logger } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  logger.info("POST /api/persons - Create person request received");
  
  try {
    const body = await readBody<CreatePersonData>(event);
    logger.debug("Request body received", { userId: body.userId });

    // Validação básica
    if (!body.name || !body.userId) {
      logger.warn("Validation failed: name and userId are required", {
        hasName: !!body.name,
        hasUserId: !!body.userId,
      });
      throw createError({
        statusCode: 400,
        statusMessage: "Nome e ID do usuário são obrigatórios",
      });
    }

    // Conectar ao MongoDB usando variáveis de ambiente
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

    // Verificar se já existe uma person com esse nome para o usuário
    logger.databaseAction("Checking if person exists for user", "persons", { 
      name: body.name, 
      userId: body.userId 
    });
    const existingPerson = await persons.findOne({ 
      name: body.name, 
      userId: body.userId 
    });
    
    if (existingPerson) {
      await client.close();
      logger.warn("Person creation failed: person already exists for user", { 
        name: body.name, 
        userId: body.userId 
      });
      throw createError({
        statusCode: 409,
        statusMessage: "Já existe uma pessoa com este nome para este usuário",
      });
    }

    // Mapear dados do frontend para o banco
    logger.debug("Processing person data");
    const { mapCreatePersonDataToPersonDocument } = await import("../../../types/person");
    const personDocument = mapCreatePersonDataToPersonDocument(body);

    logger.databaseAction("Creating new person", "persons", { 
      name: body.name, 
      userId: body.userId 
    });
    const result = await persons.insertOne(personDocument);
    await client.close();
    logger.databaseAction("Person created successfully", "persons", { 
      personId: result.insertedId.toString(),
      name: body.name,
      userId: body.userId 
    });

    const { mapPersonDocumentToPerson } = await import("../../../types/person");
    const createdPerson = mapPersonDocumentToPerson({
      _id: result.insertedId.toString(),
      ...personDocument,
    });

    logger.info("Person created successfully", {
      personId: createdPerson.id,
      name: createdPerson.name,
      userId: createdPerson.userId,
    });

    return {
      success: true,
      person: createdPerson,
    };

  } catch (error: any) {
    logger.error("Error creating person", {
      error: error.message,
      stack: error.stack,
    });

    // Se o erro já foi tratado (createError), apenas re-throw
    if (error.statusCode) {
      throw error;
    }

    // Erro genérico do servidor
    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor",
    });
  }
});
