import { logger } from "../utils/logger";

export default defineEventHandler(async (event) => {
  // Apenas fazer log para rotas da API
  if (!event.node.req.url?.startsWith('/api/') || event.node.req.url.includes('/_nuxt')) {
    return;
  }

  const startTime = Date.now();
  const method = event.node.req.method || 'GET';
  const url = event.node.req.url || '';
  const userAgent = getHeader(event, 'user-agent') || '';
  const ip = getHeader(event, 'x-forwarded-for') || 
             getHeader(event, 'x-real-ip') || 
             event.node.req.socket?.remoteAddress || 
             '';

  // Log do início da request
  logger.http(`${method} ${url} - Start`, {
    method,
    url,
    userAgent,
    ip,
    timestamp: new Date().toISOString()
  });

  // Interceptar a resposta
  event.node.res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = event.node.res.statusCode;
    
    logger.logRequest(method, url, statusCode, responseTime);
    
    // Log adicional para erros
    if (statusCode >= 400) {
      logger.warn(`HTTP Error Response: ${method} ${url}`, {
        statusCode,
        responseTime: `${responseTime}ms`,
        ip,
        userAgent
      });
    }
  });
});
