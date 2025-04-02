import { useState } from 'react';

interface ExportOptions<T> {
  data: T[];
  filename: string;
  headers?: Record<keyof T, string>;
  dateFields?: (keyof T)[];
}

export function useExport<T extends Record<string, any>>() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async ({ data, filename, headers = {}, dateFields = [] }: ExportOptions<T>) => {
    try {
      setIsExporting(true);

      if (!data.length) {
        throw new Error('No data to export');
      }

      const csvRows = [];
      const keys = Object.keys(data[0]) as (keyof T)[];

      // Add header row
      csvRows.push(
        keys.map(key => headers[key] || key).join(',')
      );

      // Add data rows
      for (const item of data) {
        const values = keys.map(key => {
          const value = item[key];

          if (value === null || value === undefined) {
            return '';
          }

          if (dateFields.includes(key)) {
            return new Date(value).toISOString();
          }

          if (typeof value === 'object') {
            return JSON.stringify(value);
          }

          return String(value).replace(/,/g, ';');
        });

        csvRows.push(values.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async ({ data, filename, headers = {}, dateFields = [] }: ExportOptions<T>) => {
    try {
      setIsExporting(true);

      if (!data.length) {
        throw new Error('No data to export');
      }

      const rows = data.map(item => {
        const row: Record<string, any> = {};
        const keys = Object.keys(item) as (keyof T)[];

        for (const key of keys) {
          const header = headers[key] || key;
          let value = item[key];

          if (value === null || value === undefined) {
            value = '';
          } else if (dateFields.includes(key)) {
            value = new Date(value);
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          }

          row[header] = value;
        }

        return row;
      });

      // Here you would use a library like xlsx to create the Excel file
      // For now, we'll just use CSV as a fallback
      return exportToCSV({ data, filename, headers, dateFields });
    } catch (error) {
      console.error('Error exporting data:', error);
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