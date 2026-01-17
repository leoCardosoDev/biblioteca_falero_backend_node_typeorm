import 'reflect-metadata'
import { randomUUID } from 'crypto'
import { TypeOrmHelper } from '@/shared/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmRepository } from '@/modules/identity/infra/db/typeorm/repositories/user-repository'
import { UserTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/login-entity'
import { RoleTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/role-entity'
import { PermissionTypeOrmEntity } from '@/modules/identity/infra/db/typeorm/entities/permission-entity'
import { StateTypeOrmEntity as State } from '@/modules/geography/infra/db/typeorm/entities/state'
import { CityTypeOrmEntity as City } from '@/modules/geography/infra/db/typeorm/entities/city'
import { NeighborhoodTypeOrmEntity as Neighborhood } from '@/modules/geography/infra/db/typeorm/entities/neighborhood'
import { DataSource } from 'typeorm'
import { AddUserRepoParams } from '@/modules/identity/application/usecases/add-user'
import { Id, Email, Cpf, Name, Rg, Address, UserStatus, UserStatusEnum } from '@/modules/identity/domain/value-objects'
import { UserMapper } from '@/modules/identity/infra/db/typeorm/mappers/user-mapper'

describe('UserTypeOrmRepository', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [UserTypeOrmEntity, LoginTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity, State, City, Neighborhood],
      synchronize: true,
      logging: false
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-10T12:00:00Z'))
    await dataSource.synchronize(true)

    // Seed roles
    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    await roleRepo.save([
      { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'ADMIN', description: 'Admin', powerLevel: 100 },
      { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'LIBRARIAN', description: 'Librarian', powerLevel: 50 }
    ])

    // Seed Geo
    const stateRepo = TypeOrmHelper.getRepository(State)
    await stateRepo.save({ id: '550e8400-e29b-41d4-a716-446655440003', name: 'State Test', uf: 'ST' })

    const cityRepo = TypeOrmHelper.getRepository(City)
    await cityRepo.save({ id: '550e8400-e29b-41d4-a716-446655440002', name: 'City Test', state: { id: '550e8400-e29b-41d4-a716-446655440003' } as State })

    const neighborhoodRepo = TypeOrmHelper.getRepository(Neighborhood)
    await neighborhoodRepo.save({ id: '550e8400-e29b-41d4-a716-446655440001', name: 'Neighborhood Test', city: { id: '550e8400-e29b-41d4-a716-446655440002' } as City })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const makeSut = (): UserTypeOrmRepository => {
    return new UserTypeOrmRepository()
  }

  const makeUserData = (suffix = ''): AddUserRepoParams => ({
    id: Id.create(randomUUID()),
    name: Name.restore('name' + suffix),
    email: Email.restore(`any${suffix}${Date.now()}${Math.random().toString().split('.')[1]}@mail.com`),
    rg: Rg.restore('rg' + suffix + Math.floor(Math.random() * 1000).toString()),
    cpf: Cpf.restore('cpf' + suffix + Math.floor(Math.random() * 1000).toString()),
    gender: 'any_gender',
    phone: 'any_phone',
    status: UserStatus.restore(UserStatusEnum.ACTIVE)
  })

  test('Should return a user on success', async () => {
    const sut = makeSut()
    const userData = makeUserData('s')
    const user = await sut.add(userData)
    expect(user).toBeTruthy()
    expect(user.id).toBeTruthy()
  })

  test('Should throw when adding user with duplicate email', async () => {
    const sut = makeSut()
    const userData = makeUserData('dup')
    await sut.add(userData)
    const promise = sut.add({
      ...makeUserData('other'),
      email: userData.email
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should throw when adding user with duplicate cpf', async () => {
    const sut = makeSut()
    const userData = makeUserData('cpf')
    await sut.add(userData)
    const promise = sut.add({
      ...makeUserData('other_cpf'),
      cpf: userData.cpf
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should return a user on loadByEmail success', async () => {
    const sut = makeSut()
    const userData = makeUserData('email')
    await sut.add(userData)
    const user = await sut.loadByEmail(userData.email.value)
    expect(user).toBeTruthy()
    expect(user?.email.value).toBe(userData.email.value)
  })

  test('Should return undefined if loadByEmail finds no user', async () => {
    const sut = makeSut()
    const user = await sut.loadByEmail('not_found@mail.com')
    expect(user).toBeUndefined()
  })

  test('Should return a user on loadByCpf success', async () => {
    const sut = makeSut()
    const userData = makeUserData('load_cpf')
    await sut.add(userData)
    const user = await sut.loadByCpf(userData.cpf.value)
    expect(user).toBeTruthy()
    expect(user?.cpf.value).toBe(userData.cpf.value)
  })

  test('Should return all users on loadAll success', async () => {
    const sut = makeSut()
    await sut.add(makeUserData('1'))
    await sut.add(makeUserData('2'))
    const users = await sut.loadAll()
    expect(users.length).toBe(2)
  })

  test('Should return null if loadById finds no user', async () => {
    const sut = makeSut()
    const user = await sut.loadById('invalid_id')
    expect(user).toBeNull()
  })

  test('Should return all users with login data on loadAll success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('login'))
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await loginRepo.save(loginRepo.create({
      userId: user.id.value,
      password: 'any_password',
      roleId: '550e8400-e29b-41d4-a716-446655440001', // Admin
      status: 'active'
    }))

    const users = await sut.loadAll()
    // Find the user we just added
    const targetUser = users.find(u => u.id.value === user.id.value)
    expect(targetUser?.login?.role.value).toBe('ADMIN')
  })

  test('Should update a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('update'))
    const updatedUser = await sut.update({
      id: user.id,
      name: Name.create('updated_name') as Name
    })
    expect(updatedUser!.name.value).toBe('updated_name')
  })

  test('Should update all user fields', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('update_all'))

    const updatedUser = await sut.update({
      id: user.id,
      name: Name.create('new_name') as Name,
      email: Email.create('new_email@mail.com') as Email,
      rg: Rg.create('newRg123') as Rg,
      cpf: Cpf.create('25162396028') as Cpf,
      gender: 'female',
      phone: 'new_phone'
    })

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const dbUser = await userRepo.findOne({ where: { id: user.id.value } })

    expect(dbUser?.name).toBe('new_name')
    expect(dbUser?.email).toBe('new_email@mail.com')
    expect(dbUser?.rg).toBe('newRg123')
    expect(dbUser?.cpf).toBe('25162396028')
    expect(dbUser?.gender).toBe('female')
    expect(dbUser?.phone).toBe('new_phone')

    expect(updatedUser?.name.value).toBe('new_name')
    expect(updatedUser?.email.value).toBe('new_email@mail.com')
  })

  test('Should update user address fields', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('update_addr'))

    // Create new address VO
    const newAddress = Address.create({
      street: 'New Street',
      number: '999',
      complement: 'New Compl',
      neighborhoodId: Id.create('550e8400-e29b-41d4-a716-446655440001') as Id,
      cityId: Id.create('550e8400-e29b-41d4-a716-446655440002') as Id,
      stateId: Id.create('550e8400-e29b-41d4-a716-446655440003') as Id,
      zipCode: '87654321'
    }) as Address

    const updatedUser = await sut.update({
      id: user.id,
      address: newAddress
    })

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const dbUser = await userRepo.findOne({ where: { id: user.id.value } })

    expect(dbUser?.addressStreet).toBe('New Street')
    expect(dbUser?.addressNumber).toBe('999')
    expect(dbUser?.addressComplement).toBe('New Compl')
    expect(dbUser?.addressZipCode).toBe('87654321')
    expect(updatedUser?.address?.street).toBe('New Street')
  })

  test('Should update user status when passed in update method', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('status_update'))

    // Using strict Value Object for status
    const newStatus = UserStatus.create('INACTIVE') as UserStatus

    const updatedUser = await sut.update({
      id: user.id,
      status: newStatus
    })

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const dbUser = await userRepo.findOne({ where: { id: user.id.value } })

    expect(dbUser?.status).toBe('INACTIVE')
    expect(updatedUser?.status.value).toBe('INACTIVE')
  })

  test('Should throw OptimisticLockError if version mismatch', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('opt_lock'))

    const promise = sut.update({
      id: user.id,
      name: Name.create('new_name') as Name,
      version: 999 // Mismatch
    })

    await expect(promise).rejects.toThrow('OptimisticLockError: version mismatch')
  })

  test('Should soft delete a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('delete'))
    await sut.delete(user.id.value)

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const dbUser = await userRepo.findOne({ where: { id: user.id.value } })
    expect(dbUser?.deletedAt).not.toBeNull()
  })

  test('Should add a user with address on success', async () => {
    const sut = makeSut()
    const userData = {
      ...makeUserData('address'),
      address: Address.create({
        street: 'any_street',
        number: '123',
        complement: 'apt 1',
        neighborhoodId: Id.create('550e8400-e29b-41d4-a716-446655440001'),
        cityId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
        stateId: Id.create('550e8400-e29b-41d4-a716-446655440003'),
        zipCode: '12345678'
      }) as Address
    }
    const user = await sut.add(userData)
    expect(user.address?.cityId.value).toBe('550e8400-e29b-41d4-a716-446655440002')
  })

  test('Should handle non-Error thrown by VO creation', async () => {
    const id = randomUUID()
    await dataSource.createQueryBuilder()
      .insert()
      .into(UserTypeOrmEntity)
      .values({
        id,
        name: 'any',
        email: 'error' + Date.now() + Math.random().toString().split('.')[1] + '@mail.com',
        rg: 'rg' + Date.now() + Math.floor(Math.random() * 1000),
        cpf: 'cpf' + Date.now() + Math.floor(Math.random() * 1000),
        gender: 'any_gender',
        status: 'ACTIVE',
        version: 1,
        addressStateId: '550e8400-e29b-41d4-a716-446655440003',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .execute()

    const sut = makeSut()
    jest.spyOn(Email, 'create').mockImplementation(() => { throw 'string-error' })
    const users = await sut.loadAll()
    expect(users.length).toBe(1)
    jest.restoreAllMocks()
  })

  test('Should include login data even if UserRole in login is invalid', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('inv_role'))
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)

    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    const roleId = randomUUID()
    await roleRepo.save({ id: roleId, slug: 'invalid_role', description: 'Invalid', powerLevel: 0 })

    await loginRepo.save(loginRepo.create({
      userId: user.id.value,
      password: 'any_password',
      roleId,
      status: 'active'
    }) as unknown as LoginTypeOrmEntity)

    const users = await sut.loadAll()
    // Find our user
    const targetUser = users.find(u => u.id.value === user.id.value)
    expect(targetUser?.login?.role.value).toBe('INVALID_ROLE')
  })

  test('Should return fallback values when login role or status is missing', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('fallback'))
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)

    // Insert login with missing role and status (nullable columns)
    await loginRepo.save(loginRepo.create({
      userId: user.id.value,
      password: 'any_password',
      // roleId is undefined
      // status is undefined
    }))

    const users = await sut.loadAll()
    const targetUser = users.find(u => u.id.value === user.id.value)

    // Expect fallbacks: USER and ACTIVE
    expect(targetUser?.login?.role.value).toBe('USER')
    expect(targetUser?.login?.status.value).toBe('ACTIVE')
  })

  test('Should update the user status on updateStatus success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData('status_up'))
    await sut.updateStatus(user.id.value, UserStatus.create('inactive') as UserStatus)

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const dbUser = await userRepo.findOne({ where: { id: user.id.value } })
    expect(dbUser?.status).toBe('INACTIVE')
  })
  test('Should skip users that fail mapping in loadAll', async () => {
    const sut = makeSut()
    await sut.add(makeUserData('skip1'))
    await sut.add(makeUserData('skip2'))

    // Spy on UserMapper.toDomain
    // First call throws, second call returns OK.

    const originalToDomain = UserMapper.toDomain

    let callCount = 0
    jest.spyOn(UserMapper, 'toDomain').mockImplementation((entity) => {
      callCount++
      if (callCount === 1) {
        throw new Error('Mapping error')
      }
      return originalToDomain(entity)
    })

    const users = await sut.loadAll()
    // Should have 2 users in DB, but only 1 returned
    expect(users.length).toBe(1)

    jest.restoreAllMocks()
  })
})
