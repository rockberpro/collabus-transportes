import { MongoClient, ObjectId } from "mongodb";
import { logger } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  logger.info("GET /api/persons/[userId] - Get persons by user ID request received");
  
  try {
    const userId = getRouterParam(event, 'userId');
    
    if (!userId) {
      logger.warn("Validation failed: userId parameter is required");
      throw createError({
        statusCode: 400,
        statusMessage: "ID do usuário é obrigatório",
      });
    }

    logger.debug("Request received for userId", { userId });

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

    // Buscar todas as persons do usuário
    logger.databaseAction("Finding persons by userId", "persons", { userId });
    const personDocs = await persons.find({ userId: userId }).toArray();
    await client.close();
    
    logger.databaseAction("Persons found", "persons", { 
      userId, 
      count: personDocs.length 
    });

    // Mapear documentos para interface do frontend
    const { mapPersonDocumentToPerson } = await import("../../../types/person");
    const mappedPersons = personDocs.map(doc => mapPersonDocumentToPerson({
      _id: doc._id?.toString(),
      name: doc.name,
      userId: doc.userId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    logger.info("Persons retrieved successfully", {
      userId,
      count: mappedPersons.length,
    });

    return {
      success: true,
      persons: mappedPersons,
    };

  } catch (error: any) {
    logger.error("Error retrieving persons", {
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
