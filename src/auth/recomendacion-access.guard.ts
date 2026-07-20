import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recomendacion } from '../recomendaciones/recomendacion.entity';

@Injectable()
export class RecomendacionAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(Recomendacion)
    private readonly recomendacionRepository: Repository<Recomendacion>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const recomendacionId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Si es admin, permitir acceso
    if (user.rol === 'ADMIN') {
      return true;
    }

    // Cargar la recomendación con todas las relaciones necesarias
    const recomendacion = await this.recomendacionRepository.findOne({
      where: { id: recomendacionId },
      relations: {
        paciente: true,
        psicologo: true,
      },
    });

    if (!recomendacion) {
      // No revelar si existe o no, retornar 404 desde el servicio
      return true;
    }

    // Validar acceso según el rol
    if (user.rol === 'PSICOLOGO') {
      // El psicólogo debe ser el asignado al paciente de esta recomendación
      // recomendacion.paciente es el Usuario (paciente)
      // Necesitamos verificar que el psicólogo del paciente coincida con el usuario autenticado
      const esPsicologoAsignado = recomendacion.paciente?.id === user.id;

      if (!esPsicologoAsignado) {
        throw new ForbiddenException(
          'No tienes permiso para acceder a esta recomendación. Solo el psicólogo asignado al paciente puede verla.',
        );
      }
    } else if (user.rol === 'PACIENTE') {
      // El paciente debe ser el dueño de la recomendación
      const esPacienteDueno = recomendacion.paciente?.id === user.id;

      if (!esPacienteDueno) {
        throw new ForbiddenException(
          'No tienes permiso para acceder a esta recomendación. Solo puedes ver tus propias recomendaciones.',
        );
      }
    }

    return true;
  }
}