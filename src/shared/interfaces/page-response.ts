export interface PaginationResponse {
  count?: number;
  pages?: number;
}

export interface PageResponse<T> {
  data: T;
  pagination: PaginationResponse;
}
