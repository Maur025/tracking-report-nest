import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpClientModule } from '@nestjs/http-client';
import { TypeOrmModule } from '@nestjs/typeorm';
import { fileURLToPath } from 'node:url';
import { environmentSchema } from './config/environment.schema.js';
import { QueueModule } from './infrastructure/queue/queue.module.js';
import { IntegrationsModule } from './integrations/integrations.module.js';
import { EnterpriseModule } from './modules/enterprise/enterprise.module.js';
import { EventModule } from './modules/event/event.module.js';
import { ProgressModule } from './modules/progress/progress.module.js';
import { RegistryProgressModule } from './modules/registry-progress/registry-progress.module.js';
import { RulesModule } from './modules/rules/rules.module.js';
import { ReportGeneratorModule } from './report-generator/report-generator.module.js';
import { ReportManagementModule } from './report-management/report-management.module.js';
import { SharedModule } from './shared/shared.module.js';
import { ReportProcessingModule } from './report-processing/report-processing.module.js';

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
        migrations: [
          fileURLToPath(
            new URL('./database/migrations/*.{ts,js}', import.meta.url),
          ),
        ],
        migrationsRun: config.getOrThrow<string>('NODE_ENV') === 'test',
      }),
    }),

    HttpClientModule.register({
      timeout: '10s',
      isGlobal: true,
    }),

    EnterpriseModule,

    SharedModule,

    IntegrationsModule,

    QueueModule,

    EventModule,

    ReportGeneratorModule,
    ReportManagementModule,

    ProgressModule,

    RulesModule,

    RegistryProgressModule,

    ReportProcessingModule,
  ],
  providers: [],
})
export class AppModule {}
