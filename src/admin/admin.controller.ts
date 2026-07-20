import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/usuarios')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Registrar personal interno (PSICOLOGO o ADMIN)' })
  @ApiResponse({ status: 201, description: 'Staff registrado correctamente' })
  @Post()
  async crearStaff(@Body() dto: CreateStaffDto) {
    return this.adminService.crearStaff(dto);
  }

  @ApiOperation({ summary: 'Listar todos los usuarios con paginación y filtro por rol' })
  @ApiQuery({ name: 'pagina', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limite', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'rol',    required: false, enum: ['PACIENTE','PSICOLOGO','ADMIN'] })
  @Get()
  async listarUsuarios(@Query('pagina') pagina, @Query('limite') limite, @Query('rol') rol) {
    return this.adminService.listarUsuarios({
      pagina: pagina ? Number(pagina) : undefined,
      limite: limite ? Number(limite) : undefined,
      rol,
    });
  }

  @ApiOperation({ summary: 'Borrado lógico — setea activo=false' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado correctamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Delete(':id')
  async darDeBaja(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.darDeBaja(id);
  }

  @ApiOperation({ summary: 'Reactivar usuario — setea activo=true' })
  @ApiResponse({ status: 200, description: 'Usuario reactivado correctamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Patch(':id/reactivar')
  async reactivarUsuario(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.reactivar(id);
  }
}