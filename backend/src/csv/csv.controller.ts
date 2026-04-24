import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvService } from './csv.service';
import type { CsvUploadResult } from './interfaces/csv.interface';

@ApiTags('CSV')
@Controller('upload')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a CSV file and validate each row' })
  @ApiResponse({ status: 201, description: 'CSV parsed and validated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or missing CSV file' })
  @UseInterceptors(FileInterceptor('file'))
  uploadCsv(@UploadedFile() file: Express.Multer.File): CsvUploadResult {
    return this.csvService.parseAndValidate(file);
  }
}
