import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AllConfig, MongoConfig } from '../../types/config.types';

/**
 * Database module
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfig>): MongooseModuleOptions => {
        const databaseConfig: MongoConfig = configService.get('database', { infer: true });

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
