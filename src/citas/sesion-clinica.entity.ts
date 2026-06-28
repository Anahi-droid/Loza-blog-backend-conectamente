import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Cita } from './cita.entity';

@Entity('sesiones_clinicas')
export class SesionClinica {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'text' })
  motivoEvolucion?: string;

  @Column({ type: 'text', nullable: true })
  notasPrivadas?: string;

  @OneToOne(() => Cita, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cita_id' })
  cita?: Cita;

  @CreateDateColumn()
  creadoEn?: Date;
}