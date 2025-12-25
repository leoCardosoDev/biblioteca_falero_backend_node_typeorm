import { FastifyInstance } from 'fastify'
import { adaptRoute } from '@/main/adapters/fastify-route-adapter'
import { makeLoginController } from '@/main/factories/login/login-controller-factory'
import { makeRefreshTokenController } from '@/main/factories/login/refresh-token-controller-factory'

const loginSchema = {
  tags: ['Auth'],
  summary: 'User authentication',
  description: 'Authenticates a user with email and password, returns access and refresh tokens',
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', description: 'User email address' },
      password: { type: 'string', description: 'User password' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'JWT access token' },
        refreshToken: { type: 'string', description: 'JWT refresh token' },
        name: { type: 'string', description: 'User name' },
        role: { type: 'string', description: 'User role' }
      }
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
}

const refreshTokenSchema = {
  tags: ['Auth'],
  summary: 'Refresh access token',
  description: 'Uses a refresh token to obtain a new access token',
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string', description: 'JWT refresh token' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'New JWT access token' },
        refreshToken: { type: 'string', description: 'New JWT refresh token' }
      }
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post('/login', {
    schema: loginSchema,
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  }, adaptRoute(makeLoginController()))

  fastify.post('/refresh-token', {
    schema: refreshTokenSchema
  }, adaptRoute(makeRefreshTokenController()))
}
