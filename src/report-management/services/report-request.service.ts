import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../shared/dto/pagination.dto.js';
import { pageResponse } from '../../shared/utils/page-response.js';
import { CreateReportRequestDto } from '../dto/create-report-request.dto.js';
import { UpdateReportRequestDto } from '../dto/update-report-request.dto.js';
import { ReportRequest } from '../entities/report-request.entity.js';

@Injectable()
export class ReportRequestService {
  constructor(
    @InjectRepository(ReportRequest)
    private readonly reportRequestRepository: Repository<ReportRequest>,
  ) {}

  async create(createReportRequestDto: CreateReportRequestDto) {
    const reportRequest = this.reportRequestRepository.create(
      createReportRequestDto,
    );

    return this.reportRequestRepository.save(reportRequest);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, size, descending, sortBy } = paginationDto;

    const [data, count] = await this.reportRequestRepository.findAndCount({
      take: size,
      skip: page * size,
      order: {
        [sortBy]: { direction: descending ? 'DESC' : 'ASC', nulls: 'LAST' },
      },
    });

    return pageResponse({ data, count, size });
  }

  async findOneByIdThrow(id: string) {
    const reportRequest = await this.reportRequestRepository.findOneBy({ id });

    if (!reportRequest) {
      throw new NotFoundException(`Report request with id ${id} not found`);
    }

    return reportRequest;
  }

  async update(id: string, updateReportRequestDto: UpdateReportRequestDto) {
    const reportRequest = await this.reportRequestRepository.preload({
      id,
      ...updateReportRequestDto,
    });

    if (!reportRequest) {
      throw new NotFoundException(`Report request with id ${id} not found`);
    }

    try {
      await this.reportRequestRepository.save(reportRequest);
      return reportRequest;
    } catch (error) {
      throw new BadRequestException(
        `Failed to update report request with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
