export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  namespace?: string
  enabled?: boolean
}

function fmt(ns: string | undefined, level: LogLevel, message: unknown) {
  const base = ns ? `[${ns}]` : ''
  return `${base}[${level.toUpperCase()}]` + (typeof message === 'string' ? ` ${message}` : '')
}

export function createLogger(opts: LoggerOptions = {}) {
  const { namespace, enabled = true } = opts
  const log = (level: LogLevel, ...args: unknown[]) => {
    if (!enabled) return
    const [first, ...rest] = args
    const prefix = fmt(namespace, level, first)
    switch (level) {
      case 'debug': return console.debug(prefix, ...rest)
      case 'info': return console.info(prefix, ...rest)
      case 'warn': return console.warn(prefix, ...rest)
      case 'error': return console.error(prefix, ...rest)
    }
  }
  return {
    debug: (...a: unknown[]) => log('debug', ...a),
    info: (...a: unknown[]) => log('info', ...a),
    warn: (...a: unknown[]) => log('warn', ...a),
    error: (...a: unknown[]) => log('error', ...a),
  }
}

export const logger = createLogger({ namespace: 'app', enabled: process.env.NODE_ENV !== 'production' }) // Simple logger
