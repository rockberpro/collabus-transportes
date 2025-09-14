import { PersonService } from "~~/server/services/person";
import { EmailService } from "../../services/email";
import { UserService } from "../../services/user";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const token = query.token as string;

    if (!token) {
      throw createError({
        statusCode: 400,
        message: "Token de ativação é obrigatório",
      });
    }

    const userService = new UserService();
    const personService = new PersonService();
    const user = await userService.findUserByToken(token);
    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Token inválido ou conta já ativada",
      });
    }
    const person = await personService.findPersonsByUserId(user._id!);

    await userService.activateUser(user._id!);
    try {
      const emailService = new EmailService();
      await emailService.sendWelcomeEmail(
        user.email,
        person.name
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return {
      success: true,
      message: "Conta ativada com sucesso!",
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Erro interno do servidor",
    });
  }
});
