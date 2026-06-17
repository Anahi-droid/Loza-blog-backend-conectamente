import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity'; // Ajusta la ruta a tu entidad real si varía

// ── Mocks ─────────────────────────────────────────────────────────────────
const mockUsuarioRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

// ── Suite ─────────────────────────────────────────────────────────────────
describe('UsuariosService', () => {
  let service: UsuariosService;
  let repository: ReturnType<typeof mockUsuarioRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          // Si usas TypeORM puro, getRepositoryToken(Usuario) genera el token "UsuarioRepository" automáticamente
          provide: getRepositoryToken(Usuario), 
          useFactory: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    repository = module.get(getRepositoryToken(Usuario));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});