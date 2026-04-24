import { Test, TestingModule } from '@nestjs/testing';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';

describe('CsvController', () => {
  let controller: CsvController;
  const csvServiceMock = {
    parseAndValidate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsvController],
      providers: [
        {
          provide: CsvService,
          useValue: csvServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CsvController>(CsvController);
    jest.clearAllMocks();
  });

  it('returns service response for uploaded file', () => {
    const file = { originalname: 'sample.csv' } as Express.Multer.File;
    const serviceResponse = {
      valid: [{ name: 'John', age: 25, email: 'john@example.com', department: 'Engineering' }],
      errors: [],
    };

    csvServiceMock.parseAndValidate.mockReturnValue(serviceResponse);

    const result = controller.uploadCsv(file);

    expect(csvServiceMock.parseAndValidate).toHaveBeenCalledWith(file);
    expect(result).toEqual(serviceResponse);
  });
});
