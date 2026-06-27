import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { Psicologo } from '../psicologos/psicologo.entity';

@Entity('especialidades')
export class Especialidad {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  nombre?: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @ManyToMany(() => Psicologo, (psicologo) => psicologo.especialidades)
  psicologos?: Psicologo[];

  @CreateDateColumn()
  creadoEn?: Date;
}