import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TestsPsicometricosService } from './tests-psicometricos.service';
import { CreateTestResultadoDto } from './dto/create-test-resultado.dto';
import { AsignarTestDto } from './dto/asignar-test.dto';
import { ResponderTestDto } from './dto/responder-test.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('tests-psicometricos')
@ApiBearerAuth('jwt-auth')
@Controller('tests-psicometricos')
@UseGuards(JwtAuthGuard)
export class TestsPsicometricosController {
  constructor(private readonly testsService: TestsPsicometricosService) {}

  // ─── ENDPOINTS PARA ASIGNACIÓN DE TESTS (PSICÓLOGO) ──────────────────────
  @Post('asignar')
  @ApiOperation({ summary: 'Asignar/activar un test psicométrico para un paciente' })
  async asignarTest(@Req() req, @Body() dto: AsignarTestDto) {
    return this.testsService.asignarTest(req.user.id, dto);
  }

  @Put(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar un test asignado (psicólogo)' })
  async desactivarTest(@Req() req, @Param('id') id: string) {
    return this.testsService.desactivarTest(req.user.id, id);
  }

  @Get('mis-asignaciones')
  @ApiOperation({ summary: 'Obtener asignaciones del psicólogo' })
  async obtenerAsignacionesPsicologo(@Req() req) {
    return this.testsService.obtenerAsignacionesPsicologo(req.user.id);
  }

  // ─── ENDPOINTS PARA PACIENTE ───────────────────────────────────────────────
  @Get('paciente/asignaciones')
  @ApiOperation({ summary: 'Obtener asignaciones del paciente' })
  async obtenerAsignacionesPaciente(@Req() req) {
    return this.testsService.obtenerAsignacionesPaciente(req.user.id);
  }

  @Post(':id/responder')
  @ApiOperation({ summary: 'Responder un test psicométrico (paciente)' })
  async responderTest(@Req() req, @Param('id') id: string, @Body() dto: ResponderTestDto) {
    return this.testsService.responderTest(req.user.id, id, dto);
  }

  @Put(':id/marcar-visto')
  @ApiOperation({ summary: 'Marcar resultado como visto (psicólogo)' })
  async marcarComoVisto(@Req() req, @Param('id') id: string) {
    return this.testsService.marcarComoVisto(id, req.user.id);
  }

  // ─── ENDPOINTS ORIGINALES (se mantienen) ───────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Registrar resultado de un test psicométrico' })
  async guardarTest(@Req() req, @Body() dto: CreateTestResultadoDto) {
    return this.testsService.registrarResultado(req.user.id, dto);
  }

  @Get('mis-resultados')
  @ApiOperation({ summary: 'Obtener mis resultados de tests' })
  async verMisResultados(@Req() req) {
    return this.testsService.obtenerHistorialPaciente(req.user.id);
  }

  @Get('estadisticas/:tipoTest')
  @ApiOperation({ summary: 'Obtener estadísticas mensuales por tipo de test (Admin/Psicólogo)' })
  async obtenerEstadisticas(@Req() req, @Param('tipoTest') tipoTest: string) {
    if (req.user.rol !== 'ADMIN' && req.user.rol !== 'PSICOLOGO') {
      throw new ForbiddenException('No tienes permisos para ver las métricas analíticas.');
    }
    return this.testsService.obtenerPromediosMensualesPorTest(tipoTest);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un resultado específico' })
  async findOne(@Req() req, @Param('id') id: string) {
    const resultado = await this.testsService.findOne(id);
    if (!resultado) return null;
    if (req.user.rol !== 'ADMIN' && resultado.pacienteId !== req.user.id) {
      throw new ForbiddenException('No tienes permisos para ver este resultado');
    }
    return resultado;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un resultado de test' })
  async update(@Req() req, @Param('id') id: string, @Body() dto: any) {
    const resultado = await this.testsService.findOne(id);
    if (!resultado) return null;
    if (req.user.rol !== 'ADMIN' && resultado.pacienteId !== req.user.id) {
      throw new ForbiddenException('No tienes permisos para modificar este resultado');
    }
    return this.testsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un resultado de test' })
  async remove(@Req() req, @Param('id') id: string) {
    const resultado = await this.testsService.findOne(id);
    if (!resultado) return { deleted: false };
    if (req.user.rol !== 'ADMIN' && resultado.pacienteId !== req.user.id) {
      throw new ForbiddenException('No tienes permisos para eliminar este resultado');
    }
    return this.testsService.remove(id);
  }
}
