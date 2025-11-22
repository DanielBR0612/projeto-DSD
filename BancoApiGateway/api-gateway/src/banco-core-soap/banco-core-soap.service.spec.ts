import { Test, TestingModule } from '@nestjs/testing';
import { BancoCoreSoapService } from './banco-core-soap.service';

describe('BancoCoreSoapService', () => {
  let service: BancoCoreSoapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BancoCoreSoapService],
    }).compile();

    service = module.get<BancoCoreSoapService>(BancoCoreSoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
