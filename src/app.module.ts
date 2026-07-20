import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PerfilModule } from './perfil/perfil.module';
import { AdminModule } from './admin/admin.module';
import { HistorialModule } from './historial/historial.module';
import { ProgresoModule } from './progreso/progreso.module';
import { RecomendacionesModule } from './recomendaciones/recomendaciones.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EncuestasModule } from './encuestas/encuestas.module';
import { ChatsModule } from './chats/chats.module';
import { TestsPsicometricosModule } from './tests-psicometricos/tests-psicometricos.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { PsicologosModule } from './psicologos/psicologos.module';
import { AgendaModule } from './agenda/agenda.module';
import { EspecialidadesModule } from './especialidades/especialidades.module'
import { CitasModule } from './citas/citas.module'; 
import { Usuario } from './usuarios/usuario.entity';
import { Psicologo } from './psicologos/psicologo.entity';
import { Cita } from './citas/cita.entity';
import { Historial } from './historial/historial.entity';
import { Progreso } from './progreso/progreso.entity';
import { Recomendacion } from './recomendaciones/recomendacion.entity';
import { Agenda } from './agenda/agenda.entity';
import { Especialidad } from './especialidades/especialidade.entity'; 
import { DisponibilidadExcepcion } from './psicologos/disponibilidad-excepcion.entity'; 
import { Pago } from './citas/pago.entity';
import { SesionClinica } from './citas/sesion-clinica.entity';
import { Diagnostico } from './historial/diagnostico.entity';
import { Tratamiento } from './historial/tratamiento.entity';
import { HorarioTrabajo } from './agenda/horario-trabajo.entity';
import { Paciente } from './pacientes/paciente.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true 
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'), 
        database: config.get<string>('DB_NAME'),
        entities: [
          Usuario, 
          Psicologo, 
          Cita, 
          Historial, 
          Progreso, 
          Recomendacion, 
          Agenda, 
          Especialidad, 
          DisponibilidadExcepcion,
          Pago,
          SesionClinica,
          Diagnostico,
          Tratamiento,
          HorarioTrabajo,
          Paciente
        ], 
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    UsuariosModule,
    AuthModule,
    PerfilModule,
    AdminModule,
    HistorialModule,
    ProgresoModule,
    RecomendacionesModule,
    NotificacionesModule,
    EncuestasModule,
    ChatsModule,
    TestsPsicometricosModule,
    PacientesModule,
    PsicologosModule,
    AgendaModule,
    CitasModule,
    EspecialidadesModule,
  ],
})
export class AppModule {}