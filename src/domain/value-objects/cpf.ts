import { InvalidCpfError } from '@/domain/errors/invalid-cpf-error'

export class Cpf {
  private readonly cpf: string

  private constructor(cpf: string) {
    this.cpf = cpf
  }

  get value(): string {
    return this.cpf
  }

  static create(cpf: string): Cpf {
    const cleaned = cpf.replace(/\D/g, '')
    if (!cleaned || !Cpf.isValid(cleaned)) {
      throw new InvalidCpfError()
    }
    return new Cpf(cleaned)
  }

  private static isValid(cpf: string): boolean {
    if (cpf.length !== 11) return false
    if (/^(\d)\1+$/.test(cpf)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10) remainder = 0
    if (remainder !== parseInt(cpf.charAt(10))) return false

    return true
  }
}
