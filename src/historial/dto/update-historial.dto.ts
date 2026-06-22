import { PartialType } from '@nestjs/swagger';
import { CreateHistorialDto } from './create-historial.dto';

export class UpdateHistorialDto extends PartialType(CreateHistorialDto) {}
