import { RegistryProgressReportResponse } from './registry-progress-report-response.interface.js';

export interface GetRegistryProgressReportDataParams {
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

export interface GetRegistryProgressReportDataResponse {
  data: RegistryProgressReportResponse[];
  pagination: {
    pages: number;
    rowsNumber: number;
  };
}

export interface GetRegistryProgressReportDataStreamParams {
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
