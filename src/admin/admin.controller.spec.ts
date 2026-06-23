import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsuariosService } from '../usuarios/usuarios.service';

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockUsuariosService = () => ({
  crear:       jest.fn(),
  listarTodos: jest.fn(),
  desactivar:  jest.fn(),
});

const mockPsicologo = {
  id:            'uuid-psico-001',
  email:         'psicologo@clinica.com',
  password:      'hashed_pass',
  nombre:        'Laura',
  apellido:      'Vega',
  rol:           'PSICOLOGO',
  activo:        true,
  creadoEn:      new Date(),
  actualizadoEn: new Date(),
};

// ── Suite ─────────────────────────────────────────────────────────────────

describe('AdminService', () => {
  let service: AdminService;
  let usuariosService: ReturnType<typeof mockUsuariosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UsuariosService, useFactory: mockUsuariosService },
      ],
    }).compile();

    service         = module.get<AdminService>(AdminService);
    usuariosService = module.get(UsuariosService);
  });

  // ── crearStaff ────────────────────────────────────────────────────────────

  describe('crearStaff', () => {
    const dto = {
      email:    'psicologo@clinica.com',
      password: 'StaffPass123',
      nombre:   'Laura',
      apellido: 'Vega',
      rol:      'PSICOLOGO' as const,
    };

    it('debe crear el personal y retornar la respuesta sin password', async () => {
      usuariosService.crear.mockResolvedValue(mockPsicologo);

      const resultado = await service.crearStaff(dto);

      expect(usuariosService.crear).toHaveBeenCalledWith(dto);
      expect(resultado).not.toHaveProperty('password');
      expect(resultado).toHaveProperty('rol', 'PSICOLOGO');
    });

    it('debe permitir crear un usuario con rol ADMIN', async () => {
      const adminDto = { ...dto, rol: 'ADMIN' as const };
      const mockAdmin = { ...mockPsicologo, rol: 'ADMIN' };
      usuariosService.crear.mockResolvedValue(mockAdmin);

      const resultado = await service.crearStaff(adminDto);

      expect(resultado.rol).toBe('ADMIN');
    });

    it('no debe exponer la password en ningún escenario', async () => {
      usuariosService.crear.mockResolvedValue(mockPsicologo);

      const resultado = await service.crearStaff(dto);

      expect(Object.keys(resultado)).not.toContain('password');
    });
  });

  // ── listarUsuarios ────────────────────────────────────────────────────────

  describe('listarUsuarios', () => {
    const paginado = {
      data:   [mockPsicologo],
      total:  1,
      pagina: 1,
      limite: 10,
    };

    it('debe usar valores por defecto (pagina=1, limite=10) cuando no se pasan filtros', async () => {
      usuariosService.listarTodos.mockResolvedValue(paginado);

      await service.listarUsuarios({});

      expect(usuariosService.listarTodos).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('debe pasar correctamente pagina, limite y rol al servicio de usuarios', async () => {
      usuariosService.listarTodos.mockResolvedValue(paginado);

      await service.listarUsuarios({ pagina: 2, limite: 5, rol: 'PSICOLOGO' });

      expect(usuariosService.listarTodos).toHaveBeenCalledWith(2, 5, 'PSICOLOGO');
    });

    it('debe retornar la estructura paginada correcta', async () => {
      usuariosService.listarTodos.mockResolvedValue(paginado);

      const resultado = await service.listarUsuarios({ pagina: 1, limite: 10 });

      expect(resultado).toHaveProperty('data');
      expect(resultado).toHaveProperty('total');
      expect(resultado).toHaveProperty('pagina');
      expect(resultado).toHaveProperty('limite');
    });
  });

  // ── darDeBaja ─────────────────────────────────────────────────────────────

  describe('darDeBaja', () => {
    it('debe invocar desactivar con el id correcto', async () => {
      usuariosService.desactivar.mockResolvedValue(undefined);

      await service.darDeBaja('uuid-psico-001');

      expect(usuariosService.desactivar).toHaveBeenCalledWith('uuid-psico-001');
      expect(usuariosService.desactivar).toHaveBeenCalledTimes(1);
    });

    it('debe retornar un mensaje de confirmación con el id', async () => {
      usuariosService.desactivar.mockResolvedValue(undefined);

      const resultado = await service.darDeBaja('uuid-psico-001');

      expect(resultado).toHaveProperty('mensaje');
      expect(resultado.mensaje).toContain('uuid-psico-001');
    });

    it('debe propagar NotFoundException si el id no existe', async () => {
      usuariosService.desactivar.mockRejectedValue(
        new NotFoundException('Usuario con id id-falso no encontrado'),
      );

      await expect(service.darDeBaja('id-falso')).rejects.toThrow(NotFoundException);
    });
  });
});