import { Pagination } from '@heroui/react';

type CoursesPaginationProps = {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

export default function CoursesPagination({
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
}: CoursesPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 px-8 pb-8">
      <Pagination
        page={currentPage}
        total={totalPages}
        showControls
        isDisabled={isLoading}
        onChange={onPageChange}
        color="warning"
      />
    </div>
  );
}
