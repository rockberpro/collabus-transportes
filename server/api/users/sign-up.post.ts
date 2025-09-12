import { MongoClient } from "mongodb";
import type { SignUpData } from "../../../types/user";
import { mapSignUpDataToUserDocument, mapUserDocumentToUser } from "../../../types/user";
import { EmailService } from "../../services/email";
import { logger } from "../../utils/logger";

// Type guard para verificar se o erro tem statusCode
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
  const startTime = Date.now();
  
  try {
    const body = await readBody<SignUpData>(event);
    
    logger.userAction("Sign-up attempt started", undefined, {
      email: body.email,
      name: body.name
    });

    // Validação básica
    if (!body.name || !body.email || !body.password) {
      logger.warn("Sign-up validation failed: missing required fields", {
        email: body.email,
        hasName: !!body.name,
        hasPassword: !!body.password
      });
      throw createError({
        statusCode: 400,
        statusMessage: "Nome, email e senha são obrigatórios",
      });
    }

    // Validar se as senhas coincidem
    if (body.password !== body.passwordConfirm) {
      logger.warn("Sign-up validation failed: passwords don't match", {
        email: body.email
      });
      throw createError({
        statusCode: 400,
        statusMessage: "As senhas não coincidem",
      });
    }

    // Conectar ao MongoDB usando variáveis de ambiente
    const mongoUri = process.env.MONGODB_URI || "";
    const dbName = process.env.MONGODB_DB_NAME || "";
    const authSource = process.env.MONGODB_AUTH_SOURCE || "";

    const client = new MongoClient(mongoUri, {
      authSource,
    });

    logger.databaseAction("Connecting to MongoDB", "usuarios");
    await client.connect();
    const db = client.db(dbName);
    const usuarios = db.collection("usuarios");

    // Verificar se o usuário já existe
    logger.databaseAction("Checking if user exists", "usuarios", { email: body.email });
    const existingUser = await usuarios.findOne({ email: body.email });
    if (existingUser) {
      await client.close();
      logger.warn("Sign-up failed: user already exists", { email: body.email });
      throw createError({
        statusCode: 409,
        statusMessage: "Usuário já existe com este email",
      });
    }

    // Mapear dados do frontend para o banco (inclui hash da senha e token)
    logger.debug("Processing user data and generating security tokens");
    const userDocument = await mapSignUpDataToUserDocument(body);

    logger.databaseAction("Creating new user", "usuarios", { email: body.email });
    const result = await usuarios.insertOne(userDocument);
    await client.close();
    logger.databaseAction("User created successfully", "usuarios", { 
      userId: result.insertedId.toString(),
      email: body.email 
    });

    const createdUser = mapUserDocumentToUser({
      _id: result.insertedId.toString(),
      ...userDocument,
    });

    // Enviar e-mail de ativação
    try {
      const emailService = new EmailService();
      await emailService.sendActivationEmail(body.email, body.name, userDocument.token);
      logger.emailAction("Activation email sent successfully", body.email, "Account Activation");
    } catch (emailError) {
      logger.logError(emailError as Error, "ACTIVATION_EMAIL", {
        userId: createdUser.id,
        email: body.email
      });
      // Não interrompe o cadastro se o e-mail falhar
    }

    const responseTime = Date.now() - startTime;
    logger.userAction("Sign-up completed successfully", createdUser.id, {
      email: body.email,
      responseTime: `${responseTime}ms`
    });

    return {
      success: true,
      user: createdUser,
    };
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    
    if (isErrorWithStatusCode(error)) {
      logger.warn("Sign-up failed with known error", {
        statusCode: error.statusCode,
        message: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }

    logger.logError(error as Error, "SIGN_UP_UNEXPECTED", {
      responseTime: `${responseTime}ms`
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor",
    });
  }
});
