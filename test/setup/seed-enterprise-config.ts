import { DataSource } from 'typeorm';
import { EnterpriseConfig } from '../../src/modules/enterprise/entities/enterprise-config.entity.js';
import { Enterprise } from '../../src/modules/enterprise/entities/enterprise.entity.js';

export const seedEnterpriseConfig = async (
  dataSource: DataSource,
): Promise<EnterpriseConfig> => {
  return dataSource.transaction(async (manager) => {
    const enterprise = await manager.save(Enterprise, {
      id: 'enterprise_1',
      name: 'Enterprise test',
      description: 'Enterprise test description',
      color: '#FF0000',
      image: '',
    });

    return manager.save(EnterpriseConfig, {
      host: 'event-api-test',
      port: '80',
      database: 'enterprise_1_db',
      referenceId: 'db1',
      enterprise,
    });
  });
};
