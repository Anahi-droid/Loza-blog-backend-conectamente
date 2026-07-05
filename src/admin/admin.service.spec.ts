import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UsuariosService } from '../usuarios/usuarios.service';

describe('AdminService', () => {
  let service: AdminService;

  const mockUsuariosService = {
    crear: jest.fn(),
    listarTodos: jest.fn(),
    desactivar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UsuariosService, useValue: mockUsuariosService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('crearStaff', () => {
    it('debe crear un usuario interno y retornar el resultado omitiendo la contraseña', async () => {
      const dto = { email: 'admin@UTE.edu.ec', password: '123', nombre: 'Hernan Varas', rol: 'ADMIN' };
      const usuarioMock = { id: 'u-1', ...dto };
      mockUsuariosService.crear.mockResolvedValue(usuarioMock);

      const resultado = await service.crearStaff(dto as any);

      expect(mockUsuariosService.crear).toHaveBeenCalledWith(dto);
      expect(resultado).not.toHaveProperty('password');
      expect(resultado).toHaveProperty('id', 'u-1');
    });
  });

  describe('listarUsuarios', () => {
    it('debe llamar a usuariosService.listarTodos pasando los filtros paginados', async () => {
      mockUsuariosService.listarTodos.mockResolvedValue([]);
      
      const resultado = await service.listarUsuarios({ pagina: 2, limite: 5, rol: 'PSICOLOGO' });

      expect(mockUsuariosService.listarTodos).toHaveBeenCalledWith(2, 5, 'PSICOLOGO');
      expect(resultado).toEqual([]);
    });
  });

  describe('darDeBaja', () => {
    it('debe ejecutar la desactivación lógica y retornar un mensaje de éxito', async () => {
      mockUsuariosService.desactivar.mockResolvedValue(undefined);

      const resultado = await service.darDeBaja('uuid-user');

      expect(mockUsuariosService.desactivar).toHaveBeenCalledWith('uuid-user');
      expect(resultado).toEqual({ mensaje: 'Usuario uuid-user desactivado correctamente' });
    });
  });
});