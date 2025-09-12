import { logger } from "./logger";

/**
 * Exemplos de como usar o sistema de logging
 * Este arquivo serve como referência e documentação
 */

// ==================== LOGS BÁSICOS ====================

export function exemploLogsBasicos() {
  // Log de erro com informações detalhadas
  logger.error("Falha na conexão com o banco de dados", {
    database: "users",
    connection: "mongodb://localhost:27017",
    timeout: 5000
  });

  // Log de aviso
  logger.warn("Rate limit próximo do limite", {
    currentRequests: 95,
    limit: 100,
    timeWindow: "1 minuto"
  });

  // Log informativo
  logger.info("Servidor iniciado com sucesso", {
    port: 3000,
    environment: "development",
    version: "1.0.0"
  });

  // Log de debug (apenas em desenvolvimento)
  logger.debug("Variáveis de ambiente carregadas", {
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasEmailConfig: !!process.env.GMAIL_USER
  });
}

// ==================== LOGS CONTEXTUAIS ====================

export function exemploLogsContextuais() {
  // Ações de usuário
  logger.userAction("Password change request", "user123", {
    email: "user@example.com",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0..."
  });

  // Ações de e-mail
  logger.emailAction("Password reset email sent", "user@example.com", "Password Reset", {
    templateUsed: "password-reset",
    recipientStatus: "active",
    deliveryAttempt: 1
  });

  // Ações de banco de dados
  logger.databaseAction("User profile updated", "users", {
    userId: "user123",
    fieldsChanged: ["name", "phone"],
    previousValues: { name: "Old Name" },
    newValues: { name: "New Name" }
  });

  // Ações de autenticação
  logger.authAction("Failed login attempt", "user@example.com", {
    reason: "invalid_password",
    attempts: 3,
    lockoutTime: "15 minutes",
    ipAddress: "192.168.1.1"
  });
}

// ==================== LOGS DE ERRO COM CONTEXTO ====================

export function exemploLogsErro() {
  try {
    // Código que pode gerar erro
    throw new Error("Conexão timeout");
  } catch (error) {
    // Log de erro com contexto completo
    logger.logError(error as Error, "DATABASE_CONNECTION", {
      operation: "findUser",
      collection: "users",
      query: { email: "user@example.com" },
      timeout: 5000,
      retryAttempt: 3
    });
  }
}

// ==================== LOGS HTTP ====================

export function exemploLogsHttp() {
  // Log de request HTTP (feito automaticamente pelo middleware)
  logger.logRequest("POST", "/api/users/sign-up", 201, 250);
  
  // Log HTTP manual para casos específicos
  logger.http("External API call", {
    method: "POST",
    url: "https://api.external.com/notify",
    statusCode: 200,
    responseTime: 1200,
    payload: { userId: "123", action: "welcome" }
  });
}

// ==================== LOGS PARA AUDITORIA ====================

export function exemploLogsAuditoria() {
  // Log de mudanças sensíveis
  logger.info("[AUDIT] User permissions changed", {
    adminUserId: "admin123",
    targetUserId: "user456",
    oldPermissions: ["read"],
    newPermissions: ["read", "write"],
    reason: "Promotion to editor role",
    approvedBy: "manager789",
    timestamp: new Date().toISOString()
  });

  // Log de acesso a dados sensíveis
  logger.info("[AUDIT] Sensitive data accessed", {
    userId: "user123",
    dataType: "personal_information",
    fields: ["email", "phone", "address"],
    purpose: "profile_update",
    ipAddress: "192.168.1.1",
    sessionId: "sess_abc123"
  });
}

// ==================== LOGS DE PERFORMANCE ====================

export function exemploLogsPerformance() {
  const startTime = Date.now();
  
  // Simulação de operação
  setTimeout(() => {
    const duration = Date.now() - startTime;
    
    logger.info("[PERFORMANCE] Database query completed", {
      operation: "getUsersWithFilters",
      duration: `${duration}ms`,
      resultCount: 150,
      filters: { active: true, type: "premium" },
      indexesUsed: ["email_index", "type_index"],
      slowQuery: duration > 1000
    });
  }, 500);
}

// ==================== LOGS DE NEGÓCIO ====================

export function exemploLogsNegocio() {
  // Eventos importantes do negócio
  logger.info("[BUSINESS] New subscription created", {
    userId: "user123",
    planType: "premium",
    duration: "monthly",
    amount: 29.99,
    currency: "BRL",
    paymentMethod: "credit_card",
    promotionCode: "WELCOME10"
  });

  logger.info("[BUSINESS] Service request completed", {
    requestId: "req_789",
    userId: "user123",
    serviceType: "transport",
    origin: "Shopping Center",
    destination: "Airport",
    distance: "25km",
    duration: "45min",
    amount: 35.50,
    driverId: "driver456"
  });
}

// ==================== LOGS DE SISTEMA ====================

export function exemploLogsSistema() {
  // Status do sistema
  logger.info("[SYSTEM] Health check completed", {
    status: "healthy",
    checks: {
      database: "connected",
      email: "operational",
      storage: "available",
      externalAPIs: "responsive"
    },
    responseTime: "120ms",
    uptime: "5 days, 3 hours"
  });

  // Recursos do sistema
  logger.warn("[SYSTEM] High memory usage detected", {
    currentUsage: "85%",
    threshold: "80%",
    freeMemory: "1.2GB",
    totalMemory: "8GB",
    topProcesses: ["node", "mongodb", "nginx"]
  });
}
