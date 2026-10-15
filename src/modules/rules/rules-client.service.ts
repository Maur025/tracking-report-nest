import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpClient } from '@nestjs/http-client';
import { streamPaginatedData } from '../../shared/utils/stream-paginated-data.js';
import { transformSafeString } from '../../shared/utils/transform-safe-string.js';
import { RulesClientResponse } from './interfaces/rules-client-response.interface.js';
import {
  GetRulesReportDataParams,
  GetRulesReportDataResponse,
  GetRulesReportDataStreamParams,
} from './interfaces/rules-client-service.interface.js';
import { RulesReportResponse } from './interfaces/rules-report-response.interface.js';
import { rulesReportResponseMapper } from './mapper/rules-report-response.mapper.js';

@Injectable()
export class RulesClientService {
  private readonly logger = new Logger('RulesClientService');

  constructor(private readonly httpClient: HttpClient) {}

  async getRulesReportData({
    dbName,
    dbHost,
    pagination = {},
    filters = {},
  }: GetRulesReportDataParams): Promise<GetRulesReportDataResponse> {
    const transformFilters = this.transformFilters(filters);

    const paginationQuery = {
      page: 0,
      size: 10,
      descending: true,
      sortBy: 'name',
      ...pagination,
    };

    try {
      const { data } = await this.httpClient.get<RulesClientResponse>(
        `${dbHost}/${dbName}/rules`,
        {
          query: {
            ...transformFilters,
            ...paginationQuery,
            descending: String(paginationQuery.descending),
          },
        },
      );

      return {
        data: rulesReportResponseMapper(data.content),
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
          break;
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
  }: GetRulesReportDataStreamParams): AsyncGenerator<
    RulesReportResponse,
    void,
    unknown
  > {
    yield* streamPaginatedData({
      onFetchData: async (page, size) => {
        const progressData = await this.getRulesReportData({
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
