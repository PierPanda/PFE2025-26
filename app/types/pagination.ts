export type PaginatedResponse<T> = {
  items: T[];
  hasMore: boolean;
  total: number;
};
