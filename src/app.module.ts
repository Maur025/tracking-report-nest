import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { environmentSchema } from './config/environment.schema.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: environmentSchema,
      isGlobal: true,
      envFilePath: !process.env.NODE_ENV
        ? '.env'
        : `.env.${process.env.NODE_ENV}`,
    }),
  ],
  providers: [],
})
export class AppModule {}
