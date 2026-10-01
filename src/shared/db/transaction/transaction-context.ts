import { Repository } from 'typeorm';
import { type EnterpriseConfig } from '../../../modules/enterprise/entities/enterprise-config.entity.js';
import { type Enterprise } from '../../../modules/enterprise/entities/enterprise.entity.js';

export interface TransactionContext {
  enterpriseRepository: Repository<Enterprise>;
  enterpriseConfigRepository: Repository<EnterpriseConfig>;
}
