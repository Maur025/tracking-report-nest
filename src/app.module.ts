import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { environmentSchema } from './config/environment.schema.js';
import { EnterpriseModule } from './modules/enterprise/enterprise.module.js';
import { SharedModule } from './shared/shared.module.js';
import { IntegrationsModule } from './integrations/integrations.module.js';

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

    EnterpriseModule,

    SharedModule,

    IntegrationsModule,
  ],
  providers: [],
})
export class AppModule {}
