import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { Cita } from '../citas/cita.entity';
import { NotificacionesService } from './notificaciones.service';

@Injectable()
export class RecordatoriosCitasCron {
  private readonly logger = new Logger(RecordatoriosCitasCron.name);

  constructor(
    @InjectRepository(Cita) private citaRepo: Repository<Cita>,
    private notificacionesService: NotificacionesService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async recordarCitasDeHoy() {
    this.logger.log('Ejecutando recordatorio diario de citas...');

    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    const citas = await this.citaRepo.find({
      where: {
        fechaHora: Between(hoyInicio, hoyFin),
        estado: Not('CANCELADA'),
      },
      relations: {
        paciente: true,
        psicologo: {
          usuario: true,
        },
      },
    });

    this.logger.log(`Citas encontradas para hoy: ${citas.length}`);

    for (const cita of citas) {
      const horaTexto = new Date(cita.fechaHora as Date).toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (cita.paciente?.id) {
        await this.notificacionesService.create({
          usuarioId: cita.paciente.id,
          titulo: 'Recordatorio de cita',
          mensaje: `Tienes una cita hoy a las ${horaTexto}.`,
          tipo: 'CITA',
        });
      }

      if (cita.psicologo?.usuario?.id) {
        await this.notificacionesService.create({
          usuarioId: cita.psicologo.usuario.id,
          titulo: 'Recordatorio de agenda',
          mensaje: `Tienes una cita hoy a las ${horaTexto} con ${cita.paciente?.nombre || 'un paciente'}.`,
          tipo: 'CITA',
        });
      }
    }
  }
}