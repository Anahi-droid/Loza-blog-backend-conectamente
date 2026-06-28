import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreatePacienteDto {
  @IsUUID()
  usuarioId?: string; 

  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  genero?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  ocupacion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefonoEmergencia?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  contactoEmergenciaNombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  tipoSangre?: string;

  @IsOptional()
  @IsString()
  antecedentesMedicos?: string;

  @IsOptional()
  @IsString()
  motivoConsultaInicial?: string;
}