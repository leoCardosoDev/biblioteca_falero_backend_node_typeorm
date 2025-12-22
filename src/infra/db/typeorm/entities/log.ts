import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  stack!: string

  @CreateDateColumn()
  date!: Date
}
