import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMongoConfig } from './configs/mongo.config';
import { ADMIN_MODULES, PUBLIC_MODULES } from './modules';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from './configs/jwt.config';

@Module({
	imports: [
		// Глобальная настройка модулей
		ConfigModule.forRoot(),
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
		...ADMIN_MODULES,
		...PUBLIC_MODULES,
	],
	controllers: [AppController],
	providers: [],
})
export class AppModule {}
