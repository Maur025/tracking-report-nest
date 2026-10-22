import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { UpdateReportRequestDto } from './update-report-request.dto.js';

const validateDto = async (payload: Record<string, unknown>) => {
  const dto = plainToInstance(UpdateReportRequestDto, payload);

  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
};

describe('UpdateReportRequestDto', () => {
  it('should accept an empty payload because every field is optional', async () => {
    // WHEN
    const errors = await validateDto({});

    // THEN
    expect(errors).toEqual([]);
  });

  it('should accept a partial update', async () => {
    // WHEN
    const errors = await validateDto({ status: 'COMPLETED' });

    // THEN
    expect(errors).toEqual([]);
  });

  it('should keep validating the provided fields', async () => {
    // WHEN
    const errors = await validateDto({ type: 'unknown' });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('type');
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('should reject unknown properties', async () => {
    // WHEN
    const errors = await validateDto({ unknownField: 'value' });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('unknownField');
    expect(errors[0].constraints).toHaveProperty('whitelistValidation');
  });
});
