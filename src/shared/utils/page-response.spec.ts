import { describe, expect, it } from 'vitest';
import { pageResponse } from './page-response.js';

describe('pageResponse', () => {
  it('should return the data and the pagination metadata', () => {
    // GIVEN
    const data = [{ id: '1' }, { id: '2' }];

    // WHEN
    const result = pageResponse({ data, count: 2, size: 10 });

    // THEN
    expect(result).toEqual({
      data,
      pagination: { count: 2, pages: 1 },
    });
  });

  it('should compute the total pages rounding up the remainder', () => {
    // WHEN
    const result = pageResponse({ data: [], count: 25, size: 10 });

    // THEN
    expect(result.pagination.pages).toBe(3);
  });

  it('should return zero pages when there is no data', () => {
    // WHEN
    const result = pageResponse({ data: [], count: 0, size: 10 });

    // THEN
    expect(result.pagination.pages).toBe(0);
  });
});
