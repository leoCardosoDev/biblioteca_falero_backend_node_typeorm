import { AppError } from '@/application/errors/app-error'

export class InvalidParamError extends AppError {
  constructor(paramName: string) {
    super('INVALID_PARAM', `Invalid param: ${paramName}`, { param: paramName })
  }
}
