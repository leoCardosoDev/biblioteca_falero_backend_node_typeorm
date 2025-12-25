import { LoginId } from '@/domain/models/ids'

export interface UpdateAccessTokenRepository {
  updateAccessToken: (id: LoginId, token: string) => Promise<void>
}
