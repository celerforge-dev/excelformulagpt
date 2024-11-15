import * as XLSX from 'xlsx';

export interface Column {
  name: string;
  key: string;
  sample?: string;
  dataType?: DataType;
}

export interface Sheet {
  name: string;
  columns: Column[];
  rowCount: number;
}

export interface ExcelData {
  fileName: string;
  sheets: Sheet[];
}

export type DataType = 'string' | 'number' | 'date' | 'boolean' | 'unknown';

type CellValue = string | number | boolean | Date | null | undefined;
type WorksheetData = Array<Array<CellValue>>;

export class ExcelParser {
  private static inferDataType(value: CellValue): DataType {
    if (value === null || value === undefined) return 'unknown';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
      const dateValue = new Date(value);
      if (dateValue.toString() !== 'Invalid Date') return 'date';
      if (!isNaN(Number(value))) return 'number';
    }
    return 'string';
  }

  private static parseColumn(
    data: WorksheetData,
    columnIndex: number,
    columnLetter: string
  ): Column {
    const headerRow = data[0] || [];
    const headerValue = headerRow[columnIndex];
    const columnName = headerValue?.toString() || `Column ${columnLetter}`;
    
    // Find first non-empty value for sample and type inference
    let sample: CellValue = undefined;
    let dataType: DataType = 'unknown';
    
    for (let row = 1; row < data.length; row++) {
      const currentRow = data[row];
      if (currentRow && currentRow[columnIndex] !== undefined) {
        sample = currentRow[columnIndex];
        dataType = this.inferDataType(sample);
        break;
      }
    }

    return {
      name: columnName,
      key: columnLetter,
      sample: sample?.toString(),
      dataType
    };
  }

  private static parseSheet(
    worksheet: XLSX.WorkSheet,
    sheetName: string
  ): Sheet {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Convert sheet to array of arrays with proper typing
    const data = XLSX.utils.sheet_to_json<Array<CellValue>>(worksheet, { 
      header: 1,
      raw: false, // Convert all numbers to strings to avoid type issues
      dateNF: 'yyyy-mm-dd' // Standardize date format
    }) as WorksheetData;
    
    const columns: Column[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const columnLetter = XLSX.utils.encode_col(col);
      columns.push(this.parseColumn(data, col, columnLetter));
    }

    return {
      name: sheetName,
      columns,
      rowCount: Math.max(0, range.e.r)
    };
  }

  public static async parse(file: File): Promise<ExcelData> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellDates: true, // Parse dates automatically
      dateNF: 'yyyy-mm-dd' // Standardize date format
    });
    
    return {
      fileName: file.name,
      sheets: workbook.SheetNames.map(sheetName => 
        this.parseSheet(workbook.Sheets[sheetName], sheetName)
      )
    };
  }

  // Optional: Add type guard functions for better type safety
  public static isValidCellValue(value: unknown): value is CellValue {
    return (
      value === null ||
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Date
    );
  }

  public static isValidExcelData(data: unknown): data is ExcelData {
    if (!data || typeof data !== 'object') return false;
    
    const excelData = data as ExcelData;
    return (
      typeof excelData.fileName === 'string' &&
      Array.isArray(excelData.sheets) &&
      excelData.sheets.every(sheet => 
        typeof sheet.name === 'string' &&
        Array.isArray(sheet.columns) &&
        typeof sheet.rowCount === 'number'
      )
    );
  }
}