import { EmailService } from "../services/email";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.to || !body.subject || (!body.text && !body.html)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Campos obrigatórios: to, subject e (text ou html)",
      });
    }

    const emailService = new EmailService();

    const result = await emailService.sendEmail({
      to: body.to,
      subject: body.subject,
      text: body.text || "",
      html: body.html || body.text || "",
    });

    return result;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send email",
      data: {
        error: error.message,
      },
    });
  }
});
