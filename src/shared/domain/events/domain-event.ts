export interface DomainEvent {
  aggregateId: string
  type: string
  payload: unknown
  createdAt: Date
}
