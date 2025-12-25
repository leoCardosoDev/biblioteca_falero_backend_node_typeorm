import { AppError } from './app-error'

export class MissingParamError extends AppError {
  constructor(paramName: string) {
    super('MISSING_PARAM', `Missing param: ${paramName}`, { param: paramName })
  }
}
