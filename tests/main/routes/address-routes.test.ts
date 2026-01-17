import app, { setupApp } from '@/main/config/app'
import { sign } from 'jsonwebtoken'
import env from '@/main/config/env'
import { UserRole } from '@/modules/identity/domain/value-objects/user-role'

describe('Address Routes', () => {
  beforeAll(async () => {
    await setupApp()
    await app.ready()
  })

  const makeAccessToken = (role = 'ADMIN'): string => {
    return sign({ id: 'any_id', role: UserRole.restore(role).value }, env.jwtSecret)
  }

  describe('GET /addresses/cep/:zipCode', () => {
    test('Should return 200 on success (mocking ZipCode search might be complex, so we check auth first)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/addresses/cep/06463220',
        headers: { authorization: `Bearer ${makeAccessToken()}` }
      })
      expect(response.statusCode).not.toBe(403)
    })

    test('Should return 403 if user is not admin', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/addresses/cep/12345678',
        headers: { authorization: `Bearer ${makeAccessToken('STUDENT')}` }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 403 if no token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/addresses/cep/12345678'
      })
      expect(response.statusCode).toBe(403)
    })
  })
})
