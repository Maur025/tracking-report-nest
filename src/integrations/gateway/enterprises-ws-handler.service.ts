import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EnterpriseConfig } from '../../modules/enterprise/entities/enterprise-config.entity.js';
import { Enterprise } from '../../modules/enterprise/entities/enterprise.entity.js';
import { TransactionHandler } from '../../shared/db/transaction/transaction-handler.js';
import {
  EnterpriseWsPayload,
  EnterpriseWsPayloadDatabase,
  EnterpriseWsPayloadServer,
} from './dto/enterprises-ws-payload.interface.js';

@Injectable()
export class EnterprisesWsHandlerService {
  constructor(private readonly transactionHandler: TransactionHandler) {}

  async saveEnterprisesWithConfigurations(
    enterprisesPayload: EnterpriseWsPayload[],
  ) {
    await this.transactionHandler.handle(
      async ({ enterpriseRepository, enterpriseConfigRepository }) => {
        const { enterprisesToSave, EnterpriseConfigsToSave } =
          this.getEnterpriseBulkCreateData(
            enterprisesPayload,
            enterpriseRepository,
            enterpriseConfigRepository,
          );

        if (enterprisesToSave.length > 0) {
          await enterpriseRepository.save(enterprisesToSave);
        }

        if (EnterpriseConfigsToSave.length > 0) {
          await enterpriseConfigRepository.upsert(EnterpriseConfigsToSave, {
            conflictPaths: ['database', 'referenceId', 'enterprise'],
          });
        }
      },
    );
  }

  private getEnterpriseBulkCreateData(
    enterprisesPayload: EnterpriseWsPayload[],
    enterpriseRepository: any,
    enterpriseConfigRepository: any,
  ): {
    enterprisesToSave: Enterprise[];
    EnterpriseConfigsToSave: EnterpriseConfig[];
  } {
    const enterprisesToSave: Enterprise[] = [];
    const EnterpriseConfigsToSave: EnterpriseConfig[] = [];

    for (const enterprise of enterprisesPayload) {
      const enterpriseData = this.getEnterpriseEntity(
        enterprise,
        enterpriseRepository,
      );

      if (!enterpriseData) continue;

      enterprisesToSave.push(enterpriseData);

      const enterpriseConfigData = this.getEnterpriseConfigEntity(
        enterprise,
        enterpriseConfigRepository,
      );

      if (!enterpriseConfigData) continue;

      EnterpriseConfigsToSave.push(enterpriseConfigData);
    }

    return {
      enterprisesToSave,
      EnterpriseConfigsToSave,
    };
  }

  private getEnterpriseEntity(
    enterprise: EnterpriseWsPayload,
    enterpriseRepository: Repository<Enterprise>,
  ): Enterprise | undefined {
    const { id, name, description, color, image } = enterprise;

    if (!id || !name) {
      return;
    }

    return enterpriseRepository.create({
      id,
      name,
      description,
      color,
      image,
    });
  }

  private getEnterpriseConfigEntity(
    enterprise: EnterpriseWsPayload,
    enterpriseConfigRepository: Repository<EnterpriseConfig>,
  ): EnterpriseConfig | undefined {
    const { id: enterpriseId, database = {} as EnterpriseWsPayloadDatabase } =
      enterprise;

    const {
      codename,
      id: databaseId,
      server = {} as EnterpriseWsPayloadServer,
    } = database;

    const { apiPort, address } = server;

    const port: string | undefined = apiPort ? String(apiPort) : undefined;

    if (!address || !port || !codename || !databaseId || !enterpriseId) {
      return;
    }

    return enterpriseConfigRepository.create({
      host: address,
      port: port,
      database: codename,
      referenceId: databaseId,
      enterprise: { id: enterpriseId },
    });
  }
}
