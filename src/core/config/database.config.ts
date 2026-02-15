import { registerAs } from '@nestjs/config';
import { MongoConfig } from '../../types/config.types';

/**
 * Название регистрируемого конфига (database)
 */
export const REGISTER_DB_TOKEN = 'database';

function requireEnv(envKey: string): string {
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`Missing required env: ${envKey}`);
  }
  return value;
}

export default registerAs(REGISTER_DB_TOKEN, (): MongoConfig => {
  const username = requireEnv(process.env.DB_USERNAME);
  const password = requireEnv(process.env.DB_PASSWORD);
  const cluster = requireEnv(process.env.DB_CLUSTER);

  const dbName = process.env.DB_NAME || 'VA_Fitness';

  const uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${cluster}.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  return {
    uri,
    options: {
      autoIndex: process.env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      minPoolSize: 5,
    },
  };
});
