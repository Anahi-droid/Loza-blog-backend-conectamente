import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
<<<<<<< HEAD
import { Usuario } from './usuario.entity'; // Ajusta la ruta a tu entidad real si varía
=======
import { Usuario } from './usuario.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
>>>>>>> 1e256ced3902d0f0a5621594ea076ca03018fb94

// ── Mocks ─────────────────────────────────────────────────────────────────
const mockUsuarioRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

// ── Suite ─────────────────────────────────────────────────────────────────
describe('UsuariosService', () => {
  let service: UsuariosService;
<<<<<<< HEAD
  let repository: ReturnType<typeof mockUsuarioRepository>;
=======
  let repository: Repository<Usuario>;

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    save: jest.fn(),
  };
>>>>>>> 1e256ced3902d0f0a5621594ea076ca03018fb94

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
<<<<<<< HEAD
          // Si usas TypeORM puro, getRepositoryToken(Usuario) genera el token "UsuarioRepository" automáticamente
          provide: getRepositoryToken(Usuario), 
          useFactory: mockUsuarioRepository,
=======
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
>>>>>>> 1e256ced3902d0f0a5621594ea076ca03018fb94
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
<<<<<<< HEAD
    repository = module.get(getRepositoryToken(Usuario));
  });

  afterEach(() => {
    jest.clearAllMocks();
=======
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
>>>>>>> 1e256ced3902d0f0a5621594ea076ca03018fb94
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
<<<<<<< HEAD
=======

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
>>>>>>> 1e256ced3902d0f0a5621594ea076ca03018fb94
});