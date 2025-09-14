import { ObjectId } from "mongodb";
import type { SignUpData } from "../../../types/user";
import {
  mapSignUpDataToUserDocument,
  mapUserDocumentToUser,
} from "../../../types/user";
import { EmailService } from "../../services/email";
import { UserService } from "../../services/user";
import { PersonService } from "../../services/person";

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
    const personService = new PersonService();

    const existingUser = await userService.findUserByEmail(body.email);
    if (existingUser) {
      logger.warn("Sign-up failed: user already exists", { email: body.email });
      throw createError({
        statusCode: 409,
        statusMessage: "Usuário já existe com este email",
      });
    }

    const userDocument = await mapSignUpDataToUserDocument(body);
    const userId = await userService.createUser(userDocument);

    try {
      const { mapCreatePersonDataToPersonDocument } = await import(
        "../../../types/person"
      );

      const personData = {
        name: body.name,
        userId: new ObjectId(userId),
      };

      const personDocument = mapCreatePersonDataToPersonDocument(personData);
      await personService.createPerson(personDocument);

      logger.databaseAction("Person entry created successfully", "persons", {
        name: body.name,
        userId,
      });
    } catch (personError) {
      logger.logError(personError as Error, "PERSON_CREATION", {
        userId,
        email: body.email,
        name: body.name,
      });
    }

    const createdUser = mapUserDocumentToUser({
      _id: userId,
      ...userDocument,
    });

    try {
      const emailService = new EmailService();
      await emailService.sendActivationEmail(
        body.email,
        body.name,
        userDocument.token
      );
    } catch (emailError) {}

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
