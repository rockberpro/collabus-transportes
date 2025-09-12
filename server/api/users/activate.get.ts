import { MongoClient } from "mongodb";
import { mapUserDocumentToUser } from "../../../types/user";
import { EmailService } from "../../services/email";
import { logger } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  
  try {
    const query = getQuery(event);
    const token = query.token as string;

    logger.authAction("Account activation attempt", undefined, { token: token ? "present" : "missing" });

    if (!token) {
      logger.warn("Account activation failed: missing token");
      throw createError({
        statusCode: 400,
        statusMessage: "Token de ativação é obrigatório",
      });
    }

    const mongoUri = process.env.MONGODB_URI || "";
    const dbName = process.env.MONGODB_DB_NAME || "";
    const authSource = process.env.MONGODB_AUTH_SOURCE || "";

    const client = new MongoClient(mongoUri, {
      authSource,
    });

    logger.databaseAction("Connecting to MongoDB for activation", "users");
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    logger.databaseAction("Searching for user with activation token", "users");
    const user = await users.findOne({ token: token, active: false });
    
    if (!user) {
      await client.close();
      logger.warn("Account activation failed: invalid or expired token");
      throw createError({
        statusCode: 404,
        statusMessage: "Token inválido ou conta já ativada",
      });
    }

    // Ativar a conta e remover o token
    logger.databaseAction("Activating user account", "users", { 
      userId: user._id.toString(),
      email: user.email 
    });
    
    await users.updateOne(
      { _id: user._id },
      { 
        $set: { active: true },
        $unset: { token: "" } // Remove o token após uso
      }
    );

    await client.close();

    // Mapear usuário ativado
    const activatedUser = mapUserDocumentToUser(user as any);

    // Enviar e-mail de boas-vindas
    try {
      const emailService = new EmailService();
      await emailService.sendWelcomeEmail(user.email, user.name);
      logger.emailAction("Welcome email sent successfully", user.email, "Welcome");
    } catch (emailError) {
      logger.logError(emailError as Error, "WELCOME_EMAIL", {
        userId: user._id.toString(),
        email: user.email
      });
      // Não interrompe a ativação se o e-mail falhar
    }

    const responseTime = Date.now() - startTime;
    logger.authAction("Account activated successfully", user.email, {
      userId: user._id.toString(),
      responseTime: `${responseTime}ms`
    });

    return {
      success: true,
      message: "Conta ativada com sucesso!",
    };

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    if (error.statusCode) {
      logger.warn("Account activation failed with known error", {
        statusCode: error.statusCode,
        message: error.statusMessage,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }

    logger.logError(error, "ACCOUNT_ACTIVATION_UNEXPECTED", {
      responseTime: `${responseTime}ms`
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor",
    });
  }
});
