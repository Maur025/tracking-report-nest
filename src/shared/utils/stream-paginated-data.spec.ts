import { describe, expect, it, vi } from 'vitest';
import { streamPaginatedData } from './stream-paginated-data.js';

const consume = async <T>(generator: AsyncGenerator<T>): Promise<T[]> => {
  const values: T[] = [];
  for await (const value of generator) {
    values.push(value);
  }
  return values;
};

describe('streamPaginatedData', () => {
  it('should reject non positive integer page sizes', async () => {
    // GIVEN
    const onFetchData = vi.fn().mockResolvedValue([]);

    // WHEN / THEN
    for (const size of [0, -1, 1.5]) {
      await expect(
        consume(streamPaginatedData({ onFetchData, size })),
      ).rejects.toThrow(RangeError);
    }
  });

  it('should stop when the first page is empty', async () => {
    // GIVEN
    const onFetchData = vi.fn().mockResolvedValue([]);

    // WHEN
    const result = await consume(streamPaginatedData({ onFetchData }));

    // THEN
    expect(result).toEqual([]);
    expect(onFetchData).toHaveBeenCalledTimes(1);
  });

  it('should yield all items of a single page smaller than the page size', async () => {
    // GIVEN
    const page = [{ id: 1 }, { id: 2 }];
    const onFetchData = vi.fn().mockResolvedValue(page);

    // WHEN
    const result = await consume(streamPaginatedData({ onFetchData }));

    // THEN
    expect(result).toEqual(page);
    expect(onFetchData).toHaveBeenCalledTimes(1);
  });

  it('should keep fetching while pages are full', async () => {
    // GIVEN
    const fullPage = Array.from({ length: 3 }, (_, index) => ({ id: index }));
    const lastPage = [{ id: 99 }];
    const onFetchData = vi
      .fn()
      .mockResolvedValueOnce(fullPage)
      .mockResolvedValueOnce(lastPage);

    // WHEN
    const result = await consume(
      streamPaginatedData({ onFetchData, size: 3 }),
    );

    // THEN
    expect(result).toEqual([...fullPage, ...lastPage]);
    expect(onFetchData).toHaveBeenNthCalledWith(1, 0, 3);
    expect(onFetchData).toHaveBeenNthCalledWith(2, 1, 3);
  });

  it('should transform each value when onEachValue is provided', async () => {
    // GIVEN
    const onFetchData = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);

    // WHEN
    const result = await consume(
      streamPaginatedData({
        onFetchData,
        onEachValue: (item) => item.id * 10,
      }),
    );

    // THEN
    expect(result).toEqual([10, 20]);
  });

  it('should wrap fetch failures in a descriptive error', async () => {
    // GIVEN
    const onFetchData = vi.fn().mockRejectedValue(new Error('Connection refused'));

    // WHEN / THEN
    await expect(consume(streamPaginatedData({ onFetchData }))).rejects.toThrow(
      'Error occurred while fetching data from external API',
    );
  });
});
