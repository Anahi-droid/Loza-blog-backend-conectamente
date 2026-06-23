import { IsInt, IsNotEmpty, IsDateString, IsString } from 'class-validator';

export class CreateRecomendacionDto {
  @IsInt()
  @IsNotEmpty()
  pacienteId: number;

  @IsInt()
  @IsNotEmpty()
  psicologoId: number;

  @IsDateString()
  @IsNotEmpty()
  fecha: Date;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}