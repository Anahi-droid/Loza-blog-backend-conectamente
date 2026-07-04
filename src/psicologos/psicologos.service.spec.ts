import { Test, TestingModule } from '@nestjs/testing';
import { PsicologosService } from './psicologos.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Psicologo } from '../psicologos/psicologo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { NotFoundException } from '@nestjs/common';

describe('PsicologosService', () => {
  let service: PsicologosService;

  const mockPsicologoRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsuarioRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PsicologosService,
        { provide: getRepositoryToken(Psicologo), useValue: mockPsicologoRepo },
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepo },
      ],
    }).compile();

    service = module.get<PsicologosService>(PsicologosService);
    jest.clearAllMocks();
  });

  describe('crearPerfil', () => {
    it('debe lanzar NotFoundException si el usuario no existe o no es PSICOLOGO', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.crearPerfil('invalid-id', { numeroColegiatura: '12345' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe crear y retornar el perfil si el usuario es válido', async () => {
      const usuarioMock = { id: 'user-123', rol: 'PSICOLOGO' };
      const datosProf = { numeroColegiatura: '12345' };
      const perfilMock = { id: 'psico-1', ...datosProf, usuario: usuarioMock };

      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);
      mockPsicologoRepo.create.mockReturnValue(perfilMock);
      mockPsicologoRepo.save.mockResolvedValue(perfilMock);

      const resultado = await service.crearPerfil('user-123', datosProf);

      expect(mockUsuarioRepo.findOne).toHaveBeenCalled();
      expect(mockPsicologoRepo.save).toHaveBeenCalled();
      expect(resultado).toEqual(perfilMock);
    });
  });

  describe('listarTodos', () => {
    it('debe retornar un arreglo de psicólogos activos (Línea 32)', async () => {
      const mockLista = [{ id: 'psico-1', numeroColegiatura: '123' }];
      mockPsicologoRepo.find.mockResolvedValue(mockLista);

      const resultado = await service.listarTodos();

      expect(mockPsicologoRepo.find).toHaveBeenCalledWith({
        relations: { usuario: true },
        where: { usuario: { activo: true } }
      });
      expect(resultado).toEqual(mockLista);
    });
  });

  describe('actualizar', () => {
    it('debe lanzar NotFoundException si el perfil no existe', async () => {
      mockPsicologoRepo.findOne.mockResolvedValue(null);

      await expect(
        service.actualizar('id-inexistente', { numeroColegiatura: '999' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar campos y guardar el perfil exitosamente', async () => {
      const perfilExistente = { id: 'psico-1', numeroColegiatura: '111' };
      mockPsicologoRepo.findOne.mockResolvedValue(perfilExistente);
      mockPsicologoRepo.save.mockResolvedValue({ ...perfilExistente, numeroColegiatura: '999' });

      const resultado = await service.actualizar('user-123', { numeroColegiatura: '999' });

      expect(resultado.numeroColegiatura).toBe('999');
      expect(mockPsicologoRepo.save).toHaveBeenCalled();
    });
  });

  describe('eliminar', () => {
    it('debe lanzar NotFoundException si el perfil a eliminar no existe (Línea 57)', async () => {
      mockPsicologoRepo.findOne.mockResolvedValue(null);

      await expect(
        service.eliminar('id-inexistente'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe eliminar el perfil si existe', async () => {
      const perfilExistente = { id: 'psico-1' };
      mockPsicologoRepo.findOne.mockResolvedValue(perfilExistente);
      mockPsicologoRepo.remove.mockResolvedValue(perfilExistente);

      await service.eliminar('user-123');

      expect(mockPsicologoRepo.remove).toHaveBeenCalledWith(perfilExistente);
    });
  });
});