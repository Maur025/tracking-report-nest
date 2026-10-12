import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { environmentSchema } from './environment.schema.js';

describe('environmentSchema', () => {
  it('should apply the defaults when no environment is provided', () => {
    // WHEN
    const result = environmentSchema.parse({});

    // THEN
    expect(result.APP_ID).toBe('REPORT01');
    expect(result.APP_NAME).toBe('tracking-report');
    expect(result.TZ).toBe('America/La_Paz');
    expect(result.DB_URL).toBe('./database/tracking-report.sqlite');
  });

  it('should coerce numeric environment variables into numbers', () => {
    // WHEN
    const result = environmentSchema.parse({
      APP_PORT: '3000',
      WS_PORT: '4000',
      PING_INTERVAL_MS: '1500',
    });

    // THEN
    expect(result.APP_PORT).toBe(3000);
    expect(result.WS_PORT).toBe(4000);
    expect(result.PING_INTERVAL_MS).toBe(1500);
  });

  it('should default numeric variables when they are not provided', () => {
    // WHEN
    const result = environmentSchema.parse({});

    // THEN
    expect(result.APP_PORT).toBe(10801);
    expect(result.WS_PORT).toBe(10701);
    expect(result.WS_GATEWAY_PORT_PROCESSOR).toBe(7170);
  });

  it('should reject empty string values', () => {
    // WHEN / THEN
    expect(() => environmentSchema.parse({ APP_PORT: '' })).toThrow(ZodError);
  });
});
