import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface SearchOptions<T> {
  initialData: T[];
  searchFields: (keyof T)[];
  debounceTime?: number;
}

export function useSearch<T>({
  initialData,
  searchFields,
  debounceTime = 300,
}: SearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceTime);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return initialData;

    return initialData.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value == null) return false;

        const stringValue = String(value).toLowerCase();
        const searchTerms = debouncedSearchTerm.toLowerCase().split(' ');

        return searchTerms.every(term => stringValue.includes(term));
      });
    });
  }, [initialData, searchFields, debouncedSearchTerm]);

  const resetSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    filteredData,
    handleSearch,
    resetSearch,
  };
} 