import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
} from "material-react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronRight } from "react-icons/fi";

export interface TreeGridRow {
  id: string;
  subRows?: TreeGridRow[];
  [key: string]: any;
}

export interface TreeGridAction<T extends TreeGridRow> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  color?: string;
  hoverColor?: string;
  show?: (row: T) => boolean;
}

export interface TreeGridColumn {
  accessorKey: string;
  header: string;
  size?: number;
  Cell?: (props: { row: any; cell: any }) => React.ReactNode;
  enableSorting?: boolean;
}

interface TreeGridProps<T extends TreeGridRow> {
  data: T[];
  columns: TreeGridColumn[];
  actions?: TreeGridAction<T>[];
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  expandIconColumn?: string; // Which column should have the expand icon
  getRowId?: (row: T) => string;
  enableExpandAll?: boolean;
  maxHeight?: string;
  enableColumnResizing?: boolean;
  density?: "compact" | "comfortable" | "spacious";
  muiTableBodyCellProps?: MRT_TableOptions<T>["muiTableBodyCellProps"];
  muiTableBodyRowProps?: MRT_TableOptions<T>["muiTableBodyRowProps"];
  getRowCanExpand?: (row: T) => boolean;
  onRowExpandToggle?: (row: T, isExpanding: boolean) => void;
  enablePagination?: boolean;
  manualPagination?: boolean;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isRowLoading?: (row: T) => boolean;
}

