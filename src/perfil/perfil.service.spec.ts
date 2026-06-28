import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { UsuariosService } from '../usuarios/usuarios.service';

// ── Mocks ─────────────────────────────────────────────────────────────────
const mockUsuariosService = () => ({
  buscarPorId: jest.fn(),
  actualizar:  jest.fn(),
});

const usuarioCompleto = {
  id:            'uuid-perfil-001',
  email:         'carlos@clinica.com',
  password:      'hashed_pass_oculta',
  nombre:        'Carlos',
  apellido:      'Méndez',
  rol:           'PACIENTE',
  activo:        true,
  creadoEn:      new Date(),
  actualizadoEn: new Date(),
};

// ── Suite ─────────────────────────────────────────────────────────────────
describe('PerfilService', () => {
  let service: PerfilService;
  let usuariosService: ReturnType<typeof mockUsuariosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilService,
        // ESTA ES LA PIEZA CLAVE QUE LE FALTA A TU COMPILADOR:
        { provide: UsuariosService, useFactory: mockUsuariosService },
      ],
    }).compile();

    service         = module.get<PerfilService>(PerfilService);
    usuariosService = module.get(UsuariosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── obtenerPerfil ─────────────────────────────────────────────────────────
  describe('obtenerPerfil', () => {
    it('debe retornar el perfil sin el campo password', async () => {
      usuariosService.buscarPorId.mockResolvedValue(usuarioCompleto);
      const resultado = await service.obtenerPerfil('uuid-perfil-001');

      expect(resultado).not.toHaveProperty('password');
      expect(resultado).toHaveProperty('email', 'carlos@clinica.com');
    });

    it('debe propagar NotFoundException si el usuario no existe', async () => {
      usuariosService.buscarPorId.mockResolvedValue(null);
      await expect(service.obtenerPerfil('id-fantasma')).rejects.toThrow(NotFoundException);
    });
  });
});