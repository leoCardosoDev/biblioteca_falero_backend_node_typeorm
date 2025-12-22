import { LogErrorRepository } from '@/application/protocols/log-error-repository'
import { TypeOrmHelper } from './typeorm-helper'
import { Log } from './entities/log'

export class LogRepository implements LogErrorRepository {
  async logError(stack: string): Promise<void> {
    const logRepo = TypeOrmHelper.getRepository(Log)
    const log = logRepo.create({
      stack,
      date: new Date()
    })
    await logRepo.save(log)
  }
}
