import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../shared/db/base-entity.js';
import { ReportStatusEnum } from '../enums/report-status.enum.js';
import { ReportTypeEnum } from '../enums/report-type-enum.js';

@Entity({ name: 'report_requests' })
export class ReportRequest extends BaseEntity {
  @Column('text', { name: 'type' })
  type: ReportTypeEnum;

  @Column('simple-json', { name: 'payload' })
  payload: Record<string, any>;

  @Column('text', { name: 'status', default: ReportStatusEnum.PENDING })
  status: ReportStatusEnum;

  @Column('text', { name: 'file_path', nullable: true })
  filePath?: string;

  @Column('text', { name: 'error_message', nullable: true })
  errorMessage?: string;
}
