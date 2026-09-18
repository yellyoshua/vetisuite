export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogContext = Record<string, string | number | boolean | null>

export function log(_level: LogLevel, _message: string, _context?: LogContext): void {
  throw new Error('Not implemented: log')
}
