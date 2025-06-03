import type { ReactNode } from 'react';
import Button from './Button';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface Column<T> {
  header: ReactNode;
  accessor: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export default function Table<T>({ 
  data, 
  columns, 
  isLoading,
  pageSize = 10,
  currentPage = 1,
  totalItems = 0,
  onPageChange
}: TableProps<T>) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const showPagination = totalItems > pageSize;

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  console.log(totalItems);
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <div className="flex justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                No items found
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                  >
                    {column.accessor(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showPagination && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {((currentPage - 1) * pageSize) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{totalItems}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex gap-1" aria-label="Pagination">
                <Button
                  size='lg'
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center justify-center w-10 h-10 border-none hover:bg-gray-50 rounded-lg disabled:cursor-default disabled:hover:bg-transparent disabled:opacity-30"
                >
                  <MdChevronLeft className="w-7 h-7" />
                </Button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  
                  // Always show first page, last page, current page, and pages around current page
                  const showPage = page === 1 || 
                                  page === totalPages || 
                                  Math.abs(currentPage - page) <= 1;

                  if (!showPage) {
                    // Show ellipsis if there's a gap
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center justify-center w-10 h-10 text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant='outline'
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg border-none disabled:cursor-default disabled:hover:bg-transparent
                        ${currentPage === page 
                          ? 'bg-gray-100 text-black' 
                          : 'bg-white border text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center justify-center w-10 h-10 border-none rounded-lg disabled:cursor-default disabled:hover:bg-transparent disabled:opacity-30"
                >
                  <MdChevronRight className="w-7 h-7" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 