export const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        code: { type: 'string' },
        message: { type: 'string' },
        details: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true
          }
        }
      },
      required: ['type', 'code', 'message']
    }
  }
}
