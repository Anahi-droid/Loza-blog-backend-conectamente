import { IsString, IsNotEmpty } from 'class-validator';

export class AsignarEncuestaDto {
  @IsString()
  @IsNotEmpty()
  pacienteId: string = '';
}
