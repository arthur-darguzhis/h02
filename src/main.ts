import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DomainExceptionFilter,
  ErrorExceptionFilter,
  HttpExceptionFilters,
} from './exception.filters';
import { validationPipe } from './validation.pipe';
import { addUnhandledRejectionListener } from './common/add-unhandled-rejection.listener';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './configuration';
import { INestApplication } from '@nestjs/common';

export function configureApp(app: INestApplication): void {
  app.enableCors();
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(
    new ErrorExceptionFilter(),
    new HttpExceptionFilters(),
    new DomainExceptionFilter(),
  );
  addUnhandledRejectionListener();
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const configService = app.get(ConfigService<ConfigType>);
  await app.listen(configService.get('PORT'));
}

bootstrap();
