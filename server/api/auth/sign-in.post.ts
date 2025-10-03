import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserService } from "../../services/user";
import { TokenService } from "../../services/token";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  const userService = new UserService();
  const tokenService = new TokenService();
  const user = await userService.authenticateUser(email, password);

  const accessTokenExpiry = 60 * 60; // 1 hour
  const refreshTokenExpiry = 60 * 60 * 24 * 7; // 7 days

  const accessToken = jwt.sign(
    { userId: user.id, type: "access" },
    process.env.JWT_SECRET as string,
    { expiresIn: accessTokenExpiry, algorithm: "HS512" }
  );
  const refreshToken = jwt.sign(
    { userId: user.id, type: "refresh" },
    process.env.JWT_SECRET as string,
    { expiresIn: refreshTokenExpiry, algorithm: "HS512" }
  );

  try {
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });

    await tokenService.setRefreshToken(refreshToken, user.id);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Erro ao criar sessão do usuário",
    });
  }

  return {
    token: {
      accessToken: accessToken,
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
});
