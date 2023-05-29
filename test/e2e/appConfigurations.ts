import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { useContainer } from 'class-validator';
import { configureApp } from '../../src/config/configApp';

export async function setConfigTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const nestApp = moduleFixture.createNestApplication();
  configureApp(nestApp);
  useContainer(nestApp.select(AppModule), { fallbackOnErrors: true });
  return nestApp;
}
