import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from '@/configs/mongo.config';
import { UserModule } from '@/users/user.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig,
		}),
		UserModule,
	],
	controllers: [AppController],
	providers: [],
})
export class AppModule {}
