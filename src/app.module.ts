import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.getOrThrow<string>('DB_URL'),

        enableWAL: true,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
  ],
  providers: [],
})
export class AppModule {}
