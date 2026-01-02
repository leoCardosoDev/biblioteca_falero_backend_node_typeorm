import 'reflect-metadata'
import { TypeOrmHelper } from '@/infra/db/typeorm/typeorm-helper'
import { UserTypeOrmRepository } from '@/infra/db/typeorm/user-repository'
import { UserTypeOrmEntity } from '@/infra/db/typeorm/entities/user-entity'
import { LoginTypeOrmEntity } from '@/infra/db/typeorm/entities/login-entity'
import { RoleTypeOrmEntity } from '@/infra/db/typeorm/entities/role-entity'
import { PermissionTypeOrmEntity } from '@/infra/db/typeorm/entities/permission-entity'
import { DataSource } from 'typeorm'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { Address } from '@/domain/value-objects/address'
import { Id } from '@/domain/value-objects/id'
import { UserStatus, UserStatusEnum } from '@/domain/value-objects/user-status'

describe('UserTypeOrmRepository', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [UserTypeOrmEntity, LoginTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity],
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
      { id: '550e8400-e29b-41d4-a716-446655440001', slug: 'ADMIN', description: 'Admin' },
      { id: '550e8400-e29b-41d4-a716-446655440002', slug: 'librarian', description: 'Librarian' }
    ])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const makeSut = (): UserTypeOrmRepository => {
    return new UserTypeOrmRepository()
  }

  const makeUserData = () => ({
    name: Name.create('any_name') as Name,
    email: Email.create('any_email@mail.com'),
    rg: Rg.create('123456789') as Rg,
    cpf: Cpf.create('529.982.247-25'),
    gender: 'any_gender',
    status: UserStatus.create('ACTIVE') as UserStatus
  })

  test('Should return a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    expect(user).toBeTruthy()
    expect(user.id).toBeTruthy()
    expect(user.name.value).toBe('any_name')
    expect(user.email.value).toBe('any_email@mail.com')
    expect(user.rg.value).toBe('123456789')
    expect(user.cpf.value).toBe('52998224725')
    expect(user.gender).toBe('any_gender')
  })

  test('Should throw when adding user with duplicate email', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    const promise = sut.add({
      name: Name.create('other_name') as Name,
      email: Email.create('any_email@mail.com'),
      rg: Rg.create('987654321') as Rg,
      cpf: Cpf.create('71428793860'),
      gender: 'any_gender',
      status: UserStatus.create('ACTIVE') as UserStatus
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should throw when adding user with duplicate cpf', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    const promise = sut.add({
      name: Name.create('other_name') as Name,
      email: Email.create('other@mail.com'),
      rg: Rg.create('987654321') as Rg,
      cpf: Cpf.create('529.982.247-25'),
      gender: 'any_gender',
      status: UserStatus.create('ACTIVE') as UserStatus
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should return a user on loadByEmail success', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    const user = await sut.loadByEmail('any_email@mail.com')
    expect(user).toBeTruthy()
    expect(user?.id).toBeTruthy()
    expect(user?.name.value).toBe('any_name')
    expect(user?.email.value).toBe('any_email@mail.com')
    expect(user?.rg.value).toBe('123456789')
    expect(user?.cpf.value).toBe('52998224725')
    expect(user?.gender).toBe('any_gender')
  })

  test('Should return undefined if loadByEmail finds no user', async () => {
    const sut = makeSut()
    const user = await sut.loadByEmail('any_email@mail.com')
    expect(user).toBeUndefined()
  })

  test('Should return a user on loadByCpf success', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    const user = await sut.loadByCpf('52998224725')
    expect(user).toBeTruthy()
    expect(user?.id).toBeTruthy()
    expect(user?.name.value).toBe('any_name')
    expect(user?.email.value).toBe('any_email@mail.com')
    expect(user?.rg.value).toBe('123456789')
    expect(user?.cpf.value).toBe('52998224725')
    expect(user?.gender).toBe('any_gender')
  })

  test('Should return undefined if loadByCpf finds no user', async () => {
    const sut = makeSut()
    const user = await sut.loadByCpf('52998224725')
    expect(user).toBeUndefined()
  })

  test('Should return all users on loadAll success', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())
    await sut.add({
      name: Name.create('User 2') as Name,
      email: Email.create('user2@mail.com'),
      rg: Rg.create('987654321') as Rg,
      cpf: Cpf.create('71428793860'),
      gender: 'male',
      status: UserStatus.create('ACTIVE') as UserStatus
    })
    const users = await sut.loadAll()
    expect(users.length).toBe(2)
    expect(users[0].name.value).toBe('any_name')
    expect(users[1].name.value).toBe('User 2')
  })

  test('Should return all users with login data on loadAll success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await loginRepo.save(loginRepo.create({
      userId: user.id.value,
      password: 'any_password',
      roleId: '550e8400-e29b-41d4-a716-446655440001', // Admin role
      status: 'active'
    }))

    const users = await sut.loadAll()
    expect(users.length).toBe(1)
    expect(users[0].login).toBeTruthy()
    expect(users[0].login?.role.value).toBe('ADMIN')
    expect(users[0].login?.status.value).toBe('ACTIVE')
  })

  test('Should return empty list if no users found', async () => {
    const sut = makeSut()
    const users = await sut.loadAll()
    expect(users.length).toBe(0)
  })

  test('Should update a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    const updatedUser = await sut.update({
      id: user.id,
      name: Name.create('updated_name') as Name,
      email: Email.create('updated_email@mail.com')
    })
    expect(updatedUser).toBeTruthy()
    expect(updatedUser!.name.value).toBe('updated_name')
    expect(updatedUser!.email.value).toBe('updated_email@mail.com')
    expect(updatedUser!.rg.value).toBe('123456789')
  })

  test('Should soft delete a user on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    await sut.delete(user.id.value)

    // Verify soft delete in DB (row should exist with deletedAt)
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const dbUser = await userRepo.findOne({ where: { id: user.id.value } })
    expect(dbUser).toBeTruthy()
    expect(dbUser?.deletedAt).not.toBeNull()
    expect(dbUser?.status).toBe('INACTIVE')

    // Verify public API returns undefined
    const deletedUser = await sut.loadByEmail('any_email@mail.com')
    expect(deletedUser).toBeUndefined()
  })

  test('Should not load soft deleted user by loadByCpf', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'deleted_user',
      email: 'deleted@mail.com',
      rg: 'any_rg',
      cpf: '52998224725',
      gender: 'male',
      deletedAt: new Date(),
      status: 'INACTIVE'
    })
    await userRepo.save(user)

    const loaded = await sut.loadByCpf('52998224725')
    expect(loaded).toBeUndefined()
  })

  test('Should not load soft deleted user by loadById', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'deleted_by_id',
      email: 'deleted_id@mail.com',
      rg: 'any_rg_id',
      cpf: 'any_cpf_id',
      gender: 'male',
      deletedAt: new Date(),
      status: 'INACTIVE'
    })
    await userRepo.save(user)

    const loaded = await sut.loadById(user.id)
    expect(loaded).toBeNull()
  })

  test('Should not load soft deleted user by loadAll', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'deleted_all',
      email: 'deleted_all@mail.com',
      rg: 'any_rg_all',
      cpf: 'any_cpf_all',
      gender: 'male',
      deletedAt: new Date(),
      status: 'INACTIVE'
    })
    await userRepo.save(user)

    const users = await sut.loadAll()
    expect(users.length).toBe(0)
  })

  test('Should add a user with address on success', async () => {
    const sut = makeSut()
    const userData = {
      ...makeUserData(),
      address: Address.create({
        street: 'any_street',
        number: '123',
        complement: 'apt 1',
        neighborhoodId: 'any_neighborhood_id',
        cityId: 'any_city_id',
        zipCode: '12345678'
      }) as Address
    }
    const user = await sut.add(userData)
    expect(user.address).toBeTruthy()
    expect(user.address?.street).toBe('any_street')
    expect(user.address?.number).toBe('123')
    expect(user.address?.cityId).toBe('any_city_id')
  })

  test('Should update a user with address on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    const updatedUser = await sut.update({
      id: user.id,
      address: Address.create({
        street: 'updated_street',
        number: '456',
        neighborhoodId: 'updated_neighborhood_id',
        cityId: 'updated_city_id',
        zipCode: '87654321'
      }) as Address
    })
    expect(updatedUser).toBeTruthy()
    expect(updatedUser!.address).toBeTruthy()
    expect(updatedUser!.address?.street).toBe('updated_street')
    expect(updatedUser!.address?.cityId).toBe('updated_city_id')
  })

  test('Should return null if update is called with non-existent id', async () => {
    const sut = makeSut()
    const result = await sut.update({
      id: Id.create('550e8400-e29b-41d4-a716-446655440099'),
      name: Name.create('any_name') as Name
    })
    expect(result).toBeNull()
  })

  test('Should update rg on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    const updatedUser = await sut.update({
      id: user.id,
      rg: Rg.create('987654321') as Rg
    })
    expect(updatedUser).toBeTruthy()
    expect(updatedUser!.rg.value).toBe('987654321')
  })

  test('Should update cpf on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    const updatedUser = await sut.update({
      id: user.id,
      cpf: Cpf.create('71428793860')
    })
    expect(updatedUser).toBeTruthy()
    expect(updatedUser!.cpf.value).toBe('71428793860')
  })

  test('Should update gender on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    const updatedUser = await sut.update({
      id: user.id,
      gender: 'female'
    })
    expect(updatedUser).toBeTruthy()
    expect(updatedUser!.gender).toBe('female')
  })

  test('Should return user with undefined address if DB has invalid address data (defensive check)', async () => {
    // Simulates corrupt data in DB - address fields exist but are invalid
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const entity = userRepo.create({
      name: 'any_name',
      email: 'corrupt_test@mail.com',
      rg: '123456789',
      cpf: '52998224725',
      gender: 'any_gender',
      // Invalid address: zipCode has wrong length
      addressStreet: 'any_street',
      addressNumber: '123',
      addressNeighborhoodId: 'any_neighborhood_id',
      addressCityId: 'any_city_id',
      addressZipCode: 'invalid_zip'
    })
    await userRepo.save(entity)

    const sut = makeSut()
    const user = await sut.loadByEmail('corrupt_test@mail.com')

    expect(user).toBeTruthy()
    expect(user?.address).toBeUndefined() // Defensive check: invalid address should not be assigned
  })

  test('Should exclude users with invalid email from loadAll results (domain shielding)', async () => {
    // Insert a valid user
    const sut = makeSut()
    await sut.add(makeUserData())

    // Directly insert a user with invalid email (bypassing domain validation)
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const corruptEntity = userRepo.create({
      name: 'Corrupt User',
      email: 'invalid-email-no-at-symbol', // Invalid: no '@'
      rg: '111222333',
      cpf: '71428793860',
      gender: 'any_gender'
    })
    await userRepo.save(corruptEntity)

    // Act
    const users = await sut.loadAll()

    // Assert: Should NOT throw, should return only the valid user
    expect(users.length).toBe(1)
    expect(users[0].email.value).toBe('any_email@mail.com')
  })

  test('Should exclude users with invalid Name from loadAll results', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const corruptEntity = userRepo.create({
      name: 'A', // Invalid: too short (min 2 chars)
      email: 'invalid_name_user@mail.com',
      rg: '111222333',
      cpf: '71428793860',
      gender: 'any_gender'
    })
    await userRepo.save(corruptEntity)

    const users = await sut.loadAll()

    expect(users.length).toBe(1)
    expect(users[0].name.value).toBe('any_name')
  })

  test('Should exclude users with invalid RG from loadAll results', async () => {
    const sut = makeSut()
    await sut.add(makeUserData())

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const corruptEntity = userRepo.create({
      name: 'Valid Name',
      email: 'invalid_rg_user@mail.com',
      rg: '', // Invalid: empty RG
      cpf: '71428793860',
      gender: 'any_gender'
    })
    await userRepo.save(corruptEntity)

    const users = await sut.loadAll()

    expect(users.length).toBe(1)
    expect(users[0].email.value).toBe('any_email@mail.com')
  })

  test('Should return undefined from loadByEmail if user data is corrupt', async () => {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const corruptEntity = userRepo.create({
      name: 'Valid Name',
      email: 'corrupt_loadbyemail@mail.com',
      rg: '', // Invalid: empty RG
      cpf: '71428793860',
      gender: 'any_gender'
    })
    await userRepo.save(corruptEntity)

    const sut = makeSut()
    const user = await sut.loadByEmail('corrupt_loadbyemail@mail.com')

    expect(user).toBeUndefined()
  })

  test('Should return undefined from loadByCpf if user data is corrupt', async () => {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const corruptEntity = userRepo.create({
      name: 'A', // Invalid: too short
      email: 'corrupt_loadbycpf@mail.com',
      rg: '111222333',
      cpf: '71428793860',
      gender: 'any_gender'
    })
    await userRepo.save(corruptEntity)

    const sut = makeSut()
    const user = await sut.loadByCpf('71428793860')

    expect(user).toBeUndefined()
  })

  test('Should throw error if add fails to reconstitute saved user (line 102)', async () => {
    const sut = makeSut()
    // Spy on private method to force null return after save
    jest.spyOn(sut as unknown as { toUserModel: () => null }, 'toUserModel').mockReturnValueOnce(null)

    const promise = sut.add(makeUserData())

    await expect(promise).rejects.toThrow('Failed to create user: data corruption detected after save')
  })

  test('Should throw error if update fails to reconstitute saved user (line 151)', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())

    // Spy on private method to force null return after update
    jest.spyOn(sut as unknown as { toUserModel: () => null }, 'toUserModel').mockReturnValueOnce(null)

    const promise = sut.update({
      id: user.id,
      name: Name.create('updated_name') as Name
    })

    await expect(promise).rejects.toThrow('Failed to update user: data corruption detected after save')
  })

  test('Should handle non-Error thrown by VO creation (line 77 String(error) fallback)', async () => {
    // Insert a user directly in DB (bypassing VOs)
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const entityWithValidData = userRepo.create({
      name: 'Valid Name',
      email: 'test_string_error@mail.com',
      rg: '111222333',
      cpf: '71428793860',
      gender: 'any_gender'
    })
    await userRepo.save(entityWithValidData)

    const sut = makeSut()

    // Mock Email.create to throw a non-Error value (string) when called
    jest.spyOn(Email, 'create').mockImplementation(() => {
      throw 'string-error-not-Error-instance'
    })

    const users = await sut.loadAll()

    // Should exclude the user because Email.create threw a non-Error
    expect(users.length).toBe(0)

    // Restore
    jest.restoreAllMocks()
  })

  describe('loadById()', () => {
    test('Should return a user on success', async () => {
      const sut = makeSut()
      const userData = makeUserData()
      const savedUser = await sut.add(userData)
      const user = await sut.loadById(savedUser.id.value)
      expect(user).toBeTruthy()
      expect(user?.id.value).toBe(savedUser.id.value)
      expect(user?.name.value).toBe(userData.name.value)
    })

    test('Should return null if loadById finds no user', async () => {
      const sut = makeSut()
      const user = await sut.loadById('550e8400-e29b-41d4-a716-446655440099')
      expect(user).toBeNull()
    })

    test('Should return null if user data is corrupt (defensive check)', async () => {
      const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
      const corruptEntity = userRepo.create({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'A', // Invalid: too short
        email: 'corrupt_loadbyid@mail.com',
        rg: '111222333',
        cpf: '71428793860',
        gender: 'any_gender'
      })
      await userRepo.save(corruptEntity)

      const sut = makeSut()
      const user = await sut.loadById('550e8400-e29b-41d4-a716-446655440001')

      expect(user).toBeNull()
    })

    test('Should return user without login if login data does not exist', async () => {
      const sut = makeSut()
      const userData = makeUserData()
      const savedUser = await sut.add(userData)
      const user = await sut.loadById(savedUser.id.value)
      expect(user).toBeTruthy()
      expect(user?.login).toBeUndefined()
    })

    test('Should return user with login data if it exists', async () => {
      const sut = makeSut()
      const user = await sut.add(makeUserData())
      const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
      await loginRepo.save(loginRepo.create({
        userId: user.id.value,
        password: 'any_password',
        roleId: '550e8400-e29b-41d4-a716-446655440002', // Librarian role
        status: 'active'
      }))

      const result = await sut.loadById(user.id.value)
      expect(result).toBeTruthy()
      expect(result?.login).toBeTruthy()
      expect(result?.login?.role.value).toBe('LIBRARIAN')
    })
  })

  test('Should throw OptimisticLockError on concurrent updates', async () => {
    const sut = makeSut()
    const userData = makeUserData()
    const user = await sut.add(userData)

    // Load user twice
    const userInstance1 = await sut.loadById(user.id.value)
    const userInstance2 = await sut.loadById(user.id.value)

    // Update first instance
    userInstance1!.name = Name.create('updated_name_1') as Name
    await sut.update(userInstance1!)

    // Update second instance (outdated version)
    userInstance2!.name = Name.create('updated_name_2') as Name
    const promise = sut.update(userInstance2!)

    await expect(promise).rejects.toThrow()
  })

  test('Should update phone on success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    const updatedUser = await sut.update({
      id: user.id,
      phone: '11999999999'
    })
    expect(updatedUser).toBeTruthy()
    expect(updatedUser!.phone).toBe('11999999999')
  })

  test('Should return null from toUserModel if UserStatus is invalid in DB', async () => {
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const entity = userRepo.create({
      name: 'Valid Name',
      email: 'invalid_status@mail.com',
      rg: '111222333',
      cpf: '71428793860',
      gender: 'any_gender',
      status: 'INVALID_STATUS' as unknown as UserStatusEnum
    })
    await userRepo.save(entity)

    const sut = makeSut()
    const user = await sut.loadByEmail('invalid_status@mail.com')
    expect(user).toBeUndefined()
  })

  test('Should skip login data in loadAll if UserRole or UserStatus in login is invalid', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())

    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    // Seed invalid role
    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    await roleRepo.save({ id: '550e8400-e29b-41d4-a716-446655440003', slug: 'invalid_role', description: 'Invalid' })

    await loginRepo.save(loginRepo.create({
      userId: user.id.value,
      password: 'any_password',
      roleId: '550e8400-e29b-41d4-a716-446655440003',
      status: 'active'
    }) as unknown as LoginTypeOrmEntity)

    const users = await sut.loadAll()
    expect(users.length).toBe(1)
    expect(users[0].login).toBeUndefined()
  })

  test('Should update the user status on updateStatus success', async () => {
    const sut = makeSut()
    const user = await sut.add(makeUserData())
    await sut.updateStatus(user.id.value, UserStatus.create('inactive') as UserStatus)

    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const dbUser = await userRepo.findOne({ where: { id: user.id.value } })
    expect(dbUser?.status).toBe('INACTIVE')
  })
})
