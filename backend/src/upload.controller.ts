import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import * as Papa from 'papaparse';

// Ensure multer's Express namespace augmentation is loaded
type MulterFile = Express.Multer.File;

@Controller()
export class UploadController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Field name must be "file".');
    }

    const csv = file.buffer.toString('utf8');
    const result = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (result.errors?.length) {
      throw new BadRequestException({
        message: 'Failed to parse CSV',
        errors: result.errors,
      });
    }

    return {
      filename: file.originalname,
      rowCount: result.data.length,
      fields: result.meta.fields ?? [],
      data: result.data,
    };
  }
}
