import { MongoClient } from "mongodb";
import { mapUserDocumentToUser } from "../../../types/user";
import { EmailService } from "../../services/email";

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

    const mongoUri = process.env.MONGODB_URI || "";
    const dbName = process.env.MONGODB_DB_NAME || "";
    const authSource = process.env.MONGODB_AUTH_SOURCE || "";

    const client = new MongoClient(mongoUri, {
      authSource,
    });

    await client.connect();
    const db = client.db(dbName);
    const usuarios = db.collection("usuarios");

    const user = await usuarios.findOne({ token: token, active: false });
    
    if (!user) {
      await client.close();
      throw createError({
        statusCode: 404,
        statusMessage: "Token inválido ou conta já ativada",
      });
    }

    // Ativar a conta e remover o token
    await usuarios.updateOne(
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
      console.log("✅ Welcome email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send welcome email:", emailError);
      // Não interrompe a ativação se o e-mail falhar
    }

    return {
      success: true,
      message: "Conta ativada com sucesso!",
    };

  } catch (error: any) {
    console.error("Erro ao ativar conta:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor",
    });
  }
});
