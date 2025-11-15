import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = (configService: ConfigService): MongooseModuleOptions => {
  return {
    uri: getMongoString(configService),
    ...getMongoOptions(),
  };
};

const getMongoString = (configService: ConfigService) => {
  // Если есть MONGODB_URI - используем её
  const mongodbUri = configService.get<string>('MONGODB_URI');
  if (mongodbUri) {
    return mongodbUri;
  }

  // Иначе собираем из отдельных параметров (для обратной совместимости)
  const LOGIN: string = configService.get('MONGO_LOGIN') || '';
  const PASSWORD: string = configService.get('MONGO_PASSWORD') || '';
  const CLUSTER: string = configService.get('MONGO_CLUSTER') || '';

  return `mongodb+srv://${LOGIN}:${PASSWORD}@${CLUSTER}.mongodb.net/`;
};

const getMongoOptions = (): Partial<MongooseModuleOptions> => {
  return {
    autoIndex: process.env.NODE_ENV !== 'production', // В продакшене отключаем autoIndex
    retryWrites: true,
    w: 'majority',
    retryAttempts: 3,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    // Дополнительные опции для лучшей производительности
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
  };
};
