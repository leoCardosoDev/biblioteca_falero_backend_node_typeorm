import { AppError } from '@/application/errors/app-error'

export class UserAlreadyExistsError extends AppError {
  constructor() {
    super('USER_ALREADY_EXISTS', 'User already exists')
    this.name = 'UserAlreadyExistsError'
  }
}
