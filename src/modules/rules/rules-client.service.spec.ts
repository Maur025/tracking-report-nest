import { HttpClient } from '@nestjs/http-client';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { RulesClientService } from './rules-client.service.js';

const buildHttpResponse = (
  content: unknown[] = [],
  pagination = { pages: 1, rowsNumber: 0 },
) => ({
  data: { content, pagination },
});

describe('RulesClientService', () => {
  let service: RulesClientService;
  let mockClientGet: Mock;

  beforeEach(async () => {
    mockClientGet = vi.fn().mockResolvedValue(buildHttpResponse());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesClientService,
        { provide: HttpClient, useValue: { get: mockClientGet } },
      ],
    }).compile();

    service = module.get<RulesClientService>(RulesClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRulesReportData', () => {
    it('should request the rules endpoint with default pagination', async () => {
      // WHEN
      await service.getRulesReportData({ dbName: 'db', dbHost: 'http://host' });

      // THEN
      expect(mockClientGet).toHaveBeenCalledWith(
        'http://host/db/rules',
        expect.objectContaining({
          query: expect.objectContaining({
            page: 0,
            size: 10,
            descending: 'true',
            sortBy: 'name',
          }),
        }),
      );
    });

    it('should translate the supported filters into query params', async () => {
      // GIVEN
      const filters = {
        type: 'SENSORS',
        toDate: '2023-01-02',
        keyword: 'regla',
        frequencyWeekday: 2,
      };

      // WHEN
      await service.getRulesReportData({
        dbName: 'db',
        dbHost: 'http://host',
        filters,
      });

      // THEN
      expect(mockClientGet).toHaveBeenCalledWith(
        'http://host/db/rules',
        expect.objectContaining({
          query: expect.objectContaining({
            '[type][equal]': 'SENSORS',
            '[date_from][between][to]': '2023-01-02',
            '[name][like]': 'regla',
            '[frequency][frequency][equal]': '2',
          }),
        }),
      );
    });

    it('should ignore empty filter values', async () => {
      // WHEN
      await service.getRulesReportData({
        dbName: 'db',
        dbHost: 'http://host',
        filters: { type: '', keyword: null },
      });

      // THEN
      const query = mockClientGet.mock.calls[0][1].query;
      expect(query).not.toHaveProperty('[type][equal]');
      expect(query).not.toHaveProperty('[name][like]');
    });

    // Known debt: the `fromDate` case is declared with a leading space, so it
    // falls through to the default and keeps the original key.
    it('should keep the original key for a fromDate filter', async () => {
      // WHEN
      await service.getRulesReportData({
        dbName: 'db',
        dbHost: 'http://host',
        filters: { fromDate: '2023-01-01' },
      });

      // THEN
      const query = mockClientGet.mock.calls[0][1].query;
      expect(query).toHaveProperty('fromDate', '2023-01-01');
      expect(query).not.toHaveProperty('[date_from][between][from]');
    });

    it('should map the response through the report mapper', async () => {
      // GIVEN
      mockClientGet.mockResolvedValue(
        buildHttpResponse(
          [{ name: 'Exceso de velocidad', alerts: [], frequency: [] }],
          { pages: 1, rowsNumber: 1 },
        ),
      );

      // WHEN
      const response = await service.getRulesReportData({
        dbName: 'db',
        dbHost: 'http://host',
      });

      // THEN
      expect(response.data).toEqual([
        expect.objectContaining({ name: 'Exceso de velocidad', frequency: [] }),
      ]);
      expect(response.pagination).toEqual({ pages: 1, rowsNumber: 1 });
    });

    it('should throw BadGatewayException when the external API fails', async () => {
      // GIVEN
      mockClientGet.mockRejectedValue(new Error('Network error'));

      // WHEN / THEN
      await expect(
        service.getRulesReportData({ dbName: 'db', dbHost: 'http://host' }),
      ).rejects.toThrow('Failed to fetch rules report data from external API');
    });
  });

  describe('getProgressReportDataStream', () => {
    it('should paginate until it receives a partial page', async () => {
      // GIVEN
      const fullPage = Array.from({ length: 100 }, (_, index) => ({
        name: `rule-${index}`,
        frequency: [],
      }));
      const lastPage = [{ name: 'last-rule', frequency: [] }];

      mockClientGet
        .mockResolvedValueOnce(buildHttpResponse(fullPage))
        .mockResolvedValueOnce(buildHttpResponse(lastPage));

      // WHEN
      const names: string[] = [];
      for await (const item of service.getProgressReportDataStream({
        dbName: 'db',
        dbHost: 'http://host',
        pagination: { sortBy: 'name' },
        filters: {},
      })) {
        names.push(item.name ?? '');
      }

      // THEN
      expect(names).toHaveLength(101);
      expect(names.at(-1)).toBe('last-rule');
      expect(mockClientGet).toHaveBeenCalledTimes(2);
    });

    it('should propagate a failure while streaming', async () => {
      // GIVEN
      mockClientGet.mockRejectedValue(new Error('Connection refused'));

      const consume = async () => {
        for await (const _ of service.getProgressReportDataStream({
          dbName: 'db',
          dbHost: 'http://host',
        })) {
          // consume
        }
      };

      // WHEN / THEN
      await expect(consume()).rejects.toThrow(
        'Error occurred while fetching data from external API',
      );
    });
  });
});
