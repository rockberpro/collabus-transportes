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
        statusMessage: "Token de ativação é obrigatório",
      });
    }

    const userService = new UserService();
    const personService = new PersonService();
    
    const user = await userService.findUserByActivationToken(token);
    console.log("Dados do usuario: ", user);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Token inválido, expirado ou conta já ativada",
      });
    }

    const person = await personService.findPersonByUserId(user.id);
    if (!person) {
      throw createError({
        statusCode: 404,
        statusMessage: "Pessoa associada ao usuário não encontrada",
      });
    }

    await userService.activateUser(user.id);
    
    try {
      const emailService = new EmailService();
      const fullName = `${person.firstName} ${person.lastName}`.trim();
      await emailService.sendWelcomeEmail(user.email, fullName);
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
      statusMessage: "Erro interno do servidor",
    });
  }
});
