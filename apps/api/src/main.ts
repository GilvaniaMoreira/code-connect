import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      // API returns JSON and Swagger — no need for a strict CSP; disabling it
      // keeps Swagger UI's inline scripts working without extra allowlists.
      contentSecurityPolicy: false,
      // The web SPA runs on a different origin and needs to fetch /thumbnails,
      // so relax CORP from the default 'same-origin'.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Code Connect API')
    .setDescription('Auth API — cadastro, login e dados do usuário')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = app.get(ConfigService).get<number>('PORT') ?? 3000;
  await app.listen(port);
}
void bootstrap();
