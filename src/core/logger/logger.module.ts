import { Module, Global } from '@nestjs/common';
import { AppLoggerService } from './logger.service';

/**
 * Модуль логирования данных приложения
 */
@Global()
@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}
