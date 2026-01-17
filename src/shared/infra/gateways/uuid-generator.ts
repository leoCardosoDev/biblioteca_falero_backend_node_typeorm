import { randomUUID } from 'crypto'

import { IdGenerator } from '@/shared/application/gateways'

export class UUIDGenerator implements IdGenerator {
  generate(): string {
    return randomUUID()
  }
}
