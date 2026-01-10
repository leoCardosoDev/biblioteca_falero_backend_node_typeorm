export const citySchema = {
  $id: 'City',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    stateId: { type: 'string', format: 'uuid' }
  }
}

export const stateSchema = {
  $id: 'State',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    uf: { type: 'string', minLength: 2, maxLength: 2 }
  }
}
