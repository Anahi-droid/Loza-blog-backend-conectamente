import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita } from '../citas/cita.entity';
import { Agenda } from '../agenda/agenda.entity';
import { Pago } from './pago.entity';
import { SesionClinica } from './sesion-clinica.entity';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private citaRepository: Repository<Cita>,
    @InjectRepository(Agenda)
    private agendaRepository: Repository<Agenda>,
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    @InjectRepository(SesionClinica)
    private sesionRepository: Repository<SesionClinica>,
  ) {}

  async agendarCita(pacienteId: string, agendaId: string, motivo: string): Promise<Cita> {
    const agenda = await this.agendaRepository.findOne({
      where: { id: agendaId },
      relations: { psicologo: true },
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

    const citaGuardada = await this.citaRepository.save(nuevaCita);

    const nuevoPago = this.pagoRepository.create({
      monto: 35.00,
      estado: 'PENDIENTE',
      cita: citaGuardada
    });
    await this.pagoRepository.save(nuevoPago);

    const nuevaSesion = this.sesionRepository.create({
      motivoEvolucion: 'Cita agendada - Esperando sesión',
      notasPrivadas: 'Ninguna nota ingresada por el profesional',
      cita: citaGuardada
    });
    await this.sesionRepository.save(nuevaSesion);

    return citaGuardada;
  }

  async listarMisCitas(usuarioId: string, rol: string): Promise<Cita[]> {
    if (rol === 'PSICOLOGO') {
      return await this.citaRepository.find({
        where: { psicologo: { usuario: { id: usuarioId } } },
        relations: { 
          paciente: true,
          psicologo: { usuario: true } 
        },
        order: { fechaHora: 'DESC' },
      });
    } else {
      return await this.citaRepository.find({
        where: { paciente: { id: usuarioId } },
        relations: { psicologo: { usuario: true } },
        order: { fechaHora: 'DESC' },
      });
    }
  }
}