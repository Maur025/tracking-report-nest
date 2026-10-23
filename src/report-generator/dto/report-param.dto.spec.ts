import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ReportParamDto } from './report-param.dto.js';

describe('ReportParamDto', () => {
  it('should apply the default values', () => {
    // WHEN
    const dto = new ReportParamDto();

    // THEN
    expect(dto.disposition).toBe('inline');
    expect(dto.fileName).toBe('example');
  });

  it('should require the database name', async () => {
    // GIVEN
    const dto = plainToInstance(ReportParamDto, {});

    // WHEN
    const errors = await validate(dto);

    // THEN
    expect(errors.map((error) => error.property)).toContain('databaseName');
  });

  it('should reject unsupported formats and dispositions', async () => {
    // GIVEN
    const dto = plainToInstance(ReportParamDto, {
      databaseName: 'db',
      format: 'csv',
      disposition: 'download',
    });

    // WHEN
    const errors = await validate(dto);

    // THEN
    const properties = errors.map((error) => error.property);
    expect(properties).toContain('format');
    expect(properties).toContain('disposition');
  });

  it('should accept a supported format and disposition', async () => {
    // GIVEN
    const dto = plainToInstance(ReportParamDto, {
      databaseName: 'db',
      format: 'pdf',
      disposition: 'attachment',
    });

    // WHEN
    const errors = await validate(dto);

    // THEN
    expect(errors).toHaveLength(0);
  });
});
