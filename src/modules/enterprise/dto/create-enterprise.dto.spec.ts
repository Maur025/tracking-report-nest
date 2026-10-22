import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateEnterpriseDto } from './create-enterprise.dto.js';

const validateDto = async (payload: Record<string, unknown>) => {
  const dto = plainToInstance(CreateEnterpriseDto, payload);

  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
};

const buildConfig = (overrides: Record<string, unknown> = {}) => ({
  host: 'tracking.example.com',
  port: '8080',
  database: 'tracking_db',
  referenceId: 'database-1',
  ...overrides,
});

describe('CreateEnterpriseDto', () => {
  it('should accept a minimal enterprise', async () => {
    // WHEN
    const errors = await validateDto({
      name: 'Acme',
      enterpriseConfigs: [buildConfig()],
    });

    // THEN
    expect(errors).toEqual([]);
  });

  it('should accept a complete enterprise', async () => {
    // WHEN
    const errors = await validateDto({
      id: 'enterprise-1',
      name: 'Acme',
      description: 'Empresa de prueba',
      color: '#FF5733',
      image: 'data:image/png;base64,logo',
      enterpriseConfigs: [buildConfig({ enterpriseRefId: 'enterprise-1' })],
    });

    // THEN
    expect(errors).toEqual([]);
  });

  it('should reject a missing name', async () => {
    // WHEN
    const errors = await validateDto({ enterpriseConfigs: [buildConfig()] });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
  });

  it('should reject an empty name', async () => {
    // WHEN
    const errors = await validateDto({
      name: '',
      enterpriseConfigs: [buildConfig()],
    });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject a missing configuration list', async () => {
    // WHEN
    const errors = await validateDto({ name: 'Acme' });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('enterpriseConfigs');
    expect(errors[0].constraints).toHaveProperty('isArray');
  });

  it('should reject a configuration list that is not an array', async () => {
    // WHEN
    const errors = await validateDto({
      name: 'Acme',
      enterpriseConfigs: buildConfig(),
    });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('enterpriseConfigs');
  });

  it('should reject an unknown property', async () => {
    // WHEN
    const errors = await validateDto({
      name: 'Acme',
      enterpriseConfigs: [buildConfig()],
      unknownField: 'value',
    });

    // THEN
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('unknownField');
    expect(errors[0].constraints).toHaveProperty('whitelistValidation');
  });
});
