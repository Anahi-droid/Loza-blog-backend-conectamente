import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockAppService = {
    getHello: jest.fn().mockReturnValue('Hello World!'),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: mockAppService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('debe estar definido el controlador (Ramas Constructor)', () => {
    expect(appController).toBeDefined();
  });

  describe('root', () => {
    it('debe retornar el saludo del servicio correctamente', () => {
      const resultado = appController.getHello();
      
      expect(mockAppService.getHello).toHaveBeenCalled();
      expect(resultado).toBe('Hello World!');
    });
  });
});