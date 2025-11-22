import { Test, TestingModule } from '@nestjs/testing';
import { BancoSoapController } from './banco-soap.controller';
import { BancoRestController } from './banco-rest.controller';
import { BancoCoreSoapService } from '../banco-core-soap/banco-core-soap.service';
import { BancoRestApiService } from '../banco-rest-api/banco-rest-api.service';

describe('Banco Controllers', () => {
  let soapController: BancoSoapController;
  let restController: BancoRestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BancoSoapController, BancoRestController],
      providers: [
        {
          provide: BancoCoreSoapService,
          useValue: {
            chamarServico: jest.fn(), 
          },
        },
        {
          provide: BancoRestApiService,
          useValue: {
            criarChavePix: jest.fn(),
            realizarPix: jest.fn(),
            consultarSaldo: jest.fn(),
          },
        },
      ],
    }).compile();

    soapController = module.get<BancoSoapController>(BancoSoapController);
    restController = module.get<BancoRestController>(BancoRestController);
  });

  it('SOAP Controller deve estar definido', () => {
    expect(soapController).toBeDefined();
  });

  it('REST Controller deve estar definido', () => {
    expect(restController).toBeDefined();
  });
});