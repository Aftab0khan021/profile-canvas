import { useState } from 'react';

export interface PaginationState {
    page: number;
    pageSize: number;
}

export interface PaginationResult extends PaginationState {
    getRange: () => { from: number; to: number };
    goToPage: (newPage: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    reset: () => void;
}

/**
 * Hook for managing pagination state
 * @param initialPageSize - Number of items per page (default: 10)
 * @returns Pagination state and controls
 */
export function usePagination(initialPageSize = 10): PaginationResult {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(initialPageSize);

    const getRange = () => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        return { from, to };
    };

    const goToPage = (newPage: number) => {
        if (newPage >= 1) {
            setPage(newPage);
        }
    };

    const nextPage = () => setPage(p => p + 1);
    const prevPage = () => setPage(p => Math.max(1, p - 1));
    const reset = () => setPage(1);

    return {
        page,
        pageSize,
        getRange,
        goToPage,
        nextPage,
        prevPage,
        reset,
    };
}
