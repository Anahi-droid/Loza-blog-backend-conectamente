import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Agenda } from '../agenda/agenda.entity';
import { Cita } from '../citas/cita.entity';
import { Especialidad } from '../especialidades/especialidade.entity'; 

@Entity('psicologos')
export class Psicologo {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  numColegiatura?: string; 

  @Column({ nullable: true })
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

  @ManyToMany(() => Especialidad, (especialidad) => especialidad.psicologos, { cascade: true })
  @JoinTable({ name: 'psicologos_especialidades' })
  especialidades?: Especialidad[];
}