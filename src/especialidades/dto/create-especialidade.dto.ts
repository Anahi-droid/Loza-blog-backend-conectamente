import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEspecialidadDto {
  @ApiProperty({ example: 'Psicología Clínica', description: 'Nombre único de la especialidad médica' })
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @ApiProperty({ example: 'Tratamiento de trastornos mentales y conductuales.', description: 'Breve descripción', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;
}