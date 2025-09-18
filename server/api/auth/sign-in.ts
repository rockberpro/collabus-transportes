import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserService } from "../../services/user";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  const userService = new UserService();
  const user = await userService.authenticateUser(email, password);

  if (!user || !await bcrypt.compare(password, user.password)) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' }
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  }
})