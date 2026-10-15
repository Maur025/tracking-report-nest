import { EventReportResponse } from './event-report-response.interface.js';

export interface GetEventReportDataParams {
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

export interface GetEventReportDataResponse {
  data: EventReportResponse[];
  pagination: {
    pages: number;
    rowsNumber: number;
  };
}

export interface GetEventReportDataStreamParams {
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
