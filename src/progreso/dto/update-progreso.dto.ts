import { PartialType } from '@nestjs/swagger';
import { CreateProgresoDto } from './create-progreso.dto';

export class UpdateProgresoDto extends PartialType(CreateProgresoDto) {}
