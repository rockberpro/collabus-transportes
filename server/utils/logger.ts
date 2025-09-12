import winston from "winston";
import path from "path";

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

winston.addColors(logColors);
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const logsDir = path.join(process.cwd(), 'logs');

const transports = [
  new winston.transports.Console({
    level: level(),
    format: logFormat,
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'all.log'),
    level: 'debug',
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

const winstonLogger = winston.createLogger({
  level: level(),
  levels: logLevels,
  format: fileLogFormat,
  transports,
});
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

  logError(error: Error, context?: string, additionalInfo?: any) {
    this.error(`[${context || 'ERROR'}] ${error.message}`, {
      stack: error.stack,
      name: error.name,
      additionalInfo,
      timestamp: new Date().toISOString(),
    });
  }
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

export const logger = Logger.getInstance();
export { winston };
