import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { ProgresoService } from './progreso.service';
import { Progreso } from './progreso.entity';

describe('ProgresoService', () => {
  let service: ProgresoService;
  let repository: Repository<Progreso>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgresoService,
        {
          provide: getRepositoryToken(Progreso),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProgresoService>(ProgresoService);
    repository = module.get<Repository<Progreso>>(getRepositoryToken(Progreso));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un progreso', async () => {
      const dto = {
        historialId: 'historial',
        fecha: new Date(),
        estadoEmocional: 'Feliz',
        avance: 'Buen progreso',
      };

      const progreso = { id: '1', ...dto };

      mockRepository.create.mockReturnValue(progreso);
      mockRepository.save.mockResolvedValue(progreso);

      const result = await service.create(dto);

      expect(result).toEqual(progreso);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los progresos', async () => {
      const lista = [{ id: '1' }];

      mockRepository.find.mockResolvedValue(lista);

      const result = await service.findAll();

      expect(result).toEqual(lista);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('debería retornar un progreso', async () => {
      const progreso = { id: '1' };

      mockRepository.findOne.mockResolvedValue(progreso);

      const result = await service.findOne('1');

      expect(result).toEqual(progreso);
      expect(repository.findOne).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPaciente', () => {
    it('debería retornar los progresos de un paciente', async () => {
      const lista = [{ id: '1' }];

      mockRepository.find.mockResolvedValue(lista);

      const result = await service.findByPaciente('historial');

      expect(result).toEqual(lista);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debería actualizar un progreso', async () => {
      const progreso = {
        id: '1',
        estadoEmocional: 'Ansioso',
      };

      const dto = {
        estadoEmocional: 'Motivado',
      };

      const actualizado = {
        ...progreso,
        ...dto,
      };

      mockRepository.findOne.mockResolvedValue(progreso);
      mockRepository.merge.mockReturnValue(actualizado);
      mockRepository.save.mockResolvedValue(actualizado);

      const result = await service.update('1', dto);

      expect(result).toEqual(actualizado);
      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debería eliminar un progreso', async () => {
      const progreso = {
        id: '1',
      };

      mockRepository.findOne.mockResolvedValue(progreso);
      mockRepository.remove.mockResolvedValue(progreso);

      const result = await service.remove('1');

      expect(result).toEqual({
        message: 'Progreso con ID 1 eliminado exitosamente',
      });

      expect(repository.remove).toHaveBeenCalledWith(progreso);
    });

    it('debería lanzar NotFoundException cuando no exista', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});