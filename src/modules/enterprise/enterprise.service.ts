import { Injectable } from '@nestjs/common';
import { TransactionHandler } from '../../shared/db/transaction/transaction-handler.js';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto.js';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto.js';
import { type Enterprise } from './entities/enterprise.entity.js';

@Injectable()
export class EnterpriseService {
  constructor(private readonly transactionalHandler: TransactionHandler) {}

  async create(createEnterpriseDto: CreateEnterpriseDto) {
    const { enterpriseConfigs, ...createDto } = createEnterpriseDto;

    const enterprise = await this.transactionalHandler.handle(
      async ({ enterpriseRepository, enterpriseConfigRepository }) => {
        const enterpriseToSave: Enterprise =
          enterpriseRepository.create(createDto);

        const enterprise = await enterpriseRepository.save(enterpriseToSave);

        const enterpriseConfigEntities = enterpriseConfigs.map((config) =>
          enterpriseConfigRepository.create({
            host: config.host,
            port: config.port,
            database: config.database,
            referenceId: config.referenceId,
            enterpriseRefId: enterprise.id,
          }),
        );

        await enterpriseConfigRepository.save(enterpriseConfigEntities);

        return enterprise;
      },
    );

    return enterprise.id;
  }

  findAll() {
    return `This action returns all enterprise`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enterprise`;
  }

  // oxlint-disable-next-line no-unused-vars
  update(id: number, updateEnterpriseDto: UpdateEnterpriseDto) {
    return `This action updates a #${id} enterprise`;
  }

  remove(id: number) {
    return `This action removes a #${id} enterprise`;
  }
}
