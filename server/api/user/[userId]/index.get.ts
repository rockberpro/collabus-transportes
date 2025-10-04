import { UserService } from "~~/server/services/user";

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "userId");
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID do usuário é obrigatório",
      });
    }

    const userService = new UserService();
    const user = await userService.findUserById(userId);
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "Usuário não encontrado",
      });
    }

    return {
      data: { ...user }
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
