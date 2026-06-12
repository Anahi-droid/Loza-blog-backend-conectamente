import { Module } from '@nestjs/common';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    UsuariosModule, // para UsuariosService
    AuthModule,     // para JwtAuthGuard
  ],
  controllers: [PerfilController],
  providers: [PerfilService],
})
export class PerfilModule {}