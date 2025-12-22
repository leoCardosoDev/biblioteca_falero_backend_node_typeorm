import { LogErrorRepository } from '@/application/protocols/log-error-repository'
import { TypeOrmHelper } from './typeorm-helper'
import { LogTypeOrmEntity } from './entities/log-entity'

export class LogRepository implements LogErrorRepository {
  async logError(stack: string): Promise<void> {
    const logRepo = TypeOrmHelper.getRepository(LogTypeOrmEntity)
    const log = logRepo.create({
      stack,
      date: new Date()
    })
    await logRepo.save(log)
  }
}
