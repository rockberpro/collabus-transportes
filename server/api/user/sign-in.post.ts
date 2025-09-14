import type { SignInData } from "../../../types/user";
import { UserService } from "../../services/user";

function isErrorWithStatusCode(
  error: unknown
): error is Error & { statusCode: number } {
  return (
    error instanceof Error &&
    "statusCode" in error &&
    typeof (error as any).statusCode === "number"
  );
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<SignInData>(event);

    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email e senha são obrigatórios",
      });
    }

    const userService = new UserService();
    
    const authenticatedUser = await userService.authenticateUser(
      body.email, 
      body.password
    );

    return {
      success: true,
      user: authenticatedUser,
    };
  } catch (error: unknown) {
    if (isErrorWithStatusCode(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor.",
    });
  }
});
