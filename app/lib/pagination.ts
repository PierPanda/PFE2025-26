export function parsePageParam(param: string | null): number {
  const raw = parseInt(param ?? '1', 10);
  return isNaN(raw) ? 1 : Math.max(1, raw);
}

export function computeOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

export function computeRange(currentPage: number, total: number, pageSize: number) {
  return {
    rangeStart: total === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, total),
    rangeEnd: Math.min(currentPage * pageSize, total),
    totalPages: Math.ceil(total / pageSize),
  };
}
