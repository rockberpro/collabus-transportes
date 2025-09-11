import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import type { SignInData } from "../../../types/user";
import { mapUserDocumentToUser } from "../../../types/user";

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
    const body = await readBody<SignInData>(event);

    // Validação básica
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email e senha são obrigatórios",
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

    // Buscar o usuário pelo email
    const user = await usuarios.findOne({ email: body.email });
    if (!user) {
      await client.close();
      throw createError({
        statusCode: 401,
        statusMessage: "Email ou senha incorretos",
      });
    }

    // Verificar se o usuário está ativo
    if (!user.active) {
      await client.close()
      throw createError({
        statusCode: 403,
        statusMessage: 'Conta não ativada! Verifique seu email para ativar a conta.'
      })
    }

    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      await client.close();
      throw createError({
        statusCode: 401,
        statusMessage: "Email ou senha incorretos.",
      });
    }

    await client.close();

    // Mapear dados do banco para o frontend (inglês → português)
    const mappedUser = mapUserDocumentToUser(user as any);

    // Retornar sucesso (sem a senha)
    return {
      success: true,
      user: mappedUser,
    };
  } catch (error: unknown) {
    console.error("Erro ao fazer login:", error);

    if (isErrorWithStatusCode(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor.",
    });
  }
});
