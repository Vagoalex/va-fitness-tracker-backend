import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './core/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');

	await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
