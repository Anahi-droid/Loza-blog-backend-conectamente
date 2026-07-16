import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita, EstadoCita } from '../citas/cita.entity';
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

  // 🚀 LISTAR CITAS SEGÚN EL ROL (Resuelve la petición del Frontend)
  async obtenerCitas(usuarioId: string, rol: string): Promise<Cita[]> {
    if (rol === 'ADMIN') {
      return await this.citaRepository.find({
        relations: { paciente: true, psicologo: true },
        order: { fechaHora: 'DESC' }
      });
    }

    if (rol === 'PSICOLOGO') {
      return await this.citaRepository.find({
        where: { psicologo: { id: usuarioId } },
        relations: { paciente: true, psicologo: true },
        order: { fechaHora: 'DESC' }
      });
    }

    // Si es PACIENTE
    return await this.citaRepository.find({
      where: { paciente: { id: usuarioId } },
      relations: { paciente: true, psicologo: true },
      order: { fechaHora: 'DESC' }
    });
  }

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
    });

    const citaGuardada = await this.citaRepository.save(nuevaCita);

    // Generar registro de pago por defecto
    const nuevoPago = this.pagoRepository.create({
      monto: 30.00, // Tarifa estándar
      estado: 'PENDIENTE',
      cita: citaGuardada,
    });
    await this.pagoRepository.save(nuevoPago);

    // Generar sesión clínica inicial vacía
    const nuevaSesion = this.sesionRepository.create({
      motivoEvolucion: motivo,
      cita: citaGuardada,
    });
    await this.sesionRepository.save(nuevaSesion);

    return citaGuardada;
  }

  async obtenerCitaPorId(id: string, usuarioId: string, rol: string): Promise<Cita> {
    const cita = await this.citaRepository.findOne({
      where: { id },
      relations: { paciente: true, psicologo: true }
    });

    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe.');
    }

    if (rol === 'PACIENTE' && cita.paciente?.id !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para visualizar esta cita.');
    }

    return cita;
  }

  async actualizarCita(
    id: string, 
    usuarioId: string, 
    rol: string, 
    estado?: EstadoCita, 
    notasMedicas?: string
  ): Promise<Cita> {
    const cita = await this.obtenerCitaPorId(id, usuarioId, rol);

    if (estado) cita.estado = estado;
    if (notasMedicas) cita.notasNotasMedicas = notasMedicas;

    return await this.citaRepository.save(cita);
  }

  async eliminarCita(id: string, usuarioId: string, rol: string): Promise<void> {
    const cita = await this.citaRepository.findOne({
      where: { id },
      relations: { psicologo: true, paciente: true }
    });

    if (!cita) {
      throw new NotFoundException('La cita que deseas cancelar no existe.');
    }

    if (rol === 'PACIENTE' && cita.paciente?.id !== usuarioId) {
      throw new ForbiddenException('No puedes cancelar una cita que no te pertenece.');
    }

    if (cita.psicologo) {
      const agenda = await this.agendaRepository.findOne({
        where: { 
          fechaHoraInicio: cita.fechaHora, 
          psicologo: { id: cita.psicologo.id } 
        }
      });
      if (agenda) {
        agenda.estaReservado = false;
        await this.agendaRepository.save(agenda);
      }
    }

    await this.citaRepository.remove(cita);
  }
}