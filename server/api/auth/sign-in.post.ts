import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserService } from "../../services/user";
import { TokenService } from "../../services/token";
import { Role } from "@prisma/client";

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
    // set server session via helper (if available)
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });

    // Additionally ensure a cookie is set with attributes suitable for cross-site usage
    try {
      // use h3 setCookie to explicitly set cookie attributes
      const { setCookie } = await import('h3');
      const cookieOptions: any = {
        httpOnly: true,
        path: '/',
        sameSite: 'None',
        secure: process.env.NODE_ENV === 'production' || false,
        maxAge: 7 * 24 * 60 * 60,
      };
      // store a minimal session marker (server still manages the real session)
      setCookie(event, 'collabus_session', accessToken, cookieOptions);
    } catch (cookieErr) {
      // ignore cookie set errors but log
      console.warn('Failed to set explicit cookie for session:', cookieErr);
    }

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
      role: user.role,
      companyId: user.companyId,
    },
  };
});
