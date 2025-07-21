import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  
  // Serve static files from the React build directory
  app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'build'));
  
  // Set API prefix after static assets, excluding the root route
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.use((req, res, next) => {
    if (!req.url.startsWith('/api') && req.method === 'GET') {
      res.sendFile(join(__dirname, '..', '..', 'frontend', 'build', 'index.html'));
    } else {
      next();
    }
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
