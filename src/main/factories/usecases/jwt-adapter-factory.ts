import { JwtAdapter } from '@/shared/infra/cryptography/jwt-adapter'

export const makeJwtAdapter = (): JwtAdapter => {
  return new JwtAdapter(process.env.JWT_SECRET ?? 'secret')
}
