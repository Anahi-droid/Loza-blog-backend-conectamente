import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Módulos Existentes
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PerfilModule } from './perfil/perfil.module';
import { AdminModule } from './admin/admin.module';
import { HistorialModule } from './historial/historial.module';
import { ProgresoModule } from './progreso/progreso.module';
import { RecomendacionesModule } from './recomendaciones/recomendaciones.module';
import { PsicologosModule } from './psicologos/psicologos.module';
import { AgendaModule } from './agenda/agenda.module';
import { CitasModule } from './citas/citas.module'; 
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EncuestasModule } from './encuestas/encuestas.module';
import { PacientesModule } from './pacientes/pacientes.module';

// Entidades del Core
import { Usuario } from './usuarios/usuario.entity';
import { Psicologo } from './psicologos/psicologo.entity';
import { Cita } from './citas/cita.entity';
import { Historial } from './historial/historial.entity';
import { Progreso } from './progreso/progreso.entity';
import { Recomendacion } from './recomendaciones/recomendacion.entity';
import { Agenda } from './agenda/agenda.entity';
import { Especialidad } from './especialidades/especialidade.entity'; 
import { EspecialidadesModule } from './especialidades/especialidades.module';

// 🚀 1. IMPORTAMOS LA ENTIDAD QUE FALTA
import { DisponibilidadExcepcion } from './psicologos/disponibilidad-excepcion.entity'; 

// 🚀 IMPORTACIONES DE LAS 5 NUEVAS ENTIDADES CON SUS RUTAS CORRECTAS
import { Pago } from './citas/pago.entity';
import { SesionClinica } from './citas/sesion-clinica.entity';
import { Diagnostico } from './historial/diagnostico.entity';
import { Tratamiento } from './historial/tratamiento.entity';
import { HorarioTrabajo } from './agenda/horario-trabajo.entity';
import { Paciente } from './pacientes/paciente.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Conexión Relacional (PostgreSQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'), 
        database: config.get('DB_NAME'),
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
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    
    // Conexión No Relacional (MongoDB)
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
    EspecialidadesModule,
    PsicologosModule,
    AgendaModule,
    CitasModule,
    PacientesModule,
  ],
})
export class AppModule {}