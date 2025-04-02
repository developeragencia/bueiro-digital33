import { useState, useCallback, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

interface SortOptions<T> {
  initialData: T[];
  initialSortField?: keyof T;
  initialDirection?: SortDirection;
}

export function useSorting<T>({
  initialData,
  initialSortField,
  initialDirection = 'asc',
}: SortOptions<T>) {
  const [sortField, setSortField] = useState<keyof T | undefined>(initialSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const toggleSort = useCallback(
    (field: keyof T) => {
      if (sortField === field) {
        setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  const sortedData = useMemo(() => {
    if (!sortField) return initialData;

    return [...initialData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [initialData, sortField, sortDirection]);

  const resetSort = useCallback(() => {
    setSortField(initialSortField);
    setSortDirection(initialDirection);
  }, [initialSortField, initialDirection]);

  return {
    sortedData,
    sortField,
    sortDirection,
    toggleSort,
    resetSort,
  };
} 