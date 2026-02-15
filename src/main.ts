import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllConfig } from './types/config.types';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService<AllConfig>);

  // Получение и установка глобального префикса API из конфигурации
  const apiPrefix = configService.get('app.apiPrefix', { infer: true });
  app.setGlobalPrefix(apiPrefix || 'api');

  // Получение режима разработки из конфигурации
  const isDevelopment = configService.get('app.isDevelopment', { infer: true });
  // Получение порта из конфигурации
  const PORT = configService.get('app.port', { infer: true });

  if (isDevelopment) {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  // Установка Swagger-документации только в режиме разработки
  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('Fitness App API')
      .setDescription('Fitness application REST API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
