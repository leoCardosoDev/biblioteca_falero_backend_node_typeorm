export class ExpirationDate {
  private constructor(private readonly value: Date) { }

  static fromDays(days: number): ExpirationDate {
    if (days <= 0) {
      throw new Error('Expiration days must be a positive number')
    }
    const date = new Date()
    date.setDate(date.getDate() + days)
    return new ExpirationDate(date)
  }

  static fromDate(date: Date): ExpirationDate {
    if (date <= new Date()) {
      throw new Error('Expiration date must be in the future')
    }
    return new ExpirationDate(date)
  }

  toDate(): Date {
    return this.value
  }

  isExpired(): boolean {
    return new Date() > this.value
  }
}
