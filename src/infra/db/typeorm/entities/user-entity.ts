import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export const dateTransformer = {
  to: (value: string) => value,
  from: (value: Date | string) => {
    if (typeof value === 'string') {
      return value
    }
    return value.toISOString().split('T')[0]
  }
}

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
    transformer: dateTransformer
  })
  dataNascimento!: string
}

