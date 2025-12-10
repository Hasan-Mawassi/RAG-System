// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();
// ============================================
// STEP 12: Application Bootstrap (src/main.ts)
// ============================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
  app.use(cookieParser());
  // Enable CORS for frontend access
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Enable validation pipes for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('RAG System API')
    .setDescription('The RAG System API description')
    .setVersion('1.0')
    .addTag('RAG')
    .addCookieAuth('access_token')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 RAG System running on: http://localhost:${port}`);
  logger.log(`📄 Upload PDF: POST http://localhost:${port}/api/rag/upload`);
  logger.log(`❓ Query: POST http://localhost:${port}/api/rag/query`);
  logger.log(`📊 Stats: GET http://localhost:${port}/api/rag/stats`);
  logger.log(`💚 Health: GET http://localhost:${port}/api/rag/health`);
}

bootstrap();
