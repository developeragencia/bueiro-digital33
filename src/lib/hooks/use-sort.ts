import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

interface UseSortProps<T> {
  data: T[];
  defaultSortKey?: keyof T;
  defaultDirection?: SortDirection;
}

interface UseSortReturn<T> {
  sortedData: T[];
  sortKey: keyof T | null;
  sortDirection: SortDirection;
  setSortKey: (key: keyof T) => void;
  toggleSortDirection: () => void;
}

export function useSort<T>({
  data,
  defaultSortKey,
  defaultDirection = 'asc'
}: UseSortProps<T>): UseSortReturn<T> {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      const result = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? result : -result;
    });
  }, [data, sortKey, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return {
    sortedData,
    sortKey,
    sortDirection,
    setSortKey,
    toggleSortDirection
  };
}