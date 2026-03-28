import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { AllConfig } from '@/core/types/config.types';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

const bootstrap = async (): Promise<void> => {
  const application = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');
  const configService = application.get(ConfigService<AllConfig>);

  // Получение и установка глобального префикса API из конфигурации
  const apiPrefix = configService.get('app.apiPrefix', { infer: true });
  // Получение режима разработки из конфигурации
  const isDevelopment = configService.get('app.isDevelopment', { infer: true });
  // Получение порта из конфигурации
  const applicationPort = configService.get('app.port', { infer: true });

  if (!apiPrefix) {
    throw new Error('App config "apiPrefix" is not defined');
  }

  if (!applicationPort) {
    throw new Error('App config "port" is not defined');
  }

  application.setGlobalPrefix(apiPrefix);

  if (isDevelopment) {
    application.enableCors({
      origin: true,
      credentials: true,
    });

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Fitness App API')
      .setDescription('Fitness application REST API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const swaggerDocument = SwaggerModule.createDocument(application, swaggerConfig);

    SwaggerModule.setup(`${apiPrefix}/docs`, application, swaggerDocument);
  }

  await application.listen(applicationPort);

  logger.log(`Application is running on: ${await application.getUrl()}`);
};

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');

  logger.error('Application failed to start', error instanceof Error ? error.stack : String(error));

  process.exit(1);
});
