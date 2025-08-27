import { useState, type ReactNode } from "react";
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
  TableSortLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
} from "react-icons/md";
import Loader from "./Loader";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

interface Column<T> {
  header: ReactNode;
  accessor: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  sortKey?: keyof T;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export default function Table<T>({
  data,
  columns,
  isLoading,
  pageSize = 10,
  currentPage = 1,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}: TableProps<T>) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const showPagination = totalItems > 0;
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    const isAsc = orderBy === key && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(key);
  };

  function getNestedValue(obj: any, path: string) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  }

  const sortedData = [...data].sort((a, b) => {
    if (!orderBy) return 0;

    const aValue = getNestedValue(a, orderBy);
    const bValue = getNestedValue(b, orderBy);

    if (typeof aValue === "string" && typeof bValue === "string") {
      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleRowsPerPageChange = (event: any) => {
    const newRowsPerPage = event.target.value;
    if (onPageChange) {
      onPageChange(1);
    }
    if (onPageSizeChange) {
      onPageSizeChange(newRowsPerPage);
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
        <MuiTable
          size='small'
          sx={{
            border: "1px solid var(--border-color)",
            borderCollapse: "collapse",
            "& td, & th": {
              border: "1px solid var(--border-color)",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  padding: "0",
                  width: "30px",
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                #
              </TableCell>
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
                  {column.sortable && column.sortKey ? (
                    <TableSortLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color:
                          orderBy === column.sortKey
                            ? "var(--accent-primary) !important"
                            : "var(--text-muted) !important",
                        "& .MuiTableSortLabel-icon": {
                          color:
                            orderBy === column.sortKey
                              ? "var(--accent-primary) !important"
                              : "var(--text-muted) !important",
                        },
                      }}
                      active={orderBy === column.sortKey}
                      direction={orderBy === column.sortKey ? order : "asc"}
                      onClick={() => handleSort(column.sortKey as string)}
                    >
                      {column.header}
                    </TableSortLabel>
                  ) : (
                    column.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              "& tr:nth-of-type(odd)": {
                backgroundColor: "var(--bg-secondary)",
              },
              "& tr:nth-of-type(even)": {
                backgroundColor: "var(--bg-primary)",
              },
            }}
          >
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{
                    textAlign: "center",
                    py: 2,
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
                    py: 2,
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  {t("No items found")}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  sx={{
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  <TableCell
                    sx={{
                      padding: "0",
                      textAlign: "center",
                      borderBottom: "1px solid var(--border-color)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {startItem + rowIndex}
                  </TableCell>
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      sx={{
                        textAlign: currentLang === "ar" ? "right" : "left",
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
            py: 1,
            backgroundColor: "var(--bg-primary)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant='body2' sx={{ color: "var(--text-muted)" }}>
              <span className='font-medium'>{startItem} -</span>
              <span className='font-medium'> {endItem}</span> {t("of")}
              <span className='font-medium'> {totalItems}</span>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant='body2'
              sx={{ color: "var(--text-muted)", fontSize: "0.75rem" }}
            >
              {t("Rows per page")}:
            </Typography>
            <FormControl size='small' sx={{ minWidth: 80 }}>
              <Select
                value={pageSize}
                onChange={handleRowsPerPageChange}
                sx={{
                  fontSize: "0.75rem",
                  height: 32,
                  "& .MuiSelect-select": {
                    py: 0.5,
                    px: 1,
                  },
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  "&:hover": {
                    borderColor: "var(--accent-primary)",
                  },
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={() => handlePageChange(1)}
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
              <MdFirstPage size={25} />
            </IconButton>

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

            <IconButton
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
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
              <MdLastPage size={25} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
