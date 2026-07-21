import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recomendacion } from './recomendacion.entity';
import { Progreso } from '../progreso/progreso.entity'; 
import { Paciente } from '../pacientes/paciente.entity';
import { CreateRecomendacionDto } from './dto/create-recomendacione.dto';
import { UpdateRecomendacionDto } from './dto/update-recomendacione.dto';

@Injectable()
export class RecomendacionesService {
  constructor(
    @InjectRepository(Recomendacion)
    private readonly recomendacionRepository: Repository<Recomendacion>,
    @InjectRepository(Progreso)
    private readonly progresoRepository: Repository<Progreso>,
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
  ) {}


  async create(createRecomendacionDto: CreateRecomendacionDto, psicologoId: string): Promise<Recomendacion> {
    const nuevaRecomendacion = this.recomendacionRepository.create({
      fecha: createRecomendacionDto.fecha,
      titulo: createRecomendacionDto.titulo,
      descripcion: createRecomendacionDto.descripcion,
      paciente: createRecomendacionDto.pacienteId ? { id: String(createRecomendacionDto.pacienteId) } : undefined,
      psicologo: { id: psicologoId }, 
    });
    return await this.recomendacionRepository.save(nuevaRecomendacion);
  }

  async findAll(usuarioId?: string, rol?: string): Promise<Recomendacion[]> {
    // Si no se proporciona usuario, retornar todas (para admin)
    if (!usuarioId || !rol) {
      return await this.recomendacionRepository.find({
        relations: { paciente: true, psicologo: { usuario: true } },
      });
    }

    if (rol === 'ADMIN') {
      return await this.recomendacionRepository.find({
        relations: { paciente: true, psicologo: { usuario: true } },
      });
    }

    if (rol === 'PSICOLOGO') {
      return await this.recomendacionRepository
        .createQueryBuilder('recomendacion')
        .leftJoinAndSelect('recomendacion.paciente', 'paciente')
        .leftJoinAndSelect('recomendacion.psicologo', 'psicologo')
        .leftJoinAndSelect('psicologo.usuario', 'usuario')
        .where('recomendacion.psicologo_id = :psicologoId', { psicologoId: usuarioId })
        .getMany();
    }

    if (rol === 'PACIENTE') {
      // 🎯 Carga limpia con la sub-relación psicologo.usuario para traer el nombre del profesional
      return await this.recomendacionRepository.find({
        where: { paciente: { id: usuarioId } },
        relations: { paciente: true, psicologo: { usuario: true } },
      });
    }

    return [];
  }

  async findOne(id: string): Promise<Recomendacion> {
    const recomendacion = await this.recomendacionRepository.findOne({
      where: { id },
      relations: { paciente: true, psicologo: { usuario: true } },
    });
    if (!recomendacion) throw new NotFoundException(`Recomendación con ID ${id} no encontrada`);
    return recomendacion;
  }

  async findByPaciente(pacienteId: string, usuarioId?: string, rol?: string): Promise<Recomendacion[]> {
    if (usuarioId && rol) {
      if (rol === 'PACIENTE') {
        if (pacienteId !== usuarioId) {
          throw new ForbiddenException('No tienes permiso para ver las recomendaciones de este paciente');
        }
      } else if (rol === 'PSICOLOGO') {
        const paciente = await this.pacienteRepository.findOne({
          where: { 
            id: pacienteId,
            psicologo: { usuario: { id: usuarioId } }
          },
          relations: { psicologo: true }
        });

        if (!paciente) {
          throw new ForbiddenException('No tienes permiso para ver las recomendaciones de este paciente');
        }
      }
    }

    return await this.recomendacionRepository.find({
      where: { paciente: { id: pacienteId } },
      relations: { psicologo: { usuario: true }, paciente: true }, 
    });
  }

  async update(id: string, updateRecomendacionDto: UpdateRecomendacionDto): Promise<Recomendacion> {
    const recomendacion = await this.findOne(id);
    
    const recomendacionPreld = this.recomendacionRepository.create({
      ...recomendacion,
      ...updateRecomendacionDto,
      paciente: updateRecomendacionDto.pacienteId ? { id: String(updateRecomendacionDto.pacienteId) } : recomendacion.paciente,
    });

    return await this.recomendacionRepository.save(recomendacionPreld);
  }

  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    const recomendacion = await this.findOne(id);
    await this.recomendacionRepository.remove(recomendacion);
    return { deleted: true, id };
  }


  async createProgreso(historialId: string, fecha: Date, estadoEmocional: string, avance: string, observaciones: string): Promise<Progreso> {
    const nuevoProgreso = this.progresoRepository.create({
      fecha,
      estadoEmocional,
      avance,
      observaciones,
      historial: { id: historialId }
    });
    return await this.progresoRepository.save(nuevoProgreso);
  }

  async findAllProgresos(): Promise<Progreso[]> {
    return await this.progresoRepository.find({
      relations: { historial: true }
    });
  }

  async findOneProgreso(id: string): Promise<Progreso> {
    const progreso = await this.progresoRepository.findOne({
      where: { id },
      relations: { historial: true }
    });
    if (!progreso) throw new NotFoundException(`Registro de progreso con ID ${id} no encontrado.`);
    return progreso;
  }

  async updateProgreso(id: string, estadoEmocional?: string, avance?: string, observaciones?: string): Promise<Progreso> {
    const progreso = await this.findOneProgreso(id);
    if (estadoEmocional !== undefined) progreso.estadoEmocional = estadoEmocional;
    if (avance !== undefined) progreso.avance = avance;
    if (observaciones !== undefined) progreso.observaciones = observaciones;
    return await this.progresoRepository.save(progreso);
  }

  async removeProgreso(id: string): Promise<{ deleted: boolean; id: string }> {
    const progreso = await this.findOneProgreso(id);
    await this.progresoRepository.remove(progreso);
    return { deleted: true, id };
  }
}