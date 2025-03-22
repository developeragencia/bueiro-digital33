import { useState, useCallback } from 'react';

interface UseFilterProps<T> {
  data: T[];
  filterField: keyof T;
}

export function useFilter<T>({ data, filterField }: UseFilterProps<T>) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredData = activeFilter
    ? data.filter(item => item[filterField] === activeFilter)
    : data;

  const handleFilter = useCallback((filter: string | null) => {
    setActiveFilter(filter);
  }, []);

  const uniqueFilters = Array.from(new Set(data.map(item => item[filterField])));

  return {
    activeFilter,
    filteredData,
    handleFilter,
    uniqueFilters
  };
}