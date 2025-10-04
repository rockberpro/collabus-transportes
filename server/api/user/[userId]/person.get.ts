import { PersonService } from "~~/server/services/person";

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "userId");
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID do usuário é obrigatório",
      });
    }

    const personService = new PersonService();
    const person = await personService.findPersonByUserId(userId);

    return {
      data: { ...person },
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
