import { randomUUID } from 'crypto'

import { IdGenerator } from '@/domain/gateways/id-generator'

export class UUIDGenerator implements IdGenerator {
  generate(): string {
    return randomUUID()
  }
}
