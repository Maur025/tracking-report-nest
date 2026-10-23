import { HttpClient } from '@nestjs/http-client';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { RegistryProgressClientService } from './registry-progress-client.service.js';

const buildHttpResponse = (
  content: unknown[] = [],
  pagination = { pages: 1, rowsNumber: 0 },
) => ({
  data: { content, pagination },
});

describe('RegistryProgressClientService', () => {
  let service: RegistryProgressClientService;
  let mockClientGet: Mock;

  beforeEach(async () => {
    mockClientGet = vi.fn().mockResolvedValue(buildHttpResponse());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryProgressClientService,
        { provide: HttpClient, useValue: { get: mockClientGet } },
      ],
    }).compile();

    service = module.get<RegistryProgressClientService>(
      RegistryProgressClientService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRegistryProgressReportData', () => {
    it('should request the registry_progress endpoint with default pagination', async () => {
      // WHEN
      await service.getRegistryProgressReportData({
        dbName: 'db',
        dbHost: 'http://host',
      });

      // THEN
      expect(mockClientGet).toHaveBeenCalledWith(
        'http://host/db/registry_progress',
        expect.objectContaining({
          query: expect.objectContaining({
            page: 0,
            size: 10,
            descending: true,
            sortBy: 'id',
          }),
        }),
      );
    });

    it('should translate the supported filters into query params', async () => {
      // GIVEN
      const filters = {
        type: 'ROUTE',
        vehicleId: 'v-1',
        progressId: 'p-1',
        fromDate: 1672531200000,
        toDate: 1672617600000,
      };

      // WHEN
      await service.getRegistryProgressReportData({
        dbName: 'db',
        dbHost: 'http://host',
        filters,
      });

      // THEN
      expect(mockClientGet).toHaveBeenCalledWith(
        'http://host/db/registry_progress',
        expect.objectContaining({
          query: expect.objectContaining({
            '[type][equal]': 'ROUTE',
            '[vehicle_id][equal]': 'v-1',
            '[progress_id][equal]': 'p-1',
            '[date_from][between][from]': '1672531200000',
            '[date_from][between][to]': '1672617600000',
          }),
        }),
      );
    });

    it('should ignore empty filter values', async () => {
      // WHEN
      await service.getRegistryProgressReportData({
        dbName: 'db',
        dbHost: 'http://host',
        filters: { type: '', vehicleId: null },
      });

      // THEN
      const query = mockClientGet.mock.calls[0][1].query;
      expect(query).not.toHaveProperty('[type][equal]');
      expect(query).not.toHaveProperty('[vehicle_id][equal]');
    });

    it('should forward unknown filters without transformation', async () => {
      // WHEN
      await service.getRegistryProgressReportData({
        dbName: 'db',
        dbHost: 'http://host',
        filters: { customFilter: 'abc' },
      });

      // THEN
      expect(mockClientGet.mock.calls[0][1].query).toHaveProperty(
        'customFilter',
        'abc',
      );
    });

    it('should map the response through the report mapper', async () => {
      // GIVEN
      mockClientGet.mockResolvedValue(
        buildHttpResponse(
          [{ value: '42', vehicle: [{ name: 'Tucson' }] }],
          { pages: 1, rowsNumber: 1 },
        ),
      );

      // WHEN
      const response = await service.getRegistryProgressReportData({
        dbName: 'db',
        dbHost: 'http://host',
      });

      // THEN
      expect(response.data).toEqual([
        expect.objectContaining({ progressValue: 42, vehicle: 'Tucson' }),
      ]);
      expect(response.pagination).toEqual({ pages: 1, rowsNumber: 1 });
    });

    it('should throw BadGatewayException when the external API fails', async () => {
      // GIVEN
      mockClientGet.mockRejectedValue(new Error('Network error'));

      // WHEN / THEN
      await expect(
        service.getRegistryProgressReportData({
          dbName: 'db',
          dbHost: 'http://host',
        }),
      ).rejects.toThrow('Failed to fetch rules report data from external API');
    });
  });

  describe('getRegistryProgressReportDataStream', () => {
    it('should paginate until it receives a partial page', async () => {
      // GIVEN
      const fullPage = Array.from({ length: 100 }, (_, index) => ({
        value: String(index),
      }));
      const lastPage = [{ value: '999' }];

      mockClientGet
        .mockResolvedValueOnce(buildHttpResponse(fullPage))
        .mockResolvedValueOnce(buildHttpResponse(lastPage));

      // WHEN
      const values: number[] = [];
      for await (const item of service.getRegistryProgressReportDataStream({
        dbName: 'db',
        dbHost: 'http://host',
        pagination: { sortBy: 'id' },
        filters: {},
      })) {
        values.push(item.progressValue ?? -1);
      }

      // THEN
      expect(values).toHaveLength(101);
      expect(values.at(-1)).toBe(999);
      expect(mockClientGet).toHaveBeenCalledTimes(2);
    });

    it('should propagate a failure while streaming', async () => {
      // GIVEN
      mockClientGet.mockRejectedValue(new Error('Connection refused'));

      const consume = async () => {
        for await (const _ of service.getRegistryProgressReportDataStream({
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
