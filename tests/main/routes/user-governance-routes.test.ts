
import jwt from 'jsonwebtoken'
import app, { setupApp } from '@/main/config/app'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { RoleTypeOrmEntity } from '@/infra/db/typeorm/entities/role-entity'
import { PermissionTypeOrmEntity } from '@/infra/db/typeorm/entities/permission-entity'
import { DomainEventTypeOrmEntity } from '@/infra/db/typeorm/entities/domain-event-entity'
import { DataSource } from 'typeorm'




describe('User Governance Routes', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [UserTypeOrmEntity, LoginTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity, DomainEventTypeOrmEntity]
    })
    await setupApp()
    await app.ready()
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
    await app.close()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true)
  })

  describe('PATCH /users/:id/status', () => {
    test('Should return 403 if no access token is provided', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/users/any_id/status',
        payload: { status: 'BLOCKED' }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 204 on success', async () => {
      const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
      const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
      const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)

      const adminRole = await roleRepo.save(roleRepo.create({
        slug: 'ADMIN',
        description: 'Administrator',
        powerLevel: 100
      }))

      const userRole = await roleRepo.save(roleRepo.create({
        slug: 'USER',
        description: 'Regular User',
        powerLevel: 10
      }))

      // Actor (Admin)
      const actorParams = {
        name: 'Admin User',
        email: 'admin@mail.com',
        rg: 'admin_rg',
        cpf: 'admin_cpf',
        gender: 'male',
        password: 'password' // needed for login? checks schema constraints
      }
      const actorUser = await userRepo.save(userRepo.create(actorParams))
      await loginRepo.save(loginRepo.create({
        userId: actorUser.id,
        password: 'hashed_password',
        roleId: adminRole.id
      }))

      // Target (User)
      const targetParams = {
        name: 'User To Block',
        email: 'block@mail.com',
        rg: '123456789',
        cpf: '52998224725',
        gender: 'male'
      }
      const targetUser = await userRepo.save(userRepo.create(targetParams))
      await loginRepo.save(loginRepo.create({
        userId: targetUser.id,
        password: 'hashed_password',
        roleId: userRole.id
      }))

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/users/${targetUser.id}/status`,
        headers: { authorization: `Bearer ${jwt.sign({ id: actorUser.id, role: 'ADMIN' }, process.env.JWT_SECRET ?? 'secret')}` }, // Manual token to ensure ID matches
        payload: { status: 'BLOCKED' }
      })
      expect(response.statusCode).toBe(204)

      const updatedUser = await userRepo.findOneBy({ id: targetUser.id })
      expect(updatedUser?.status).toBe('BLOCKED')
    })
  })

  describe('PATCH /users/:id/role', () => {
    test('Should return 403 if no access token is provided', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/users/any_id/role',
        payload: { roleId: 'any_role_id' }
      })
      expect(response.statusCode).toBe(403)
    })

    test('Should return 204 on success', async () => {
      const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
      const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
      const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)

      const adminRole = await roleRepo.save(roleRepo.create({
        slug: 'ADMIN',
        description: 'Administrator',
        powerLevel: 100
      }))

      const userRole = await roleRepo.save(roleRepo.create({
        slug: 'USER',
        description: 'Regular User',
        powerLevel: 10
      }))

      const newRole = await roleRepo.save(roleRepo.create({
        slug: 'NEW_ROLE',
        description: 'New Role',
        powerLevel: 50
      }))

      // Actor (Admin)
      const actorUser = await userRepo.save(userRepo.create({
        name: 'Admin User',
        email: 'admin@mail.com',
        rg: 'admin_rg',
        cpf: 'admin_cpf',
        gender: 'male'
      }))
      await loginRepo.save(loginRepo.create({
        userId: actorUser.id,
        password: 'hashed_password',
        roleId: adminRole.id
      }))

      // Target (User)
      const targetUser = await userRepo.save(userRepo.create({
        name: 'User To Promote',
        email: 'promote@mail.com',
        rg: '123456789',
        cpf: '52998224725',
        gender: 'male'
      }))
      const targetLogin = await loginRepo.save(loginRepo.create({
        userId: targetUser.id,
        password: 'hashed_password',
        roleId: userRole.id
      }))

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/users/${targetUser.id}/role`,
        headers: { authorization: `Bearer ${jwt.sign({ id: actorUser.id, role: 'ADMIN' }, process.env.JWT_SECRET ?? 'secret')}` },
        payload: { roleId: newRole.id }
      })
      expect(response.statusCode).toBe(204)

      const updatedLogin = await loginRepo.findOneBy({ id: targetLogin.id })
      expect(updatedLogin?.roleId).toBe(newRole.id)
    })
  })
})
