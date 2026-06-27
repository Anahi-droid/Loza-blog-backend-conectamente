import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TestsPsicometricosService } from './tests-psicometricos.service';
import { CreateTestResultadoDto } from './dto/create-test-resultado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('tests-psicometricos')
@ApiBearerAuth('jwt-auth')
@Controller('tests-psicometricos')
@UseGuards(JwtAuthGuard)
export class TestsPsicometricosController {
  constructor(private readonly testsService: TestsPsicometricosService) {}

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
    // ADMINs puede ver cualquier resultado; los pacientes solo sus propios resultados
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
