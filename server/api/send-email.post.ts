import { EmailService } from "../services/email";
import { logger } from "../utils/logger";

export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  
  try {
    const body = await readBody(event);

    logger.emailAction("Generic email send request", body.to, body.subject);

    // Validação básica
    if (!body.to || !body.subject || (!body.text && !body.html)) {
      logger.warn("Email send validation failed: missing required fields", {
        hasTo: !!body.to,
        hasSubject: !!body.subject,
        hasText: !!body.text,
        hasHtml: !!body.html
      });
      throw createError({
        statusCode: 400,
        statusMessage: "Campos obrigatórios: to, subject e (text ou html)"
      });
    }

    const emailService = new EmailService();
    
    const result = await emailService.sendEmail({
      to: body.to,
      subject: body.subject,
      text: body.text || "",
      html: body.html || body.text || ""
    });

    const responseTime = Date.now() - startTime;
    logger.emailAction("Generic email sent successfully", body.to, body.subject, {
      messageId: result.messageId,
      responseTime: `${responseTime}ms`
    });

    return result;

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // Se for um erro conhecido do EmailService, repassa
    if (error.statusCode) {
      logger.warn("Email send failed with known error", {
        statusCode: error.statusCode,
        message: error.statusMessage,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }

    logger.logError(error, "GENERIC_EMAIL_SEND", {
      responseTime: `${responseTime}ms`
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send email",
      data: {
        error: error.message
      }
    });
  }
});
