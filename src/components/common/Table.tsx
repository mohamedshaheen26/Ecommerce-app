import type { ReactNode } from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
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

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <TableContainer>
        <MuiTable size='small'>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    textAlign: currentLang === "ar" ? "right" : "left",
                    borderBottom: "1px solid var(--border-color)",
                    ...(column.className && {
                      className: column.className,
                    }),
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{
                    textAlign: "center",
                    py: 4,
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  <Loader />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  {t("No items found")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  sx={{
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      sx={{
                        borderBottom: "1px solid var(--border-color)",
                        whiteSpace: "nowrap",
                        backgroundColor: "inherit",
                        ...(column.className && {
                          className: column.className,
                        }),
                      }}
                    >
                      {column.accessor(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {showPagination && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            backgroundColor: "var(--bg-primary)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant='body2' sx={{ color: "var(--text-muted)" }}>
              {t("Showing")} <span className='font-medium'>{startItem}</span>{" "}
              {t("to")} <span className='font-medium'>{endItem}</span> {t("of")}{" "}
              <span className='font-medium'>{totalItems}</span> {t("results")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              size='small'
              sx={{
                height: 40,
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                backgroundColor: "var(--bg-primary)",
                borderRadius: "6px",
                "&:disabled": {
                  "&:disabled": {
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                  },
                },
                "&:hover": {
                  backgroundColor: "var(--accent-hover)",
                  color: "var(--text-primary)",
                },
              }}
            >
              {currentLang === "ar" ? (
                <MdChevronRight size={25} />
              ) : (
                <MdChevronLeft size={25} />
              )}
            </IconButton>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const showPage =
                page === 1 ||
                page === totalPages ||
                Math.abs(currentPage - page) <= 1;

              if (!showPage) {
                if (page === 2 || page === totalPages - 1) {
                  return (
                    <Typography
                      key={page}
                      variant='body2'
                      sx={{
                        px: 1,
                        color: "var(--text-muted)",
                      }}
                    >
                      ...
                    </Typography>
                  );
                }
                return null;
              }

              return (
                <IconButton
                  key={page}
                  onClick={() => handlePageChange(page)}
                  size='small'
                  sx={{
                    fontSize: "0.875rem",
                    minWidth: 37,
                    height: 40,
                    borderRadius: "6px",
                    backgroundColor:
                      currentPage === page
                        ? "var(--accent-primary)"
                        : "var(--bg-primary)",
                    color:
                      currentPage === page
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    "&:hover": {
                      backgroundColor:
                        currentPage === page
                          ? "var(--accent-primary)"
                          : "var(--accent-hover)",
                      color:
                        currentPage === page
                          ? "var(--text-primary)"
                          : "var(--text-primary)",
                    },
                  }}
                >
                  {page}
                </IconButton>
              );
            })}

            <IconButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              size='small'
              sx={{
                height: 40,
                color: "var(--text-secondary)",
                backgroundColor: "var(--bg-primary)",
                borderRadius: "6px",
                "&:disabled": {
                  backgroundColor: "transparent",
                  color: "var(--text-muted)",
                },
                "&:hover": {
                  backgroundColor: "var(--accent-hover)",
                  color: "var(--text-primary)",
                },
              }}
            >
              {currentLang === "ar" ? (
                <MdChevronLeft size={25} />
              ) : (
                <MdChevronRight size={25} />
              )}
            </IconButton>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
