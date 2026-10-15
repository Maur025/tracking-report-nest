import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpClient } from '@nestjs/http-client';
import { streamPaginatedData } from '../../shared/utils/stream-paginated-data.js';
import { transformSafeString } from '../../shared/utils/transform-safe-string.js';
import type { EventClientResponseDto } from './interfaces/event-client-response.interface.js';
import type {
  GetEventReportDataParams,
  GetEventReportDataResponse,
  GetEventReportDataStreamParams,
} from './interfaces/event-client-service.interface.js';
import type { EventReportResponse } from './interfaces/event-report-response.interface.js';
import { eventReportResponseMapper } from './mapper/event-report-response.mapper.js';

@Injectable()
export class EventClientService {
  private readonly logger = new Logger('EventClientService');

  constructor(private readonly httpClient: HttpClient) {}

  async getEventReportData({
    dbName,
    dbHost,
    pagination = {},
    filters = {},
  }: GetEventReportDataParams): Promise<GetEventReportDataResponse> {
    const transformFilters = this.transformFilters(filters);

    const paginationQuery = {
      page: 0,
      size: 10,
      descending: true,
      sortBy: 'date',
      ...pagination,
    };

    try {
      const { data } = await this.httpClient.get<EventClientResponseDto>(
        `${dbHost}/${dbName}/registry_events/eventnotification`,
        {
          query: {
            ...transformFilters,
            ...paginationQuery,
            descending: String(paginationQuery.descending),
          },
        },
      );

      return {
        data: eventReportResponseMapper(data.content),
        pagination: data.pagination,
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch event report data from external API',
        error,
      );
      throw new BadGatewayException(
        'Failed to fetch event report data from external API',
        { cause: error },
      );
    }
  }

  private transformFilters(filters: Record<string, unknown>) {
    const transformedFilters: Record<string, string> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (!value) {
        continue;
      }

      const stringValue = transformSafeString(value);

      switch (key) {
        case 'vehicleId': {
          transformedFilters['[vehicle_id][equal]'] = stringValue;
          break;
        }
        case 'ruleId': {
          transformedFilters['[rule_id][equal]'] = stringValue;
          break;
        }
        case 'inout': {
          transformedFilters['[inout][equal]'] = stringValue;
          break;
        }
        case 'geofenceId': {
          transformedFilters['[geofence_id][equal]'] = stringValue;
          break;
        }
        case 'type': {
          transformedFilters['[type_name][equal]'] = stringValue;
          break;
        }
        case 'deventId': {
          transformedFilters['[devent_id][equal]'] = stringValue;
          break;
        }
        case 'fromDate': {
          transformedFilters['[date][between][from]'] = stringValue;
          break;
        }
        case 'toDate': {
          transformedFilters['[date][between][to]'] = stringValue;
          break;
        }
        default: {
          transformedFilters[key] = stringValue;
        }
      }
    }

    return transformedFilters;
  }

  async *getEventReportDataStream({
    dbName,
    dbHost,
    pagination,
    filters,
  }: GetEventReportDataStreamParams): AsyncGenerator<
    EventReportResponse,
    void,
    undefined
  > {
    yield* streamPaginatedData({
      onFetchData: async (page, size) => {
        const eventData = await this.getEventReportData({
          dbName,
          dbHost,
          pagination: { ...pagination, page, size },
          filters,
        });

        return eventData.data;
      },
    });
  }
}
