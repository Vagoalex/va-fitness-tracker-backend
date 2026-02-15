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
        const mongoConfig = configService.get('database', { infer: true });

        if (!mongoConfig?.uri || typeof mongoConfig.uri !== 'string') {
          throw new Error('MongoDB configuration error: "mongo.uri" is missing or invalid');
        }

        return {
          uri: mongoConfig.uri,
          ...mongoConfig.options,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
