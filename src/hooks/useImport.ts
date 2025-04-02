import { useCallback } from 'react';
import * as XLSX from 'xlsx';

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

  const importFromExcel = useCallback(
    async (file: File, options: ImportOptions<T> = {}): Promise<ImportResult<T>> => {
      const result: ImportResult<T> = {
        data: [],
        errors: [],
        totalRows: 0,
        successRows: 0,
        failedRows: 0,
      };

      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = jsonData[0] as string[];
        result.totalRows = jsonData.length - 1;

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
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
        console.error('Error importing Excel:', error);
        throw new Error('Erro ao importar arquivo Excel');
      }
    },
    [processValue, validateRow]
  );

  return {
    importFromCSV,
    importFromExcel,
  };
} 