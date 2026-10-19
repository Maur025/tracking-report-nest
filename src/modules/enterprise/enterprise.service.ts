import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionHandler } from '../../shared/db/transaction/transaction-handler.js';
import { PaginationDto } from '../../shared/dto/pagination.dto.js';
import { pageResponse } from '../../shared/utils/page-response.js';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto.js';
import { Enterprise } from './entities/enterprise.entity.js';

@Injectable()
export class EnterpriseService {
  constructor(
    private readonly transactionalHandler: TransactionHandler,
    @InjectRepository(Enterprise)
    private readonly enterpriseRepository: Repository<Enterprise>,
  ) {}

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

  async findAll(paginationDto: PaginationDto) {
    const { page, size, descending, sortBy } = paginationDto;

    const [data, count] = await this.enterpriseRepository.findAndCount({
      take: size,
      skip: page * size,
      order: {
        [sortBy]: { direction: descending ? 'DESC' : 'ASC', nulls: 'LAST' },
      },
    });

    return pageResponse({ data, count, size });
  }

  async findOne(id: string) {
    const enterprise = await this.enterpriseRepository.findOneBy({ id });

    if (!enterprise) {
      throw new NotFoundException(`Enterprise with id ${id} not found`);
    }

    return enterprise;
  }

  async remove(id: string) {
    const enterprise = await this.findOne(id);

    await this.enterpriseRepository.remove(enterprise);
  }
}
