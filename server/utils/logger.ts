import winston from "winston";
import path from "path";

// Configuração dos níveis de log personalizados
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Colorir os logs no console
winston.addColors(logColors);

// Formato personalizado para os logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Formato para arquivos (sem cores)
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Determinar nível de log baseado no ambiente
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Criar diretório de logs se não existir
const logsDir = path.join(process.cwd(), 'logs');

const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: logFormat,
  }),
  
  // Arquivo para todos os logs
  new winston.transports.File({
    filename: path.join(logsDir, 'all.log'),
    level: 'debug',
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Arquivo apenas para erros
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Criar o logger winston
const winstonLogger = winston.createLogger({
  level: level(),
  levels: logLevels,
  format: fileLogFormat,
  transports,
});

// Classe wrapper para facilitar o uso
export class Logger {
  private static instance: Logger;
  private winston: winston.Logger;

  private constructor() {
    this.winston = winstonLogger;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Métodos de logging
  error(message: string, meta?: any) {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: any) {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: any) {
    this.winston.info(message, meta);
  }

  http(message: string, meta?: any) {
    this.winston.http(message, meta);
  }

  debug(message: string, meta?: any) {
    this.winston.debug(message, meta);
  }

  // Métodos específicos para contextos
  userAction(action: string, userId?: string, details?: any) {
    this.info(`[USER_ACTION] ${action}`, {
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  emailAction(action: string, to: string, subject?: string, details?: any) {
    this.info(`[EMAIL] ${action}`, {
      to,
      subject,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  databaseAction(action: string, collection?: string, details?: any) {
    this.info(`[DATABASE] ${action}`, {
      collection,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  authAction(action: string, email?: string, details?: any) {
    this.info(`[AUTH] ${action}`, {
      email,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Método para logging de erros com contexto completo
  logError(error: Error, context?: string, additionalInfo?: any) {
    this.error(`[${context || 'ERROR'}] ${error.message}`, {
      stack: error.stack,
      name: error.name,
      additionalInfo,
      timestamp: new Date().toISOString(),
    });
  }

  // Método para logging de requests HTTP
  logRequest(method: string, url: string, statusCode: number, responseTime?: number) {
    this.http(`${method} ${url} ${statusCode}`, {
      method,
      url,
      statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
    });
  }
}

// Exportar instância singleton
export const logger = Logger.getInstance();

// Exportar também o winston logger para casos específicos
export { winston };
