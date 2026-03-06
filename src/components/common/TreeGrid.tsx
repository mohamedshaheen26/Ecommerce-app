import { Box, IconButton, Tooltip } from "@mui/material";
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
                  <IconButton
                    onClick={row.getToggleExpandedHandler()}
                    sx={{
                      transform: row.getIsExpanded()
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
                    <FiChevronRight size={16} />
                  </IconButton>
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
  }, [columnsProp, expandIconColumn, isRTL]);

  const table = useMaterialReactTable({
    columns,
    data,
    getRowId,
    state: {
      isLoading,
      globalFilter: searchQuery,
    },
    onGlobalFilterChange: onSearchChange,
    enableExpandAll,
    enableExpanding: true,
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
    // Styling to match Table.tsx
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
    enablePagination: false,
    enableBottomToolbar: false,
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
    },
  });

  return <MaterialReactTable table={table} />;
}
