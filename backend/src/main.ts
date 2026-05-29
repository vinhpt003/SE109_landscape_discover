import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin
      ? (origin, callback) => {
          if (!origin) {
            callback(null, true);
            return;
          }
          const allowedOrigins = corsOrigin.split(',').map((o) => o.trim());
          const isAllowed = allowedOrigins.some((o) => {
            if (o === '*') return true;
            if (o.includes('*')) {
              const regexStr =
                '^' +
                o
                  .replace(/[.+^${}()|[\]\\]/g, '\\$&')
                  .replace(/\\\*/g, '[a-zA-Z0-9-.]+') +
                '$';
              return new RegExp(regexStr).test(origin);
            }
            return o === origin;
          });
          if (isAllowed) {
            callback(null, true);
          } else {
            callback(null, false);
          }
        }
      : /^http:\/\/localhost(:\d+)?$/,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
