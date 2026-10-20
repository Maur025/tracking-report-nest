import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../shared/dto/pagination.dto.js';
import { pageResponse } from '../../shared/utils/page-response.js';
import { CreateReportRequestDto } from '../dto/create-report-request.dto.js';
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
}
