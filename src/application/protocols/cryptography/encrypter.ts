import { TokenPayload } from '@/domain/models'

export interface Encrypter {
  encrypt: (payload: TokenPayload) => Promise<string>
}
