import { useState } from 'react';
import { useToast } from '../lib/hooks/use-toast';
import { Workbook } from 'exceljs';

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

  const exportToExcel = async (data: any[], fileName: string) => {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');

      // Adicionar cabeçalhos
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Adicionar dados
      data.forEach(item => {
        const row = headers.map(header => item[header]);
        worksheet.addRow(row);
      });

      // Ajustar largura das colunas
      worksheet.columns.forEach(column => {
        column.width = 15;
      });

      // Estilizar cabeçalhos
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Gerar arquivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
      // Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      throw error;
    }
  };

  return {
    loading,
    exportToCSV,
    exportToExcel
  };
} 