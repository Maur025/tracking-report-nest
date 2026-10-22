import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { ProgressReportQueryParams } from './progress-report-query-params.js';

describe('ProgressReportQueryParams', () => {
  it('should apply the inherited default values', () => {
    // WHEN
    const dto = plainToInstance(ProgressReportQueryParams, {
      databaseName: 'enterprise_1_db',
    });

    // THEN
    expect(dto.format).toBe('pdf');
    expect(dto.disposition).toBe('inline');
    expect(dto.fileName).toBe('example');
    expect(dto.page).toBe(0);
    expect(dto.size).toBe(10);
    expect(dto.descending).toBe(false);
    expect(dto.sortBy).toBe('id');
  });

  it('should keep the given values', () => {
    // WHEN
    const dto = plainToInstance(ProgressReportQueryParams, {
      databaseName: 'enterprise_1_db',
      format: 'excel',
      disposition: 'attachment',
      fileName: 'progress_report',
      title: 'Reporte de progreso',
      filterByLabel: 'tipo=RUTA',
      zoneId: 'America/La_Paz',
    });

    // THEN
    expect(dto.databaseName).toBe('enterprise_1_db');
    expect(dto.format).toBe('excel');
    expect(dto.disposition).toBe('attachment');
    expect(dto.fileName).toBe('progress_report');
    expect(dto.title).toBe('Reporte de progreso');
    expect(dto.filterByLabel).toBe('tipo=RUTA');
    expect(dto.zoneId).toBe('America/La_Paz');
  });

  it('should transform the date parameters into zoned date times', () => {
    // WHEN
    const dto = plainToInstance(ProgressReportQueryParams, {
      databaseName: 'enterprise_1_db',
      date: '2026-09-29T16:27:17.649Z',
      zoneId: 'America/La_Paz',
    });

    // THEN
    expect(dto.date).toBeDefined();
    expect(dto.date?.toString()).toContain('2026-09-29');
  });
});
