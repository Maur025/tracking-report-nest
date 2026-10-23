import { PageResponse } from '../interfaces/page-response.js';

interface PageResponseParams<T> {
  data: T;
  count: number;
  size: number;
}

export const pageResponse = <T>({
  data,
  count,
  size,
}: PageResponseParams<T>): PageResponse<T> => {
  return {
    data,
    pagination: {
      count,
      pages: Math.ceil(count / size),
    },
  };
};
