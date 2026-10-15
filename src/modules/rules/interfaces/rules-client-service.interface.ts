import { RulesReportResponse } from './rules-report-response.interface.js';

export interface GetRulesReportDataParams {
  dbName?: string;
  dbHost?: string;
  pagination?: {
    page?: number;
    size?: number;
    descending?: boolean;
    sortBy?: string;
  };
  filters?: Record<string, unknown>;
}

export interface GetRulesReportDataResponse {
  data: RulesReportResponse[];
  pagination: {
    pages: number;
    rowsNumber: number;
  };
}

export interface GetRulesReportDataStreamParams {
  dbName?: string;
  dbHost?: string;
  pagination?: {
    page?: number;
    size?: number;
    descending?: boolean;
    sortBy?: string;
  };
  filters?: Record<string, unknown>;
}
