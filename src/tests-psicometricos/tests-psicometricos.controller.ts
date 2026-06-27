import { Controller, Post, Get, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { TestsPsicometricosService } from './tests-psicometricos.service';
import { CreateTestResultadoDto } from './dto/create-test-resultado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tests-psicometricos')
@UseGuards(JwtAuthGuard)
export class TestsPsicometricosController {
  constructor(private readonly testsService: TestsPsicometricosService) {}

  @Post()
  async guardarTest(@Req() req, @Body() dto: CreateTestResultadoDto) {
    return this.testsService.registrarResultado(req.user.id, dto);
  }

  @Get('mis-resultados')
  async verMisResultados(@Req() req) {
    return this.testsService.obtenerHistorialPaciente(req.user.id);
  }

  @Get('estadisticas/:tipoTest')
  async obtenerEstadisticas(@Req() req, @Param('tipoTest') tipoTest: string) {
    if (req.user.rol !== 'ADMIN' && req.user.rol !== 'PSICOLOGO') {
      throw new ForbiddenException('No tienes permisos para ver las métricas analíticas.');
    }
    return this.testsService.obtenerPromediosMensualesPorTest(tipoTest);
  }
}