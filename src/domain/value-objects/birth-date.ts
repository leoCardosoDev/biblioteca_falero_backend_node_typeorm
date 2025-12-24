import { InvalidBirthDateError } from '@/domain/errors/invalid-birth-date-error'

export class BirthDate {
  private readonly date: string

  private constructor(date: string) {
    this.date = date
  }

  get value(): string {
    return this.date
  }

  static create(dateStr: string): BirthDate | InvalidBirthDateError {
    if (!dateStr) {
      return new InvalidBirthDateError(dateStr)
    }
    const parsed = new Date(dateStr)
    if (isNaN(parsed.getTime())) {
      return new InvalidBirthDateError(dateStr)
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (parsed > today) {
      return new InvalidBirthDateError(dateStr)
    }
    const isoDate = dateStr.split('T')[0]
    return new BirthDate(isoDate)
  }
}
