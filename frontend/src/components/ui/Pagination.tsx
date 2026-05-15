import React from "react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, disabled = false }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="secondary"
        disabled={currentPage === 1 || disabled}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1"
      >
        Previous
      </Button>
      
      <div className="flex items-center space-x-1">
        {pages.map(page => (
          <button
            key={page}
            disabled={disabled}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors flex items-center justify-center
              ${currentPage === page 
                ? "bg-brand-primary text-white" 
                : "text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              }`}
          >
            {page}
          </button>
        ))}
      </div>

      <Button
        variant="secondary"
        disabled={currentPage === totalPages || disabled}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1"
      >
        Next
      </Button>
    </div>
  );
}
