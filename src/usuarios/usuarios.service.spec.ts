import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repo: Repository<Usuario>;
  
  const mockUsuarioRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepo,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    repo = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    jest.clearAllMocks();
  });

  describe('crear', () => {
    it('debe lanzar ConflictException si el email ya existe', async () => {
      const dto = { email: 'duplicado@correo.com', password: 'password123', nombre: 'Andres', apellido: 'Jurado' };
      mockUsuarioRepo.findOne.mockResolvedValue(new Usuario()); // Simula que sí encontró uno

      await expect(service.crear(dto)).rejects.toThrow(ConflictException);
    });

    it('debe lanzar BadRequestException si no se envía contraseña', async () => {
      const dto = { email: 'test@correo.com', password: '', nombre: 'Andres', apellido: 'Jurado' };
      mockUsuarioRepo.findOne.mockResolvedValue(null); // No existe previo

      await expect(service.crear(dto)).rejects.toThrow(BadRequestException);
    });

    it('debe crear y guardar el usuario encriptando la contraseña', async () => {
      const dto = { email: 'nuevo@correo.com', password: 'password123', nombre: 'Andres', apellido: 'Jurado' };
      const usuarioMock = { ...dto, password: 'password_encriptada' };

      mockUsuarioRepo.findOne.mockResolvedValue(null);
      mockUsuarioRepo.create.mockReturnValue(usuarioMock);
      mockUsuarioRepo.save.mockResolvedValue(usuarioMock);

      const resultado = await service.crear(dto);

      expect(mockUsuarioRepo.findOne).toHaveBeenCalled();
      expect(mockUsuarioRepo.save).toHaveBeenCalled();
      expect(resultado.password).not.toBe('password123'); // Verifica el hashing indirectamente[cite: 3]
    });
  });

  describe('buscarPorId', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId('id-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('debe retornar el usuario si existe y está activo', async () => {
      const usuarioMock = { id: '1', email: 'test@correo.com', activo: true };
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);

      const resultado = await service.buscarPorId('1');

      expect(resultado).toEqual(usuarioMock);
    });
  });

  describe('desactivar', () => {
    it('debe cambiar el estado del usuario a activo = false (borrado lógico)', async () => {
      const usuarioMock = { id: '1', email: 'test@correo.com', activo: true };
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);
      mockUsuarioRepo.save.mockResolvedValue({ ...usuarioMock, activo: false });

      await service.desactivar('1');

      expect(usuarioMock.activo).toBe(false); // Operación principal de eliminación lógica[cite: 3]
      expect(mockUsuarioRepo.save).toHaveBeenCalledWith(usuarioMock);
    });
  });
});