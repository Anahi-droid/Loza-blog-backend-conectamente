import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service';
import { Paciente } from './paciente.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';


const PACIENTE_ID = '11111111-1111-1111-1111-111111111111';
const USUARIO_ID = '33333333-3333-3333-3333-333333333333';
const NOT_FOUND_ID = '99999999-9999-9999-9999-999999999999';

describe('PacientesService', () => {
  let service: PacientesService;

  const mockPacienteRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacientesService,
        {
          provide: getRepositoryToken(Paciente),
          useValue: mockPacienteRepository,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<PacientesService>(PacientesService);
  });

  describe('create', () => {
    it('debería crear un paciente exitosamente si cumple las condiciones', async () => {
      const dto = { usuarioId: USUARIO_ID, fechaNacimiento: '1990-01-01' };
      const mockUsuario = { id: USUARIO_ID, activo: true, rol: 'PACIENTE', perfilPaciente: null };
      const mockPacienteFinal = { id: PACIENTE_ID, ...dto, usuario: mockUsuario };

      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuario);
      mockPacienteRepository.create.mockReturnValue(mockPacienteFinal);
      mockPacienteRepository.save.mockResolvedValue(mockPacienteFinal);

      const result = await service.create(dto);

      expect(result).toEqual(mockPacienteFinal);
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockPacienteRepository.save).toHaveBeenCalledWith(mockPacienteFinal);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.create({ usuarioId: NOT_FOUND_ID }))
        .rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si el rol no es PACIENTE', async () => {
      const mockUsuarioAdmin = { id: USUARIO_ID, activo: true, rol: 'ADMIN', perfilPaciente: null };
      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuarioAdmin);

      await expect(service.create({ usuarioId: USUARIO_ID }))
        .rejects.toThrow(BadRequestException);
    });

    it('debería lanzar ConflictException si el usuario ya tiene expediente clínico', async () => {
      const mockUsuarioExistente = { id: USUARIO_ID, activo: true, rol: 'PACIENTE', perfilPaciente: { id: PACIENTE_ID } };
      mockUsuarioRepository.findOne.mockResolvedValue(mockUsuarioExistente);

      await expect(service.create({ usuarioId: USUARIO_ID }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('debería retornar el expediente de un paciente y borrar la password de la respuesta', async () => {
      const mockPaciente = {
        id: PACIENTE_ID,
        usuario: { id: USUARIO_ID, activo: true, password: 'secretPassword123' },
      };
      mockPacienteRepository.findOne.mockResolvedValue(mockPaciente);

      const result = await service.findOne(PACIENTE_ID);

      expect(result.usuario.password).toBeUndefined();
      expect(result.id).toEqual(PACIENTE_ID);
    });

    it('debería lanzar NotFoundException si el paciente no existe', async () => {
      mockPacienteRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(NOT_FOUND_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar el expediente correctamente', async () => {
      const dto = { ocupacion: 'Ingeniero de Software' };
      const mockPacienteOriginal = { id: PACIENTE_ID, usuario: { id: USUARIO_ID } };
      
      mockPacienteRepository.findOne.mockResolvedValue(mockPacienteOriginal);
      mockPacienteRepository.merge.mockImplementation((target, source) => Object.assign(target, source));
      mockPacienteRepository.save.mockResolvedValue({ ...mockPacienteOriginal, ...dto });

      const result = await service.update(PACIENTE_ID, dto);

      expect(result.ocupacion).toEqual('Ingeniero de Software');
      expect(mockPacienteRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si intenta reasignar a otro usuarioId', async () => {
      const dto = { usuarioId: 'otro-usuario-id-distinto' };
      const mockPacienteOriginal = { id: PACIENTE_ID, usuario: { id: USUARIO_ID } };

      mockPacienteRepository.findOne.mockResolvedValue(mockPacienteOriginal);

      await expect(service.update(PACIENTE_ID, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('debería eliminar el expediente correctamente', async () => {
      const mockPaciente = { id: PACIENTE_ID };
      mockPacienteRepository.findOne.mockResolvedValue(mockPaciente);
      mockPacienteRepository.remove.mockResolvedValue(mockPaciente);

      const result = await service.remove(PACIENTE_ID);

      expect(result).toEqual({ deleted: true });
      expect(mockPacienteRepository.remove).toHaveBeenCalledWith(mockPaciente);
    });
  });
});