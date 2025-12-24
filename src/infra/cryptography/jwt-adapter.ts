import jwt from 'jsonwebtoken'

import { Encrypter } from '@/application/protocols/cryptography/encrypter'
import { Decrypter } from '@/application/protocols/cryptography/decrypter'
import { TokenPayload, Role } from '@/domain/models'

export class JwtAdapter implements Encrypter, Decrypter {
  constructor(private readonly secret: string) { }

  async encrypt(payload: TokenPayload): Promise<string> {
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
      role: (decoded.role as Role) ?? Role.MEMBER
    }
  }
}
