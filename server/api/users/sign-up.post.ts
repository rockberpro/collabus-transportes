import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { SignUpData } from "../../../types/user";
import { mapSignUpDataToUserDocument, mapUserDocumentToUser } from "../../../types/user";
import { EmailService } from "../../services/email";

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
  try {
    const body = await readBody<SignUpData>(event);

    // Validação básica
    if (!body.name || !body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nome, email e senha são obrigatórios",
      });
    }

    // Validar se as senhas coincidem
    if (body.password !== body.passwordConfirm) {
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

    await client.connect();
    const db = client.db(dbName);
    const usuarios = db.collection("usuarios");

    // Verificar se o usuário já existe
    const existingUser = await usuarios.findOne({ email: body.email });
    if (existingUser) {
      await client.close();
      throw createError({
        statusCode: 409,
        statusMessage: "Usuário já existe com este email",
      });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // Gerar token de ativação único (UUID v4)
    const activationToken = randomUUID();

    // Mapear dados do frontend para o banco
    const userDocument = mapSignUpDataToUserDocument(body, hashedPassword, activationToken);

    const result = await usuarios.insertOne(userDocument);
    await client.close();

    const createdUser = mapUserDocumentToUser({
      _id: result.insertedId.toString(),
      ...userDocument,
    });

    // Enviar e-mail de ativação
    try {
      const emailService = new EmailService();
      await emailService.sendActivationEmail(body.email, body.name, activationToken);
      console.log("✅ Activation email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send activation email:", emailError);
      // Não interrompe o cadastro se o e-mail falhar
    }

    return {
      success: true,
      user: createdUser,
    };
  } catch (error: unknown) {
    console.error("Erro ao cadastrar usuário:", error);

    if (isErrorWithStatusCode(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor",
    });
  }
});
