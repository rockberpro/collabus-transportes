import { UserService } from "~~/server/services/user";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const email = query.email as string;

    const userService = new UserService();

    if (email) {
      const user = await userService.findUserByEmail(email);
      if (!user) {
        throw createError({
          statusCode: 404,
          statusMessage: "Usuário não encontrado",
        });
      }

      return {
        user,
      };
    }
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
