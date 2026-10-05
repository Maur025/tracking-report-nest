import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnterpriseConfig } from './entities/enterprise-config.entity.js';

@Injectable()
export class EnterpriseConfigService {
  constructor(
    @InjectRepository(EnterpriseConfig)
    private readonly enterpriseConfigRepository: Repository<EnterpriseConfig>,
  ) {}

  async findByDatabaseNameThrow({ databaseName }: { databaseName: string }) {
    return this.enterpriseConfigRepository.findOneOrFail({
      where: {
        database: databaseName,
      },
      relations: { enterprise: true },
    });
  }
}
