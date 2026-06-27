import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Psicologo } from '../psicologos/psicologo.entity';
import { Cita } from '../citas/cita.entity';

export type Rol = 'PACIENTE' | 'PSICOLOGO' | 'ADMIN';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  email?: string;

  @Column()
  password?: string;

  @Column()
  nombre?: string;

  @Column()
  apellido?: string;

  @Column({ type: 'varchar', default: 'PACIENTE' })
  rol?: Rol;

  @Column({ default: true })
  activo?: boolean;

  @OneToOne(() => Psicologo, (psicologo) => psicologo.usuario)
  perfilPsicologo?: Psicologo;

  @OneToMany(() => Cita, (cita) => cita.paciente)
  citas?: Cita[];

  @CreateDateColumn()
  creadoEn?: Date;

  @UpdateDateColumn()
  actualizadoEn?: Date;
}