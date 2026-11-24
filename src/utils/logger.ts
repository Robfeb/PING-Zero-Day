export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'PERF';

export interface LogEntry {
  id: number;
  timestamp: string;
  timeMs: number;
  level: LogLevel;
  message: string;
  data?: any;
}

class DiagnosticLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 120;
  private nextId = 1;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error(`Uncaught Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, {
          error: event.error?.stack || event.error,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.error(`Unhandled Promise Rejection: ${event.reason}`, {
          reason: event.reason,
        });
      });
    }
  }

  private addEntry(level: LogLevel, message: string, data?: any): void {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const entry: LogEntry = {
      id: this.nextId++,
      timestamp: timeStr,
      timeMs: performance.now(),
      level,
      message,
      data,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (level === 'ERROR') {
      console.error(`[${entry.timestamp}] [${level}] ${message}`, data ?? '');
    } else if (level === 'WARN') {
      console.warn(`[${entry.timestamp}] [${level}] ${message}`, data ?? '');
    } else {
      console.log(`[${entry.timestamp}] [${level}] ${message}`, data ?? '');
    }

    this.notify();
  }

  public info(message: string, data?: any): void {
    this.addEntry('INFO', message, data);
  }

  public warn(message: string, data?: any): void {
    this.addEntry('WARN', message, data);
  }

  public error(message: string, data?: any): void {
    this.addEntry('ERROR', message, data);
  }

  public perf(message: string, data?: any): void {
    this.addEntry('PERF', message, data);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
    this.info('Diagnostic logs cleared by operative.');
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (e) {
        console.error('Error in log listener', e);
      }
    }
  }
}

export const Logger = new DiagnosticLogger();
