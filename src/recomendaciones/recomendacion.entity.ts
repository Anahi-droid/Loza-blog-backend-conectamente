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

@Entity('recomendaciones')
export class Recomendacion {
  @PrimaryGeneratedColumn('uuid') 
  id!: string;

  @Column({ type: 'timestamp' })
  fecha!: Date;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' }) 
  paciente!: Usuario;

  @ManyToOne(() => Psicologo, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'psicologo_id' })
  psicologo?: Psicologo;

  @CreateDateColumn({ name: 'creado_en' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updatedAt!: Date;
}