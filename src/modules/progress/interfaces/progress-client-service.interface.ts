import { ProgressReportResponse } from './progress-report-response.interface.js';

export interface GetProgressReportDataParams {
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

export interface GetProgressReportDataResponse {
  data: ProgressReportResponse[];
  pagination: {
    pages: number;
    rowsNumber: number;
  };
}

export interface GetProgressReportDataStreamParams {
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
