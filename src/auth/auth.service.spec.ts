import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsuariosService = {
    crear: jest.fn(),
    buscarPorEmail: jest.fn(),
    comparePasswords: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: mockUsuariosService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe registrar un usuario y retornar los datos sin password', async () => {
      const dto = { email: 'test@correo.com', password: 'password123', nombre: 'Andres', apellido: 'Jurado' };
      const usuarioCreado = { id: '1', ...dto, rol: 'PACIENTE' };
      
      mockUsuariosService.crear.mockResolvedValue(usuarioCreado);

      const resultado = await service.register(dto);

      expect(mockUsuariosService.crear).toHaveBeenCalledWith({ ...dto, rol: 'PACIENTE' });
      expect(resultado).not.toHaveProperty('password');
      expect(resultado.email).toBe(dto.email);
    });
  });

  describe('login', () => {
    it('debe lanzar UnauthorizedException si las credenciales están vacías', async () => {
      await expect(service.login({ email: '', password: '' })).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUsuariosService.buscarPorEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'noexiste@correo.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
    });

    it('debe retornar un accessToken si las credenciales son válidas', async () => {
      const dto = { email: 'test@correo.com', password: 'password123' };
      const usuarioMock = { id: '1', email: dto.email, password: 'hashed_password', rol: 'PACIENTE', perfilPsicologo: null };

      mockUsuariosService.buscarPorEmail.mockResolvedValue(usuarioMock);
      mockUsuariosService.comparePasswords.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt_token_exitoso');

      const resultado = await service.login(dto);

      expect(resultado).toEqual({ accessToken: 'jwt_token_exitoso' });
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });
});