import { PartialType } from '@nestjs/swagger';
import { CreatePsicologoDto } from './create-psicologo.dto';

export class UpdatePsicologoDto extends PartialType(CreatePsicologoDto) {}
