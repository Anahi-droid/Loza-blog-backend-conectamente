import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    UsuariosModule, 
    AuthModule,     
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}