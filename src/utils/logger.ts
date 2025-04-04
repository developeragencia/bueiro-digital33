import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Adiciona um stream para o Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Adiciona um método para logar erros com stack trace
export const logError = (error: Error, metadata?: Record<string, any>) => {
  logger.error(error.message, {
    ...metadata,
    stack: error.stack
  });
};

// Adiciona um método para logar warnings
export const logWarning = (message: string, metadata?: Record<string, any>) => {
  logger.warn(message, metadata);
};

// Adiciona um método para logar informações
export const logInfo = (message: string, metadata?: Record<string, any>) => {
  logger.info(message, metadata);
};

// Adiciona um método para logar debug
export const logDebug = (message: string, metadata?: Record<string, any>) => {
  logger.debug(message, metadata);
};

// Adiciona um método para logar requisições HTTP
export const logHttpRequest = (req: any, res: any, responseTime: number) => {
  const metadata = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('user-agent'),
    ip: req.ip
  };

  if (res.statusCode >= 500) {
    logger.error(`${req.method} ${req.url}`, metadata);
  } else if (res.statusCode >= 400) {
    logger.warn(`${req.method} ${req.url}`, metadata);
  } else {
    logger.info(`${req.method} ${req.url}`, metadata);
  }
};

// Adiciona um método para logar erros de banco de dados
export const logDatabaseError = (error: Error, query?: string, params?: any[]) => {
  logger.error('Database error', {
    message: error.message,
    stack: error.stack,
    query,
    params
  });
};

// Adiciona um método para logar erros de API
export const logApiError = (error: Error, endpoint: string, method: string, payload?: any) => {
  logger.error('API error', {
    message: error.message,
    stack: error.stack,
    endpoint,
    method,
    payload
  });
};

// Adiciona um método para logar transações de pagamento
export const logPaymentTransaction = (transaction: any, status: string, metadata?: Record<string, any>) => {
  logger.info(`Payment transaction ${status}`, {
    transactionId: transaction.id,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    ...metadata
  });
};

// Adiciona um método para logar webhooks
export const logWebhook = (platform: string, event: string, payload: any, status: string) => {
  logger.info(`Webhook ${status}`, {
    platform,
    event,
    payload
  });
}; 