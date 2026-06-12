import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { AdminService } from './admin.service';
import { CreateStaffDto } from './dto/create-admin.dto';

@Controller('admin/usuarios')
@UseGuards(JwtAuthGuard, RolesGuard) // Orden: primero autenticación, luego rol
@Roles('ADMIN')                       // Todo el controlador requiere rol ADMIN
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  crearStaff(@Body() dto: CreateStaffDto) {
    return this.adminService.crearStaff(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  listarUsuarios(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('rol') rol?: string,
  ) {
    return this.adminService.listarUsuarios({
      pagina: pagina ? parseInt(pagina, 10) : 1,
      limite: limite ? parseInt(limite, 10) : 10,
      rol,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  darDeBaja(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.darDeBaja(id);
  }
}