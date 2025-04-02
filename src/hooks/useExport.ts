import { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface ExportOptions<T> {
  data: T[];
  filename: string;
  headers?: Partial<Record<keyof T, string>>;
  dateFields?: (keyof T)[];
}

export function useExport<T extends Record<string, any>>() {
  const [isExporting, setIsExporting] = useState(false);

  const formatValue = (value: any, isDate: boolean): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (isDate) {
      return new Date(value).toLocaleDateString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const exportToCSV = async ({ data, filename, headers = {}, dateFields = [] }: ExportOptions<T>) => {
    try {
      setIsExporting(true);

      const rows = data.map(item => {
        const row: Record<string, string> = {};
        
        Object.keys(item).forEach(key => {
          const header = headers[key as keyof T] || key;
          const value = formatValue(item[key], dateFields.includes(key as keyof T));
          row[header] = value;
        });

        return row;
      });

      const csvContent = rows.map(row => 
        Object.values(row).map(value => 
          `"${value.replace(/"/g, '""')}"`
        ).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}.csv`);

    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async ({ data, filename, headers = {}, dateFields = [] }: ExportOptions<T>) => {
    try {
      setIsExporting(true);

      const rows = data.map(item => {
        const row: Record<string, string> = {};
        
        Object.keys(item).forEach(key => {
          const header = headers[key as keyof T] || key;
          const value = formatValue(item[key], dateFields.includes(key as keyof T));
          row[header] = value;
        });

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, `${filename}.xlsx`);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportToCSV,
    exportToExcel
  };
} 