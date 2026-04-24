export interface CsvValidRow {
  name: string;
  age: number;
  email: string;
  department?: string;
}

export interface CsvRowError {
  row: number;
  issues: string[];
}

export interface CsvUploadResult {
  valid: CsvValidRow[];
  errors: CsvRowError[];
}
