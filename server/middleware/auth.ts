import { logger } from "../utils/logger";

export default defineEventHandler(async (event) => {
  if (!event.node.req.url?.startsWith('/api/')) {
    return;
  }

  const publicRoutes = [
    '/api/users/sign-in',
    '/api/users/sign-up', 
    '/api/users/activate',
    '/api/client-logs',
    '/api/send-email'
  ];

  const url = event.node.req.url;
  const isPublicRoute = publicRoutes.some(route => url.startsWith(route));
  
  if (isPublicRoute) {
    return;
  }

  const method = event.node.req.method || 'GET';
  const ip = getHeader(event, 'x-forwarded-for') || 
             getHeader(event, 'x-real-ip') || 
             event.node.req.socket?.remoteAddress || 
             'unknown';

  logger.authAction("API authentication attempt", undefined, {
    method,
    url,
    ip,
    timestamp: new Date().toISOString()
  });

  const authHeader = getHeader(event, 'authorization');
  
  if (!authHeader) {
    logger.warn("API authentication failed: missing authorization header", {
      method,
      url,
      ip
    });
    throw createError({
      statusCode: 401,
      statusMessage: "Token de autorização requerido"
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    logger.warn("API authentication failed: invalid authorization format", {
      method,
      url,
      ip,
      authFormat: authHeader.substring(0, 10) + '...'
    });
    throw createError({
      statusCode: 401,
      statusMessage: "Formato de autorização inválido. Use: Bearer <token>"
    });
  }

  const token = authHeader.substring(7);
  
  if (!token) {
    logger.warn("API authentication failed: empty token", {
      method,
      url,
      ip
    });
    throw createError({
      statusCode: 401,
      statusMessage: "Token de autorização vazio"
    });
  }

  const apiToken = process.env.API_TOKEN;
  
  if (!apiToken) {
    logger.error("API authentication error: API_TOKEN not configured in environment", {
      method,
      url,
      ip
    });
    throw createError({
      statusCode: 500,
      statusMessage: "Configuração de autenticação não encontrada"
    });
  }

  if (token !== apiToken) {
    logger.warn("API authentication failed: invalid token", {
      method,
      url,
      ip,
      tokenLength: token.length,
      expectedLength: apiToken.length
    });
    throw createError({
      statusCode: 403,
      statusMessage: "Token de autorização inválido"
    });
  }

  logger.authAction("API authentication successful", undefined, {
    method,
    url,
    ip,
    timestamp: new Date().toISOString()
  });
});
