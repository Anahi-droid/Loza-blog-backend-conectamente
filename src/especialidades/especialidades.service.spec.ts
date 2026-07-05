import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EspecialidadesService } from './especialidades.service';
import { Especialidad } from './especialidade.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

const ESPECIALIDAD_ID = '22222222-2222-2222-2222-222222222222';
const OTRA_ESPECIALIDAD_ID = '55555555-5555-5555-5555-555555555555';
const NOT_FOUND_ID = '99999999-9999-9999-9999-999999999999';

describe('EspecialidadesService', () => {
  let service: EspecialidadesService;

  const mockEspecialidadRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EspecialidadesService,
        {
          provide: getRepositoryToken(Especialidad),
          useValue: mockEspecialidadRepository,
        },
      ],
    }).compile();

    service = module.get<EspecialidadesService>(EspecialidadesService);
  });

  describe('create', () => {
    it('debería crear una especialidad exitosamente si el nombre no existe', async () => {
      const dto = { nombre: 'Psicología Clínica', descripcion: 'Tratamiento de trastornos' };
      const mockNuevaEspecialidad = { id: ESPECIALIDAD_ID, ...dto };

      mockEspecialidadRepository.findOne.mockResolvedValue(null);
      mockEspecialidadRepository.create.mockReturnValue(mockNuevaEspecialidad);
      mockEspecialidadRepository.save.mockResolvedValue(mockNuevaEspecialidad);

      const result = await service.create(dto);

      expect(result).toEqual(mockNuevaEspecialidad);
      expect(mockEspecialidadRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockEspecialidadRepository.save).toHaveBeenCalledWith(mockNuevaEspecialidad);
    });

    it('debería lanzar un ConflictException si el nombre ya está registrado', async () => {
      const dto = { nombre: 'Psicología Clínica' };
      mockEspecialidadRepository.findOne.mockResolvedValue({ id: ESPECIALIDAD_ID, nombre: 'Psicología Clínica' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debería retornar una lista de especialidades incluyendo sus relaciones', async () => {
      const mockLista = [{ id: ESPECIALIDAD_ID, nombre: 'Psicología Clínica', psicologos: [] }];
      mockEspecialidadRepository.find.mockResolvedValue(mockLista);

      const result = await service.findAll();

      expect(result).toEqual(mockLista);
      expect(mockEspecialidadRepository.find).toHaveBeenCalledWith({ relations: { psicologos: true } });
    });
  });

  describe('findOne', () => {
    it('debería retornar la especialidad si es encontrada por ID', async () => {
      const mockEspecialidad = { id: ESPECIALIDAD_ID, nombre: 'Psicología Infantil' };
      mockEspecialidadRepository.findOne.mockResolvedValue(mockEspecialidad);

      const result = await service.findOne(ESPECIALIDAD_ID);

      expect(result).toEqual(mockEspecialidad);
    });

    it('debería lanzar un NotFoundException si la especialidad no existe', async () => {
      mockEspecialidadRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(NOT_FOUND_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar la especialidad correctamente', async () => {
      const dto = { nombre: 'Neuropsicología' };
      const mockOriginal = { id: ESPECIALIDAD_ID, nombre: 'Psicología Antigua' };

      mockEspecialidadRepository.findOne
        .mockResolvedValueOnce(mockOriginal) 
        .mockResolvedValueOnce(null);        

      mockEspecialidadRepository.merge.mockImplementation((target, source) => Object.assign(target, source));
      mockEspecialidadRepository.save.mockResolvedValue({ ...mockOriginal, ...dto });

      const result = await service.update(ESPECIALIDAD_ID, dto);

      expect(result.nombre).toEqual('Neuropsicología');
      expect(mockEspecialidadRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar un ConflictException si el nuevo nombre ya lo usa otra especialidad', async () => {
      const dto = { nombre: 'Psicología Organizacional' };
      const mockOriginal = { id: ESPECIALIDAD_ID, nombre: 'Psicología Clínica' };
      const mockExistenteConEseNombre = { id: OTRA_ESPECIALIDAD_ID, nombre: 'Psicología Organizacional' };

      mockEspecialidadRepository.findOne
        .mockResolvedValueOnce(mockOriginal)             
        .mockResolvedValueOnce(mockExistenteConEseNombre);

      await expect(service.update(ESPECIALIDAD_ID, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('debería eliminar la especialidad correctamente y retornar un mensaje', async () => {
      const mockEspecialidad = { id: ESPECIALIDAD_ID, nombre: 'A Borrar' };
      mockEspecialidadRepository.findOne.mockResolvedValue(mockEspecialidad);
      mockEspecialidadRepository.remove.mockResolvedValue(mockEspecialidad);

      const result = await service.remove(ESPECIALIDAD_ID);

      expect(result).toEqual({ message: `Especialidad con ID ${ESPECIALIDAD_ID} eliminada exitosamente` });
      expect(mockEspecialidadRepository.remove).toHaveBeenCalledWith(mockEspecialidad);
    });
  });
});