import { TokenService } from "../../services/token";

export default defineEventHandler(async (event) => {
  const tokenService = new TokenService();
  try {
    // try to read session; be defensive in case getUserSession throws or returns null
    let session: any = null;
    try {
      session = await getUserSession(event);
    } catch (e) {
      console.warn('getUserSession threw an error during sign-out:', e);
      session = null;
    }

    const userId = session?.user?.id;

    if (!userId) {
      // No session user id available. Attempt to clear any session and return success (idempotent logout).
      try {
        await clearUserSession(event);
      } catch (clearErr) {
        console.warn('clearUserSession failed during idempotent sign-out:', clearErr);
      }
      return { message: 'Desconectado com sucesso!' };
    }

    // Revoke all tokens for the user and clear session
    try {
      await tokenService.revokeUserTokens(userId);
    } catch (revokeErr) {
      console.error('Failed to revoke user tokens during sign-out for userId', userId, revokeErr);
      // continue to clear session even if revoke fails
    }

    try {
      await clearUserSession(event);
    } catch (clearErr) {
      console.error('Failed to clear user session during sign-out for userId', userId, clearErr);
      // still return success to the client, but log the issue
      return { message: 'Desconectado com sucesso!' };
    }

    return { message: 'Desconectado com sucesso!' };
  } catch (error) {
    console.error('Unexpected error in sign-out endpoint:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao desconectar',
    });
  }
});
