import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

let app;

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  nestApp.use(helmet());

  const swagger = new DocumentBuilder()
    .setVersion('1.0')
    .setTitle('Nest Js - API')
    .setDescription('Your API Description')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .addBearerAuth()
    .build();

  const documentation = SwaggerModule.createDocument(nestApp, swagger);

  SwaggerModule.setup('swagger', nestApp, documentation);

  await nestApp.init();

  return nestApp.getHttpAdapter().getInstance();
}

export default async function handler(req, res) {
  app ??= await bootstrap();
  return app(req, res);
}
