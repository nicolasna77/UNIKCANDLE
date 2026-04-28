"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Download, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationComponent } from "@/app/[locale]/(private)/Pagination";

interface DataTableAdvancedProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  onExport?: (data: TData[]) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
}

export function DataTableAdvanced<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Rechercher...",
  onExport,
  isLoading = false,
  emptyMessage = "Aucun résultat trouvé.",
  pagination: serverPagination,
  onPageChange,
}: DataTableAdvancedProps<TData, TValue>) {
  const isServerSidePagination = !!serverPagination && !!onPageChange;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  const columnsWithSelection: ColumnDef<TData, TValue>[] = React.useMemo(() => {
    const hasSelectionColumn = columns.some(
      (col) => typeof col.id === "string" && col.id === "select"
    );

    if (hasSelectionColumn) return columns;

    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Tout sélectionner"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner la ligne"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }, [columns]);

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: serverPagination?.limit ?? 10,
  });

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSidePagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: isServerSidePagination ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSidePagination
      ? undefined
      : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: isServerSidePagination,
    ...(isServerSidePagination && serverPagination
      ? { pageCount: serverPagination.pages }
      : {}),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: isServerSidePagination
        ? {
            pageIndex: (serverPagination?.page ?? 1) - 1,
            pageSize: serverPagination?.limit ?? 10,
          }
        : pagination,
    },
  });

  React.useEffect(() => {
    if (!isServerSidePagination) {
      setCurrentPage(pagination.pageIndex + 1);
    }
  }, [pagination.pageIndex, isServerSidePagination]);

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      if (isServerSidePagination && onPageChange) {
        onPageChange(newPage);
      } else {
        setPagination((prev) => ({ ...prev, pageIndex: newPage - 1 }));
        setCurrentPage(newPage);
      }
    },
    [isServerSidePagination, onPageChange]
  );

  const visibleColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  return (
    <div className="w-full space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {searchKey && (
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={
                  (table.getColumn(searchKey)?.getFilterValue() as string) ??
                  ""
                }
                onChange={(event) =>
                  table
                    .getColumn(searchKey)
                    ?.setFilterValue(event.target.value)
                }
                className="pl-8 h-9"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(data)}
              className="h-9"
            >
              <Download className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
          )}
          {visibleColumns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <SlidersHorizontal className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Colonnes</span>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Afficher/masquer
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-sm"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/40 hover:bg-muted/40"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-10"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columnsWithSelection.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnsWithSelection.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="text-3xl opacity-20">—</div>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {isServerSidePagination
            ? `${serverPagination?.total ?? 0} résultat${(serverPagination?.total ?? 0) !== 1 ? "s" : ""}`
            : `${table.getFilteredRowModel().rows.length} résultat${table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}`}
        </p>
        <PaginationComponent
          table={table}
          currentPage={
            isServerSidePagination
              ? (serverPagination?.page ?? 1)
              : currentPage
          }
          updatePageInURL={handlePageChange}
        />
      </div>
    </div>
  );
}
