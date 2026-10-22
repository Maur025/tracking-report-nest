export const REPORT_QUEUE_NAME = 'report-queue';

export const REPORT_JOBS = {
  GENERATE_PDF: 'generate-pdf',
  GENERATE_EXCEL: 'generate-excel',
} as const;

export interface GenerateReportJob {
  reportId: string;
}
