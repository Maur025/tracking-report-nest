import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanDatabase } from './setup/clean-database.js';
import { createTestApp } from './setup/create-test-app.js';
import { seedEnterpriseConfig } from './setup/seed-enterprise-config.js';
import { binaryParser } from './setup/utils.js';

const RESOURCE_URL = '/api/progress/reports';

describe('/api/progress/reports e2e test', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await cleanDatabase(dataSource);
    await seedEnterpriseConfig(dataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should return 400 when required query parameters aren't provided /(GET)", async () => {
    // WHEN
    const response = await request(app.getHttpServer()).get(RESOURCE_URL);

    // THEN
    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.arrayContaining([
          expect.stringContaining('should not be empty'),
          expect.stringContaining('must be a string'),
        ]),
        error: expect.stringMatching('Bad Request'),
        statusCode: 400,
      }),
    );
  });

  it("should return 500 when the database name provided doesn't exist /(GET)", async () => {
    // WHEN
    const response = await request(app.getHttpServer())
      .get(RESOURCE_URL)
      .query({
        databaseName: 'enterprise_3_db',
      });

    // THEN
    expect(response.status).toBe(500);
  });

  it('should return 400 when an unknown query parameter is provided /(GET)', async () => {
    // WHEN
    const response = await request(app.getHttpServer())
      .get(RESOURCE_URL)
      .query({
        databaseName: 'enterprise_1_db',
        unknownParam: 'value',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('unknownParam should not exist'),
      ]),
    );
  });

  it('should return 400 when the format is not supported /(GET)', async () => {
    // WHEN
    const response = await request(app.getHttpServer())
      .get(RESOURCE_URL)
      .query({
        databaseName: 'enterprise_1_db',
        format: 'csv',
      });

    // THEN
    expect(response.status).toBe(400);
  });

  it('should return 400 when the disposition is not supported /(GET)', async () => {
    // WHEN
    const response = await request(app.getHttpServer())
      .get(RESOURCE_URL)
      .query({
        databaseName: 'enterprise_1_db',
        disposition: 'unknown',
      });

    // THEN
    expect(response.status).toBe(400);
  });

  it('should return 200 and a pdf file when the format is not provided /(GET)', async () => {
    // WHEN
    const response = await request(app.getHttpServer())
      .get(RESOURCE_URL)
      .query({
        databaseName: 'enterprise_1_db',
        zoneId: 'America/La_Paz',
      })
      .buffer(true)
      .parse(binaryParser);

    // THEN
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.body.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('should return 200 and set the inline disposition /(GET)', async () => {
    // WHEN
    const response = await request(app.getHttpServer())
      .get(RESOURCE_URL)
      .query({
        databaseName: 'enterprise_1_db',
        fileName: 'progress_report',
        disposition: 'inline',
        format: 'pdf',
      })
      .buffer(true)
      .parse(binaryParser);

    // THEN
    expect(response.status).toBe(200);
    expect(response.headers['content-disposition']).toContain('inline');
    expect(response.headers['content-disposition']).toContain('progress_report');
    expect(response.body.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('should always attach the xlsx file when the format is excel /(GET)', async () => {
    // WHEN
    const response = await request(app.getHttpServer())
      .get(RESOURCE_URL)
      .query({
        databaseName: 'enterprise_1_db',
        fileName: 'progress_report',
        disposition: 'inline',
        format: 'excel',
      })
      .buffer(true)
      .parse(binaryParser);

    // THEN
    expect(response.status).toBe(200);
    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.body.subarray(0, 4).toString()).toBe('PK\x03\x04');
  });

  it('should return 200 and return a pdf file /(GET)', async () => {
    // GIVEN
    const disposition = 'attachment';
    const fileName = 'event_report';

    // WHEN
    const response = await request(app.getHttpServer())
      .get(RESOURCE_URL)
      .query({
        databaseName: 'enterprise_1_db',
        disposition,
        fileName,
        descending: true,
        sortBy: 'name',
        format: 'pdf',
        date: '2026-09-29T16:27:17.649Z',
        zoneId: 'America/La_Paz',
      })
      .buffer(true)
      .parse(binaryParser);

    // THEN
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain(disposition);
    expect(response.headers['content-disposition']).toContain(fileName);

    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('should return 200 and return a xlsx file /(GET)', async () => {
    // GIVEN
    const fileName = 'event_report';

    // WHEN
    const response = await request(app.getHttpServer())
      .get(RESOURCE_URL)
      .query({
        databaseName: 'enterprise_1_db',
        fileName,
        descending: true,
        sortBy: 'name',
        format: 'excel',
        zoneId: 'America/La_Paz',
      })
      .buffer(true)
      .parse(binaryParser);

    // THEN
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.headers['content-disposition']).toContain(fileName);

    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.subarray(0, 4).toString()).toBe('PK\x03\x04');
  });
});
