import { Hasher } from '@/application/protocols/cryptography/hasher'
import { HashComparer } from '@/application/protocols/cryptography/hash-comparer'
import crypto from 'crypto'

export class Sha256Adapter implements Hasher, HashComparer {
  async hash(plaintext: string): Promise<string> {
    return crypto.createHash('sha256').update(plaintext).digest('hex')
  }

  async compare(plaintext: string, digest: string): Promise<boolean> {
    const hash = await this.hash(plaintext)
    return hash === digest
  }
}
