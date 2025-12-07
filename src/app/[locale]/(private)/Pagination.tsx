"use client";

import { PaginationComponent as BasePaginationComponent } from "@/components/pagination-component";

interface PaginationTable {
  getPageCount: () => number;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
}

interface PaginationComponentProps {
  table: PaginationTable;
  currentPage: number;
  updatePageInURL: (page: number) => void;
}

/**
 * Wrapper autour du composant de pagination partagé
 * Adapté pour fonctionner avec TanStack Table
 */
export function PaginationComponent({
  table,
  currentPage,
  updatePageInURL,
}: PaginationComponentProps) {
  return (
    <BasePaginationComponent
      currentPage={currentPage}
      totalPages={table.getPageCount()}
      onPageChange={updatePageInURL}
      canPreviousPage={table.getCanPreviousPage()}
      canNextPage={table.getCanNextPage()}
      className="space-x-2"
    />
  );
}
