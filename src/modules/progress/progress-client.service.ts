import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpClient } from '@nestjs/http-client';
import { streamPaginatedData } from '../../shared/utils/stream-paginated-data.js';
import { transformSafeString } from '../../shared/utils/transform-safe-string.js';
import { ProgressClientResponse } from './interfaces/progress-client-response.interface.js';
import {
  GetProgressReportDataParams,
  GetProgressReportDataResponse,
  GetProgressReportDataStreamParams,
} from './interfaces/progress-client-service.interface.js';
import { ProgressReportResponse } from './interfaces/progress-report-response.interface.js';
import { progressReportResponseMapper } from './mapper/progress-report-response.mapper.js';

@Injectable()
export class ProgressClientService {
  private readonly logger = new Logger('ProgressClientService');

  constructor(private readonly httpClient: HttpClient) {}

  async getProgressReportData({
    dbName,
    dbHost,
    pagination = {},
    filters = {},
  }: GetProgressReportDataParams): Promise<GetProgressReportDataResponse> {
    const transformFilters = this.transformFilters(filters);

    const paginationQuery = {
      page: 0,
      size: 10,
      descending: true,
      sortBy: 'name',
      ...pagination,
    };

    try {
      const { data } = await this.httpClient.get<ProgressClientResponse>(
        `${dbHost}/${dbName}/progress`,
        {
          query: {
            ...transformFilters,
            ...paginationQuery,
            descending: String(paginationQuery.descending),
          },
        },
      );

      return {
        data: progressReportResponseMapper(data.content),
        pagination: data.pagination,
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch progress report data from external API',
        error,
      );
      throw new BadGatewayException(
        'Failed to fetch progress report data from external API',
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
        case ' fromDate': {
          transformedFilters['[date_from][between][from]'] = stringValue;
          break;
        }
        case 'toDate': {
          transformedFilters['[date_from][between][to]'] = stringValue;
          break;
        }
        case 'keyword': {
          transformedFilters['[name][like]'] = stringValue;
          break;
        }
        case 'frequencyWeekday': {
          transformedFilters['[frequency][frequency][equal]'] = stringValue;
          break;
        }
        default: {
          transformedFilters[key] = stringValue;
        }
      }
    }

    return transformedFilters;
  }

  async *getProgressReportDataStream({
    dbName,
    dbHost,
    pagination,
    filters,
  }: GetProgressReportDataStreamParams): AsyncGenerator<
    ProgressReportResponse,
    void,
    unknown
  > {
    yield* streamPaginatedData({
      onFetchData: async (page, size) => {
        console.log({ page, size });

        const progressData = await this.getProgressReportData({
          dbName,
          dbHost,
          pagination: { ...pagination, page, size },
          filters,
        });

        return progressData.data;
      },
    });
  }
}
