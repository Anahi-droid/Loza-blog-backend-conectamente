import { Test, TestingModule } from '@nestjs/testing';
import { HistorialService } from './historial.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Historial } from './historial.entity';
import { Diagnostico } from './diagnostico.entity';
import { NotFoundException } from '@nestjs/common';

describe('HistorialService', () => {
  let service: HistorialService;
  let historialRepo: Repository<Historial>;
  let diagnosticoRepo: Repository<Diagnostico>;

  const mockHistorialRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockDiagnosticoRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistorialService,
        { provide: getRepositoryToken(Historial), useValue: mockHistorialRepo },
        { provide: getRepositoryToken(Diagnostico), useValue: mockDiagnosticoRepo },
      ],
    }).compile();

    service = module.get<HistorialService>(HistorialService);
    historialRepo = module.get<Repository<Historial>>(getRepositoryToken(Historial));
    diagnosticoRepo = module.get<Repository<Diagnostico>>(getRepositoryToken(Diagnostico));
    jest.clearAllMocks();
  });

  describe('Historiales Clínicos - Operaciones Principales', () => {
    it('create() debe crear y guardar un nuevo historial correctamente', async () => {
      const dto = { fechaSesion: '2026-07-02', diagnostico: 'Ansiedad', observaciones: 'Estable', pacienteId: 'p-1' };
      const mockResult = { id: 'h-1', ...dto, psicologo: { id: 'psico-1' } };

      mockHistorialRepo.create.mockReturnValue(mockResult);
      mockHistorialRepo.save.mockResolvedValue(mockResult);

      const resultado = await service.create(dto, 'psico-1');

      expect(mockHistorialRepo.create).toHaveBeenCalled();
      expect(mockHistorialRepo.save).toHaveBeenCalledWith(mockResult);
      expect(resultado).toEqual(mockResult);
    });

    it('findOne() debe lanzar NotFoundException si el historial no existe', async () => {
      mockHistorialRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('id-falso')).rejects.toThrow(NotFoundException);
    });

    it('remove() debe eliminar el historial y retornar confirmación estructurada', async () => {
      const historialMock = { id: 'h-1' };
      mockHistorialRepo.findOne.mockResolvedValue(historialMock);
      mockHistorialRepo.remove.mockResolvedValue(historialMock);

      const resultado = await service.remove('h-1');

      expect(mockHistorialRepo.remove).toHaveBeenCalledWith(historialMock);
      expect(resultado).toEqual({ deleted: true, id: 'h-1' });
    });
  });
  describe('Diagnósticos Clínicos - Gestión CIE-10', () => {
    it('createDiagnostico() debe asociar un diagnóstico al historial clínico existente', async () => {
      const historialMock = { id: 'h-1' };
      const diagnosticoMock = { id: 'd-1', codigoCIE10: 'F41.1', descripcion: 'Ansiedad generalizada', historial: historialMock };

      mockHistorialRepo.findOne.mockResolvedValue(historialMock);
      mockDiagnosticoRepo.create.mockReturnValue(diagnosticoMock);
      mockDiagnosticoRepo.save.mockResolvedValue(diagnosticoMock);

      const resultado = await service.createDiagnostico('h-1', 'F41.1', 'Ansiedad generalizada');

      expect(mockDiagnosticoRepo.create).toHaveBeenCalled();
      expect(mockDiagnosticoRepo.save).toHaveBeenCalledWith(diagnosticoMock);
      expect(resultado).toEqual(diagnosticoMock);
    });

    it('findOneDiagnostico() debe lanzar NotFoundException si el diagnóstico no existe', async () => {
      mockDiagnosticoRepo.findOne.mockResolvedValue(null);

      await expect(service.findOneDiagnostico('d-falso')).rejects.toThrow(NotFoundException);
    });

    it('updateDiagnostico() debe modificar selectivamente las propiedades enviadas', async () => {
      const diagnosticoOriginal = { id: 'd-1', codigoCIE10: 'F41.1', descripcion: 'Ansiedad original' };
      mockDiagnosticoRepo.findOne.mockResolvedValue(diagnosticoOriginal);
      mockDiagnosticoRepo.save.mockImplementation(async (d) => d);

      const resultado = await service.updateDiagnostico('d-1', undefined, 'Nueva descripción modificada');

      expect(resultado.descripcion).toBe('Nueva descripción modificada');
      expect(resultado.codigoCIE10).toBe('F41.1');
      expect(mockDiagnosticoRepo.save).toHaveBeenCalled();
    });

    it('removeDiagnostico() debe eliminar el registro de diagnóstico de la base de datos', async () => {
      const diagnosticoMock = { id: 'd-1' };
      mockDiagnosticoRepo.findOne.mockResolvedValue(diagnosticoMock);
      mockDiagnosticoRepo.remove.mockResolvedValue(diagnosticoMock);

      const resultado = await service.removeDiagnostico('d-1');

      expect(mockDiagnosticoRepo.remove).toHaveBeenCalledWith(diagnosticoMock);
      expect(resultado).toEqual({ deleted: true, id: 'd-1' });
    });
  });
});