import { PartialType } from '@nestjs/swagger';
import { CreateTestResultadoDto } from './create-test-resultado.dto';

export class UpdateTestResultadoDto extends PartialType(CreateTestResultadoDto) {}
