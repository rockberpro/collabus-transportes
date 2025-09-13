import { MongoClient } from "mongodb";
import { mapUserDocumentToUser } from "../../../types/user";
import { EmailService } from "../../services/email";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const token = query.token as string;

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

    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const user = await users.findOne({ token: token, active: false });

    if (!user) {
      await client.close();
      throw createError({
        statusCode: 404,
        statusMessage: "Token inválido ou conta já ativada",
      });
    }

    await users.updateOne(
      { _id: user._id },
      {
        $set: { active: true },
        $unset: { token: "" }, // clear token
      }
    );

    await client.close();

    const activatedUser = mapUserDocumentToUser(user as any);

    try {
      const emailService = new EmailService();
      await emailService.sendWelcomeEmail(user.email, user.name);
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
      statusMessage: "Erro interno do servidor",
    });
  }
});
