import { Injectable, LoggerService, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfig } from '../../types/config.types';

/**
 * Уровни логирования
 */
type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

/**
 * Метаданные для логирования (стек трейс, дополнительные данные)
 */
interface LogMetadata {
  trace?: string;
  [key: string]: unknown;
}

/**
 * Структура записи лога
 */
interface LogEntry {
  timestamp: string; // Временная метка
  level: LogLevel; // Уровень логирования
  context: string; // Контекст (имя сервиса/модуля)
  message: string; // Сообщение
  metadata?: LogMetadata; // Дополнительные метаданные
}

/**
 * Улучшенный сервис логирования с улучшенной типобезопасностью и производительностью
 */
@Injectable()
export class AppLoggerService implements LoggerService {
  private context: string; // Контекст логирования (по умолчанию 'Application')
  private readonly isProduction: boolean; // Флаг продакшн окружения
  private readonly isDevelopment: boolean; // Флаг dev окружения
  private readonly logLevel: LogLevel; // Текущий уровень логирования

  /**
   * Карта цветов для разных уровней логирования (для dev окружения)
   */
  private readonly colorMap: Record<LogLevel, string> = {
    error: '\x1b[31m', // красный
    warn: '\x1b[33m', // желтый
    log: '\x1b[32m', // зеленый
    debug: '\x1b[36m', // голубой
    verbose: '\x1b[90m', // серый
  } as const;

  /**
   * Приоритет уровней логирования (от более важных к менее важным)
   */
  private readonly levelPriority: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];

  constructor(
    private readonly configService: ConfigService<AllConfig>,
    @Optional() context?: string,
  ) {
    this.context = context || 'Application';
    // Кэшируем проверки окружения для производительности (не проверяем на каждом логе)
    this.isProduction = this.configService.get('app.isProduction', { infer: true }) ?? false;
    this.isDevelopment = this.configService.get('app.isDevelopment', { infer: true }) ?? false;

    // Получаем уровень логирования из конфига или используем 'log' по умолчанию
    const configLevel = this.configService.get<string>('app.logLevel', { infer: true });
    this.logLevel = this.parseLogLevel(configLevel) || 'log';
  }

  /**
   * Установить контекст для этого экземпляра логгера
   * @param context - Новый контекст логирования
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Логирование информационного сообщения
   */
  log(message: string, context?: string): void {
    this.print('log', message, context);
  }

  /**
   * Логирование ошибки
   * @param message - Сообщение об ошибке
   * @param trace - Стек трейс ошибки (опционально)
   * @param context - Контекст логирования (опционально)
   */
  error(message: string, trace?: string, context?: string): void {
    this.print('error', message, context, { trace });
  }

  /**
   * Логирование предупреждения
   */
  warn(message: string, context?: string): void {
    this.print('warn', message, context);
  }

  /**
   * Логирование отладочной информации (только в dev режиме)
   */
  debug(message: string, context?: string): void {
    if (this.shouldLog('debug')) {
      this.print('debug', message, context);
    }
  }

  /**
   * Детальное логирование (только если уровень логирования позволяет)
   */
  verbose(message: string, context?: string): void {
    if (this.shouldLog('verbose')) {
      this.print('verbose', message, context);
    }
  }

  /**
   * Логирование с дополнительными метаданными
   * @param level - Уровень логирования
   * @param message - Сообщение
   * @param metadata - Дополнительные метаданные (стек трейс, объекты и т.д.)
   * @param context - Контекст логирования (опционально)
   */
  logWithMetadata(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    context?: string,
  ): void {
    if (this.shouldLog(level)) {
      this.print(level, message, context, metadata);
    }
  }

  /**
   * Внутренний метод для вывода лога
   * @param level - Уровень логирования
   * @param message - Сообщение
   * @param context - Контекст (если не указан, используется контекст экземпляра)
   * @param metadata - Дополнительные метаданные
   */
  private print(level: LogLevel, message: string, context?: string, metadata?: LogMetadata): void {
    try {
      const timestamp = new Date().toISOString();
      const logContext = context || this.context;

      const logEntry: LogEntry = {
        timestamp,
        level,
        context: logContext,
        message,
        ...(metadata && { metadata }),
      };

      if (this.isProduction) {
        // Продакшн: структурированное JSON логирование (для парсинга лог-агрегаторами)
        console.log(JSON.stringify(logEntry));
      } else {
        // Разработка: цветной, читаемый формат
        this.printFormatted(level, timestamp, logContext, message, metadata);
      }
    } catch (error) {
      // Резервный вариант: если кастомный логгер упал, используем стандартный console
      console.error('Logger error:', error);
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Форматированный вывод лога для dev окружения (с цветами)
   * @param level - Уровень логирования
   * @param timestamp - Временная метка
   * @param context - Контекст
   * @param message - Сообщение
   * @param metadata - Метаданные (стек трейс и т.д.)
   */
  private printFormatted(
    level: LogLevel,
    timestamp: string,
    context: string,
    message: string,
    metadata?: LogMetadata,
  ): void {
    const color = this.colorMap[level];
    const reset = '\x1b[0m'; // Сброс цвета
    const formattedMessage = `[${timestamp}] ${color}[${level.toUpperCase()}]${reset} [${context}] ${message}`;

    // Используем соответствующий метод console в зависимости от уровня
    switch (level) {
      case 'error':
        console.error(formattedMessage);
        // Выводим стек трейс красным цветом, если он есть
        if (metadata?.trace) {
          console.error(`\x1b[31m${metadata.trace}\x1b[0m`);
        }
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
        // Для debug уровня выводим трейс голубым цветом
        if (metadata?.trace && level === 'debug') {
          console.log(`\x1b[36m${metadata.trace}\x1b[0m`);
        }
    }
  }

  /**
   * Проверка, нужно ли логировать сообщение данного уровня
   * Логируются только сообщения с уровнем <= текущему уровню логирования
   * @param level - Запрашиваемый уровень логирования
   * @returns true если нужно логировать, false иначе
   */
  private shouldLog(level: LogLevel): boolean {
    const currentLevelIndex = this.levelPriority.indexOf(this.logLevel);
    const requestedLevelIndex = this.levelPriority.indexOf(level);
    return requestedLevelIndex <= currentLevelIndex;
  }

  /**
   * Парсинг уровня логирования из строки конфига
   * @param level - Строка уровня логирования из конфига
   * @returns Валидный LogLevel или null если невалидный
   */
  private parseLogLevel(level?: string): LogLevel | null {
    if (!level) return null;
    const normalizedLevel = level.toLowerCase() as LogLevel;
    return this.levelPriority.includes(normalizedLevel) ? normalizedLevel : null;
  }
}
