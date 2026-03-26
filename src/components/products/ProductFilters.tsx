import { Button } from '../ui/Button';

interface ProductFiltersProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ProductFilters = ({
  page,
  totalPages,
  onPageChange,
}: ProductFiltersProps) => {
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <Button
        variant="secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </Button>
      <span className="text-sm font-semibold text-gray-700">
        Page {page} of {Math.max(totalPages, 1)}
      </span>
      <Button
        variant="secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};
