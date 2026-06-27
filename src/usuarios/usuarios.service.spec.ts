import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repository: Repository<Usuario>;

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarPorId', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe retornar el usuario y eliminar la propiedad password por seguridad', async () => {
      const usuarioMock = { id: '123', nombre: 'Juan', password: 'secret_hash' };
      mockUsuarioRepository.findOne.mockResolvedValue(usuarioMock);

      const resultado = await service.buscarPorId('123');
      expect(resultado.password).toBeUndefined();
      expect(resultado.nombre).toBe('Juan');
    });
  });

  describe('actualizarPerfil', () => {
    it('debe lanzar BadRequestException si se intenta modificar el rol o el email', async () => {
      const usuarioMock = { id: '123', email: 'juan@test.com', rol: 'PACIENTE' };
      mockUsuarioRepository.findOne.mockResolvedValue(usuarioMock);

      await expect(
        service.actualizarPerfil('123', { email: 'nuevo@test.com' }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.actualizarPerfil('123', { rol: 'ADMIN' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});