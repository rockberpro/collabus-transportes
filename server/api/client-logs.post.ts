import { logger } from "../utils/logger";

interface ClientLogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
  url?: string;
  userAgent?: string;
  userId?: string;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<ClientLogEntry>(event);

    // Validação básica
    if (!body.level || !body.message || !body.timestamp) {
      throw createError({
        statusCode: 400,
        statusMessage: "Campos obrigatórios: level, message, timestamp"
      });
    }

    // Obter informações adicionais do request
    const clientIP = getHeader(event, 'x-forwarded-for') || 
                    getHeader(event, 'x-real-ip') || 
                    event.node.req.socket?.remoteAddress || 
                    'unknown';

    const serverTimestamp = new Date().toISOString();

    // Criar log estruturado para o servidor
    const serverLogData = {
      clientLog: true,
      clientLevel: body.level,
      clientMessage: body.message,
      clientContext: body.context,
      clientData: body.data,
      clientTimestamp: body.timestamp,
      clientUrl: body.url,
      clientUserAgent: body.userAgent,
      clientUserId: body.userId,
      serverTimestamp,
      clientIP
    };

    // Mapear nível do cliente para nível do servidor
    const logMessage = `[CLIENT_LOG] ${body.context ? `[${body.context}] ` : ''}${body.message}`;

    switch (body.level) {
      case 'error':
        logger.error(logMessage, serverLogData);
        break;
      case 'warn':
        logger.warn(logMessage, serverLogData);
        break;
      case 'info':
        logger.info(logMessage, serverLogData);
        break;
      case 'debug':
        logger.debug(logMessage, serverLogData);
        break;
      default:
        logger.info(logMessage, serverLogData);
    }

    return {
      success: true,
      message: "Client log received"
    };

  } catch (error: any) {
    logger.logError(error, "CLIENT_LOG_ENDPOINT", {
      requestBody: await readBody(event).catch(() => null)
    });

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to process client log"
    });
  }
});
