import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  app.setGlobalPrefix(config.get('API_PREFIX', 'api/v1'));
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: config.get('WEB_ORIGIN', 'http://localhost:4200'), credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const swaggerConfig = new DocumentBuilder().setTitle('FinTrack API').setDescription('Tenant-scoped personal and family finance API').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup(`${config.get('API_PREFIX', 'api/v1')}/docs`, app, SwaggerModule.createDocument(app, swaggerConfig));
  await app.listen(config.get<number>('PORT', 3000));
}
bootstrap();
