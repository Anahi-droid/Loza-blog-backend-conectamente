import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Psicologo } from '../psicologos/psicologo.entity';

@Entity('agendas')
export class Agenda {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'timestamp' })
  fechaHoraInicio?: Date; 

  @Column({ type: 'boolean', default: false })
  estaReservado?: boolean; 

  
  @ManyToOne(() => Psicologo, (psicologo) => psicologo.agendas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'psicologo_id' })
  psicologo?: Psicologo;

  @CreateDateColumn()
  creadoEn?: Date;
}
