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
import { ChevronDown, Download, RefreshCw } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataTableAdvancedProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  onExport?: (data: TData[]) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTableAdvanced<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Rechercher...",
  onRefresh,
  onExport,
  isLoading = false,
  emptyMessage = "Aucun résultat trouvé.",
}: DataTableAdvancedProps<TData, TValue>) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Récupérer la page depuis l'URL, par défaut 1
  const currentPage = React.useMemo(() => {
    const page = searchParams.get("page");
    return page ? Math.max(1, parseInt(page, 10)) : 1;
  }, [searchParams]);

  // Fonction pour mettre à jour l'URL avec la nouvelle page
  const updatePageInURL = React.useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      if (newPage === 1) {
        params.delete("page");
      } else {
        params.set("page", newPage.toString());
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Ajouter une colonne de sélection si elle n'existe pas déjà
  const columnsWithSelection: ColumnDef<TData, TValue>[] = React.useMemo(() => {
    const hasSelectionColumn = columns.some(
      (col) => typeof col.id === "string" && col.id === "select"
    );

    if (hasSelectionColumn) {
      return columns;
    }

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

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: 10,
      },
    },
  });

  // Synchroniser la page avec l'URL
  React.useEffect(() => {
    const tablePageIndex = table.getState().pagination.pageIndex;
    const urlPageIndex = currentPage - 1;
    if (tablePageIndex !== urlPageIndex) {
      table.setPageIndex(urlPageIndex);
    }
  }, [currentPage, table]);

  // Fonction pour générer les numéros de page
  const generatePageNumbers = () => {
    const totalPages = table.getPageCount();
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Afficher toutes les pages si <= 7
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique de pagination complexe
      pages.push(1);

      if (currentPage > 4) {
        pages.push("ellipsis");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        if (pages[pages.length - 1] !== totalPages - 1) {
          pages.push("ellipsis");
        }
      }

      if (!pages.includes(totalPages) && totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="w-full space-y-4">
      {/* Barre d'outils */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport(data)}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Colonnes <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className=" ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  Chargement...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 py-4">
        <div className="flex items-center space-x-6 lg:space-x-8">
          {/* Navigation pagination */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    updatePageInURL(newPage);
                  }}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {generatePageNumbers().map((page, index) => {
                if (page === "ellipsis") {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                const isActive = page === currentPage;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => updatePageInURL(page)}
                      isActive={isActive}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    const newPage = Math.min(
                      table.getPageCount(),
                      currentPage + 1
                    );
                    updatePageInURL(newPage);
                  }}
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
