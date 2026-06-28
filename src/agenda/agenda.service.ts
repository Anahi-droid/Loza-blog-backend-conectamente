import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agenda } from './agenda.entity';
import { DisponibilidadExcepcion } from '../psicologos/disponibilidad-excepcion.entity'; 

@Injectable()
export class AgendasService {
  constructor(
    @InjectRepository(Agenda)
    private readonly agendaRepository: Repository<Agenda>,
    @InjectRepository(DisponibilidadExcepcion)
    private readonly excepcionRepository: Repository<DisponibilidadExcepcion>,
  ) {}

  async verificarExcepcion(psicologoId: string, fechaDeseada: Date): Promise<boolean> {
    const excepcionBloqueante = await this.excepcionRepository.createQueryBuilder('excepcion')
      .where('excepcion.psicologo_id = :psicologoId', { psicologoId })
      .andWhere(':fecha >= excepcion.fechaInicio AND :fecha <= excepcion.fechaFin', { fecha: fechaDeseada })
      .getOne();

    if (excepcionBloqueante) {
      throw new BadRequestException(
        `El psicólogo no está disponible en este horario. Motivo: ${excepcionBloqueante.motivo}`
      );
    }
    return true;
  }

  async crearDisponibilidad(psicologoId: string, fechaHora: Date): Promise<Agenda> {
    await this.verificarExcepcion(psicologoId, fechaHora);

    const existe = await this.agendaRepository.findOne({
      where: {
        psicologo: { id: psicologoId },
        fechaHoraInicio: fechaHora,
      },
    });

    if (existe) {
      throw new ConflictException('Ya registraste disponibilidad para esta fecha y hora.');
    }

    const bloque = this.agendaRepository.create({
      fechaHoraInicio: fechaHora,
      psicologo: { id: psicologoId },
    });

    return await this.agendaRepository.save(bloque);
  }

  async obtenerDisponiblesPorPsicologo(psicologoId: string): Promise<Agenda[]> {
    return await this.agendaRepository.find({
      where: {
        psicologo: { id: psicologoId },
        estaReservado: false,
      },
      order: { fechaHoraInicio: 'ASC' },
    });
  }

  async actualizarDisponibilidad(
    agendaId: string, 
    psicologoId: string, 
    nuevaFecha?: Date, 
    estaReservado?: boolean
  ) {
    const agenda = await this.agendaRepository.findOne({
      where: { id: agendaId, psicologo: { id: psicologoId } }
    });

    if (!agenda) {
      throw new NotFoundException('El bloque de agenda no existe o no tienes autorización.');
    }

    if (nuevaFecha !== undefined) agenda.fechaHoraInicio = nuevaFecha;
    if (estaReservado !== undefined) agenda.estaReservado = estaReservado;

    return this.agendaRepository.save(agenda);
  }

  async eliminarDisponibilidad(agendaId: string, psicologoId: string): Promise<void> {
    const agenda = await this.agendaRepository.findOne({
      where: { id: agendaId, psicologo: { id: psicologoId } }
    });

    if (!agenda) {
      throw new NotFoundException('El bloque de agenda no existe o no tienes autorización.');
    }
    if (agenda.estaReservado) {
      throw new BadRequestException('No se puede eliminar un horario que ya se encuentra reservado.');
    }

    await this.agendaRepository.remove(agenda);
  }

  async listarTodasLasAgendas(): Promise<Agenda[]> {
    return await this.agendaRepository.find({
      relations: { psicologo: true },
      order: { fechaHoraInicio: 'DESC' }
    });
  }

  async buscarPorId(id: string): Promise<Agenda | null> {
    if (!id) return null;
    return await this.agendaRepository.findOne({
      where: { id },
      relations: { psicologo: true }
    });
  }
}