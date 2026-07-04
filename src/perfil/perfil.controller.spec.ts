import { Test, TestingModule } from '@nestjs/testing';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const USUARIO_ID = '33333333-3333-3333-3333-333333333333';

describe('PerfilController', () => {
  let controller: PerfilController;
  let service: PerfilService;

  const mockPerfilService = {
    obtenerPerfil: jest.fn(),
    crearPerfil: jest.fn(),
    actualizarPerfil: jest.fn(),
    eliminarPerfil: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfilController],
      providers: [
        {
          provide: PerfilService,
          useValue: mockPerfilService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PerfilController>(PerfilController);
    service = module.get<PerfilService>(PerfilService);
  });

  it('debería estar definido el controlador de perfil', () => {
    expect(controller).toBeDefined();
  });

  describe('obtenerPerfil (Mismo Usuario Autenticado)', () => {
    it('debería extraer el id del objeto req.user e invocar al servicio', async () => {
      const mockRequest: any = { user: { id: USUARIO_ID, email: 'test@test.com', rol: 'PACIENTE' } };
      const mockResponse = { id: USUARIO_ID, nombre: 'Juan' };

      mockPerfilService.obtenerPerfil.mockResolvedValue(mockResponse);

      const result = await controller.obtenerPerfil(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(service.obtenerPerfil).toHaveBeenCalledWith(USUARIO_ID);
    });
  });

  describe('obtenerPorId', () => {
    it('debería invocar a obtenerPerfil enviando el id recibido por parámetro', async () => {
      const mockResponse = { id: USUARIO_ID, nombre: 'Juan' };
      mockPerfilService.obtenerPerfil.mockResolvedValue(mockResponse);

      const result = await controller.obtenerPorId(USUARIO_ID);

      expect(result).toEqual(mockResponse);
      expect(service.obtenerPerfil).toHaveBeenCalledWith(USUARIO_ID);
    });
  });

  describe('crearPerfil', () => {
    it('debería invocar a service.crearPerfil mandando el DTO', async () => {
      const dto = { nombre: 'Lucas', apellido: 'Díaz', email: 'lucas@test.com', password: 'securePassword' };
      const mockResponse = { id: USUARIO_ID, nombre: 'Lucas' };

      mockPerfilService.crearPerfil.mockResolvedValue(mockResponse);

      const result = await controller.crearPerfil(dto);

      expect(result).toEqual(mockResponse);
      expect(service.crearPerfil).toHaveBeenCalledWith(dto);
    });
  });

  describe('actualizarPerfil', () => {
    it('debería actualizar el perfil ocupando el id de la sesión req.user', async () => {
      const mockRequest: any = { user: { id: USUARIO_ID } };
      const dto = { nombre: 'Lucas Editado' };
      const mockResponse = { id: USUARIO_ID, nombre: 'Lucas Editado' };

      mockPerfilService.actualizarPerfil.mockResolvedValue(mockResponse);

      const result = await controller.actualizarPerfil(mockRequest, dto);

      expect(result).toEqual(mockResponse);
      expect(service.actualizarPerfil).toHaveBeenCalledWith(USUARIO_ID, dto);
    });
  });

  describe('eliminarPerfil', () => {
    it('debería llamar al borrado/desactivación usando el id de req.user', async () => {
      const mockRequest: any = { user: { id: USUARIO_ID } };
      mockPerfilService.eliminarPerfil.mockResolvedValue(undefined);

      await controller.eliminarPerfil(mockRequest);

      expect(service.eliminarPerfil).toHaveBeenCalledWith(USUARIO_ID);
      expect(service.eliminarPerfil).toHaveBeenCalledTimes(1);
    });
  });
});