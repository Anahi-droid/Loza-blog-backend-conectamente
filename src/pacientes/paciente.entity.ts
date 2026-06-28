import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToOne, 
  JoinColumn, 
  OneToMany,
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity'; //
import { Cita } from '../citas/cita.entity'; //
import { Historial } from '../historial/historial.entity'; //
import { Recomendacion } from '../recomendaciones/recomendacion.entity'; //

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  // Relación 1:1 estricta con la tabla base de usuarios
  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  // Datos Clínicos y Demográficos
  @Column({ name: 'fecha_nacimiento', type: 'date' })
  fechaNacimiento?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  genero?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  ocupacion?: string;

  // Contacto de Emergencia (Crítico para plataformas de salud mental)
  @Column({ name: 'telefono_emergencia', type: 'varchar', length: 20, nullable: true })
  telefonoEmergencia?: string;

  @Column({ name: 'contacto_emergencia_nombre', type: 'varchar', length: 150, nullable: true })
  contactoEmergenciaNombre?: string;

  // Historial Clínico Base
  @Column({ name: 'tipo_sangre', type: 'varchar', length: 10, nullable: true })
  tipoSangre?: string;

  @Column({ name: 'antecedentes_medicos', type: 'text', nullable: true })
  antecedentesMedicos?: string;

  @Column({ name: 'motivo_consulta_inicial', type: 'text', nullable: true })
  motivoConsultaInicial?: string;

  
  @OneToMany(() => Cita, (cita) => cita.paciente) //
  citas?: Cita[];

  @OneToMany(() => Historial, (historial) => historial.paciente) //
  historiales?: Historial[];

  @OneToMany(() => Recomendacion, (rec) => rec.paciente) //
  recomendaciones?: Recomendacion[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn?: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn?: Date;
}