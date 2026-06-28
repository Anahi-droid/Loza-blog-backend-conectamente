import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './usuario.entity';

<<<<<<< HEAD
// ── Fábrica de mocks ──────────────────────────────────────────────────────
=======
>>>>>>> 1e256ced3902d0f0a5621594ea076ca03018fb94

const mockUsuario = (): Usuario => ({
  id: 'uuid-test-001',
  email: 'ana@clinica.com',
  password: 'hashed_password',
  nombre: 'Ana',
  apellido: 'García',
  rol: 'PACIENTE',
  activo: true,
  creadoEn: new Date(),
  actualizadoEn: new Date(),
});

const mockRepo = () => ({
  findOne:           jest.fn(),
  find:              jest.fn(),
  create:            jest.fn(),
  save:              jest.fn(),
  createQueryBuilder: jest.fn(),
});

<<<<<<< HEAD
// ── Suite principal ───────────────────────────────────────────────────────
=======

>>>>>>> 1e256ced3902d0f0a5621594ea076ca03018fb94

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repo: jest.Mocked<Partial<Repository<Usuario>>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getRepositoryToken(Usuario), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    repo    = module.get(getRepositoryToken(Usuario));
  });

  // ── hashPassword ─────────────────────────────────────────────────────────

  describe('hashPassword', () => {
    it('debe retornar un hash distinto al texto plano', async () => {
      const hash = await service.hashPassword('miPassword123');
      expect(hash).not.toBe('miPassword123');
      expect(hash.startsWith('$2b$')).toBe(true);
    });
<<<<<<< HEAD
=======
  });

  // ── comparePasswords ─────────────────────────────────────────────────────

  describe('comparePasswords', () => {
    it('debe retornar true cuando la contraseña coincide', async () => {
      const hash = await bcrypt.hash('correcta', 10);
      const resultado = await service.comparePasswords('correcta', hash);
      expect(resultado).toBe(true);
    });

    it('debe retornar false cuando la contraseña no coincide', async () => {
      const hash = await bcrypt.hash('correcta', 10);
      const resultado = await service.comparePasswords('incorrecta', hash);
      expect(resultado).toBe(false);
    });
  });

  // ── crear ─────────────────────────────────────────────────────────────────

  describe('crear', () => {
    const dto = {
      email: 'ana@clinica.com',
      password: 'Password123',
      nombre: 'Ana',
      apellido: 'García',
      rol: 'PACIENTE' as const,
    };

    it('debe crear un usuario correctamente cuando el email no existe', async () => {
      const usuarioCreado = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      (repo.create   as jest.Mock).mockReturnValue(usuarioCreado);
      (repo.save     as jest.Mock).mockResolvedValue(usuarioCreado);

      const resultado = await service.crear(dto);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(resultado.email).toBe(dto.email);
    });

    it('debe lanzar ConflictException cuando el email ya existe', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockUsuario());

      await expect(service.crear(dto)).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debe guardar la contraseña hasheada, no en texto plano', async () => {
      const usuarioCreado = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      (repo.create   as jest.Mock).mockImplementation((data) => ({ ...data }));
      (repo.save     as jest.Mock).mockImplementation((u) => Promise.resolve(u));

      await service.crear(dto);

      const llamada = (repo.create as jest.Mock).mock.calls[0][0];
      expect(llamada.password).not.toBe(dto.password);
      expect(llamada.password.startsWith('$2b$')).toBe(true);
    });
  });

  // ── buscarPorEmail ───────────────────────────────────────────────────────

  describe('buscarPorEmail', () => {
    it('debe retornar el usuario si existe y está activo', async () => {
      const usuario = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);

      const resultado = await service.buscarPorEmail('ana@clinica.com');
      expect(resultado).toEqual(usuario);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: 'ana@clinica.com', activo: true },
      });
    });

    it('debe retornar null si el usuario no existe', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const resultado = await service.buscarPorEmail('noexiste@test.com');
      expect(resultado).toBeNull();
    });
  });

  // ── buscarPorId ──────────────────────────────────────────────────────────

  describe('buscarPorId', () => {
    it('debe retornar el usuario si existe', async () => {
      const usuario = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);

      const resultado = await service.buscarPorId('uuid-test-001');
      expect(resultado).toEqual(usuario);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.buscarPorId('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  // ── actualizar ───────────────────────────────────────────────────────────

  describe('actualizar', () => {
    it('debe actualizar nombre y apellido correctamente', async () => {
      const usuario = mockUsuario();
      const dto = { nombre: 'Ana María', apellido: 'López' };
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);
      (repo.save    as jest.Mock).mockResolvedValue({ ...usuario, ...dto });

      const resultado = await service.actualizar('uuid-test-001', dto);
      expect(resultado.nombre).toBe('Ana María');
      expect(repo.save).toHaveBeenCalled();
    });

    it('debe hashear la contraseña cuando se actualiza', async () => {
      const usuario = mockUsuario();
      const dto = { password: 'NuevaClave456' };
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);
      (repo.save    as jest.Mock).mockImplementation((u) => Promise.resolve(u));

      await service.actualizar('uuid-test-001', dto);

      const guardado = (repo.save as jest.Mock).mock.calls[0][0];
      expect(guardado.password).not.toBe('NuevaClave456');
      expect(guardado.password.startsWith('$2b$')).toBe(true);
    });
  });

  // ── desactivar ───────────────────────────────────────────────────────────

  describe('desactivar', () => {
    it('debe setear activo=false (borrado lógico)', async () => {
      const usuario = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);
      (repo.save    as jest.Mock).mockResolvedValue({ ...usuario, activo: false });

      await service.desactivar('uuid-test-001');

      const guardado = (repo.save as jest.Mock).mock.calls[0][0];
      expect(guardado.activo).toBe(false);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.desactivar('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listarTodos ──────────────────────────────────────────────────────────

  describe('listarTodos', () => {
    it('debe retornar datos paginados correctamente', async () => {
      const usuarios = [mockUsuario(), { ...mockUsuario(), id: 'uuid-002' }];
      const queryBuilder: any = {
        where:           jest.fn().mockReturnThis(),
        skip:            jest.fn().mockReturnThis(),
        take:            jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([usuarios, 2]),
      };
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilder);

      const resultado = await service.listarTodos(1, 10);

      expect(resultado.total).toBe(2);
      expect(resultado.data).toHaveLength(2);
      expect(resultado.pagina).toBe(1);
      expect(resultado.limite).toBe(10);
    });

    it('debe aplicar filtro por rol cuando se proporciona', async () => {
      const queryBuilder: any = {
        where:           jest.fn().mockReturnThis(),
        skip:            jest.fn().mockReturnThis(),
        take:            jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUsuario()], 1]),
      };
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilder);

      await service.listarTodos(1, 10, 'PSICOLOGO');

      expect(queryBuilder.where).toHaveBeenCalledWith('u.rol = :rol', { rol: 'PSICOLOGO' });
    });
>>>>>>> 1e256ced3902d0f0a5621594ea076ca03018fb94
  });

  // ── comparePasswords ─────────────────────────────────────────────────────

  describe('comparePasswords', () => {
    it('debe retornar true cuando la contraseña coincide', async () => {
      const hash = await bcrypt.hash('correcta', 10);
      const resultado = await service.comparePasswords('correcta', hash);
      expect(resultado).toBe(true);
    });

    it('debe retornar false cuando la contraseña no coincide', async () => {
      const hash = await bcrypt.hash('correcta', 10);
      const resultado = await service.comparePasswords('incorrecta', hash);
      expect(resultado).toBe(false);
    });
  });

  // ── crear ─────────────────────────────────────────────────────────────────

  describe('crear', () => {
    const dto = {
      email: 'ana@clinica.com',
      password: 'Password123',
      nombre: 'Ana',
      apellido: 'García',
      rol: 'PACIENTE' as const,
    };

    it('debe crear un usuario correctamente cuando el email no existe', async () => {
      const usuarioCreado = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      (repo.create   as jest.Mock).mockReturnValue(usuarioCreado);
      (repo.save     as jest.Mock).mockResolvedValue(usuarioCreado);

      const resultado = await service.crear(dto);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(resultado.email).toBe(dto.email);
    });

    it('debe lanzar ConflictException cuando el email ya existe', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockUsuario());

      await expect(service.crear(dto)).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('debe guardar la contraseña hasheada, no en texto plano', async () => {
      const usuarioCreado = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      (repo.create   as jest.Mock).mockImplementation((data) => ({ ...data }));
      (repo.save     as jest.Mock).mockImplementation((u) => Promise.resolve(u));

      await service.crear(dto);

      const llamada = (repo.create as jest.Mock).mock.calls[0][0];
      expect(llamada.password).not.toBe(dto.password);
      expect(llamada.password.startsWith('$2b$')).toBe(true);
    });
  });

  // ── buscarPorEmail ───────────────────────────────────────────────────────

  describe('buscarPorEmail', () => {
    it('debe retornar el usuario si existe y está activo', async () => {
      const usuario = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);

      const resultado = await service.buscarPorEmail('ana@clinica.com');
      expect(resultado).toEqual(usuario);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: 'ana@clinica.com', activo: true },
      });
    });

    it('debe retornar null si el usuario no existe', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const resultado = await service.buscarPorEmail('noexiste@test.com');
      expect(resultado).toBeNull();
    });
  });

  // ── buscarPorId ──────────────────────────────────────────────────────────

  describe('buscarPorId', () => {
    it('debe retornar el usuario si existe', async () => {
      const usuario = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);

      const resultado = await service.buscarPorId('uuid-test-001');
      expect(resultado).toEqual(usuario);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.buscarPorId('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  // ── actualizar ───────────────────────────────────────────────────────────

  describe('actualizar', () => {
    it('debe actualizar nombre y apellido correctamente', async () => {
      const usuario = mockUsuario();
      const dto = { nombre: 'Ana María', apellido: 'López' };
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);
      (repo.save    as jest.Mock).mockResolvedValue({ ...usuario, ...dto });

      const resultado = await service.actualizar('uuid-test-001', dto);
      expect(resultado.nombre).toBe('Ana María');
      expect(repo.save).toHaveBeenCalled();
    });

    it('debe hashear la contraseña cuando se actualiza', async () => {
      const usuario = mockUsuario();
      const dto = { password: 'NuevaClave456' };
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);
      (repo.save    as jest.Mock).mockImplementation((u) => Promise.resolve(u));

      await service.actualizar('uuid-test-001', dto);

      const guardado = (repo.save as jest.Mock).mock.calls[0][0];
      expect(guardado.password).not.toBe('NuevaClave456');
      expect(guardado.password.startsWith('$2b$')).toBe(true);
    });
  });

  // ── desactivar ───────────────────────────────────────────────────────────

  describe('desactivar', () => {
    it('debe setear activo=false (borrado lógico)', async () => {
      const usuario = mockUsuario();
      (repo.findOne as jest.Mock).mockResolvedValue(usuario);
      (repo.save    as jest.Mock).mockResolvedValue({ ...usuario, activo: false });

      await service.desactivar('uuid-test-001');

      const guardado = (repo.save as jest.Mock).mock.calls[0][0];
      expect(guardado.activo).toBe(false);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.desactivar('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  // ── listarTodos ──────────────────────────────────────────────────────────

  describe('listarTodos', () => {
    it('debe retornar datos paginados correctamente', async () => {
      const usuarios = [mockUsuario(), { ...mockUsuario(), id: 'uuid-002' }];
      const queryBuilder: any = {
        where:           jest.fn().mockReturnThis(),
        skip:            jest.fn().mockReturnThis(),
        take:            jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([usuarios, 2]),
      };
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilder);

      const resultado = await service.listarTodos(1, 10);

      expect(resultado.total).toBe(2);
      expect(resultado.data).toHaveLength(2);
      expect(resultado.pagina).toBe(1);
      expect(resultado.limite).toBe(10);
    });

    it('debe aplicar filtro por rol cuando se proporciona', async () => {
      const queryBuilder: any = {
        where:           jest.fn().mockReturnThis(),
        skip:            jest.fn().mockReturnThis(),
        take:            jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUsuario()], 1]),
      };
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(queryBuilder);

      await service.listarTodos(1, 10, 'PSICOLOGO');

      expect(queryBuilder.where).toHaveBeenCalledWith('u.rol = :rol', { rol: 'PSICOLOGO' });
    });
  });
});