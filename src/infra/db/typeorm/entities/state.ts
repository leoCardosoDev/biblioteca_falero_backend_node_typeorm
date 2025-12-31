import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('state')
export class State {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 255 })
  name!: string

  @Column({ length: 2, unique: true })
  uf!: string
}
