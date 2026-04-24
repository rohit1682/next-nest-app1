import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CsvRowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(18)
  @Max(100)
  age: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  department?: string;
}
