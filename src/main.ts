import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DomainExceptionFilter,
  ErrorExceptionFilter,
  HttpExceptionFilters,
} from './exception.filters';
import { validationPipe } from './validation.pipe';
import { unhandledRejectionHandler } from './common/unhandled-rejection.handler';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(
    new ErrorExceptionFilter(),
    new HttpExceptionFilters(),
    new DomainExceptionFilter(),
  );
  unhandledRejectionHandler();
  app.use(cookieParser());
  await app.listen(3000);
}

bootstrap();
