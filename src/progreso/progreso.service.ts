import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progreso } from './progreso.entity';
import { CreateProgresoDto } from './dto/create-progreso.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto';

@Injectable()
export class ProgresoService {
  constructor(
    @InjectRepository(Progreso)
    private readonly progresoRepository: Repository<Progreso>,
  ) {}

  async create(createProgresoDto: CreateProgresoDto): Promise<Progreso> {
    const nuevoProgreso = this.progresoRepository.create({
      ...createProgresoDto,
      historial: { id: createProgresoDto.historialId },
    });
    return await this.progresoRepository.save(nuevoProgreso);
  }

  async findAll(): Promise<Progreso[]> {
    return await this.progresoRepository.find({
      relations: { historial: { paciente: true } },
    });
  }

  async findOne(id: string): Promise<Progreso> {
    const progreso = await this.progresoRepository.findOne({
      where: { id },
      relations: { historial: { paciente: true } },
    });
    if (!progreso) throw new NotFoundException(`Progreso con ID ${id} no encontrado`);
    return progreso;
  }

  // El id recibido aquí es el id del Usuario-paciente (Historial.paciente -> Usuario),
  // no el id propio del Historial.
  async findByPaciente(pacienteId: string): Promise<Progreso[]> {
    return await this.progresoRepository.find({
      where: { historial: { paciente: { id: pacienteId } } },
      relations: { historial: { paciente: true } },
      order: { fecha: 'ASC' },
    });
  }

  async update(id: string, updateProgresoDto: UpdateProgresoDto): Promise<Progreso> {
    const progreso = await this.findOne(id);
    const progresoEditado = this.progresoRepository.merge(progreso, {
      ...updateProgresoDto,
      ...(updateProgresoDto.historialId && { historial: { id: updateProgresoDto.historialId } })
    });

    return await this.progresoRepository.save(progresoEditado);
  }

  async remove(id: string): Promise<{ message: string }> {
    const progreso = await this.findOne(id);
    await this.progresoRepository.remove(progreso);
    return { message: `Progreso con ID ${id} eliminado exitosamente` };
  }

  // psicologoId: si viene, restringe las métricas a los pacientes de ese psicólogo
  // (rol PSICOLOGO). Cuando es undefined (rol ADMIN) se ven las métricas globales.
  async obtenerMetricasGenerales(psicologoId?: string): Promise<any> {
    const conAlcancePsicologo = (
      qb: ReturnType<Repository<Progreso>['createQueryBuilder']>,
    ) => {
      qb.leftJoin('progreso.historial', 'historial');
      if (psicologoId) {
        qb.leftJoin('historial.psicologo', 'psicologo').andWhere(
          'psicologo.id = :psicologoId',
          { psicologoId },
        );
      }
      return qb;
    };

    const totalProgresos = await conAlcancePsicologo(
      this.progresoRepository.createQueryBuilder('progreso'),
    ).getCount();

    const progresosUltimos30Dias = await conAlcancePsicologo(
      this.progresoRepository.createQueryBuilder('progreso'),
    )
      .andWhere('progreso.fecha >= :fecha', { fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) })
      .getCount();

    const porEstadoEmocional = await conAlcancePsicologo(
      this.progresoRepository.createQueryBuilder('progreso'),
    )
      .select('progreso.estadoEmocional', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('progreso.estadoEmocional')
      .orderBy('cantidad', 'DESC')
      .limit(5)
      .getRawMany();

    const ultimosProgresosQuery = this.progresoRepository
      .createQueryBuilder('progreso')
      .leftJoinAndSelect('progreso.historial', 'historial')
      .leftJoinAndSelect('historial.paciente', 'paciente')
      .orderBy('progreso.fecha', 'DESC')
      .take(10);
    if (psicologoId) {
      ultimosProgresosQuery
        .leftJoin('historial.psicologo', 'psicologo')
        .andWhere('psicologo.id = :psicologoId', { psicologoId });
    }
    const ultimosProgresos = await ultimosProgresosQuery.getMany();

    return {
      totalProgresos,
      progresosUltimos30Dias,
      porEstadoEmocional,
      ultimosProgresos,
    };
  }
}
