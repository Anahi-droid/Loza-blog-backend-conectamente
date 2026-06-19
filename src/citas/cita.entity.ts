import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Psicologo } from '../psicologos/psicologo.entity';

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'REALIZADA';

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'timestamp' })
  fechaHora?: Date; 

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estado?: EstadoCita;

  @Column({ type: 'text', nullable: true })
  motivoConsulta?: string;

  @Column({ type: 'text', nullable: true })
  notasNotasMedicas?: string; 

  
  @ManyToOne(() => Usuario, (usuario) => usuario.citas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paciente_id' })
  paciente?: Usuario;

  
  @ManyToOne(() => Psicologo, (psicologo) => psicologo.citas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'psicologo_id' })
  psicologo?: Psicologo;

  @CreateDateColumn()
  creadoEn?: Date;

  @UpdateDateColumn()
  actualizadoEn?: Date;
}
