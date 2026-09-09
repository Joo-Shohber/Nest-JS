import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.use(helmet());

    const swagger = new DocumentBuilder()
      .setVersion('1.0')
      .setTitle('Nest Js - API')
      .setDescription('Your API Description')
      .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
      .addBearerAuth()
      .build();
    const documentation = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('swagger', app, documentation);

    await app.init();
  }
  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  await bootstrap();
  server(req, res);
};
