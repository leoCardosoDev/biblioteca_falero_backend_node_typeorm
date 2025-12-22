import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('accounts')
export class AccountTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column()
  email!: string

  @Column()
  password!: string
}
