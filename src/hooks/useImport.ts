import { useCallback } from 'react';
import { Workbook } from 'exceljs';

interface ImportOptions<T> {
  headers?: { [key: string]: keyof T };
  dateFields?: (keyof T)[];
  numberFields?: (keyof T)[];
  booleanFields?: (keyof T)[];
  required?: (keyof T)[];
  validate?: (data: T) => boolean | string;
}

interface ImportResult<T> {
  data: T[];
  errors: string[];
  totalRows: number;
  successRows: number;
  failedRows: number;
}

export function useImport<T>() {
  const processValue = useCallback(
    (value: any, field: keyof T, options: ImportOptions<T>): any => {
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const { dateFields = [], numberFields = [], booleanFields = [] } = options;

      if (dateFields.includes(field)) {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      }

      if (numberFields.includes(field)) {
        const num = Number(value);
        return isNaN(num) ? null : num;
      }

      if (booleanFields.includes(field)) {
        if (typeof value === 'string') {
          const lowercaseValue = value.toLowerCase();
          if (['true', '1', 'yes', 'sim'].includes(lowercaseValue)) return true;
          if (['false', '0', 'no', 'não'].includes(lowercaseValue)) return false;
          return null;
        }
        return Boolean(value);
      }

      return value;
    },
    []
  );

  const validateRow = useCallback(
    (row: T, options: ImportOptions<T>): string[] => {
      const errors: string[] = [];
      const { required = [], validate } = options;

      required.forEach(field => {
        if (row[field] === null || row[field] === undefined || row[field] === '') {
          errors.push(`Campo obrigatório '${String(field)}' está vazio`);
        }
      });

      if (validate) {
        const validationResult = validate(row);
        if (typeof validationResult === 'string') {
          errors.push(validationResult);
        } else if (!validationResult) {
          errors.push('Dados inválidos');
        }
      }

      return errors;
    },
    []
  );

  const importFromCSV = useCallback(
    async (file: File, options: ImportOptions<T> = {}): Promise<ImportResult<T>> => {
      const result: ImportResult<T> = {
        data: [],
        errors: [],
        totalRows: 0,
        successRows: 0,
        failedRows: 0,
      };

      try {
        const text = await file.text();
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        const headers = rows[0];

        result.totalRows = rows.length - 1;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length !== headers.length) {
            result.errors.push(`Linha ${i + 1}: número de colunas inválido`);
            result.failedRows++;
            continue;
          }

          const item: any = {};
          let hasError = false;

          headers.forEach((header, index) => {
            const mappedField = options.headers?.[header] || (header as keyof T);
            const value = processValue(row[index], mappedField, options);
            item[mappedField] = value;
          });

          const rowErrors = validateRow(item as T, options);
          if (rowErrors.length > 0) {
            result.errors.push(`Linha ${i + 1}: ${rowErrors.join(', ')}`);
            result.failedRows++;
            hasError = true;
          }

          if (!hasError) {
            result.data.push(item);
            result.successRows++;
          }
        }

        return result;
      } catch (error) {
        console.error('Error importing CSV:', error);
        throw new Error('Erro ao importar arquivo CSV');
      }
    },
    [processValue, validateRow]
  );

  const importFromExcel = async (file: File): Promise<any[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('Planilha não encontrada');
      }

      const headers: string[] = [];
      const data: any[] = [];

      // Obter cabeçalhos
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
      });

      // Obter dados
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Pular cabeçalhos

        const rowData: Record<string, any> = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          rowData[header] = cell.value;
        });

        data.push(rowData);
      });

      return data;
    } catch (error) {
      console.error('Erro ao importar do Excel:', error);
      throw error;
    }
  };

  return {
    importFromCSV,
    importFromExcel,
  };
} 