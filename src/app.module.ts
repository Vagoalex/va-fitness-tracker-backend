import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE, APP_GUARD } from '@nestjs/core';

import { appConfig, databaseConfig, jwtConfig, validate } from './core/config';

import { DatabaseModule } from './core/database/database.module';
import { LoggerModule } from './core/logger/logger.module';
import { I18nModule } from './core/i18n';

import { GlobalExceptionFilter } from './common/filters';
import { ValidationPipe } from './common/pipes';
import { RolesGuard, JwtAuthGuard } from './core/guards';

import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Core modules
    DatabaseModule,
    I18nModule,
    LoggerModule,

    // Feature modules
    AuthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Глобальная аутентификация
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Глобальная авторизация
    },
  ],
})
export class AppModule {}
