import { registerAs } from '@nestjs/config';
import { MongoConfig } from '../../types/config.types';

export const REGISTER_DB_TOKEN = 'database';

export default registerAs(REGISTER_DB_TOKEN, (): MongoConfig => {
  const username = process.env.DB_USERNAME || '';
  const password = process.env.DB_PASSWORD || '';
  const cluster = process.env.DB_CLUSTER || '';

  const uri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/`;

  return {
    uri,
    options: {
      autoIndex: process.env.NODE_ENV !== 'production',
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 5,
    },
  };
});
