import { TokenService } from "../../services/token";

export default defineEventHandler(async (event) => {
  const tokenService = new TokenService();
  try {
    const session = await getUserSession(event) as any;
    const userId = session.user.id;
    if (!userId) {
      throw createError({
        statusCode: 401,
        message: "Usuário não autenticado",
      });
    }
    await tokenService.revokeToken(userId);
    await clearUserSession(event);

    return { message: "Desconectado com sucesso!" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Erro ao desconectar",
    });
  }
});
