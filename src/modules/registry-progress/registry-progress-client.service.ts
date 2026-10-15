import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpClient } from '@nestjs/http-client';
import { streamPaginatedData } from '../../shared/utils/stream-paginated-data.js';
import { transformSafeString } from '../../shared/utils/transform-safe-string.js';
import { RegistryProgressClientResponse } from './interfaces/registry-progress-client-response.interface.js';
import {
  GetRegistryProgressReportDataParams,
  GetRegistryProgressReportDataResponse,
  GetRegistryProgressReportDataStreamParams,
} from './interfaces/registry-progress-client-service.interface.js';
import { RegistryProgressReportResponse } from './interfaces/registry-progress-report-response.interface.js';
import { registryProgressReportResponseMapper } from './mapper/registry-progress-report-response.mapper.js';

@Injectable()
export class RegistryProgressClientService {
  private readonly logger = new Logger('RegistryProgressClientService');

  constructor(private readonly httpClient: HttpClient) {}

  async getRegistryProgressReportData({
    dbName,
    dbHost,
    pagination = {},
    filters = {},
  }: GetRegistryProgressReportDataParams): Promise<GetRegistryProgressReportDataResponse> {
    const transformFilters = this.transformFilters(filters);

    const paginationQuery = {
      page: 0,
      size: 10,
      descending: true,
      sortBy: 'id',
      ...pagination,
    };

    try {
      const { data } =
        await this.httpClient.get<RegistryProgressClientResponse>(
          `${dbHost}/${dbName}/registry_progress`,
          {
            query: {
              ...transformFilters,
              ...paginationQuery,
            },
          },
        );

      return {
        data: registryProgressReportResponseMapper(data.content),
        pagination: data.pagination,
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch rules report data from external API',
        error,
      );
      throw new BadGatewayException(
        'Failed to fetch rules report data from external API',
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
        case 'type': {
          transformedFilters['[type][equal]'] = stringValue;
          break;
        }
        case 'vehicleId': {
          transformedFilters['[vehicle_id][equal]'] = stringValue;
          break;
        }
        case 'progressId': {
          transformedFilters['[progress_id][equal]'] = stringValue;
          break;
        }
        case 'fromDate': {
          transformedFilters['[date_from][between][from]'] = stringValue;
          break;
        }
        case 'toDate': {
          transformedFilters['[date_from][between][to]'] = stringValue;
          break;
        }
        default: {
          transformedFilters[key] = stringValue;
          break;
        }
      }
    }

    return transformedFilters;
  }

  async *getRegistryProgressReportDataStream({
    dbName,
    dbHost,
    pagination,
    filters,
  }: GetRegistryProgressReportDataStreamParams): AsyncGenerator<
    RegistryProgressReportResponse,
    void,
    unknown
  > {
    yield* streamPaginatedData({
      onFetchData: async (page, size) => {
        const { data } = await this.getRegistryProgressReportData({
          dbName,
          dbHost,
          pagination: { ...pagination, page, size },
          filters,
        });

        return data;
      },
    });
  }
}
