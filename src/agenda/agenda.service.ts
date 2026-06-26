import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agenda } from './agenda.entity';

@Injectable()
export class AgendasService {
  constructor(
    @InjectRepository(Agenda)
    private agendaRepository: Repository<Agenda>,
  ) {}

  
  async crearDisponibilidad(psicologoId: string, fechaHora: Date): Promise<Agenda> {
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
}