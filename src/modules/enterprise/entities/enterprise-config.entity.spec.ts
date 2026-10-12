import { describe, expect, it } from 'vitest';
import { EnterpriseConfig } from './enterprise-config.entity.js';
import { Enterprise } from './enterprise.entity.js';

describe('EnterpriseConfig', () => {
  it('should build the host url from the host and port', () => {
    // GIVEN
    const config = new EnterpriseConfig();
    config.host = 'tracking.example.com';
    config.port = '8080';

    // WHEN
    const hostUrl = config.hostUrl;

    // THEN
    expect(hostUrl).toBe('http://tracking.example.com:8080');
  });

  it('should keep the database and its enterprise', () => {
    // GIVEN
    const enterprise = new Enterprise();
    const config = new EnterpriseConfig();
    config.database = 'tracking_db';
    config.enterprise = enterprise;

    // THEN
    expect(config.database).toBe('tracking_db');
    expect(config.enterprise).toBe(enterprise);
  });
});
