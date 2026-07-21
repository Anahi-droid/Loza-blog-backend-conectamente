import { Injectable, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agenda } from './agenda.entity';
import { DisponibilidadExcepcion } from '../psicologos/disponibilidad-excepcion.entity';
import { HorarioTrabajo } from './horario-trabajo.entity';

@Injectable()
export class AgendasService {
  constructor(
    @InjectRepository(Agenda)
    private readonly agendaRepository: Repository<Agenda>,
    @InjectRepository(DisponibilidadExcepcion)
    private readonly excepcionRepository: Repository<DisponibilidadExcepcion>,
    @InjectRepository(HorarioTrabajo)
    private readonly horarioRepository: Repository<HorarioTrabajo>,
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
    const nueva = this.agendaRepository.create({
      fechaHoraInicio: fechaHora,
      estaReservado: false,
      psicologo: { id: psicologoId }
    });
    return this.agendaRepository.save(nueva);
  }

  async obtenerDisponiblesPorPsicologo(psicologoId: string): Promise<Agenda[]> {
    return await this.agendaRepository.find({
      where: { psicologo: { id: psicologoId }, estaReservado: false },
      order: { fechaHoraInicio: 'ASC' },
    });
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

  async actualizarDisponibilidad(agendaId: string, psicologoId: string, nuevaFecha?: Date, estaReservado?: boolean) {
    const agenda = await this.agendaRepository.findOne({
      where: { id: agendaId, psicologo: { id: psicologoId } }
    });

    if (!agenda) throw new NotFoundException('El bloque de agenda no existe o no tienes autorización.');

    if (nuevaFecha !== undefined) agenda.fechaHoraInicio = nuevaFecha;
    if (estaReservado !== undefined) agenda.estaReservado = estaReservado;

    return this.agendaRepository.save(agenda);
  }

  async eliminarDisponibilidad(agendaId: string, psicologoId: string): Promise<void> {
    const agenda = await this.agendaRepository.findOne({
      where: { id: agendaId, psicologo: { id: psicologoId } }
    });

    if (!agenda) throw new NotFoundException('El bloque de agenda no existe o no tienes autorización.');

    await this.agendaRepository.remove(agenda);
  }


  async listarTodosLosHorariosTrabajo(): Promise<HorarioTrabajo[]> {
    return await this.horarioRepository.find({
      relations: { psicologo: true },
      order: { diaSemana: 'ASC', horaApertura: 'ASC' }
    });
  }

  async guardarHorarioTrabajo(psicologoId: string, dia: number, apertura: string, cierre: string): Promise<HorarioTrabajo> {
    const nuevoHorario = this.horarioRepository.create({
      diaSemana: dia,
      horaApertura: apertura,
      horaCierre: cierre,
      psicologo: { id: psicologoId }
    });
    return this.horarioRepository.save(nuevoHorario);
  }

  async buscarHorarioTrabajoPorId(id: string): Promise<HorarioTrabajo | null> {
    return this.horarioRepository.findOne({ where: { id }, relations: { psicologo: true } });
  }

  async actualizarHorarioTrabajo(id: string, psicologoId: string, dia?: number, apertura?: string, cierre?: string): Promise<HorarioTrabajo> {
    const horario = await this.horarioRepository.findOne({ where: { id }, relations: { psicologo: true } });
    if (!horario) throw new NotFoundException('El horario de trabajo especificado no existe.');
    if (horario.psicologo.id !== psicologoId) throw new ForbiddenException('No tienes permiso para modificar este horario.');

    if (dia !== undefined) horario.diaSemana = dia;
    if (apertura !== undefined) horario.horaApertura = apertura;
    if (cierre !== undefined) horario.horaCierre = cierre;

    return this.horarioRepository.save(horario);
  }

  async eliminarHorarioTrabajo(id: string, psicologoId: string): Promise<void> {
    const horario = await this.horarioRepository.findOne({ where: { id }, relations: { psicologo: true } });
    if (!horario) throw new NotFoundException('El horario de trabajo especificado no existe.');
    if (horario.psicologo.id !== psicologoId) throw new ForbiddenException('No tienes permiso para eliminar este horario.');
    await this.horarioRepository.remove(horario);
  }

  async listarTodasLasExcepciones(): Promise<DisponibilidadExcepcion[]> {
    return await this.excepcionRepository.find({
      relations: { psicologo: true },
      order: { fechaInicio: 'DESC' }
    });
  }

  async guardarExcepcion(psicologoId: string, inicio: Date, fin: Date, motivo: string): Promise<DisponibilidadExcepcion> {
    const nuevaExcepcion = this.excepcionRepository.create({
      fechaInicio: inicio,
      fechaFin: fin,
      motivo: motivo,
      psicologo: { id: psicologoId }
    });
    return this.excepcionRepository.save(nuevaExcepcion);
  }

  async buscarExcepcionPorId(id: string): Promise<DisponibilidadExcepcion | null> {
    return this.excepcionRepository.findOne({ where: { id }, relations: { psicologo: true } });
  }

  async actualizarExcepcion(id: string, psicologoId: string, inicio?: Date, fin?: Date, motivo?: string): Promise<DisponibilidadExcepcion> {
    const excepcion = await this.excepcionRepository.findOne({ where: { id }, relations: { psicologo: true } });
    if (!excepcion) throw new NotFoundException('La excepción especificada no existe.');
    if (excepcion.psicologo.id !== psicologoId) throw new ForbiddenException('No tienes permiso para modificar esta excepción.');

    if (inicio !== undefined) excepcion.fechaInicio = inicio;
    if (fin !== undefined) excepcion.fechaFin = fin;
    if (motivo !== undefined) excepcion.motivo = motivo;

    return this.excepcionRepository.save(excepcion);
  }

  async eliminarExcepcion(id: string, psicologoId: string): Promise<void> {
    const excepcion = await this.excepcionRepository.findOne({ where: { id }, relations: { psicologo: true } });
    if (!excepcion) throw new NotFoundException('La excepción especificada no existe.');
    if (excepcion.psicologo.id !== psicologoId) throw new ForbiddenException('No tienes permiso para eliminar esta excepción.');
    await this.excepcionRepository.remove(excepcion);
  }

  private async obtenerPsicologoPorUsuarioId(usuarioId: string) {
    const agenda = await this.agendaRepository.manager.getRepository('Psicologo').findOne({
      where: { usuario: { id: usuarioId } }
    });
    if (!agenda) {
      throw new NotFoundException('No se encontró el perfil profesional de psicólogo asociado a tu usuario.');
    }
    return agenda;
  }

  async listarAgendasPorRol(usuarioId: string, rol: string): Promise<Agenda[]> {
    if (rol === 'ADMIN') {
      return await this.agendaRepository.find({
        relations: { psicologo: { usuario: true } },
        order: { fechaHoraInicio: 'DESC' }
      });
    }

    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return await this.agendaRepository.find({
      where: { psicologo: { id: psicologo.id } },
      relations: { psicologo: { usuario: true } },
      order: { fechaHoraInicio: 'DESC' }
    });
  }

  async crearDisponibilidadPorUsuarioId(usuarioId: string, fechaHora: Date): Promise<Agenda> {
    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    await this.verificarExcepcion(psicologo.id, fechaHora);
    
    const nueva = this.agendaRepository.create({
      fechaHoraInicio: fechaHora,
      estaReservado: false,
      psicologo: { id: psicologo.id }
    });
    return this.agendaRepository.save(nueva);
  }

  async actualizarDisponibilidadPorUsuarioId(agendaId: string, usuarioId: string, nuevaFecha?: Date, estaReservado?: boolean) {
    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return this.actualizarDisponibilidad(agendaId, psicologo.id, nuevaFecha, estaReservado);
  }

  async eliminarDisponibilidadPorUsuarioId(agendaId: string, usuarioId: string): Promise<void> {
    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return this.eliminarDisponibilidad(agendaId, psicologo.id);
  }

  async listarHorariosTrabajoPorRol(usuarioId: string, rol: string): Promise<HorarioTrabajo[]> {
    if (rol === 'ADMIN') {
      return await this.horarioRepository.find({
        relations: { psicologo: { usuario: true } },
        order: { diaSemana: 'ASC', horaApertura: 'ASC' }
      });
    }

    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return await this.horarioRepository.find({
      where: { psicologo: { id: psicologo.id } },
      relations: { psicologo: { usuario: true } },
      order: { diaSemana: 'ASC', horaApertura: 'ASC' }
    });
  }

  async guardarHorarioTrabajoPorUsuarioId(usuarioId: string, dia: number, apertura: string, cierre: string): Promise<HorarioTrabajo> {
    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return this.guardarHorarioTrabajo(psicologo.id, dia, apertura, cierre);
  }

  async actualizarHorarioTrabajoPorUsuarioId(id: string, usuarioId: string, dia?: number, apertura?: string, cierre?: string): Promise<HorarioTrabajo> {
    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return this.actualizarHorarioTrabajo(id, psicologo.id, dia, apertura, cierre);
  }

  async eliminarHorarioTrabajoPorUsuarioId(id: string, usuarioId: string): Promise<void> {
    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return this.eliminarHorarioTrabajo(id, psicologo.id);
  }

  async listarExcepcionesPorRol(usuarioId: string, rol: string): Promise<DisponibilidadExcepcion[]> {
    if (rol === 'ADMIN') {
      return await this.excepcionRepository.find({
        relations: { psicologo: { usuario: true } },
        order: { fechaInicio: 'DESC' }
      });
    }

    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return await this.excepcionRepository.find({
      where: { psicologo: { id: psicologo.id } },
      relations: { psicologo: { usuario: true } },
      order: { fechaInicio: 'DESC' }
    });
  }

  async guardarExcepcionPorUsuarioId(usuarioId: string, inicio: Date, fin: Date, motivo: string): Promise<DisponibilidadExcepcion> {
    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return this.guardarExcepcion(psicologo.id, inicio, fin, motivo);
  }

  async actualizarExcepcionPorUsuarioId(id: string, usuarioId: string, inicio?: Date, fin?: Date, motivo?: string): Promise<DisponibilidadExcepcion> {
    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return this.actualizarExcepcion(id, psicologo.id, inicio, fin, motivo);
  }

  async eliminarExcepcionPorUsuarioId(id: string, usuarioId: string): Promise<void> {
    const psicologo = await this.obtenerPsicologoPorUsuarioId(usuarioId);
    return this.eliminarExcepcion(id, psicologo.id);
  }
}