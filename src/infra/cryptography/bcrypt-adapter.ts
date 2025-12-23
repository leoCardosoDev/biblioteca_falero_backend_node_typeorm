import { Hasher } from '@/application/protocols/cryptography/hasher'
import { HashComparer } from '@/application/protocols/cryptography/hash-comparer'
import { hash, compare } from 'bcrypt'

export class BcryptAdapter implements Hasher, HashComparer {
  constructor(private readonly salt: number) { }

  async hash(plaintext: string): Promise<string> {
    return await hash(plaintext, this.salt)
  }

  async compare(plaintext: string, digest: string): Promise<boolean> {
    return await compare(plaintext, digest)
  }
}
