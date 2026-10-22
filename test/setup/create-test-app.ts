import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { IntegrationsModule } from '../../src/integrations/integrations.module.js';

@Module({})
class MockIntegrationsModule {}

export const createTestApp = async (): Promise<INestApplication> => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(IntegrationsModule)
    .useModule(MockIntegrationsModule)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useLogger(false);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        exposeUnsetFields: false,
      },
      transform: true,
    }),
  );

  await app.init();

  return app;
};
