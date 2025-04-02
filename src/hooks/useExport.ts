import { useCallback } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface ExportOptions<T> {
  filename?: string;
  sheetName?: string;
  headers?: { [K in keyof T]?: string };
  dateFields?: (keyof T)[];
  numberFields?: (keyof T)[];
  booleanFields?: (keyof T)[];
}

export function useExport<T>() {
  const exportToCSV = useCallback(
    (data: T[], options: ExportOptions<T> = {}) => {
      try {
        const {
          filename = 'export.csv',
          headers = {},
          dateFields = [],
          numberFields = [],
          booleanFields = [],
        } = options;

        const processedData = data.map(item => {
          const processedItem: any = {};
          
          Object.entries(item as any).forEach(([key, value]) => {
            if (value === null || value === undefined) {
              processedItem[key] = '';
            } else if (dateFields.includes(key as keyof T)) {
              processedItem[key] = value instanceof Date ? value.toISOString() : value;
            } else if (numberFields.includes(key as keyof T)) {
              processedItem[key] = Number(value);
            } else if (booleanFields.includes(key as keyof T)) {
              processedItem[key] = Boolean(value);
            } else {
              processedItem[key] = value;
            }
          });

          return processedItem;
        });

        const csvContent = processedData.map(row => {
          return Object.entries(row)
            .map(([key, value]) => {
              const header = headers[key as keyof T] || key;
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(',');
        });

        const headerRow = Object.keys(processedData[0] || {})
          .map(key => headers[key as keyof T] || key)
          .map(header => `"${header}"`)
          .join(',');

        const csv = [headerRow, ...csvContent].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);

        return true;
      } catch (error) {
        console.error('Error exporting to CSV:', error);
        return false;
      }
    },
    []
  );

  const exportToExcel = useCallback(
    (data: T[], options: ExportOptions<T> = {}) => {
      try {
        const {
          filename = 'export.xlsx',
          sheetName = 'Sheet1',
          headers = {},
          dateFields = [],
          numberFields = [],
          booleanFields = [],
        } = options;

        const processedData = data.map(item => {
          const processedItem: any = {};
          
          Object.entries(item as any).forEach(([key, value]) => {
            const header = headers[key as keyof T] || key;
            
            if (value === null || value === undefined) {
              processedItem[header] = '';
            } else if (dateFields.includes(key as keyof T)) {
              processedItem[header] = value instanceof Date ? value : new Date(value);
            } else if (numberFields.includes(key as keyof T)) {
              processedItem[header] = Number(value);
            } else if (booleanFields.includes(key as keyof T)) {
              processedItem[header] = Boolean(value);
            } else {
              processedItem[header] = value;
            }
          });

          return processedItem;
        });

        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, filename);

        return true;
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        return false;
      }
    },
    []
  );

  return {
    exportToCSV,
    exportToExcel,
  };
} 