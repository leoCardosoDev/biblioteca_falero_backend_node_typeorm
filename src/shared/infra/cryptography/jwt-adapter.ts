import jwt from 'jsonwebtoken'

import { Encrypter } from '@/shared/application/protocols/cryptography/encrypter'
import { Decrypter } from '@/shared/application/protocols/cryptography/decrypter'
import { TokenPayload } from '@/shared/domain/models/token-payload'

export class JwtAdapter implements Encrypter, Decrypter {
  constructor(private readonly secret: string) { }

  async encrypt(plaintext: unknown): Promise<string> {
    const payload = plaintext as TokenPayload
    const accessToken = jwt.sign({ id: payload.id, role: payload.role }, this.secret)
    return accessToken
  }

  async decrypt(ciphertext: string): Promise<TokenPayload | undefined> {
    const decoded = jwt.verify(ciphertext, this.secret) as { id?: string, role?: string }
    if (!decoded?.id) {
      return undefined
    }
    return {
      id: decoded.id,
      role: decoded.role ?? 'STUDENT'
    }
  }
}
