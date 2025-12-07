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

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canPreviousPage?: boolean;
  canNextPage?: boolean;
  className?: string;
}

export function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
  canPreviousPage = currentPage > 1,
  canNextPage = currentPage < totalPages,
  className = "",
}: PaginationComponentProps) {
  const generatePageNumbers = () => {
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
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                onPageChange(newPage);
              }}
              className={
                !canPreviousPage
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
                  onClick={() => onPageChange(page)}
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
                const newPage = Math.min(totalPages, currentPage + 1);
                onPageChange(newPage);
              }}
              className={
                !canNextPage
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
