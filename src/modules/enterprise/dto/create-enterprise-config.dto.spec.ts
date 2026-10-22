import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateEnterpriseConfigDto } from './create-enterprise-config.dto.js';

const validateDto = async (payload: Record<string, unknown>) => {
  const dto = plainToInstance(CreateEnterpriseConfigDto, payload);

  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
};

const buildConfig = (overrides: Record<string, unknown> = {}) => ({
  host: 'tracking.example.com',
  port: '8080',
  database: 'tracking_db',
  referenceId: 'database-1',
  ...overrides,
});

describe('CreateEnterpriseConfigDto', () => {
  it('should accept a complete configuration', async () => {
    // WHEN
    const errors = await validateDto(buildConfig());

    // THEN
    expect(errors).toEqual([]);
  });

  it('should accept a configuration without the enterprise reference', async () => {
    // WHEN
    const errors = await validateDto(buildConfig({ enterpriseRefId: undefined }));

    // THEN
    expect(errors).toEqual([]);
  });

  it.each(['host', 'port', 'database', 'referenceId'])(
    'should reject a configuration without the %s',
    async (property) => {
      // GIVEN
      const payload = buildConfig();
      delete payload[property];

      // WHEN
      const errors = await validateDto(payload);

      // THEN
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty('isString');
    },
  );

  it('should reject a non string port', async () => {
    // WHEN
    const errors = await validateDto(buildConfig({ port: 8080 }));

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('port');
  });

  it('should reject an unknown property', async () => {
    // WHEN
    const errors = await validateDto(buildConfig({ unknownField: 'value' }));

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('unknownField');
    expect(errors[0].constraints).toHaveProperty('whitelistValidation');
  });
});
