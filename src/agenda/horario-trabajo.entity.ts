import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Psicologo } from '../psicologos/psicologo.entity';

@Entity('horarios_trabajo')
export class HorarioTrabajo {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'integer' })
  diaSemana?: number; 

  @Column({ type: 'time' })
  horaApertura?: string;

  @Column({ type: 'time' })
  horaCierre?: string;

  @ManyToOne(() => Psicologo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'psicologo_id' })
  psicologo?: Psicologo;
}