import jwt from 'jsonwebtoken'
import { Encrypter } from '@/application/protocols/cryptography/encrypter'
import { Decrypter } from '@/application/protocols/cryptography/decrypter'

export class JwtAdapter implements Encrypter, Decrypter {
  constructor(private readonly secret: string) { }

  async encrypt(plaintext: string): Promise<string> {
    const accessToken = jwt.sign({ id: plaintext }, this.secret)
    return accessToken
  }

  async decrypt(ciphertext: string): Promise<string | undefined> {
    const decoded = jwt.verify(ciphertext, this.secret) as { id?: string }
    return decoded?.id
  }
}
