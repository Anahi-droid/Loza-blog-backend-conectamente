import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  const mockUsuariosService = {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarTodos: jest.fn(),
    actualizar: jest.fn(),
    desactivar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        { provide: UsuariosService, useValue: mockUsuariosService },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe invocar a usuariosService.crear y retornar el nuevo usuario', async () => {
      const dto = { email: 'andres@correo.com', password: 'password123', nombre: 'Andres', apellido: 'Jurado' };
      const resultadoMock = { id: 'uuid-1', email: dto.email, nombre: dto.nombre, apellido: dto.apellido, activo: true };
      
      mockUsuariosService.crear.mockResolvedValue(resultadoMock);

      const resultado = await controller.create(dto);

      expect(mockUsuariosService.crear).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(resultadoMock);
    });
  });

  describe('findOne', () => {
    it('debe invocar a usuariosService.buscarPorId y retornar el usuario correspondiente', async () => {
      const usuarioMock = { id: 'uuid-123', email: 'test@correo.com', nombre: 'Test', activo: true };
      mockUsuariosService.buscarPorId.mockResolvedValue(usuarioMock);

      const resultado = await controller.findOne('uuid-123');

      expect(mockUsuariosService.buscarPorId).toHaveBeenCalledWith('uuid-123');
      expect(resultado).toEqual(usuarioMock);
    });
  });

  describe('remove', () => {
    it('debe desactivar al usuario y retornar el mensaje de éxito estructurado', async () => {
      mockUsuariosService.desactivar.mockResolvedValue(undefined);

      const resultado = await controller.remove('uuid-123');

      expect(mockUsuariosService.desactivar).toHaveBeenCalledWith('uuid-123');
      expect(resultado).toEqual({ message: 'Usuario con id uuid-123 desactivado correctamente.' });
    });
  });
});