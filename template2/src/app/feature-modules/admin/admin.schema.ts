import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../utility/base.entity.js';
import { Role } from '../../utility/constant.js';

@Entity('admins')
export class Admin extends BaseEntity {
  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ default: Role.ADMIN })
  role!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', nullable: true })
  password!: string | null;
}
