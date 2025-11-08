import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "userId");
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: "ID do usuário é obrigatório" });
    }

    const body = await readBody(event);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarBase64: body.avatarBase64,
      },
    });

    return { success: true, data: updatedUser };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Erro interno do servidor" });
  }
});
