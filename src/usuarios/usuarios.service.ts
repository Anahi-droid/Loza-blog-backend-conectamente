import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita } from '../citas/cita.entity';
import { Agenda } from '../agenda/agenda.entity';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private citaRepository: Repository<Cita>,
    @InjectRepository(Agenda)
    private agendaRepository: Repository<Agenda>,
  ) {}

  async agendarCita(pacienteId: string, agendaId: string, motivo: string): Promise<Cita> {
    // 1. Verificar si el bloque de agenda existe y traer la relación del psicólogo
    const agenda = await this.agendaRepository.findOne({
      where: { id: agendaId },
      relations: ['psicologo'],
    });

    if (!agenda) {
      throw new NotFoundException('El horario seleccionado no existe.');
    }

    if (agenda.estaReservado) {
      throw new BadRequestException('Este horario ya ha sido reservado.');
    }

    
    agenda.estaReservado = true;
    await this.agendaRepository.save(agenda);

    
    const nuevaCita = this.citaRepository.create({
      fechaHora: agenda.fechaHoraInicio,
      motivoConsulta: motivo,
      paciente: { id: pacienteId }, 
      psicologo: agenda.psicologo,
      estado: 'PENDIENTE',
    });

    return await this.citaRepository.save(nuevaCita);
  }

  
  async listarMisCitas(usuarioId: string, rol: string): Promise<Cita[]> {
    if (rol === 'PSICOLOGO') {
      return await this.citaRepository.find({
        where: { psicologo: { usuario: { id: usuarioId } } },
        relations: ['paciente'],
        order: { fechaHora: 'DESC' },
      });
    } else {
      return await this.citaRepository.find({
        where: { paciente: { id: usuarioId } },
        relations: ['psicologo', 'psicologo.usuario'],
        order: { fechaHora: 'DESC' },
      });
    }
  }
}