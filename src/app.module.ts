import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';

import { appConfig, databaseConfig, authConfig, validate } from '@/core/config';

import { DatabaseModule } from '@/core/database/database.module';
import { LoggerModule } from '@/core/logger/logger.module';
import { I18nModule } from '@/core/i18n';

import { GlobalExceptionFilter } from '@/common/filters';
import { ValidationPipe } from '@/common/pipes';
import { RolesGuard, JwtAuthGuard } from '@/core/security';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [appConfig, databaseConfig, authConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Core modules
    LoggerModule,
    I18nModule,
    DatabaseModule,

    // Feature modules
    AuthModule,
    UserModule,
  ],
  providers: [
    /**
     * Глобальный фильтр исключений.
     */
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },

    /**
     * Валидация запросов.
     */
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },

    /**
     * Глобальная аутентификация.
     * Все роуты требуют JWT, кроме помеченных @Public().
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    /**
     * Проверка ролей через @Roles().
     */
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
