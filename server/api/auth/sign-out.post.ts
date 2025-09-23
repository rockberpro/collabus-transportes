import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserService } from "../../services/user";

export default defineEventHandler(async (event) => {
  try {
    await clearUserSession(event);

    return { message: "Desconectado com sucesso!" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Erro ao desconectar",
    });
  }
});
