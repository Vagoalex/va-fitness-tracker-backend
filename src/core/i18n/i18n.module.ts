import { Module, Global } from '@nestjs/common';
import { I18nModule as NestI18nModule, I18nJsonLoader } from 'nestjs-i18n';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfig } from '../../types/config.types';
import { TypedI18nService } from './i18n.service';

/**
 * Глобальный модуль для интернационализации
 * Предоставляет типизированный сервис для работы с переводами
 */
@Global()
@Module({
  imports: [
    NestI18nModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfig>) => {
        const isDevelopment = configService.get('app.isDevelopment', { infer: true });

        return {
          fallbackLanguage: 'en',
          loader: I18nJsonLoader,
          loaderOptions: {
            // В development используем src, в production - dist
            path: isDevelopment
              ? join(process.cwd(), 'src', 'core', 'i18n')
              : join(process.cwd(), 'dist', 'core', 'i18n'),
            watch: isDevelopment,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [TypedI18nService],
  exports: [TypedI18nService, NestI18nModule],
})
export class I18nModule {}
