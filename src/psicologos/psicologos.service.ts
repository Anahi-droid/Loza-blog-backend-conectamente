import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Psicologo } from '../psicologos/psicologo.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class PsicologosService {
  constructor(
    @InjectRepository(Psicologo)
    private psicologoRepository: Repository<Psicologo>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  
  async crearPerfil(usuarioId: string, datosProf: Partial<Psicologo>): Promise<Psicologo> {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId, rol: 'PSICOLOGO' } });
    
    if (!usuario) {
      throw new NotFoundException('El usuario no existe o no tiene el rol de PSICOLOGO.');
    }

    const nuevoPsicologo = this.psicologoRepository.create({
      ...datosProf,
      usuario,
    });

    return await this.psicologoRepository.save(nuevoPsicologo);
  }


  async listarTodos(): Promise<Psicologo[]> {
    return await this.psicologoRepository.find({
      relations: ['usuario'],
      where: { usuario: { activo: true } }
    });
  }
}