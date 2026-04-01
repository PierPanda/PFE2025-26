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
    <div className="flex items-center justify-center gap-4 px-8 pb-8 bg-tertiary">
      <Pagination
        page={currentPage}
        total={totalPages}
        showControls
        radius="md"
        classNames={{
          item: 'bg-secondary text-bg hover:!bg-primary hover:!text-dark data-[hovered=true]:!bg-primary data-[hovered=true]:!text-dark data-[pressed=true]:!bg-primary data-[pressed=true]:!text-dark',
          cursor: 'bg-primary text-tertiary font-semibold',
          prev: 'bg-dark text-tertiary hover:!bg-dark/60 hover:!text-dark data-[hovered=true]:!bg-dark/60 data-[hovered=true]:!text-dark data-[pressed=true]:!bg-dark/60 data-[pressed=true]:!text-dark',
          next: 'bg-dark text-tertiary hover:!bg-dark/60 hover:!text-dark data-[hovered=true]:!bg-dark/60 data-[hovered=true]:!text-dark data-[pressed=true]:!bg-dark/60data-[pressed=true]:!text-dark',
        }}
        isDisabled={isLoading}
        onChange={onPageChange}
      />
    </div>
  );
}
