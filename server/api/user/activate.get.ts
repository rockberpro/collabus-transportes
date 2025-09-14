import { mapUserDocumentToUser } from "../../../types/user";
import { EmailService } from "../../services/email";
import { mapPersonDocumentToPerson } from "~~/types/person";
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

    console.log("Activation token received:", token);

    const userService = new UserService();
    const userWithPerson = await userService.findUserWithPerson(token);
    if (!userWithPerson) {
      throw createError({
        statusCode: 401,
        message: "Token inválido ou conta já ativada",
      });
    }

    const user = userWithPerson;
    const person = userWithPerson.person;
    
    await userService.activateUser(user._id);

    const activatedUser = mapUserDocumentToUser(user as any);
    const activatedPerson = mapPersonDocumentToPerson(person as any);

    try {
      const emailService = new EmailService();
      await emailService.sendWelcomeEmail(activatedUser.email, activatedPerson.name);
      logger.emailAction(
        "Welcome email sent successfully",
        user.email,
        "Welcome"
      );
    } catch (emailError) {}

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
