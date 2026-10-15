import { Logger } from '@nestjs/common';

interface StreamPaginatedDataParams<I, O = I> {
  onFetchData: (page: number, size: number) => Promise<I[]>;
  onEachValue?: (value: I) => O;
  size?: number;
}

const logger = new Logger('getStreamHttpData');

export function streamPaginatedData<I>(
  params: StreamPaginatedDataParams<I, I>,
): AsyncGenerator<I, void, unknown>;

export function streamPaginatedData<I, O>(
  params: StreamPaginatedDataParams<I, O>,
): AsyncGenerator<O, void, unknown>;

export async function* streamPaginatedData<I, O = I>({
  onFetchData,
  onEachValue,
  size = 100,
}: StreamPaginatedDataParams<I, O>): AsyncGenerator<I | O, void, unknown> {
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError(
      `Page size must be a positive integer. Received: ${size}`,
    );
  }

  let page: number = 0;
  let hasMoreData: boolean = true;

  while (hasMoreData) {
    try {
      const responses = await onFetchData(page, size);

      if (responses?.length <= 0) {
        hasMoreData = false;
        break;
      }

      for (const item of responses) {
        yield onEachValue ? onEachValue(item) : item;
      }

      if (responses.length < size) {
        hasMoreData = false;
        break;
      }

      page++;
    } catch (error) {
      logger.error(
        'Error occurred while fetching data from external API',
        error,
      );
      throw new Error('Error occurred while fetching data from external API', {
        cause: error,
      });
    }
  }
}
