import { describe, expect, it } from 'vitest';
import { EnterpriseConfig } from './enterprise-config.entity.js';
import { Enterprise } from './enterprise.entity.js';

describe('Enterprise', () => {
  it('should hold its descriptive data', () => {
    // GIVEN
    const enterprise = new Enterprise();

    // WHEN
    enterprise.name = 'Acme';
    enterprise.description = 'Empresa de prueba';
    enterprise.color = '#FF5733';

    // THEN
    expect(enterprise.name).toBe('Acme');
    expect(enterprise.description).toBe('Empresa de prueba');
    expect(enterprise.color).toBe('#FF5733');
  });

  it('should relate to its configurations', () => {
    // GIVEN
    const enterprise = new Enterprise();
    const config = new EnterpriseConfig();

    // WHEN
    enterprise.enterpriseConfigs = [config];

    // THEN
    expect(enterprise.enterpriseConfigs).toEqual([config]);
  });
});
