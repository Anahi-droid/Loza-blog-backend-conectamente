import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Cita } from './cita.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto?: number;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estado?: string;

  @OneToOne(() => Cita, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cita_id' })
  cita?: Cita;

  @CreateDateColumn()
  creadoEn?: Date;
}