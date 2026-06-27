import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificacionDto {
  @ApiProperty({ example: '5caa60f6-86c5-4dc0-a1f6-e0754c67002b', description: 'ID del usuario en Postgres' })
  @IsUUID()
  @IsNotEmpty()
  usuarioId?: string;

  @ApiProperty({ example: 'Nueva Cita Agendada', description: 'Título de la notificación' })
  @IsString()
  @IsNotEmpty()
  titulo?: string;

  @ApiProperty({ example: 'Tu cita con el psicólogo ha sido confirmada para mañana.', description: 'Contenido del mensaje' })
  @IsString()
  @IsNotEmpty()
  mensaje?: string;

  @ApiProperty({ example: 'CITA', description: 'Tipo de notificación', enum: ['INFO', 'ALERTA', 'CITA'], required: false })
  @IsEnum(['INFO', 'ALERTA', 'CITA'])
  @IsOptional()
  tipo?: string;
}