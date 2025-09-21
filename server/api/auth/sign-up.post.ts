import type { SignUpData } from "../../../types/user";
import { EmailService } from "../../services/email";
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
    const body = await readBody<SignUpData>(event);

    if (!body.name || !body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nome, email e senha são obrigatórios",
      });
    }

    if (body.password !== body.passwordConfirm) {
      throw createError({
        statusCode: 400,
        statusMessage: "As senhas não coincidem",
      });
    }

    const userService = new UserService();
    const { user: createdUser, activationToken } = await userService.createUserWithPerson({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    try {
      const emailService = new EmailService();
      await emailService.sendActivationEmail(
        body.email,
        body.name,
        activationToken
      );
    } catch (emailError) {
      console.error("Failed to send activation email:", emailError);
    }

    return {
      success: true,
      user: createdUser,
    };
  } catch (error: unknown) {
    if (isErrorWithStatusCode(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor",
    });
  }
});
