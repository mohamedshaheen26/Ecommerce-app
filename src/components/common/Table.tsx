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
  FormControl,
  Checkbox,
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
import Button from "./Button";
import Select from "./Select";
import toast from "react-hot-toast";
import Grid from "./Grid";
import DeleteModal from "./DeleteModal";
import { TableVirtuoso } from "react-virtuoso";

interface Column<T> {
  header: ReactNode;
  accessor: (item: T) => ReactNode;
  className?: string;
  width?: string;
  sortable?: boolean;
  sortKey?: keyof T;
}

interface BulkAction {
  value: string;
  label: string;
  variant?: "outline" | "contained" | "text";
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  size?: "small" | "medium";
  isLoading?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  // Bulk actions props
  showBulkActions?: boolean;
  showPageSize?: boolean;
  showPagenation?: boolean;
  showPage?: boolean;
  bulkActions?: BulkAction[];
  onBulkAction?: (action: string, selectedIds: (string | number)[]) => void;
  getRowId?: (item: T) => string | number;
  showSelectedCount?: boolean;
}

export default function Table<T extends Record<string, any>>({
  data,
  columns,
  size = "small",
  isLoading,
  pageSize = 10,
  currentPage = 1,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  showBulkActions = true,
  showPageSize = true,
  showPagenation = true,
  bulkActions = [],
  onBulkAction,
  getRowId = (item: T) => item.id,
}: TableProps<T>) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const [isSelectedModalOpen, setIsSelectedModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");

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

  const handleBulkActionChange = (value: string) => {
    setBulkAction(value);

    setSelectedRows(new Set());
  };

  const openSelectedModal = () => {
    if (!bulkAction || selectedRows.size === 0) {
      toast.error(t("Please select an action and select rows"));
      return;
    }
    setIsSelectedModalOpen(true);
  };

  const handleBulkApply = () => {
    if (onBulkAction) {
      onBulkAction(bulkAction, Array.from(selectedRows));
    }

    setSelectedRows(new Set());
    setBulkAction("");
    setIsSelectedModalOpen(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map(getRowId);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (item: T, checked: boolean) => {
    const itemId = getRowId(item);
    const newSelected = new Set(selectedRows);

    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }

    setSelectedRows(newSelected);
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isIndeterminate =
    selectedRows.size > 0 && selectedRows.size < data.length;

  const defaultBulkActions: BulkAction[] = [
    {
      value: "delete",
      label: t("Delete Selected"),
      variant: "outline",
      color: "error",
    },
    {
      value: "archive",
      label: t("Archive Selected"),
      variant: "outline",
      color: "warning",
    },
    {
      value: "export",
      label: t("Export Selected"),
      variant: "outline",
      color: "info",
    },
    {
      value: "print",
      label: t("Print Selected"),
      variant: "outline",
      color: "secondary",
    },
  ];

  const actionsToShow =
    bulkActions.length > 0 ? bulkActions : defaultBulkActions;

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        {(showBulkActions || showPageSize) && (
          <Grid>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                p: 1,
              }}
            >
              {showBulkActions && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Select
                    fullWidth={false}
                    value={bulkAction}
                    onChange={(e: any) =>
                      handleBulkActionChange(e.target.value)
                    }
                    options={[
                      { value: "", label: t("Bulk Actions") },
                      ...actionsToShow,
                    ]}
                  />
                  <Button variant='outline' onClick={openSelectedModal}>
                    {t("Apply")}
                  </Button>
                </Box>
              )}
              {showPageSize && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant='body2'
                    sx={{ color: "var(--text-muted)", fontSize: "0.75rem" }}
                  >
                    {t("Rows per page")}:
                  </Typography>
                  <FormControl size='small' sx={{ minWidth: 80 }}>
                    <Select
                      id='rows-per-page'
                      value={pageSize}
                      onChange={handleRowsPerPageChange}
                      options={[10, 50, 100, 500, 1000].map((pageSize) => ({
                        value: pageSize.toString(),
                        label: pageSize.toString(),
                      }))}
                    />
                  </FormControl>
                </Box>
              )}
            </Box>
          </Grid>
        )}

        <TableContainer
          sx={{
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <TableVirtuoso
            style={{
              height: 450,
              width: "100%",
            }}
            data={
              isLoading
                ? [{ isLoading: true } as unknown as T]
                : data.length === 0
                ? [{ isEmpty: true } as unknown as T]
                : sortedData
            }
            components={{
              Table: (props) => (
                <MuiTable
                  {...props}
                  size={size}
                  sx={{ tableLayout: "fixed", width: "100%" }}
                />
              ),
              TableHead: TableHead,
              TableRow: TableRow,
              TableBody: TableBody,
            }}
            fixedHeaderContent={() => (
              <TableRow
                sx={{
                  backgroundColor: "var(--bg-primary)",
                  boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                }}
              >
                {showBulkActions && bulkAction && (
                  <TableCell
                    sx={{
                      textAlign: "center",
                      width: "50px",
                      padding: "10px",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <Checkbox
                      sx={{
                        p: 0,
                        color: "var(--accent-primary)",
                        "&.Mui-checked": {
                          color: "var(--accent-primary)",
                        },
                        "&.MuiCheckbox-indeterminate": {
                          color: "var(--accent-primary)",
                        },
                      }}
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                )}

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
                      width: column.width || "auto",
                    }}
                    className={`${column.className}`}
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
            )}
            itemContent={(index, item) => {
              if (item.isLoading) {
                return (
                  <TableCell
                    colSpan={
                      showBulkActions && bulkAction
                        ? columns.length + 2
                        : columns.length + 1
                    }
                    sx={{
                      textAlign: "center",
                      py: 2,
                      backgroundColor: "var(--bg-primary)",
                    }}
                  >
                    <Loader />
                  </TableCell>
                );
              }

              if (item.isEmpty) {
                return (
                  <TableCell
                    colSpan={
                      showBulkActions && bulkAction
                        ? columns.length + 2
                        : columns.length + 1
                    }
                    sx={{
                      textAlign: "center",
                      py: 2,
                      color: "var(--text-secondary)",
                      backgroundColor: "var(--bg-primary)",
                    }}
                  >
                    {t("No items found")}
                  </TableCell>
                );
              }

              return (
                <>
                  {showBulkActions && bulkAction && (
                    <TableCell
                      sx={{
                        textAlign: "center",
                        padding: "10px",
                        borderBottom: "1px solid var(--border-color)",
                        backgroundColor:
                          index % 2 === 0
                            ? "var(--bg-primary)"
                            : "var(--bg-secondary)",
                      }}
                    >
                      <Checkbox
                        sx={{
                          p: 0,
                          color: "var(--accent-primary)",
                          "&.Mui-checked": {
                            color: "var(--accent-primary)",
                          },
                        }}
                        checked={selectedRows.has(getRowId(item))}
                        onChange={(e) =>
                          handleSelectRow(item, e.target.checked)
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      padding: "0",
                      textAlign: "center",
                      borderBottom: "1px solid var(--border-color)",
                      color: "var(--text-secondary)",
                      backgroundColor:
                        index % 2 === 0
                          ? "var(--bg-primary)"
                          : "var(--bg-secondary)",
                    }}
                  >
                    {startItem + index}
                  </TableCell>
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={colIndex}
                      sx={{
                        textAlign: currentLang === "ar" ? "right" : "left",
                        borderBottom: "1px solid var(--border-color)",
                        whiteSpace: "nowrap",
                        backgroundColor:
                          index % 2 === 0
                            ? "var(--bg-primary)"
                            : "var(--bg-secondary)",
                        width: column.width || "auto",
                      }}
                      className={`${column.className}`}
                    >
                      {column.accessor(item)}
                    </TableCell>
                  ))}
                </>
              );
            }}
          />
        </TableContainer>

        {showPagenation && (
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
                {currentLang === "ar" ? (
                  <MdLastPage size={25} />
                ) : (
                  <MdFirstPage size={25} />
                )}
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
              {totalPages <= 1 ? (
                <IconButton
                  size='small'
                  sx={{
                    fontSize: "0.875rem",
                    minWidth: 37,
                    height: 40,
                    borderRadius: "6px",
                    backgroundColor: "var(--accent-primary)",
                    color: "var(--text-primary)",
                    "&:hover": {
                      backgroundColor: "var(--accent-primary)",
                      color: "var(--text-primary)",
                    },
                  }}
                >
                  1
                </IconButton>
              ) : (
                [...Array(totalPages)].map((_, index) => {
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
                })
              )}

              <IconButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalItems <= 10}
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
                disabled={currentPage === totalPages || totalItems <= 10}
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
                  <MdFirstPage size={25} />
                ) : (
                  <MdLastPage size={25} />
                )}
              </IconButton>
            </Box>
          </Box>
        )}
      </Paper>

      <DeleteModal
        isOpen={isSelectedModalOpen}
        onClose={() => {
          setIsSelectedModalOpen(false);
        }}
        onConfirm={handleBulkApply}
        title='Bulk'
        itemType=''
        itemName={""}
      />
    </>
  );
}
