import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Req, 
  UseGuards, 
  BadRequestException, 
  Patch, 
  Delete, 
  NotFoundException 
} from '@nestjs/common';
import { AgendasService } from './agenda.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('agendas')
export class AgendasController {
  constructor(private readonly agendasService: AgendasService) {}

  @UseGuards(JwtAuthGuard)
  @Get('horarios-trabajo')
  async obtenerTodosLosHorariosTrabajo(@Req() req) {
    const usuarioId = req.user.id;
    const rol = req.user.rol;
    return this.agendasService.listarHorariosTrabajoPorRol(usuarioId, rol);
  }

  @UseGuards(JwtAuthGuard)
  @Get('disponibilidad-excepciones')
  async obtenerTodasLasExcepciones(@Req() req) {
    const usuarioId = req.user.id;
    const rol = req.user.rol;
    return this.agendasService.listarExcepcionesPorRol(usuarioId, rol);
  }

  // 🎯 FILTRADO HERMÉTICO: Cada psicólogo ve solo sus propios bloques de agenda
  @UseGuards(JwtAuthGuard)
  @Get()
  async obtenerTodas(@Req() req) {
    const usuarioId = req.user.id;
    const rol = req.user.rol;
    return this.agendasService.listarAgendasPorRol(usuarioId, rol);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async crearHorario(@Req() req, @Body('fechaHoraInicio') fechaHoraInicio: string) {
    const usuarioId = req.user.id;
    return this.agendasService.crearDisponibilidadPorUsuarioId(usuarioId, new Date(fechaHoraInicio));
  }

  @Get('psicologo/:id')
  obtenerDisponibles(@Param('id') id: string) {
    if (!id || id === 'undefined') {
      throw new BadRequestException('El ID del psicólogo enviado es requerido.');
    }
    return this.agendasService.obtenerDisponiblesPorPsicologo(id);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    const agenda = await this.agendasService.buscarPorId(id);
    if (!agenda) {
      throw new NotFoundException(`Bloque de agenda con ID ${id} no encontrado.`);
    }
    return agenda;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async actualizarHorario(
    @Param('id') agendaId: string,
    @Req() req,
    @Body('fechaHoraInicio') nuevaFecha?: string,
    @Body('estaReservado') estaReservado?: boolean,
  ) {
    const usuarioId = req.user.id;
    return this.agendasService.actualizarDisponibilidadPorUsuarioId(agendaId, usuarioId, nuevaFecha ? new Date(nuevaFecha) : undefined, estaReservado);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async eliminarHorario(@Param('id') agendaId: string, @Req() req) {
    const usuarioId = req.user.id;
    await this.agendasService.eliminarDisponibilidadPorUsuarioId(agendaId, usuarioId);
    return { message: 'Bloque de disponibilidad eliminado correctamente.' };
  }

  @Get('horarios-trabajo/:id')
  async obtenerHorarioTrabajoPorId(@Param('id') id: string) {
    const horario = await this.agendasService.buscarHorarioTrabajoPorId(id);
    if (!horario) throw new NotFoundException(`Horario de trabajo con ID ${id} no encontrado.`);
    return horario;
  }

  @UseGuards(JwtAuthGuard)
  @Post('horarios-trabajo')
  async registrarHorarioTrabajo(
    @Req() req,
    @Body('diaSemana') diaSemana: number,
    @Body('horaApertura') horaApertura: string,
    @Body('horaCierre') horaCierre: string,
  ) {
    const usuarioId = req.user.id;
    return this.agendasService.guardarHorarioTrabajoPorUsuarioId(usuarioId, diaSemana, horaApertura, horaCierre);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('horarios-trabajo/:id')
  async modificarHorarioTrabajo(
    @Param('id') id: string,
    @Req() req,
    @Body('diaSemana') diaSemana?: number,
    @Body('horaApertura') horaApertura?: string,
    @Body('horaCierre') horaCierre?: string,
  ) {
    const usuarioId = req.user.id;
    return this.agendasService.actualizarHorarioTrabajoPorUsuarioId(id, usuarioId, diaSemana, horaApertura, horaCierre);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('horarios-trabajo/:id')
  async removerHorarioTrabajo(@Param('id') id: string, @Req() req) {
    const usuarioId = req.user.id;
    await this.agendasService.eliminarHorarioTrabajoPorUsuarioId(id, usuarioId);
    return { message: 'Horario de trabajo base removido de forma exitosa.' };
  }

  @Get('disponibilidad-excepciones/:id')
  async obtenerExcepcionPorId(@Param('id') id: string) {
    const excepcion = await this.agendasService.buscarExcepcionPorId(id);
    if (!excepcion) throw new NotFoundException(`Excepción con ID ${id} no encontrada.`);
    return excepcion;
  }

  @UseGuards(JwtAuthGuard)
  @Post('disponibilidad-excepciones')
  async registrarExcepcion(
    @Req() req,
    @Body('fechaInicio') fechaInicio: string,
    @Body('fechaFin') fechaFin: string,
    @Body('motivo') motivo: string,
  ) {
    const usuarioId = req.user.id;
    return this.agendasService.guardarExcepcionPorUsuarioId(usuarioId, new Date(fechaInicio), new Date(fechaFin), motivo);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('disponibilidad-excepciones/:id')
  async modificarExcepcion(
    @Param('id') id: string,
    @Req() req,
    @Body('fechaInicio') fechaInicio?: string,
    @Body('fechaFin') fechaFin?: string,
    @Body('motivo') motivo?: string,
  ) {
    const usuarioId = req.user.id;
    return this.agendasService.actualizarExcepcionPorUsuarioId(
      id, 
      usuarioId, 
      fechaInicio ? new Date(fechaInicio) : undefined, 
      fechaFin ? new Date(fechaFin) : undefined, 
      motivo
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('disponibilidad-excepciones/:id')
  async removerExcepcion(@Param('id') id: string, @Req() req) {
    const usuarioId = req.user.id;
    await this.agendasService.eliminarExcepcionPorUsuarioId(id, usuarioId);
    return { message: 'Excepción de disponibilidad eliminada correctamente.' };
  }
}