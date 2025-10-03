import { TokenService } from "../../services/token";

export default defineEventHandler(async (event) => {
  const tokenService = new TokenService();
  try {
    const session = await getUserSession(event) as any;
    const userId = session.user.id;
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Usuário não autenticado",
      });
    }
    
    // Revogar todos os tokens do usuário
    await tokenService.revokeUserTokens(userId);
    await clearUserSession(event);

    return { message: "Desconectado com sucesso!" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao desconectar",
    });
  }
});
