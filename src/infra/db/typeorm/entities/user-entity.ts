import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('users')
export class UserTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ unique: true })
  email!: string

  @Column()
  rg!: string

  @Column({ unique: true })
  cpf!: string

  @Column({
    type: 'date',
    transformer: {
      to: (value: string) => value,
      from: (value: Date | string) => typeof value === 'string' ? value : value.toISOString().split('T')[0]
    }
  })
  dataNascimento!: string
}

