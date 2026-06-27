import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Agenda } from '../agenda/agenda.entity';
import { Cita } from '../citas/cita.entity';
import { DisponibilidadExcepcion } from './disponibilidad-excepcion.entity'; 

@Entity('psicologos')
export class Psicologo {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  numColegiatura?: string; 

  @Column()
  especialidad?: string;

  @Column({ type: 'text', nullable: true })
  biografia?: string;

  
  @OneToOne(() => Usuario, (usuario) => usuario.perfilPsicologo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' }) 
  usuario?: Usuario;

  
  @OneToMany(() => Agenda, (agenda) => agenda.psicologo)
  agendas?: Agenda[];

  @OneToMany(() => Cita, (cita) => cita.psicologo)
  citas?: Cita[];

  @OneToMany(() => DisponibilidadExcepcion, (excepcion) => excepcion.psicologo)
  excepciones?: DisponibilidadExcepcion[];
}