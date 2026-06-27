import { PartialType } from '@nestjs/swagger';
import { CreateEspecialidadDto } from './create-especialidade.dto'; 

export class UpdateEspecialidadeDto extends PartialType(CreateEspecialidadDto) {
  nombre: any;
}