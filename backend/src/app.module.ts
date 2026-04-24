import { Module } from '@nestjs/common';
import { CsvModule } from './csv/csv.module';

@Module({
  imports: [CsvModule],
})
export class AppModule {}
