import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongoConfig } from './core/configs/mongo.config';
import { ADMIN_MODULES, PUBLIC_MODULES, SHARED_MODULES } from './modules';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from './core/configs/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/shared/auth/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';

@Module({
	imports: [
		// Глобальная настройка модулей
		ConfigModule.forRoot({ isGlobal: true }),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig,
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJWTConfig,
		}),

		// Подключение модулей
		...SHARED_MODULES,
		...ADMIN_MODULES,
		...PUBLIC_MODULES,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
})
export class AppModule {}
