import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('logins')
export class LoginTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  email: string

  @Column()
  password: string

  @Column({ nullable: true })
  role?: string

  @Column({ nullable: true })
  accessToken?: string

  @Column()
  userId: string
}

