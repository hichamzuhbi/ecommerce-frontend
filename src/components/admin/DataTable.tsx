import type { ReactNode } from 'react';
import { Button } from '../ui/Button';

interface DataTableProps<T> {
  columns: Array<{ key: string; header: string; render: (row: T) => ReactNode }>;
  data: T[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  rowKey: (row: T) => string;
}

export const DataTable = <T,>({
  columns,
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  rowKey,
}: DataTableProps<T>) => {
  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-gray-100">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((row) => (
                  <tr key={rowKey(row)} className="border-b border-gray-100">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm font-medium text-gray-700">
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 p-4">
        <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <span className="text-sm font-semibold text-gray-700">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
