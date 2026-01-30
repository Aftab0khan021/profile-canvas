import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    onPageChange: (page: number) => void;
    className?: string;
}

/**
 * Pagination component for navigating through pages
 */
export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    className = ''
}: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className={`flex items-center justify-between px-4 py-3 border-t ${className}`}>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                    {totalItems && ` (${totalItems} total)`}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
