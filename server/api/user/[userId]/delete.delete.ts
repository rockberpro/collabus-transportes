import { PrismaClient } from "@prisma/client";
import { EmailService } from "~~/server/services/email";
import { generateGoodbyeEmailTemplate } from "~~/server/templates/goodbye-email";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, "userId");
    if (!userId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "ID do usuário é obrigatório" 
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { person: true },
    });

    if (!user) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: "Usuário não encontrado" 
      });
    }

    // Verificar se pode deletar (apenas PASSAGEIRO)
    if (user.role !== 'PASSAGEIRO') {
      throw createError({ 
        statusCode: 403, 
        statusMessage: "Sua conta não pode ser excluída pois está vinculada a dados do sistema" 
      });
    }

    const userName = user.person 
      ? `${user.person.firstName} ${user.person.lastName}` 
      : user.email;

    // Enviar email de despedida ANTES de deletar
    try {
      const emailService = new EmailService();
      const emailTemplate = generateGoodbyeEmailTemplate({ name: userName });
      
      await emailService.sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      console.error("Erro ao enviar email de despedida:", emailError);
      // Continua com a exclusão mesmo se o email falhar
    }

    // Deletar tokens primeiro (cascade)
    await prisma.token.deleteMany({
      where: { userId },
    });

    // Deletar person se existir
    if (user.personId) {
      await prisma.person.delete({
        where: { id: user.personId },
      });
    }

    // Deletar usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    return { 
      success: true, 
      message: "Conta excluída com sucesso" 
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error("Erro ao excluir conta:", error);
    throw createError({ 
      statusCode: 500, 
      statusMessage: "Erro ao excluir conta" 
    });
  }
});
