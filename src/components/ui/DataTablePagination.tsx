import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems?: number;
  totalRecords?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  apiEndpoint?: string;
  className?: string;
}

export function DataTablePagination({
  currentPage,
  pageSize,
  totalItems,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className = "",
}: DataTablePaginationProps) {
  const count = totalRecords ?? totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startRecord = count === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, count);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3.5 px-4 bg-slate-50/80 border-t border-slate-200/90 rounded-b-2xl text-xs text-slate-600 ${className}`}
    >
      {/* Left: Records Counter & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-slate-600">
          Showing <strong className="font-bold text-slate-900">{startRecord}</strong> to{" "}
          <strong className="font-bold text-slate-900">{endRecord}</strong> of{" "}
          <strong className="font-bold text-slate-900">{count}</strong> records
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-slate-500">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          title="First Page"
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          title="Previous Page"
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((pg, idx) =>
            typeof pg === "number" ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(pg)}
                className={`min-w-7 h-7 px-2 rounded-lg text-xs font-semibold transition ${
                  pg === safeCurrentPage
                    ? "bg-blue-600 text-white shadow-2xs font-bold"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pg}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400">
                ...
              </span>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === totalPages}
          title="Next Page"
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage === totalPages}
          title="Last Page"
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
