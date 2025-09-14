import type { CreatePersonData } from "../../../types/person";
import { PersonService } from "../../services/person";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreatePersonData>(event);

    if (!body.name || !body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nome e ID do usuário são obrigatórios",
      });
    }

    const personService = new PersonService();

    logger.databaseAction("Creating person", "persons");

    const existingPerson = await personService.findPersonByNameAndUserId(
      body.name, 
      body.userId.toString()
    );

    if (existingPerson) {
      throw createError({
        statusCode: 409,
        statusMessage: "Já existe uma pessoa com este nome para este usuário",
      });
    }

    const { mapCreatePersonDataToPersonDocument } = await import(
      "../../../types/person"
    );
    const personDocument = mapCreatePersonDataToPersonDocument(body);

    const personId = await personService.createPerson(personDocument);

    const { mapPersonDocumentToPerson } = await import("../../../types/person");
    const createdPerson = mapPersonDocumentToPerson({
      _id: personId,
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
