import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminService = {
    crearStaff: jest.fn(),
    listarUsuarios: jest.fn(),
    darDeBaja: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    jest.clearAllMocks();
  });

  describe('crearStaff', () => {
    it('debe invocar adminService.crearStaff con el DTO enviado', async () => {
      const dto = { email: 'test@ute.com', password: '123', nombre: 'Anahi Loza', rol: 'PSICOLOGO' };
      mockAdminService.crearStaff.mockResolvedValue({ id: 'staff-1', email: dto.email });

      const res = await controller.crearStaff(dto as any);

      expect(mockAdminService.crearStaff).toHaveBeenCalledWith(dto);
      expect(res).toHaveProperty('id', 'staff-1');
    });
  });

  describe('listarUsuarios', () => {
    it('debe castear las strings de la query a tipos numéricos correctos', async () => {
      mockAdminService.listarUsuarios.mockResolvedValue([]);

      await controller.listarUsuarios('2', '15', 'PACIENTE');

      expect(mockAdminService.listarUsuarios).toHaveBeenCalledWith({
        pagina: 2,
        limite: 15,
        rol: 'PACIENTE',
      });
    });
  });

  describe('darDeBaja', () => {
    it('debe llamar al servicio para desactivar al usuario por id', async () => {
      mockAdminService.darDeBaja.mockResolvedValue({ mensaje: 'Desactivado' });

      const res = await controller.darDeBaja('uuid-1');

      expect(mockAdminService.darDeBaja).toHaveBeenCalledWith('uuid-1');
      expect(res).toEqual({ mensaje: 'Desactivado' });
    });
  });
});