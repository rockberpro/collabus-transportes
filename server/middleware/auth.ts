import { logger } from "../utils/logger";

export default defineEventHandler(async (event) => {
  // Apenas aplicar autenticação para rotas da API que precisam de proteção
  if (!event.node.req.url?.startsWith('/api/')) {
    return;
  }

  // Rotas que não precisam de autenticação (públicas)
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

  // Por padrão, todas as outras rotas da API precisam de autenticação
  // Exceto as rotas públicas listadas acima
  // As rotas protegidas incluem:
  // - /api/persons/* (todas as operações com pessoas)

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

  // Obter o token do cabeçalho Authorization
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

  // Verificar se é um Bearer token
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

  // Extrair o token
  const token = authHeader.substring(7); // Remove 'Bearer '
  
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

  // Verificar se o token corresponde ao API_TOKEN do ambiente
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
