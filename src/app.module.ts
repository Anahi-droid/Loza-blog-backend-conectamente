import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PsicologosModule } from './psicologos/psicologos.module';
import { AgendasModule } from './agenda/agenda.module';
import { CitasModule } from './citas/citas.module';
import { AuthModule } from './auth/auth.module'; // El que ya tenían hecho

@Module({
  imports: [
    TypeOrmModule.forRoot({
      
    }),
    UsuariosModule,
    PsicologosModule,
    AgendasModule,
    CitasModule,
    AuthModule,
  ],
})
export class AppModule {}