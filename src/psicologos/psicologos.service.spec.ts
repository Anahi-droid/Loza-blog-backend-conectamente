import { Test, TestingModule } from '@nestjs/testing';
import { PsicologosService } from './psicologos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Psicologo } from './psicologo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { NotFoundException } from '@nestjs/common';

describe('PsicologosService', () => {
  let service: PsicologosService;

  const mockPsicologoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockUsuarioRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PsicologosService,
        {
          provide: getRepositoryToken(Psicologo),
          useValue: mockPsicologoRepository,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<PsicologosService>(PsicologosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearPerfil', () => {
    it('debe lanzar NotFoundException si el usuario no existe o no es un PSICOLOGO', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(
        service.crearPerfil('user-123', { numColegiatura: 'COL-999' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe crear con éxito el perfil médico si el usuario cumple con el rol de PSICOLOGO', async () => {
      const usuarioPsicologo = { id: 'user-123', rol: 'PSICOLOGO' };
      const datosPerfil = { numColegiatura: 'COL-123', especialidad: 'Clínica' };
      
      mockUsuarioRepository.findOne.mockResolvedValue(usuarioPsicologo);
      mockPsicologoRepository.create.mockReturnValue({ ...datosPerfil, usuario: usuarioPsicologo });
      mockPsicologoRepository.save.mockResolvedValue({ id: 'perfil-uuid', ...datosPerfil });

      const resultado = await service.crearPerfil('user-123', datosPerfil);
      
      expect(resultado).toHaveProperty('id');
      expect(mockPsicologoRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});