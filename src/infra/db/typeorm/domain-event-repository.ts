import { SaveDomainEventRepository } from '@/domain/events/domain-events'
import { DomainEvent } from '@/domain/events/domain-event'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { DomainEventTypeOrmEntity } from './entities/domain-event-entity'

export class DomainEventTypeOrmRepository implements SaveDomainEventRepository {
  async save(event: DomainEvent): Promise<void> {
    const repository = TypeOrmHelper.getRepository(DomainEventTypeOrmEntity)
    const domainEventRecord = repository.create({
      aggregate_id: event.aggregateId,
      type: event.type,
      payload: event.payload,
      created_at: event.createdAt
    })
    await repository.save(domainEventRecord)
  }
}
