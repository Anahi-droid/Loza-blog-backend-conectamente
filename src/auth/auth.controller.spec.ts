import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe invocar a authService.register y retornar el usuario creado con éxito', async () => {
      const dto = { email: 'andres@correo.com', password: 'password123', nombre: 'Andres', apellido: 'Jurado' };
      const resultadoMock = { id: 'uuid-123', email: dto.email, nombre: dto.nombre, apellido: dto.apellido, rol: 'PACIENTE' };
      
      mockAuthService.register.mockResolvedValue(resultadoMock);

      const resultado = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(resultadoMock);
    });
  });

  describe('login', () => {
    it('debe invocar a authService.login y retornar el accessToken con éxito', async () => {
      const dto = { email: 'andres@correo.com', password: 'password123' };
      const tokenMock = { accessToken: 'jwt_token_simulado' };
      
      mockAuthService.login.mockResolvedValue(tokenMock);

      const resultado = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(tokenMock);
    });
  });
});