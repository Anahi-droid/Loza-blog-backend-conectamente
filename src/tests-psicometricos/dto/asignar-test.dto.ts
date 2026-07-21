import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class AsignarTestDto {
  @IsString()
  @IsNotEmpty()
  pacienteId!: string;

  @IsEnum(['TENDENCIAS_PERSONALES', 'BIENESTAR_ACTUAL'])
  @IsNotEmpty()
  tipoTest!: 'TENDENCIAS_PERSONALES' | 'BIENESTAR_ACTUAL';
}