import { Test, TestingModule } from '@nestjs/testing';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';

describe('HistorialController', () => {
  let controller: HistorialController;

  const mockHistorialService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createDiagnostico: jest.fn(),
    findAllDiagnosticos: jest.fn(),
    findOneDiagnostico: jest.fn(),
    updateDiagnostico: jest.fn(),
    removeDiagnostico: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialController],
      providers: [
        { provide: HistorialService, useValue: mockHistorialService },
      ],
    }).compile();

    controller = module.get<HistorialController>(HistorialController);
    jest.clearAllMocks();
  });

  describe('Flujo de Historial Clínico', () => {
    it('create() debe extraer el psicologoId de la solicitud e invocar al servicio', async () => {
      const req = { user: { id: 'psico-123' } };
      const dto = { fechaSesion: '2026-07-02', diagnostico: 'Estrés', observaciones: 'Mejora notable', pacienteId: 'pac-1' };
      mockHistorialService.create.mockResolvedValue({ id: 'h-1', ...dto });

      const resultado = await controller.create(req, dto);

      expect(mockHistorialService.create).toHaveBeenCalledWith(dto, 'psico-123');
      expect(resultado).toHaveProperty('id', 'h-1');
    });

    it('findAll() debe listar todos los expedientes disponibles', async () => {
      mockHistorialService.findAll.mockResolvedValue([]);
      const resultado = await controller.findAll();
      expect(resultado).toEqual([]);
    });

    it('remove() debe procesar la eliminación física del historial por su identificador', async () => {
      mockHistorialService.remove.mockResolvedValue({ deleted: true, id: 'h-1' });
      const resultado = await controller.remove('h-1');
      expect(resultado).toEqual({ deleted: true, id: 'h-1' });
    });
  });
  describe('Flujo de Diagnósticos Clínicos (CIE-10)', () => {
    it('createDiagnostico() debe enviar los parámetros obligatorios al servicio', async () => {
      const mockDiag = { id: 'd-1', codigoCIE10: 'F41.1', descripcion: 'Ansiedad' };
      mockHistorialService.createDiagnostico.mockResolvedValue(mockDiag);

      const resultado = await controller.createDiagnostico('h-1', 'F41.1', 'Ansiedad');

      expect(mockHistorialService.createDiagnostico).toHaveBeenCalledWith('h-1', 'F41.1', 'Ansiedad');
      expect(resultado).toEqual(mockDiag);
    });

    it('findOneDiagnostico() debe retornar el diagnóstico solicitado por UUID', async () => {
      const mockDiag = { id: 'd-1', codigoCIE10: 'F41.1' };
      mockHistorialService.findOneDiagnostico.mockResolvedValue(mockDiag);

      const resultado = await controller.findOneDiagnostico('d-1');

      expect(mockHistorialService.findOneDiagnostico).toHaveBeenCalledWith('d-1');
      expect(resultado).toEqual(mockDiag);
    });

    it('updateDiagnostico() debe invocar la edición con las propiedades del body', async () => {
      const mockDiag = { id: 'd-1', descripcion: 'Modificado' };
      mockHistorialService.updateDiagnostico.mockResolvedValue(mockDiag);

      const resultado = await controller.updateDiagnostico('d-1', undefined, 'Modificado');

      expect(mockHistorialService.updateDiagnostico).toHaveBeenCalledWith('d-1', undefined, 'Modificado');
      expect(resultado).toEqual(mockDiag);
    });

    it('removeDiagnostico() debe procesar la baja del registro', async () => {
      mockHistorialService.removeDiagnostico.mockResolvedValue({ deleted: true, id: 'd-1' });

      const resultado = await controller.removeDiagnostico('d-1');

      expect(mockHistorialService.removeDiagnostico).toHaveBeenCalledWith('d-1');
      expect(resultado).toEqual({ deleted: true, id: 'd-1' });
    });
  });
});