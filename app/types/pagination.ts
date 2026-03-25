// app/types/pagination.ts
export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  total: number;
};
