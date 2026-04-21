import winston, { format, transports, Logger } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

// Custom log format
const logFormat = printf(({ timestamp, level, message, stack }) => {
  return stack
    ? `${timestamp} [${level}]: ${message}\n${stack}`  // error with stack trace
    : `${timestamp} [${level}]: ${message}`;
});

const logger: Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),   // capture stack traces on errors
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),
    new transports.File({
      filename: 'logs/combined.log',
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  ],
});

export default logger;

/** Example usage */
// logger.info('Application started');
// logger.warn('This is a warning');
// logger.debug('Debug info here');
// logger.error('Something failed', { reason: 'DB connection timeout' });