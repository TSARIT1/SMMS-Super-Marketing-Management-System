import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(0, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(0)}
        className="btn-sm"
      >
        First
      </button>
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="btn-sm"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`btn-sm ${p === currentPage ? "bg-blue-600 text-white" : ""}`}
        >
          {p + 1}
        </button>
      ))}
      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn-sm"
      >
        Next
      </button>
      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(totalPages - 1)}
        className="btn-sm"
      >
        Last
      </button>
    </div>
  );
}
