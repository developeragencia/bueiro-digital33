import { useState, useCallback } from 'react';

type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export function useSort<T extends Record<string, any>>(initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const sortData = useCallback((items: T[], key: keyof T, direction: SortDirection): T[] => {
    return [...items].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const result = aValue < bValue ? -1 : 1;
      return direction === 'asc' ? result : -result;
    });
  }, []);

  const requestSort = useCallback((key: keyof T) => {
    let direction: SortDirection = 'asc';

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    setData(prev => sortData(prev, key, direction));
  }, [sortConfig, sortData]);

  const updateData = useCallback((newData: T[]) => {
    setData(sortConfig ? sortData(newData, sortConfig.key, sortConfig.direction) : newData);
  }, [sortConfig, sortData]);

  return {
    data,
    sortConfig,
    requestSort,
    updateData
  };
}