import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import * as Papa from 'papaparse';
import { CsvRowDto } from './dto/csv-row.dto';
import { CsvUploadResult, CsvValidRow } from './interfaces/csv.interface';

@Injectable()
export class CsvService {
  parseAndValidate(file: Express.Multer.File): CsvUploadResult {
    if (!file) {
      throw new BadRequestException('No file uploaded. Field name must be "file".');
    }

    const csvText = file.buffer.toString('utf8');
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      throw new BadRequestException({
        message: 'Failed to parse CSV',
        errors: parsed.errors,
      });
    }

    const valid: CsvValidRow[] = [];
    const errors: CsvUploadResult['errors'] = [];

    parsed.data.forEach((row, index) => {
      const normalized = {
        name: (row.name ?? '').trim(),
        age:
          row.age === undefined || row.age === null || row.age === ''
            ? Number.NaN
            : Number(row.age),
        email: (row.email ?? '').trim(),
        department: (row.department ?? '').trim() || undefined,
      };

      const dto = plainToInstance(CsvRowDto, normalized);
      const validationErrors = validateSync(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (validationErrors.length > 0) {
        errors.push({
          row: index + 1,
          issues: this.extractMessages(validationErrors),
        });
        return;
      }

      valid.push(dto as CsvValidRow);
    });

    return { valid, errors };
  }

  private extractMessages(validationErrors: ValidationError[]): string[] {
    return validationErrors.flatMap((error) => Object.values(error.constraints ?? {}));
  }
}
