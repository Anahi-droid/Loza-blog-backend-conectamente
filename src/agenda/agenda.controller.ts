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
  

  @Get('horarios-trabajo')
  async obtenerTodosLosHorariosTrabajo() {
    return this.agendasService.listarTodosLosHorariosTrabajo();
  }

  @Get('disponibilidad-excepciones')
  async obtenerTodasLasExcepciones() {
    return this.agendasService.listarTodasLasExcepciones();
  }

  @Get()
  async obtenerTodas() {
    return this.agendasService.listarTodasLasAgendas();
  }


  @UseGuards(JwtAuthGuard)
  @Post()
  async crearHorario(@Req() req, @Body('fechaHoraInicio') fechaHoraInicio: string) {
    const psicologoId = req.user.psicologoId || req.user.id;    
    if (!psicologoId) {
      throw new BadRequestException('El token no contiene un identificador válido.');
    }
    return this.agendasService.crearDisponibilidad(psicologoId, new Date(fechaHoraInicio));
  }

  @Get('psicologo/:id')
  obtenerDisponibles(@Param('id') id: string) {
    if (!id || id === 'undefined') {
      throw new BadRequestException('El ID del psicólogo enviado es requerido.');
    }
    return this.agendasService.obtenerDisponiblesPorPsicologo(id);
  }

  @Get(':id') // 🚀 Bajado aquí: Ahora solo capturará UUIDs reales, no rutas de texto
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
    const psicologoId = req.user.psicologoId || req.user.id;
    return this.agendasService.actualizarDisponibilidad(agendaId, psicologoId, nuevaFecha ? new Date(nuevaFecha) : undefined, estaReservado);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async eliminarHorario(@Param('id') agendaId: string, @Req() req) {
    const psicologoId = req.user.psicologoId || req.user.id;
    await this.agendasService.eliminarDisponibilidad(agendaId, psicologoId);
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
    const psicologoId = req.user.psicologoId || req.user.id;
    return this.agendasService.guardarHorarioTrabajo(psicologoId, diaSemana, horaApertura, horaCierre);
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
    const psicologoId = req.user.psicologoId || req.user.id;
    return this.agendasService.actualizarHorarioTrabajo(id, psicologoId, diaSemana, horaApertura, horaCierre);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('horarios-trabajo/:id')
  async removerHorarioTrabajo(@Param('id') id: string, @Req() req) {
    const psicologoId = req.user.psicologoId || req.user.id;
    await this.agendasService.eliminarHorarioTrabajo(id, psicologoId);
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
    const psicologoId = req.user.psicologoId || req.user.id;
    return this.agendasService.guardarExcepcion(psicologoId, new Date(fechaInicio), new Date(fechaFin), motivo);
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
    const psicologoId = req.user.psicologoId || req.user.id;
    return this.agendasService.actualizarExcepcion(
      id, 
      psicologoId, 
      fechaInicio ? new Date(fechaInicio) : undefined, 
      fechaFin ? new Date(fechaFin) : undefined, 
      motivo
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('disponibilidad-excepciones/:id')
  async removerExcepcion(@Param('id') id: string, @Req() req) {
    const psicologoId = req.user.psicologoId || req.user.id;
    await this.agendasService.eliminarExcepcion(id, psicologoId);
    return { message: 'Excepción de disponibilidad eliminada correctamente.' };
  }
}