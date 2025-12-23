import { TokenPayload } from '@/domain/models'

export interface Decrypter {
  decrypt: (ciphertext: string) => Promise<TokenPayload | undefined>
}
