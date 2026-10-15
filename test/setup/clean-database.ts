import { DataSource } from 'typeorm';
import { EnterpriseConfig } from '../../src/modules/enterprise/entities/enterprise-config.entity.js';
import { Enterprise } from '../../src/modules/enterprise/entities/enterprise.entity.js';

export const cleanDatabase = async (dataSource: DataSource): Promise<void> => {
  await dataSource.transaction(async (manager) => {
    await manager.getRepository(EnterpriseConfig).clear();
    await manager.getRepository(Enterprise).clear();
  });
};
