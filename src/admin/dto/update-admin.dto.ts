import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffDto } from './create-admin.dto';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}