export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogContext = Record<string, string | number | boolean | null>

const STREAMS = { debug: process.stdout, info: process.stdout, warn: process.stderr, error: process.stderr }

// Una línea JSON por evento: las alarmas de CloudWatch cuentan las que traen level "error".
export function log(level: LogLevel, message: string, context: LogContext = {}): void {
  STREAMS[level].write(`${JSON.stringify({ level, message, ...context })}\n`)
}
