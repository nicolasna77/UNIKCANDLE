"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

export function PaginationComponent({
  table,
  currentPage,
  updatePageInURL,
}: PaginationComponentProps) {
  const generatePageNumbers = () => {
    const totalPages = table.getPageCount();
    const current = currentPage;
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Si moins de 7 pages, afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour les ellipsis
      if (current <= 4) {
        // Pages 1-5 + ellipsis + dernière page
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
        // Première page + ellipsis + pages (totalPages-4) à totalPages
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Première page + ellipsis + pages autour de current + ellipsis + dernière page
        pages.push(1);
        pages.push("ellipsis");
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
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
  );
}
