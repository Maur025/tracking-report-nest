import { Inject, Injectable } from '@nestjs/common';
import { ReportGenerator } from '../report-management/interfaces/report-generator.js';
import { REPORT_GENERATORS } from './report-generators-token.js';

@Injectable()
export class ReportGenerateStrategyService {
  private readonly strategies: ReadonlyMap<string, ReportGenerator>;

  constructor(@Inject(REPORT_GENERATORS) generators: ReportGenerator[]) {
    this.strategies = new Map(
      generators.map((generator) => [generator.type, generator]),
    );
  }

  getStrategy(type: string) {
    if (!type) {
      throw new Error('Report type is required');
    }

    const strategy = this.strategies.get(type);

    if (!strategy) {
      throw new Error(`Unsupported report type: ${type}`);
    }

    return strategy;
  }
}
