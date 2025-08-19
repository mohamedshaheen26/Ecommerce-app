import type { ReactNode } from "react";
import Button from "./Button";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

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
  onPageChange,
}: TableProps<T>) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const showPagination = totalItems > pageSize;
  const { t } = useTranslation();
  const { currentLang } = useLanguage();

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-[var(--border-color)]'>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope='col'
                  className={`px-6 py-3 ${
                    currentLang == "ar" ? "text-right" : "text-left"
                  } text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider ${
                    column.className || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-[var(--bg-primary)] divide-y divide-[var(--border-color)]'>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className='px-6 py-4 text-center'>
                  <Loader />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-6 py-4 text-center text-sm text-gray-500'
                >
                  No items found
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap ${
                        column.className || ""
                      }`}
                    >
                      {column.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className='px-6 py-3 flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-primary)]'>
          <div className='flex flex-1 flex-col sm:flex-row items-center sm:justify-between'>
            <div className='mb-2'>
              <p className='text-sm text-[var(--text-muted)]'>
                {t("Showing")}{" "}
                <span className='font-medium'>
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                {t("to")}{" "}
                <span className='font-medium'>
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                {t("of")} <span className='font-medium'>{totalItems}</span>{" "}
                {t("results")}
              </p>
            </div>
            <div>
              <nav
                className='relative z-0 inline-flex gap-1'
                aria-label='Pagination'
              >
                <Button
                  variant='outline'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='w-10 h-10 border-none disabled:bg-transparent'
                >
                  {currentLang === "ar" ? (
                    <MdChevronRight className='w-7 h-7' />
                  ) : (
                    <MdChevronLeft className='w-7 h-7' />
                  )}
                </Button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;

                  // Always show first page, last page, current page, and pages around current page
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(currentPage - page) <= 1;

                  if (!showPage) {
                    // Show ellipsis if there's a gap
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span
                          key={page}
                          className='relative inline-flex items-center justify-center w-10 h-10 text-[var(--text-muted)] bg-[var(--bg-primary)]'
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
                      className={`border-none
                        ${
                          currentPage === page
                            ? "bg-[var(--accent-primary)] !text-[var(--text-primary)]"
                            : ""
                        }`}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant='outline'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className=' w-10 h-10 border-none disabled:bg-transparent'
                >
                  {currentLang === "ar" ? (
                    <MdChevronLeft className='w-7 h-7' />
                  ) : (
                    <MdChevronRight className='w-7 h-7' />
                  )}
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
