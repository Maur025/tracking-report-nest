import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ReportStatusEnum } from '../enums/report-status.enum.js';
import { ReportTypeEnum } from '../enums/report-type-enum.js';
import { CreateReportRequestDto } from './create-report-request.dto.js';

const validateDto = async (payload: Record<string, unknown>) => {
  const dto = plainToInstance(CreateReportRequestDto, payload);

  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
};

describe('CreateReportRequestDto', () => {
  it.each(Object.values(ReportTypeEnum))(
    'should accept the %s report type',
    async (type) => {
      // WHEN
      const errors = await validateDto({ type, payload: {} });

      // THEN
      expect(errors).toEqual([]);
    },
  );

  it('should reject an unknown report type', async () => {
    // WHEN
    const errors = await validateDto({ type: 'unknown', payload: {} });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('type');
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('should reject a missing report type', async () => {
    // WHEN
    const errors = await validateDto({ payload: {} });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('type');
  });

  it('should reject a payload that is not an object', async () => {
    // WHEN
    const errors = await validateDto({ type: 'event', payload: 'not-an-object' });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('payload');
    expect(errors[0].constraints).toHaveProperty('isObject');
  });

  it('should accept a missing status, file path and error message', async () => {
    // WHEN
    const errors = await validateDto({ type: 'event', payload: { a: 1 } });

    // THEN
    expect(errors).toEqual([]);
  });

  it.each(Object.values(ReportStatusEnum))(
    'should accept the %s status',
    async (status) => {
      // WHEN
      const errors = await validateDto({
        type: 'event',
        payload: {},
        status,
      });

      // THEN
      expect(errors).toEqual([]);
    },
  );

  it('should reject an unknown status', async () => {
    // WHEN
    const errors = await validateDto({
      type: 'event',
      payload: {},
      status: 'UNKNOWN',
    });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('should reject a non string file path', async () => {
    // WHEN
    const errors = await validateDto({
      type: 'event',
      payload: {},
      filePath: 123,
    });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('filePath');
  });

  it('should reject unknown properties', async () => {
    // WHEN
    const errors = await validateDto({
      type: 'event',
      payload: {},
      unknownField: 'value',
    });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('unknownField');
    expect(errors[0].constraints).toHaveProperty('whitelistValidation');
  });
});
