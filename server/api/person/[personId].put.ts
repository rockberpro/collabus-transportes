import { PersonService } from "~~/server/services/person";

export default defineEventHandler(async (event) => {
  try {
    const personId = getRouterParam(event, "personId");
    if (!personId) {
      throw createError({ statusCode: 400, statusMessage: "ID da pessoa é obrigatório" });
    }

    const body = await readBody(event);

    const personService = new PersonService();
    await personService.updatePerson(personId, body);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Erro interno do servidor" });
  }
});