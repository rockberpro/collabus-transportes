import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import type { SignInData } from "../../../types/user";
import { mapUserDocumentToUser } from "../../../types/user";
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
    const body = await readBody<SignInData>(event);

    logger.authAction("Sign-in attempt started", body.email);

    if (!body.email || !body.password) {
      logger.warn("Sign-in validation failed: missing email or password", {
        email: body.email,
        hasPassword: !!body.password
      });
      throw createError({
        statusCode: 400,
        statusMessage: "Email e senha são obrigatórios",
      });
    }

    const mongoUri = process.env.MONGODB_URI || "";
    const dbName = process.env.MONGODB_DB_NAME || "";
    const authSource = process.env.MONGODB_AUTH_SOURCE || "";

    const client = new MongoClient(mongoUri, {
      authSource,
    });

    logger.databaseAction("Connecting to MongoDB for sign-in", "users");
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    logger.databaseAction("Searching for user by email", "users", { email: body.email });
    const user = await users.findOne({ email: body.email });
    if (!user) {
      await client.close();
      logger.warn("Sign-in failed: user not found", { email: body.email });
      throw createError({
        statusCode: 401,
        statusMessage: "Email ou senha incorretos",
      });
    }

    if (!user.active) {
      await client.close();
      logger.warn("Sign-in failed: account not activated", { 
        email: body.email,
        userId: user._id.toString() 
      });
      throw createError({
        statusCode: 403,
        statusMessage: 'Conta não ativada! Verifique seu email para ativar a conta.'
      });
    }

    // Verificar a senha
    logger.debug("Verifying password for user", { email: body.email });
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      await client.close();
      logger.warn("Sign-in failed: invalid password", { email: body.email });
      throw createError({
        statusCode: 401,
        statusMessage: "Email ou senha incorretos.",
      });
    }

    await client.close();

    // Mapear dados do banco para o frontend (inglês → português)
    const mappedUser = mapUserDocumentToUser(user as any);

    const responseTime = Date.now() - startTime;
    logger.authAction("Sign-in completed successfully", body.email, {
      userId: mappedUser.id,
      responseTime: `${responseTime}ms`
    });

    // Retornar sucesso (sem a senha)
    return {
      success: true,
      user: mappedUser,
    };
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;

    if (isErrorWithStatusCode(error)) {
      logger.warn("Sign-in failed with known error", {
        statusCode: error.statusCode,
        message: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }

    logger.logError(error as Error, "SIGN_IN_UNEXPECTED", {
      responseTime: `${responseTime}ms`
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor.",
    });
  }
});
