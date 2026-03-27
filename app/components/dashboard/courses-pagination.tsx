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
    <div className="flex items-center justify-center gap-4 px-8 pb-8 bg-primary">
      <Pagination
        page={currentPage}
        total={totalPages}
        showControls
        radius="md"
        classNames={{
          item: 'bg-tertiary text-bg hover:!bg-secondary hover:!text-black data-[hovered=true]:!bg-secondary data-[hovered=true]:!text-black data-[pressed=true]:!bg-secondary data-[pressed=true]:!text-black',
          cursor: 'bg-secondary text-tertiary font-semibold',
          prev: 'bg-tertiary text-bg hover:!bg-secondary hover:!text-black data-[hovered=true]:!bg-secondary data-[hovered=true]:!text-black data-[pressed=true]:!bg-secondary data-[pressed=true]:!text-black',
          next: 'bg-tertiary text-bg hover:!bg-secondary hover:!text-black data-[hovered=true]:!bg-secondary data-[hovered=true]:!text-black data-[pressed=true]:!bg-secondary data-[pressed=true]:!text-black',
        }}
        isDisabled={isLoading}
        onChange={onPageChange}
      />
    </div>
  );
}
