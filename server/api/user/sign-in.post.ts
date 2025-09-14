import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import type { SignInData } from "../../../types/user";
import { mapUserDocumentToUser } from "../../../types/user";

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

    if (!body.email || !body.password) {
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

    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const user = await users.findOne({ email: body.email });
    if (!user) {
      await client.close();
      throw createError({
        statusCode: 401,
        statusMessage: "Email ou senha incorretos",
      });
    }

    if (!user.active) {
      await client.close();
      throw createError({
        statusCode: 403,
        statusMessage:
          "Conta não ativada! Verifique seu email para ativar a conta.",
      });
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      await client.close();
      throw createError({
        statusCode: 401,
        statusMessage: "Email ou senha incorretos.",
      });
    }

    await client.close();

    const mappedUser = mapUserDocumentToUser(user as any);

    return {
      success: true,
      user: mappedUser,
    };
  } catch (error: unknown) {
    if (isErrorWithStatusCode(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Erro interno do servidor.",
    });
  }
});
