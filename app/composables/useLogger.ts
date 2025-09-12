/**
 * Composable para logging no frontend
 * Fornece uma interface consistente para logs do cliente
 */

interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
  url?: string;
  userAgent?: string;
  userId?: string;
}

export const useLogger = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const createLogEntry = (
    level: LogEntry['level'],
    message: string,
    context?: string,
    data?: any
  ): LogEntry => {
    return {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  };

  const sendToServer = async (logEntry: LogEntry) => {
    if (!isDevelopment && (logEntry.level === 'error' || logEntry.level === 'warn')) {
      try {
        await $fetch('/api/client-logs', {
          method: 'POST',
          body: logEntry
        });
      } catch (err) {
        console.warn('Failed to send log to server:', err);
      }
    }
  };

  const logToConsole = (logEntry: LogEntry) => {
    const { level, message, context, data, timestamp } = logEntry;
    const contextStr = context ? `[${context}]` : '';
    const logMessage = `${timestamp} ${contextStr} ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      case 'debug':
        if (isDevelopment) {
          console.debug(logMessage, data);
        }
        break;
    }
  };

  const log = async (
    level: LogEntry['level'],
    message: string,
    context?: string,
    data?: any
  ) => {
    const logEntry = createLogEntry(level, message, context, data);
    
    logToConsole(logEntry);
    await sendToServer(logEntry);
  };

  return {
    error: (message: string, context?: string, data?: any) => 
      log('error', message, context, data),
    
    warn: (message: string, context?: string, data?: any) => 
      log('warn', message, context, data),
    
    info: (message: string, context?: string, data?: any) => 
      log('info', message, context, data),
    
    debug: (message: string, context?: string, data?: any) => 
      log('debug', message, context, data),

    userAction: (action: string, data?: any) =>
      log('info', action, 'USER_ACTION', data),

    apiError: (endpoint: string, error: any, data?: any) =>
      log('error', `API call failed: ${endpoint}`, 'API_ERROR', { error, ...data }),

    validationError: (field: string, message: string, data?: any) =>
      log('warn', `Validation failed: ${field} - ${message}`, 'VALIDATION', data),

    navigationError: (route: string, error: any) =>
      log('error', `Navigation failed to ${route}`, 'NAVIGATION', { error }),

    performanceLog: (operation: string, duration: number, data?: any) =>
      log('info', `${operation} took ${duration}ms`, 'PERFORMANCE', data),
  };
};
