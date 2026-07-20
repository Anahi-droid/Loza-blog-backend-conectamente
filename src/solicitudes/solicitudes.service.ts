import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudVinculacion } from './solicitud-vinculacion.entity';
import { Paciente } from '../pacientes/paciente.entity';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(SolicitudVinculacion)
    private readonly solicitudRepository: Repository<SolicitudVinculacion>,
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
  ) {}

  // 1. El paciente solicita ser atendido por un psicólogo
  async enviarSolicitud(pacienteId: string, psicologoId: string, mensaje?: string) {
    const nuevaSolicitud = this.solicitudRepository.create({
      paciente: { id: pacienteId },
      psicologo: { id: psicologoId },
      mensajeInicial: mensaje,
    });
    return await this.solicitudRepository.save(nuevaSolicitud);
  }

  // 2. El psicólogo lista las solicitudes pendientes que le han llegado
  async listarParaPsicologo(psicologoId: string) {
    return await this.solicitudRepository.find({
      where: { psicologo: { id: psicologoId }, estado: 'PENDIENTE' },
      relations: { paciente: true }, // 👈 🎯 CORREGIDO: Formato de objeto estricto
    });
  }

  // 3. Procesar la aprobación o rechazo (Creación dinámicas de expedientes clínicos)
  async procesarSolicitud(solicitudId: string, estado: 'ACEPTADA' | 'RECHAZADA') {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
      relations: { paciente: true, psicologo: true }, // 👈 🎯 CORREGIDO: Formato de objeto estricto
    });

    if (!solicitud) {
      throw new NotFoundException('La solicitud de vinculación no existe.');
    }

    solicitud.estado = estado;
    await this.solicitudRepository.save(solicitud);

    // 🎯 SI ES ACEPTADA: Ejecutamos la vinculación o inicialización del expediente
    if (estado === 'ACEPTADA') {
      let expedientePaciente = await this.pacienteRepository.findOne({
        where: { usuario: { id: solicitud.paciente.id } },
      });

      if (!expedientePaciente) {
        expedientePaciente = this.pacienteRepository.create({
          usuario: solicitud.paciente,
          psicologo: solicitud.psicologo,
          fechaNacimiento: new Date(), 
          motivoConsultaInicial: solicitud.mensajeInicial || 'Registrado por solicitud de vinculación externa',
        });
      } else {
        expedientePaciente.psicologo = solicitud.psicologo;
      }

      await this.pacienteRepository.save(expedientePaciente);
    }

    return { mensaje: `Solicitud ${estado.toLowerCase()} correctamente.` };
  }
}