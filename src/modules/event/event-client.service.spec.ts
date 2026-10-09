import { HttpClient } from '@nestjs/http-client';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { EventClientService } from './event-client.service.js';
import { Pagination } from './interfaces/event-client-response.interface.js';
import { EventReportResponse } from './interfaces/event-report-response.interface.js';

describe('EventClientService', () => {
  let service: EventClientService;
  let mockClientGet: Mock;

  beforeEach(async () => {
    mockClientGet = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventClientService,
        {
          provide: HttpClient,
          useValue: {
            get: mockClientGet,
          },
        },
      ],
    }).compile();

    service = module.get<EventClientService>(EventClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEventReportData', () => {
    it('should return data of events, consuming external api', async () => {
      // GIVEN
      const requestParams = {
        dbName: 'test',
        dbHost: 'http://localhost:1234',
        pagination: {
          page: 1,
          size: 10,
        },
        filters: {
          vehicleId: 'vehicle123',
          ruleId: 'rule456',
          inout: 'in',
          geofenceId: 'geofence789',
          type: ['type1', 'type2'],
          deventId: 'devent101112',
          fromDate: '2023-01-01',
          toDate: '2023-01-31',
        },
      };

      mockClientGet.mockResolvedValue({
        data: {
          content: [],
          pagination: { pages: 2, rowsNumber: 20 },
        },
      });

      // WHEN
      const response = await service.getEventReportData(requestParams);

      // THEN
      expect(mockClientGet).toHaveBeenCalledWith(
        `${requestParams.dbHost}/${requestParams.dbName}/registry_events/eventnotification`,
        expect.objectContaining({
          query: expect.objectContaining({
            '[vehicle_id][equal]': requestParams.filters.vehicleId,
            '[rule_id][equal]': requestParams.filters.ruleId,
            '[inout][equal]': requestParams.filters.inout,
            '[geofence_id][equal]': requestParams.filters.geofenceId,
            '[type_name][equal]': String(requestParams.filters.type),
            '[devent_id][equal]': requestParams.filters.deventId,
            '[date][between][from]': requestParams.filters.fromDate,
            '[date][between][to]': requestParams.filters.toDate,
            page: requestParams.pagination.page,
            size: requestParams.pagination.size,
            descending: 'true',
            sortBy: 'date',
          }),
        }),
      );

      expect(response).toBeDefined();
      expect(response).toEqual(
        expect.objectContaining({
          data: expect.anything(),
          pagination: expect.objectContaining({
            pages: expect.any(Number),
            rowsNumber: expect.any(Number),
          }),
        }),
      );
    });

    it('should fail consuming external api', async () => {
      // GIVEN
      const requestParams = {
        dbName: 'test',
        dbHost: 'http://localhost:1234',
        filters: {
          toDate: '2023-01-31',
        },
      };

      mockClientGet.mockRejectedValue('Network error');

      // WHEN
      const execution = service.getEventReportData(requestParams);

      // THEN
      await expect(execution).rejects.toThrow(
        'Failed to fetch event report data from external API',
      );

      expect(mockClientGet).toHaveBeenCalledWith(
        `${requestParams.dbHost}/${requestParams.dbName}/registry_events/eventnotification`,
        expect.objectContaining({
          query: expect.objectContaining({
            '[date][between][to]': requestParams.filters.toDate,
            page: 0,
            size: 10,
            descending: 'true',
            sortBy: 'date',
          }),
        }),
      );
    });
  });

  describe('getEventReportDataStream', () => {
    it('should return a stream of event report data with 1 page', async () => {
      // GIVEN
      const events = [
        { device_id: '1' },
        { device_id: '2' },
      ] as unknown as EventReportResponse[];

      const params = {
        dbName: 'test',
        dbHost: 'http://localhost:1234',
        pagination: { sortBy: 'date', descending: true },
        filters: {},
      };

      const getEventReportDataSpy = vi
        .spyOn(service, 'getEventReportData')
        .mockResolvedValue({
          data: events,
          pagination: { pages: 1, rowsNumber: 2 },
        });

      const result = [];
      // WHEN
      for await (const event of service.getEventReportDataStream(params)) {
        result.push(event);
      }

      // THEN
      expect(result).toBeDefined();
      expect(getEventReportDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...params,
          pagination: { ...params.pagination, page: 0, size: 100 },
        }),
      );
    });

    it('should fetch subsequent pages until receiving less than page size', async () => {
      const firstPage = Array.from({ length: 100 }, (_, index) => ({
        id: `event-${index}`,
      })) as EventReportResponse[];

      const secondPage = [
        { id: 'event-100' },
        { id: 'event-101' },
      ] as unknown as EventReportResponse[];

      const getEventReportDataSpy = vi
        .spyOn(service, 'getEventReportData')
        .mockResolvedValueOnce({
          data: firstPage,
          pagination: {} as Pagination,
        })
        .mockResolvedValueOnce({
          data: secondPage,
          pagination: {} as Pagination,
        });

      const result = [];

      for await (const event of service.getEventReportDataStream({
        dbName: 'test-db',
        dbHost: 'http://localhost:8080',
        pagination: {
          descending: true,
          sortBy: 'date',
        },
        filters: {},
      })) {
        result.push(event);
      }

      expect(result).toEqual([...firstPage, ...secondPage]);

      expect(getEventReportDataSpy).toHaveBeenCalledTimes(2);
    });

    it('should throw BadGatewayException when fetching data fails', async () => {
      vi.spyOn(service, 'getEventReportData').mockRejectedValue(
        new Error('Connection refused'),
      );

      const consumeStream = async () => {
        for await (const _ of service.getEventReportDataStream({
          dbName: 'test-db',
          dbHost: 'http://localhost:8080',
          pagination: {},
          filters: {},
        })) {
          // consume
        }
      };

      await expect(consumeStream()).rejects.toThrow(
        'Error occurred while fetching data from external API',
      );
    });
  });
});
