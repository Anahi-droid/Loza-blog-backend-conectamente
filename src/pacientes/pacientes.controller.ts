import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe,
  UseGuards,
  Req
} from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  // 🎯 CORREGIDO: Protegido con JWT para inyectar el ID y Rol del profesional que registra al paciente
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPacienteDto: CreatePacienteDto, @Req() req) {
    const datosConCreador = {
      ...createPacienteDto,
      creadorId: req.user?.id,
      creadorRol: req.user?.rol
    };
    return this.pacientesService.create(datosConCreador);
  }

  // 🚀 Mantiene el filtro hermético por Token/Rol para la tabla principal
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    return this.pacientesService.findAll(req.user);
  }

  // 🎯 RUTA ESTRATÉGICA: Posicionada antes de ':id' para evitar colisiones en NestJS. Exclusiva para el modal de citas.
  @Get('buscar/todos')
  obtenerTodosParaCitas() {
    return this.pacientesService.obtenerTodosActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pacientesService.findOne(id);
  }

  // 🎯 RUTA PROPIA DEL PACIENTE: Consulta su expediente personal desde su Token JWT
  @UseGuards(JwtAuthGuard)
  @Get('me/perfil')
  obtenerMiPerfil(@Req() req) {
    return this.pacientesService.obtenerPerfilPorUsuarioId(req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updatePacienteDto: UpdatePacienteDto
  ) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pacientesService.remove(id);
  }
}