import { randomUUID } from 'crypto'

import { IdGenerator } from '@/shared/domain/gateways/id-generator'

export class UUIDGenerator implements IdGenerator {
  generate(): string {
    return randomUUID()
  }
}
