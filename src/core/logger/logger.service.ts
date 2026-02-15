import { Injectable, LoggerService, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfig, AppLogLevel, LOG_LEVELS } from '../../types/config.types';

/**
 * Метаданные для логирования (стек трейс, дополнительные данные)
 */
interface LogMetadata {
  trace?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Структура записи лога
 */
interface LogEntry {
  timestamp: string; // Временная метка
  level: AppLogLevel; // Уровень логирования
  context: string; // Контекст (имя сервиса/модуля)
  message: string; // Сообщение
  metadata?: LogMetadata; // Дополнительные метаданные
}

/**
 * Улучшенный сервис логирования с улучшенной типобезопасностью и производительностью
 */
@Injectable()
export class AppLoggerService implements LoggerService {
  private context: string = 'Application'; // Контекст логирования (по умолчанию 'Application')

  private readonly isProduction: boolean; // Флаг продакшн окружения
  private readonly logLevel: AppLogLevel; // Текущий уровень логирования

  /**
   * Карта цветов для разных уровней логирования (для dev окружения)
   */
  private readonly colorMap: Record<AppLogLevel, string> = {
    error: '\x1b[31m', // красный
    warn: '\x1b[33m', // желтый
    log: '\x1b[32m', // зеленый
    debug: '\x1b[36m', // голубой
    verbose: '\x1b[90m', // серый
  } as const;

  /**
   * Приоритет уровней логирования (от более важных к менее важным)
   */
  private readonly levelPriority: AppLogLevel[] = [...LOG_LEVELS];

  // Ключи, которые нельзя логировать в открытом виде
  private readonly redactedKeys = new Set([
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'cookie',
    'cookies',
    'set-cookie',
  ]);

  constructor(private readonly configService: ConfigService<AllConfig>) {
    this.isProduction = this.configService.get('app.isProduction', { infer: true }) ?? false;
    this.logLevel = this.configService.get('app.logLevel', { infer: true }) ?? 'log';
  }

  private cloneWithContext(context: string): AppLoggerService {
    const logger = new AppLoggerService(this.configService);
    logger.setContext(context);
    return logger;
  }

  /**
   * "Дочерний" логгер с фиксированным контекстом.
   */
  child(context: string): AppLoggerService {
    return this.cloneWithContext(context);
  }

  /**
   * Установить контекст для этого экземпляра логгера
   * @param context - Новый контекст логирования
   */
  setContext(context: string): void {
    this.context = context || 'Application';
  }

  /**
   * Логирование информационного сообщения
   */
  log(message: unknown, context?: string): void {
    this.print('log', message, context);
  }

  /**
   * Логирование ошибки
   * @param message - Сообщение об ошибке
   * @param trace - Стек трейс ошибки (опционально)
   * @param context - Контекст логирования (опционально)
   */
  error(message: unknown, trace?: string, context?: string): void {
    this.print('error', message, context, { trace });
  }

  /**
   * Логирование предупреждения
   */
  warn(message: unknown, context?: string): void {
    this.print('warn', message, context);
  }

  /**
   * Логирование отладочной информации (только в dev режиме)
   */
  debug(message: unknown, context?: string): void {
    if (this.shouldLog('debug')) this.print('debug', message, context);
  }

  /**
   * Детальное логирование (только если уровень логирования позволяет)
   */
  verbose(message: unknown, context?: string): void {
    if (this.shouldLog('verbose')) this.print('verbose', message, context);
  }

  /**
   * Логирование с дополнительными метаданными
   * @param level - Уровень логирования
   * @param message - Сообщение
   * @param metadata - Дополнительные метаданные (стек трейс, объекты и т.д.)
   * @param context - Контекст логирования (опционально)
   */
  logWithMetadata(
    level: AppLogLevel,
    message: unknown,
    metadata?: LogMetadata,
    context?: string,
  ): void {
    if (this.shouldLog(level)) this.print(level, message, context, metadata);
  }

  /**
   * Внутренний метод для вывода лога
   * @param level - Уровень логирования
   * @param message - Сообщение
   * @param context - Контекст (если не указан, используется контекст экземпляра)
   * @param metadata - Дополнительные метаданные
   */
  private print(
    level: AppLogLevel,
    message: unknown,
    context?: string,
    metadata?: LogMetadata,
  ): void {
    try {
      if (!this.shouldLog(level)) return;

      const timestamp = new Date().toISOString();
      const logContext = context || this.context;

      const normalizedMessage = this.normalizeMessage(message);
      const safeMetadata = metadata ? this.redact(metadata) : undefined;

      const logEntry: LogEntry = {
        timestamp,
        level,
        context: logContext,
        message: normalizedMessage,
        ...(safeMetadata && { metadata: safeMetadata }),
      };

      if (this.isProduction) {
        // JSON-лог для агрегаторов
        console.log(this.safeStringify(logEntry));
      } else {
        this.printFormatted(logEntry);
      }
    } catch (loggerError) {
      console.error('Logger error:', loggerError);
      console.log(`[${level.toUpperCase()}] ${String(message as string)}`);
    }
  }

  /**
   * Форматированный вывод лога для dev окружения (с цветами)
   * @param entry - Уровень логирования
   */
  private printFormatted(entry: LogEntry): void {
    const color = this.colorMap[entry.level];
    const reset = '\x1b[0m';

    const formatted =
      `[${entry.timestamp}] ${color}[${entry.level.toUpperCase()}]${reset}` +
      ` [${entry.context}] ${entry.message}`;

    if (entry.level === 'error') console.error(formatted);
    else if (entry.level === 'warn') console.warn(formatted);
    else console.log(formatted);

    if (entry.metadata?.trace) {
      console.error(`\x1b[31m${entry.metadata.trace}\x1b[0m`);
    }

    if (entry.metadata?.data && Object.keys(entry.metadata.data).length > 0) {
      console.log(entry.metadata.data);
    }
  }

  /**
   * Проверка, нужно ли логировать сообщение данного уровня
   * Логируются только сообщения с уровнем <= текущему уровню логирования
   * @param level - Запрашиваемый уровень логирования
   * @returns true если нужно логировать, false иначе
   */
  private shouldLog(level: AppLogLevel): boolean {
    const currentLevelIndex = this.levelPriority.indexOf(this.logLevel);
    const requestedLevelIndex = this.levelPriority.indexOf(level);

    // если вдруг logLevel некорректный, не ломаемся
    if (currentLevelIndex === -1 || requestedLevelIndex === -1) return true;

    return requestedLevelIndex <= currentLevelIndex;
  }

  private redact<T>(value: T): T {
    if (!value || typeof value !== 'object') return value;

    if (Array.isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value.map((item) => this.redact(item)) as T;
    }

    const record = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};

    for (const [key, fieldValue] of Object.entries(record)) {
      if (this.redactedKeys.has(key.toLowerCase())) {
        output[key] = '[REDACTED]';
        continue;
      }
      output[key] = this.redact(fieldValue);
    }

    return output as T;
  }

  private safeStringify(value: unknown): string {
    const seen = new WeakSet<object>();

    return JSON.stringify(value, (_key, currentValue) => {
      if (typeof currentValue === 'bigint') return currentValue.toString();

      if (currentValue && typeof currentValue === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (seen.has(currentValue)) return '[Circular]';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        seen.add(currentValue);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return currentValue;
    });
  }

  private normalizeMessage(message: unknown): string {
    if (message instanceof Error) return message.message;
    if (typeof message === 'string') return message;
    if (message === null || message === undefined) return String(message);

    return this.safeStringify(this.redact(message));
  }
}
