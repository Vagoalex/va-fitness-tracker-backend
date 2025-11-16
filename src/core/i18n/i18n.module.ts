import { Module, Global } from '@nestjs/common';
import {
  I18nModule as NestI18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
  CookieResolver,
  I18nJsonLoader,
} from 'nestjs-i18n';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfig } from '../../types/config.types';
import { I18nService } from './i18n.service';
import { I18N_CONFIG } from './constants';
import { join } from 'path';

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
          fallbackLanguage: I18N_CONFIG.defaultLanguage,
          loader: I18nJsonLoader,
          loaderOptions: {
            path: join(__dirname, 'locales'),
            watch: isDevelopment,
          },
          // Автогенерация типов
          typesOutputPath: join(
            process.cwd(),
            'src',
            'core',
            'i18n',
            'generated',
            'i18n.generated.ts',
          ),
        };
      },
      resolvers: [
        new QueryResolver([...I18N_CONFIG.resolvers.query]),
        new HeaderResolver([...I18N_CONFIG.resolvers.header]),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
      inject: [ConfigService],
    }),
  ],
  providers: [I18nService],
  exports: [I18nService, NestI18nModule],
})
export class I18nModule {}
