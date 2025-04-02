import { useState, useCallback, useMemo } from 'react';

type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';

interface FilterCondition<T> {
  field: keyof T;
  operator: FilterOperator;
  value: any;
}

interface FilterOptions<T> {
  initialData: T[];
  initialFilters?: FilterCondition<T>[];
}

export function useFilter<T>({ initialData, initialFilters = [] }: FilterOptions<T>) {
  const [filters, setFilters] = useState<FilterCondition<T>[]>(initialFilters);

  const addFilter = useCallback((filter: FilterCondition<T>) => {
    setFilters(prev => [...prev, filter]);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateFilter = useCallback((index: number, filter: FilterCondition<T>) => {
    setFilters(prev => prev.map((f, i) => (i === index ? filter : f)));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const applyFilter = useCallback(
    (item: T, filter: FilterCondition<T>): boolean => {
      const value = item[filter.field];
      const filterValue = filter.value;

      if (value == null) return false;

      switch (filter.operator) {
        case 'equals':
          return value === filterValue;

        case 'contains':
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());

        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());

        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());

        case 'gt':
          return Number(value) > Number(filterValue);

        case 'lt':
          return Number(value) < Number(filterValue);

        case 'gte':
          return Number(value) >= Number(filterValue);

        case 'lte':
          return Number(value) <= Number(filterValue);

        default:
          return true;
      }
    },
    []
  );

  const filteredData = useMemo(() => {
    return initialData.filter(item =>
      filters.every(filter => applyFilter(item, filter))
    );
  }, [initialData, filters, applyFilter]);

  return {
    filters,
    filteredData,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
  };
} 