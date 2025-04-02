import { useState, useCallback, useMemo } from 'react';

interface PaginationOptions<T> {
  initialData: T[];
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function usePagination<T>({
  initialData,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationOptions<T>) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = initialData.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Ajusta a página atual se necessário
  if (currentPage > totalPages) {
    setCurrentPage(totalPages || 1);
  }

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    return initialData.slice(startIndex, endIndex);
  }, [initialData, currentPage, pageSize, totalItems]);

  const paginationInfo = useMemo((): PaginationInfo => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      startIndex: startIndex + 1,
      endIndex,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  }, [currentPage, pageSize, totalItems, totalPages]);

  const goToPage = useCallback(
    (page: number) => {
      const targetPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(targetPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const changePageSize = useCallback(
    (newPageSize: number) => {
      const newTotalPages = Math.ceil(totalItems / newPageSize);
      const newCurrentPage = Math.min(currentPage, newTotalPages);
      setPageSize(newPageSize);
      setCurrentPage(newCurrentPage);
    },
    [currentPage, totalItems]
  );

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    paginatedData,
    paginationInfo,
    pageSizeOptions,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    resetPagination,
  };
} 