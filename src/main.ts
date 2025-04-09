import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CentralDataSource } from './databases/centralDB.config'; // adjust path as needed
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  await CentralDataSource.initialize();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
