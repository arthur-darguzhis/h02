import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './configuration';
import { configureApp } from './config/configApp';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<ConfigType>);
  configureApp(app);
  await app.listen(configService.get('PORT'));
}

bootstrap();
