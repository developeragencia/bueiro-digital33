import { useState } from 'react';
import { useToast } from '../lib/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ExportOptions<T> {
  data: T[];
  filename: string;
  headers?: Partial<Record<keyof T, string>>;
  dateFields?: (keyof T)[];
}

export function useExport() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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

  const exportToCSV = async <T extends Record<string, any>>(
    data: T[],
    filename: string,
    headers: { [key in keyof T]?: string } = {}
  ) => {
    try {
      setLoading(true);

      if (!data.length) {
        toast.error('Não há dados para exportar');
        return;
      }

      const headerRow = Object.keys(data[0]).map(key => headers[key] || key);
      const csvRows = [
        headerRow.join(','),
        ...data.map(row =>
          Object.values(row)
            .map(value => `"${value}"`)
            .join(',')
        ),
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success('Arquivo exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Erro ao exportar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async ({ data, filename, headers = {}, dateFields = [] }: ExportOptions<T>) => {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  return {
    loading,
    exportToCSV,
    exportToExcel
  };
} 