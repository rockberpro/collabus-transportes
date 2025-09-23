import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserService } from "../../services/user";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  const userService = new UserService();
  const user = await userService.authenticateUser(email, password);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError({
      statusCode: 401,
      message: "Invalid credentials",
    });
  }

  const accessToken = jwt.sign(
    { userId: user.id, type: "access" },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { userId: user.id, type: "refresh" },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token: refreshToken,
      tokenType: 'refreshToken'
    });

  return {
    token: accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
});
