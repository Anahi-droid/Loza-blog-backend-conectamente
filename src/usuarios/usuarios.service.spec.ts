import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsuariosService', () => {
  let service: UsuariosService;
  
  const mockUsuarioRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
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
    jest.clearAllMocks();
  });

  describe('Utilidades de Contraseña', () => {
    it('comparePasswords() debe validar texto plano contra el hash', async () => {
      const plain = 'clave123';
      const hash = await service.hashPassword(plain);
      const coinciden = await service.comparePasswords(plain, hash);
      expect(coinciden).toBe(true);
    });
  });

  describe('crear', () => {
    it('debe lanzar ConflictException si el email ya existe', async () => {
      const dto = { email: 'duplicado@correo.com', password: 'password123', nombre: 'Andres', apellido: 'Jurado' };
      mockUsuarioRepo.findOne.mockResolvedValue(new Usuario());

      await expect(service.crear(dto)).rejects.toThrow(ConflictException);
    });

    it('debe lanzar BadRequestException si no se envía contraseña', async () => {
      const dto = { email: 'test@correo.com', password: '', nombre: 'Andres', apellido: 'Jurado' };
      mockUsuarioRepo.findOne.mockResolvedValue(null);

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
      expect(resultado.password).not.toBe('password123');
    });
  });

  describe('actualizar', () => {
    it('debe actualizar los datos mutables y hashear la clave si se proporciona', async () => {
      const usuarioMock = { id: '1', email: 'test@correo.com', password: 'hash_anterior', activo: true };
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);
      mockUsuarioRepo.save.mockImplementation((u) => Promise.resolve(u));

      const dto = { nombre: 'Andres Felipe', password: 'nueva_clave_123' };
      const resultado = await service.actualizar('1', dto);

      expect(resultado.nombre).toBe('Andres Felipe');
      expect(resultado.password).not.toBe('nueva_clave_123');
      expect(mockUsuarioRepo.save).toHaveBeenCalled();
    });

    it('debe mantener la clave anterior si el dto no la incluye', async () => {
      const usuarioMock = { id: '1', email: 'test@correo.com', password: 'hash_intacto', activo: true };
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);
      mockUsuarioRepo.save.mockImplementation((u) => Promise.resolve(u));

      const dto = { nombre: 'Andres Modificado' };
      const resultado = await service.actualizar('1', dto);

      expect(resultado.password).toBe('hash_intacto');
    });
  });

  describe('desactivar', () => {
    it('debe cambiar el estado del usuario a activo = false (borrado lógico)', async () => {
      const usuarioMock = { id: '1', email: 'test@correo.com', activo: true };
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);
      mockUsuarioRepo.save.mockResolvedValue({ ...usuarioMock, activo: false });

      await service.desactivar('1');

      expect(usuarioMock.activo).toBe(false);
      expect(mockUsuarioRepo.save).toHaveBeenCalledWith(usuarioMock);
    });
  });

  describe('buscarPorEmail', () => {
    it('debe retornar el usuario activo que coincida con el email', async () => {
      const usuarioMock = { id: '1', email: 'buscar@correo.com', activo: true };
      mockUsuarioRepo.findOne.mockResolvedValue(usuarioMock);

      const res = await service.buscarPorEmail('buscar@correo.com');
      expect(res).toEqual(usuarioMock);
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

  describe('listarTodos', () => {
    it('debe paginar y aplicar filtros de rol usando QueryBuilder', async () => {
      mockUsuarioRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const res = await service.listarTodos(1, 10, 'psicologo');

      expect(mockUsuarioRepo.createQueryBuilder).toHaveBeenCalledWith('u');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('u.rol = :rol', { rol: 'psicologo' });
      expect(res.data).toEqual([]);
      expect(res.total).toBe(0);
    });

    it('debe paginar correctamente sin recibir el filtro opcional de rol', async () => {
      mockUsuarioRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.listarTodos(2, 5);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });
  });
});