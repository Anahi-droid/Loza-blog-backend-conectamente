import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/update-auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  @ApiOperation({ summary: 'Registro público — solo para PACIENTES' })
  @ApiResponse({ status: 201, description: 'Paciente registrado correctamente' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @Post('register')
  register(@Body() dto: RegisterDto) { ... }

  @ApiOperation({ summary: 'Login global — retorna JWT' })
  @ApiResponse({ status: 200, description: 'Login exitoso, retorna accessToken' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Post('login')
  login(@Body() dto: LoginDto) { ... }
}