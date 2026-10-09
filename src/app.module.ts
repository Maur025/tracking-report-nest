import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpClientModule } from '@nestjs/http-client';
import { TypeOrmModule } from '@nestjs/typeorm';
import { environmentSchema } from './config/environment.schema.js';
import { IntegrationsModule } from './integrations/integrations.module.js';
import { EnterpriseModule } from './modules/enterprise/enterprise.module.js';
import { EventModule } from './modules/event/event.module.js';
import { ReportModule } from './report/report.module.js';
import { SharedModule } from './shared/shared.module.js';
import { ProgressModule } from './modules/progress/progress.module.js';
import { RulesModule } from './modules/rules/rules.module.js';

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

    HttpClientModule.register({
      timeout: '10s',
      isGlobal: true,
    }),

    EnterpriseModule,

    SharedModule,

    IntegrationsModule,

    EventModule,

    ReportModule,

    ProgressModule,

    RulesModule,
  ],
  providers: [],
})
export class AppModule {}
