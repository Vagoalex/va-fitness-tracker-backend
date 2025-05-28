import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './guards/roles.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');

	// Получаем зависимости из контейнера
	// const reflector = app.get(Reflector);
	// const jwtService = app.get(JwtService);

	// Создаем guard с зависимостями
	// app.useGlobalGuards(new RolesGuard(reflector, jwtService));

	await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
