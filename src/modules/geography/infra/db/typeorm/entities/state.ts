import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('state')
export class StateTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 255 })
  name!: string

  @Column({ length: 2, unique: true })
  uf!: string
}
