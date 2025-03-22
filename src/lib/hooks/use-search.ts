import { useState, useCallback } from 'react';
import { useDebounce } from './use-debounce';

interface UseSearchProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  debounceMs?: number;
}

export function useSearch<T>({ data, searchFields, debounceMs = 300 }: UseSearchProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredData = data.filter(item => {
    if (!debouncedSearchTerm) return true;

    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(debouncedSearchTerm);
      }
      return false;
    });
  });

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    searchTerm,
    filteredData,
    handleSearch
  };
}