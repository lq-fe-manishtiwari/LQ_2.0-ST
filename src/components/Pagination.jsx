import React from 'react';

/**
 * Reusable Pagination Component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (0-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalElements - Total number of elements
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {boolean} props.isFirst - Is first page
 * @param {boolean} props.isLast - Is last page
 */
export default function Pagination({
    currentPage,
    totalPages,
    totalElements,
    onPageChange,
    isFirst,
    isLast
}) {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (!isFirst) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (!isLast) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (pageNum) => {
        onPageChange(pageNum);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is less than max
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first page, last page, current page and surrounding pages
            if (currentPage <= 2) {
                // Near the beginning
                for (let i = 0; i < 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages - 1);
            } else if (currentPage >= totalPages - 3) {
                // Near the end
                pages.push(0);
                pages.push('...');
                for (let i = totalPages - 4; i < totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // In the middle
                pages.push(0);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages - 1);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
            {/* Info */}
            <div className="text-sm text-gray-600">
                Showing page <span className="font-semibold">{currentPage + 1}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
                {totalElements > 0 && (
                    <span className="ml-1">
                        ({totalElements} total item{totalElements !== 1 ? 's' : ''})
                    </span>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    onClick={handlePrevious}
                    disabled={isFirst}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isFirst
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    aria-label="Previous page"
                >
                    <i className="bi bi-chevron-left"></i>
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {pageNumbers.map((pageNum, index) => {
                        if (pageNum === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageClick(pageNum)}
                                className={`min-w-[36px] px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {pageNum + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Mobile: Current Page Display */}
                <div className="sm:hidden px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium">
                    {currentPage + 1} / {totalPages}
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={isLast}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isLast
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    aria-label="Next page"
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>
        </div>
    );
}
