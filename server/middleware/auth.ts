export default defineEventHandler(async (event) => {
  if (!event.node.req.url?.startsWith("/api/")) {
    return;
  }

  const publicRoutes = [
    "/api/users/sign-in",
    "/api/users/sign-up",
    "/api/users/activate",
    "/api/client-logs",
    "/api/send-email",
  ];

  const url = event.node.req.url;
  const isPublicRoute = publicRoutes.some((route) => url.startsWith(route));

  if (isPublicRoute) {
    return;
  }

  const authHeader = getHeader(event, "authorization");

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: "Token de autorização requerido",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      statusMessage: "Formato de autorização inválido. Use: Bearer <token>",
    });
  }

  const token = authHeader.substring(7);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Token de autorização vazio",
    });
  }

  const apiToken = process.env.API_TOKEN;

  if (!apiToken) {
    throw createError({
      statusCode: 500,
      statusMessage: "Configuração de autenticação não encontrada",
    });
  }

  if (token !== apiToken) {
    throw createError({
      statusCode: 403,
      statusMessage: "Token de autorização inválido",
    });
  }
});
