import { registerAs } from '@nestjs/config';
import { MongoConfig } from '../../types/config.types';

/**
 * Название регистрируемого конфига (database)
 */
export const REGISTER_DB_TOKEN = 'database';

const buildAtlasUri = (dbName: string, cluster: string): string => {
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;

  // Валидация env гарантирует наличие обязательных значений.
  return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${cluster}.mongodb.net/${dbName}?retryWrites=true&w=majority`;
};

const buildLocalUri = (dbName: string): string => {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;

  // Валидация env гарантирует наличие обязательных значений.
  return `mongodb://${host}:${port}/${dbName}`;
};

export default registerAs(REGISTER_DB_TOKEN, (): MongoConfig => {
  const dbName = process.env.DB_NAME;
  const cluster = process.env.DB_CLUSTER;

  if (process.env.NODE_ENV === 'production' && !cluster) {
    throw new Error('DB_CLUSTER must be defined in production environment');
  }

  const uri = cluster ? buildAtlasUri(dbName, cluster) : buildLocalUri(dbName);

  return {
    uri,
    options: {
      autoIndex: process.env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      minPoolSize: 5,
    },
  };
});
