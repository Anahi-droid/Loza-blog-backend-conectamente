import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Psicologo } from '../psicologos/psicologo.entity';

@Entity('horarios_trabajo')
export class HorarioTrabajo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'integer', name: 'dia_semana' })
  diaSemana!: number; 

  @Column({ type: 'time', name: 'hora_apertura' })
  horaApertura!: string;

  @Column({ type: 'time', name: 'hora_cierre' })
  horaCierre!: string;

  @ManyToOne(() => Psicologo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'psicologo_id' }) 
  psicologo!: Psicologo;
}