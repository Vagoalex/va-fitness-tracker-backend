import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AllConfig } from '../../types/config.types';

/**
 * Database module
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfig>): MongooseModuleOptions => {
        const databaseConfig = configService.get('database', { infer: true });

        if (!databaseConfig?.uri || typeof databaseConfig.uri !== 'string') {
          throw new Error('Database configuration error: "database.uri.uri" is missing or invalid');
        }

        return {
          uri: databaseConfig.uri,
          ...databaseConfig.options,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
