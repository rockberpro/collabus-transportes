import { MongoClient, ObjectId } from "mongodb";
import { mapUserDocumentToUser } from "../../../types/user";
import { EmailService } from "../../services/email";
import { mapPersonDocumentToPerson } from "~~/types/person";

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

    const mongoUri = process.env.MONGODB_URI || "";
    const dbName = process.env.MONGODB_DB_NAME || "";
    const authSource = process.env.MONGODB_AUTH_SOURCE || "";

    const client = new MongoClient(mongoUri, {
      authSource,
    });

    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const user = await users.aggregate([
      { $match: { token: token, active: false } },
      {
        $lookup: {
          from: "persons",
          localField: "_id",
          foreignField: "userId",
          as: "person"
        }
      },
      { $unwind: "$person" }
    ]).next();
    const person = user?.person;
    
    if (!user) {
      await client.close();
      throw createError({
        statusCode: 401,
        message: "Token inválido ou conta já ativada",
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
