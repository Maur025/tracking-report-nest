import { Injectable } from '@nestjs/common';
import { ReportGenerator } from '../../report-management/interfaces/report-generator.js';

@Injectable()
export class EventReportGenerator implements ReportGenerator {
  readonly type = 'EVENT';

  async generate(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
