import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita, EstadoCita } from '../citas/cita.entity';
import { Agenda } from '../agenda/agenda.entity';
import { Pago } from './pago.entity';
import { SesionClinica } from './sesion-clinica.entity';
import { Historial } from '../historial/historial.entity'; 

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
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>, 
  ) {}

  // 🚀 MÉTODO CORREGIDO: Inyecta de forma segura la información del pago adjunto
  async obtenerCitas(usuarioId: string, rol: string): Promise<any[]> {
    let citas: Cita[] = [];

    if (rol === 'ADMIN') {
      citas = await this.citaRepository.find({
        relations: { paciente: true, psicologo: { usuario: true } },
        order: { fechaHora: 'DESC' }
      });
    } else if (rol === 'PSICOLOGO') {
      citas = await this.citaRepository.find({
        where: { psicologo: { usuario: { id: usuarioId } } },
        relations: { paciente: true, psicologo: { usuario: true } },
        order: { fechaHora: 'DESC' }
      });
    } else {
      citas = await this.citaRepository.find({
        where: { paciente: { id: usuarioId } },
        relations: { paciente: true, psicologo: { usuario: true } },
        order: { fechaHora: 'DESC' }
      });
    }

    // 🎯 Mapeo seguro: Buscamos el pago correspondiente en la base de datos para cada cita
    const citasConPagos = await Promise.all(
      citas.map(async (cita) => {
        const pagoAsociado = await this.pagoRepository.findOne({
          where: { cita: { id: cita.id } }
        });
        return {
          ...cita,
          pago: pagoAsociado || null // Se le adjunta al objeto final para que el frontend lo pinte limpio
        };
      })
    );

    return citasConPagos;
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

    const nuevoPago = this.pagoRepository.create({
      monto: 30.00, 
      estado: 'PENDIENTE',
      cita: citaGuardada,
    });
    await this.pagoRepository.save(nuevoPago);

    const nuevaSesion = this.sesionRepository.create({
      motivoEvolucion: motivo,
      cita: citaGuardada,
    });
    await this.sesionRepository.save(nuevaSesion);

    return citaGuardada;
  }

  async obtenerCitaPorId(id: string, usuarioId: string, rol: string): Promise<Cita> {
    // 🚀 CORREGIDO: Inyectamos la relación profunda para evitar que TypeORM limpie las llaves foráneas al hacer .save()
    const cita = await this.citaRepository.findOne({
      where: { id },
      relations: { 
        paciente: true, 
        psicologo: { usuario: true } // 🎯 Crucial para mantener intacto el id del psicólogo y su dueño
      }
    });

    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe.');
    }

    // Validación de seguridad para que los pacientes no husmeen otras citas
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

  async actualizarEstadoPago(pagoId: string, estado: string): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({ where: { id: pagoId } });
    
    if (!pago) {
      throw new NotFoundException(`El registro de pago con ID ${pagoId} no fue encontrado.`);
    }

    pago.estado = estado;
    return await this.pagoRepository.save(pago);
  }
}