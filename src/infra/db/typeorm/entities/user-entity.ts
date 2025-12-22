import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('users')
export class UserTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column()
  email!: string

  @Column()
  rg!: string

  @Column()
  cpf!: string
}

