import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PerfilModule } from './perfil/perfil.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, UsuariosModule, PerfilModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
