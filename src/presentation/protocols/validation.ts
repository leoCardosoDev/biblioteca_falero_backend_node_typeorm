export interface Validation {
  validate: (input: Record<string, unknown>) => Error | undefined
}