export default function TreeGrid<T extends TreeGridRow>({
  data,
  columns: columnsProp,
  actions = [],
  isLoading = false,
  searchQuery = "",
  onSearchChange,
  expandIconColumn,
  getRowId = (row) => row.id,
  enableExpandAll = false,
  maxHeight = "510px",
  enableColumnResizing = true,
  density = "compact",
  muiTableBodyCellProps,
  muiTableBodyRowProps,
  getRowCanExpand,
  onRowExpandToggle,
  enablePagination = false,
  manualPagination = false,
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  isRowLoading,
}: TreeGridProps<T>) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  // Transform columns to include expand icon in specified column
  const columns = useMemo<MRT_ColumnDef<T>[]>(() => {
    return columnsProp.map((col) => {
      const isExpandColumn =
        expandIconColumn && col.accessorKey === expandIconColumn;

      return {
        accessorKey: col.accessorKey,
        header: col.header,
        size: col.size,
        enableSorting: col.enableSorting ?? true,
        Cell: isExpandColumn
          ? ({ row, cell }: any) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  paddingInlineStart: `${row.depth * 1.5}rem`,
                }}
              >
                {row.getCanExpand() ? (
                  (() => {
                    const rowLoading =
                      isRowLoading?.(row.original as T) ?? false;
                    return (
                      <IconButton
                        onClick={() => {
                          const isExpanding = !row.getIsExpanded();
                          onRowExpandToggle?.(row.original, isExpanding);
                          row.toggleExpanded();
                        }}
                        disabled={rowLoading}
                        sx={{
                          transform: rowLoading
                            ? "none"
                            : row.getIsExpanded()
                              ? isRTL
                                ? "scaleX(-1) rotate(90deg)"
                                : "rotate(90deg)"
                              : isRTL
                                ? "scaleX(-1) rotate(0deg)"
                                : "rotate(0deg)",
                          transition: "transform 0.2s",
                          p: 0.25,
                          width: 24,
                          height: 24,
                          color: "var(--text-secondary)",
                        }}
                        size='small'
                      >
                        {rowLoading ? (
                          <CircularProgress size={14} thickness={5} />
                        ) : (
                          <FiChevronRight size={16} />
                        )}
                      </IconButton>
                    );
                  })()
                ) : (
                  <Box sx={{ width: 24 }} />
                )}
                {col.Cell ? col.Cell({ row, cell }) : cell.getValue()}
              </Box>
            )
          : col.Cell
            ? ({ row, cell }: any) => col.Cell!({ row, cell })
            : undefined,
      };
    });
  }, [columnsProp, expandIconColumn, isRTL, isRowLoading, onRowExpandToggle]);

  const table = useMaterialReactTable({
    columns,
    data,
    getRowId,
    state: {
      isLoading,
      globalFilter: searchQuery,
      pagination: { pageIndex: currentPage - 1, pageSize },
    },
    onGlobalFilterChange: onSearchChange,
    onPaginationChange: (updaterOrValue) => {
      const previous = { pageIndex: currentPage - 1, pageSize };
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(previous)
          : updaterOrValue;

      if (next.pageSize !== pageSize) {
        onPageSizeChange?.(next.pageSize);
      }

      if (next.pageIndex !== currentPage - 1) {
        onPageChange?.(next.pageIndex + 1);
      }
    },
    enableExpandAll,
    enableExpanding: true,
    getRowCanExpand: getRowCanExpand
      ? (row) => getRowCanExpand(row.original as T)
      : undefined,
    getSubRows: (row: T): T[] | undefined => row.subRows as T[] | undefined,
    enableRowActions: actions.length > 0,
    positionActionsColumn: "last",
    renderRowActions:
      actions.length > 0
        ? ({ row }) => (
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              {actions.map((action, index) => {
                const shouldShow = action.show
                  ? action.show(row.original)
                  : true;
                if (!shouldShow) return null;

                return (
                  <Tooltip key={index} title={action.label}>
                    <IconButton
                      onClick={() => action.onClick(row.original)}
                      size='small'
                      sx={{
                        color: action.color || "rgb(59, 130, 246)",
                        "&:hover": {
                          backgroundColor:
                            action.hoverColor ||
                            `${action.color || "rgb(59, 130, 246)"}1A`,
                        },
                      }}
                    >
                      {action.icon}
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Box>
          )
        : undefined,
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "var(--bg-primary)",
        border: "none",
      },
    },
    muiTableContainerProps: {
      sx: {
        borderTop: "1px solid var(--border-color)",
        maxHeight,
        "&::-webkit-scrollbar": {
          height: "8px",
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "var(--border-color)",
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: "var(--text-muted)",
          },
        },
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "auto",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        backgroundColor: "var(--bg-primary)",
        borderBottom: "none",
        padding: "12px 16px",
        "& .MuiButtonBase-root": {
          color: "var(--text-muted)",
          "&:hover": {
            color: "var(--text-secondary)",
          },
        },
        "& .Mui-TableHeadCell-Content-Wrapper": {
          color: "var(--text-muted)",
        },
        "& .MuiTableSortLabel-icon": {
          color: "var(--text-muted) !important",
          opacity: 0.5,
        },
        "& .Mui-active .MuiTableSortLabel-icon": {
          color: "var(--text-secondary) !important",
          opacity: 1,
        },
        "& .MuiDivider-root": {
          borderColor: "var(--border-color)",
          "&:hover": {
            borderColor: "var(--text-secondary)",
          },
        },
      },
    },
    muiTableBodyCellProps:
      muiTableBodyCellProps ||
      (({ row }) => ({
        sx: {
          borderBottom: "1px solid var(--border-color)",
          backgroundColor:
            row.index % 2 === 0 ? "var(--bg-primary)" : "var(--bg-secondary)",
          color: "var(--text-secondary)",
          padding: "12px 16px",
        },
      })),
    muiTableBodyRowProps:
      muiTableBodyRowProps ||
      (({ row }) => ({
        sx: {
          backgroundColor:
            row.index % 2 === 0 ? "var(--bg-primary)" : "var(--bg-secondary)",
          "&:hover": {
            backgroundColor: "var(--accent-hover)",
          },
        },
      })),
    muiTopToolbarProps: {
      sx: {
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-secondary)",
        "& .MuiButtonBase-root": {
          color: "var(--text-secondary)",
        },
        "& .MuiInputBase-root": {
          color: "var(--text-secondary)",
        },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--accent-hover) !important",
        },
        "& .MuiList-root": {
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-secondary) !important",
        },
      },
    },
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-secondary)",
        borderTop: "1px solid var(--border-color)",
        "& .MuiInputLabel-root": {
          color: "var(--text-secondary)",
          fontSize: ".8rem",
        },
        "& .MuiTablePagination-root": {
          color: "var(--text-secondary)",
        },
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
          {
            color: "var(--text-muted)",
          },
        "& .MuiTablePagination-select": {
          color: "var(--text-secondary)",
        },
        "& .MuiSvgIcon-root": {
          color: "var(--text-secondary)",
        },
        "& .MuiIconButton-root": {
          color: "var(--text-secondary)",
          "&:hover": {
            backgroundColor: "var(--accent-hover)",
          },
        },
        "& .MuiIconButton-root.Mui-disabled": {
          color: "var(--text-muted)",
        },
      },
    },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 25, 50, 100],
      SelectProps: {
        sx: {
          color: "var(--text-secondary)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--border-color)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--text-muted)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--text-secondary)",
          },
        },
        MenuProps: {
          PaperProps: {
            sx: {
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-color)",
              "& .MuiMenuItem-root:hover": {
                backgroundColor: "var(--accent-hover)",
              },
            },
          },
        },
      },
    },
    muiColumnActionsButtonProps: {
      sx: {
        color: "var(--text-muted)",
        "&:hover": {
          color: "var(--text-secondary)",
          backgroundColor: "var(--accent-hover)",
        },
      },
    },
    muiFilterTextFieldProps: {
      sx: {
        "& .MuiInputBase-root": {
          color: "var(--text-secondary)",
          backgroundColor: "var(--bg-secondary)",
        },
        "& .MuiInputLabel-root": {
          color: "var(--text-muted)",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--border-color)",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--text-muted)",
        },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--text-secondary) !important",
        },
      },
    },
    enableColumnResizing,
    layoutMode: "grid",
    enablePagination,
    manualPagination: enablePagination ? manualPagination : undefined,
    rowCount: enablePagination && manualPagination ? totalItems : undefined,
    enableBottomToolbar: enablePagination,
    enableStickyHeader: true,
    displayColumnDefOptions: {
      "mrt-row-expand": {
        size: 0,
        enableResizing: false,
      },
      "mrt-row-actions":
        actions.length > 0
          ? {
              header: t("Actions"),
              size: 140,
              muiTableHeadCellProps: {
                sx: {
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  backgroundColor: "var(--bg-primary)",
                  border: "none",
                },
              },
            }
          : undefined,
    },
    initialState: {
      density,
      columnVisibility: { "mrt-row-expand": false },
      pagination: { pageIndex: currentPage - 1, pageSize },
    },
  });

  return <MaterialReactTable table={table} />;
}
