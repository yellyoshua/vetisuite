type LogLevel = 'warn' | 'error' | 'info' | 'debug'

const logger = {
  warning: (message: string, context: unknown = '') => log('warn', message, context),
  error: (message: string, context: unknown = '') => log('error', message, context),
  info: (message: string, context: unknown = '') => log('info', message, context),
  debug: (message: string, context: unknown = '') => log('debug', message, context),
}

function log(level: LogLevel, message: string, context: unknown) {
  console[level](message, context) // eslint-disable-line no-console
}

export default logger
