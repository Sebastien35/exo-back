import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [REQUEST, ConfigService],
      useFactory: async (request: Request, configService: ConfigService) => {
        const tenant = request['tenant'];
        
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: tenant.database,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true, // Set to false in production
        };
      },
      // Removed 'scope' as it is not a valid property for TypeOrmModuleAsyncOptions
    }),
  ],
})
export class DatabaseModule {}