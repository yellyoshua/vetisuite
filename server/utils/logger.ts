export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export function log(_level: LogLevel, _message: string, _data?: Record<string, unknown>): void {
  throw new Error('Not implemented: log')
}
