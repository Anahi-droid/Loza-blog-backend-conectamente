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
      const dto = { email: 'test@correo.com', password: 'password123', nombre: 'Andres', apellido: 'Jurado', rol: 'PACIENTE' };
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

    it('debe lanzar UnauthorizedException si el usuario no existe o no tiene password', async () => {
      mockUsuariosService.buscarPorEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'noexiste@correo.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
    
      mockUsuariosService.buscarPorEmail.mockResolvedValue({ id: '1', email: 'sinclave@c.com', password: '' });
      await expect(service.login({ email: 'sinclave@c.com', password: 'password123' })).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña no coincide (Línea 41)', async () => {
      const dto = { email: 'test@correo.com', password: 'password_incorrecto' };
      const usuarioMock = { id: '1', email: dto.email, password: 'hashed_password' };

      mockUsuariosService.buscarPorEmail.mockResolvedValue(usuarioMock);
      mockUsuariosService.comparePasswords.mockResolvedValue(false); // Simula clave inválida

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
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

    it('debe extraer el psicologoId de forma correcta si el usuario tiene perfil de psicólogo', async () => {
      const dto = { email: 'psico@correo.com', password: 'password123' };
      const usuarioMock = { id: '2', email: dto.email, password: 'hashed_password', rol: 'PSICOLOGO', perfilPsicologo: { id: 'psico-uuid' } };

      mockUsuariosService.buscarPorEmail.mockResolvedValue(usuarioMock);
      mockUsuariosService.comparePasswords.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt_token_psico');

      const resultado = await service.login(dto);
      expect(resultado).toEqual({ accessToken: 'jwt_token_psico' });
    });
  });
});