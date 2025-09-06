'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  showFirstLast?: boolean;
  showGoToPage?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
  showFirstLast = true,
  showGoToPage = true
}: PaginationProps) {
  const [goToPageValue, setGoToPageValue] = useState('');

  const handleGoToPage = () => {
    const page = parseInt(goToPageValue);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToPageValue('');
    }
  };

  const handleGoToPageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis');
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="flex items-center space-x-2">
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {showPageNumbers && (
          <div className="flex items-center space-x-1">
            {visiblePages.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <div key={`ellipsis-${index}`} className="px-2">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {showGoToPage && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Go to:</span>
            <Input
              type="number"
              min="1"
              max={totalPages}
              value={goToPageValue}
              onChange={(e) => setGoToPageValue(e.target.value)}
              onKeyPress={handleGoToPageKeyPress}
              className="w-16 h-8 text-center"
              placeholder="Page"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToPage}
              disabled={!goToPageValue || parseInt(goToPageValue) < 1 || parseInt(goToPageValue) > totalPages}
              className="h-8 px-3"
            >
              Go
            </Button>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
}
