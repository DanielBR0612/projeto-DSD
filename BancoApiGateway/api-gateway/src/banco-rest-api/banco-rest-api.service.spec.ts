import { Test, TestingModule } from '@nestjs/testing';
import { BancoRestApiService } from './banco-rest-api.service';

describe('BancoRestApiService', () => {
  let service: BancoRestApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BancoRestApiService],
    }).compile();

    service = module.get<BancoRestApiService>(BancoRestApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
