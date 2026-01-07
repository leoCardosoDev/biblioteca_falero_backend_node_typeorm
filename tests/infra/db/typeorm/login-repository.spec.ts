import { Repository, DataSource } from 'typeorm'
import { TypeOrmHelper, LoginTypeOrmRepository, LoginTypeOrmEntity, UserTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity } from '@/infra'
import { State } from '@/infra/db/typeorm/entities/state'
import { City } from '@/infra/db/typeorm/entities/city'
import { Neighborhood } from '@/infra/db/typeorm/entities/neighborhood'
import { Id, Email, UserStatus } from '@/domain'

describe('LoginTypeOrmRepository', () => {
  let dataSource: DataSource

  beforeAll(async () => {
    dataSource = await TypeOrmHelper.connect({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
      entities: [LoginTypeOrmEntity, UserTypeOrmEntity, RoleTypeOrmEntity, PermissionTypeOrmEntity, State, City, Neighborhood]
    })
  })

  afterAll(async () => {
    await TypeOrmHelper.disconnect()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true)
    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    await roleRepo.save(roleRepo.create({
      id: '550e8400-e29b-41d4-a716-446655440002',
      slug: 'member',
      description: 'Member'
    }))
  })

  const makeSut = (): LoginTypeOrmRepository => {
    return new LoginTypeOrmRepository()
  }

  test('Should return an account on loadByEmail success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create('any_email@mail.com') as Email,
      password: 'any_password',
      passwordHash: 'hashed_password',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    await sut.add(addLoginParams)
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeTruthy()
    expect(account?.id.value).toBeTruthy()
    expect(account?.passwordHash).toBe('hashed_password')
    expect(account?.userId.value).toBe(user.id)
  })

  test('Should return undefined if loadByEmail fails', async () => {
    const sut = makeSut()
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeUndefined()
  })

  test('Should return undefined if loadByEmail finds user but not login', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeUndefined()
  })

  test('Should update the account accessToken on updateAccessToken success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create('any_email@mail.com') as Email,
      password: 'any_password',
      passwordHash: 'hashed_password',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    const login = await sut.add(addLoginParams)

    // Verify DB directly for accessToken, as Login model might not expose it
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    let dbLogin = await loginRepo.findOneBy({ id: login.id.value })
    expect(dbLogin?.accessToken).toBeFalsy()

    await sut.updateAccessToken(login.id.value, 'any_token')

    dbLogin = await loginRepo.findOneBy({ id: login.id.value })
    expect(dbLogin?.accessToken).toBe('any_token')
  })

  test('Should throw Error if save succeeds but data is corrupt (Line 33)', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'corrupt_save_user',
      email: 'corrupt_save@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create('corrupt_save@mail.com') as Email,
      password: 'any_password',
      passwordHash: 'hashed_password',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }

    // Mock TypeOrmHelper.getRepository to return a repository that saves but returns bad data
    // We need to spy on TypeOrmHelper.getRepository but it is static. 
    // Since we can't easily spy on static methods without deeper mocks or modifying the helper,
    // and we want to hit line 33 which is: if (!result) throw Error
    // result comes from this.toDomain(saved, data.email)
    // saved comes from repository.save(loginEntity)
    // If we can make repository.save return an entity that has NO roleId (even though we passed it),
    // toDomain will return null (line 85: if (!entity.roleId) return null)

    // We can spy on the actual repository instance because TypeOrmHelper returns it
    const realRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const saveSpy = jest.spyOn(realRepo, 'save').mockImplementationOnce(async (entity) => {
      // We save correctly to DB to avoid FK errors if we wanted, but here we just want to return bad data
      // Actually, let's just return an entity missing the roleId to simulate the "corruption"
      // We don't need to actually avoid the DB save for this unit test if we mock the return
      const corruptEntity = { ...entity, roleId: undefined } as unknown as LoginTypeOrmEntity
      return Promise.resolve(corruptEntity)
    })
    // Note: TypeOrmHelper.getRepository creates a new repo instance or returns cached?
    // Looking at typeorm-helper.ts (assumed), it usually returns the same repo if connection allows.
    // However, if it creates new instance every time, spread spy might fail.
    // But TypeORM repositories are usually stable.
    // Let's verify by trying to spy on prototype or just assume makeSut calls TypeOrmHelper.getRepository

    // Actually, LoginTypeOrmRepository calls TypeOrmHelper.getRepository(LoginTypeOrmEntity) inside add()
    // So we need to mock TypeOrmHelper.getRepository
    const getRepoSpy = jest.spyOn(TypeOrmHelper, 'getRepository').mockReturnValueOnce({
      create: realRepo.create.bind(realRepo),
      save: saveSpy,
      findOne: realRepo.findOne.bind(realRepo)
    } as unknown as Repository<LoginTypeOrmEntity>)

    const promise = sut.add(addLoginParams)
    await expect(promise).rejects.toThrow('Failed to create login: data corruption detected after save')

    saveSpy.mockRestore()
    getRepoSpy.mockRestore()
  })

  test('Should return undefined (via null from toDomain) if roleId is invalid (Line 88)', async () => {
    const sut = makeSut()
    const realRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)

    // Mock findOne to return corrupt roleId
    const findSpy = jest.spyOn(realRepo, 'findOne').mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      roleId: 'invalid-role-uuid', // CORRUPT
      user: { email: 'any@mail.com' }
    } as unknown as LoginTypeOrmEntity)

    const getRepoSpy = jest.spyOn(TypeOrmHelper, 'getRepository').mockReturnValue({
      findOne: findSpy
    } as unknown as Repository<LoginTypeOrmEntity>)

    const result = await sut.loadByUserId('any_id')
    expect(result).toBeUndefined() // Line 67 covered partially, Line 88 covered

    findSpy.mockRestore()
    getRepoSpy.mockRestore()
  })

  test('Should return undefined if userId is invalid (Line 91)', async () => {
    const sut = makeSut()

    // We can't insert a login with invalid foreign key 'userId' if FK is strict.
    // However, if we assume the user was DELETED but login remains? Or maybe disable FK?
    // Or, maybe userId in Login table is just a string? 
    // In strict mode, we can't save invalid userId.
    // BUT the repository reads `userId` from the Entity. 
    // If the DB column is type uuid, it might fail insert.
    // If it is string, it saves.

    // Let's assume we can save it (e.g. valid UUID but not V4 compliant if logic is checking compliance).
    // `Id.create` checks for regex validation of UUID.
    // We can use a non-compliant string that fits in the column.

    // Note: If we can't save invalid userId due to DB constraints, this line 91 might be unreachable 
    // via integration test and can only be covered by UNIT test mocking the entity return.
    // Let's use checking `toDomain` via `loadByEmail` mocking `findOne`.

    const realRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const findSpy = jest.spyOn(realRepo, 'findOne').mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000', // Valid
      userId: 'invalid-user-uuid', // INVALID
      roleId: '550e8400-e29b-41d4-a716-446655440002', // Valid
      user: { email: 'any@mail.com' } // Mock relation
    } as unknown as LoginTypeOrmEntity)
    // We also need to spy on TypeOrmHelper to return this repo
    const getRepoSpy = jest.spyOn(TypeOrmHelper, 'getRepository').mockReturnValue({
      findOne: findSpy
    } as unknown as Repository<LoginTypeOrmEntity>)

    const result = await sut.loadByUserId('any_id')
    expect(result).toBeUndefined()

    findSpy.mockRestore()
    getRepoSpy.mockRestore()
  })

  test('Should return undefined if id is invalid (Line 94)', async () => {
    const sut = makeSut()
    const realRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const findSpy = jest.spyOn(realRepo, 'findOne').mockResolvedValue({
      id: 'invalid-id-uuid', // INVALID
      userId: '550e8400-e29b-41d4-a716-446655440001', // Valid
      roleId: '550e8400-e29b-41d4-a716-446655440002', // Valid
      user: { email: 'any@mail.com' }
    } as unknown as LoginTypeOrmEntity)
    const getRepoSpy = jest.spyOn(TypeOrmHelper, 'getRepository').mockReturnValue({
      findOne: findSpy
    } as unknown as Repository<LoginTypeOrmEntity>)

    const result = await sut.loadByUserId('any_id')
    expect(result).toBeUndefined()

    findSpy.mockRestore()
    getRepoSpy.mockRestore()
  })

  test('Should return null in toDomain if exception is thrown (Line 105)', async () => {
    // This tests the catch block in toDomain.
    // We can reach toDomain via loadByEmail.
    // We need to make something throw during toDomain execution.
    // toDomain calls Id.create, Login.create.
    // We can mock Id.create to throw.

    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    // Create valid user and login in DB
    const user = userRepo.create({
      name: 'throw_user',
      email: 'throw@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await loginRepo.save({
      userId: user.id,
      password: 'any_password',
      roleId: '550e8400-e29b-41d4-a716-446655440002',
      status: 'active'
    })

    // Mock Id.create to throw
    const originalCreate = Id.create
    jest.spyOn(Id, 'create').mockImplementationOnce(() => {
      throw new Error('Unexpected error')
    })

    const account = await sut.loadByEmail('throw@mail.com')
    expect(account).toBeUndefined() // toDomain returns null, leadByEmail returns undefined

    jest.spyOn(Id, 'create').mockImplementation(originalCreate)
  })

  test('Should return an account on add success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'any_email@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create(user.email) as Email,
      password: 'any_password',
      passwordHash: 'any_password_hash',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    const login = await sut.add(addLoginParams)
    expect(login).toBeTruthy()
    expect(login.id.value).toBeTruthy()
    expect(login.passwordHash).toBe('any_password_hash')
    expect(login.userId.value).toBe(user.id)
    expect(login.roleId.value).toBe('550e8400-e29b-41d4-a716-446655440002')
  })

  test('Should return undefined if roleId is missing in DB', async () => {
    const sut = makeSut()
    const userId = '550e8400-e29b-41d4-a716-446655440002'
    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    // create FK user first
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    await userRepo.save(userRepo.create({
      id: userId,
      name: 'any_name',
      email: 'default_values@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male'
    }))

    const loginEntity = loginRepo.create({
      userId,
      password: 'any_password',
      roleId: undefined, // Role is missing
      status: 'active'
    } as unknown as LoginTypeOrmEntity)
    await loginRepo.save(loginEntity)

    const result = await sut.loadByEmail('default_values@mail.com')
    expect(result).toBeUndefined()
  })

  test('Should return undefined if loadByEmail finds user but is soft deleted', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'deleted_user',
      email: 'deleted@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      deletedAt: new Date(),
      status: 'INACTIVE'
    })
    await userRepo.save(user)

    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await loginRepo.save({
      userId: user.id,
      password: 'any_password',
      roleId: '550e8400-e29b-41d4-a716-446655440002', // use roleId instead of role
      status: 'active'
    })

    const account = await sut.loadByEmail('deleted@mail.com')
    expect(account).toBeUndefined()
  })

  test('Should return undefined if loadByEmail finds user but status is INACTIVE', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'inactive_user',
      email: 'inactive@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'INACTIVE'
    })
    await userRepo.save(user)

    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    await loginRepo.save({
      userId: user.id,
      password: 'any_password',
      roleId: '550e8400-e29b-41d4-a716-446655440002', // roleId
      status: 'active'
    })

    const account = await sut.loadByEmail('inactive@mail.com')
    expect(account).toBeUndefined()
  })

  test('Should update the login role on updateRole success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'role_update@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    // Seed target role
    const roleRepo = TypeOrmHelper.getRepository(RoleTypeOrmEntity)
    await roleRepo.save(roleRepo.create({
      id: '550e8400-e29b-41d4-a716-446655440001',
      slug: 'admin',
      description: 'Admin'
    }))

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create('role_update@mail.com') as Email,
      password: 'any_password',
      passwordHash: 'hashed_password',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    const login = await sut.add(addLoginParams)

    await sut.updateRole(user.id, '550e8400-e29b-41d4-a716-446655440001')

    const loginRepo = TypeOrmHelper.getRepository(LoginTypeOrmEntity)
    const dbLogin = await loginRepo.findOneBy({ id: login.id.value })
    expect(dbLogin?.roleId).toBe('550e8400-e29b-41d4-a716-446655440001')
  })

  test('Should return a login on loadByUserId success', async () => {
    const sut = makeSut()
    const userRepo = TypeOrmHelper.getRepository(UserTypeOrmEntity)
    const user = userRepo.create({
      name: 'any_name',
      email: 'load_by_id@mail.com',
      rg: 'any_rg',
      cpf: 'any_cpf',
      gender: 'male',
      status: 'ACTIVE'
    })
    await userRepo.save(user)

    const addLoginParams = {
      userId: Id.create(user.id),
      email: Email.create('load_by_id@mail.com') as Email,
      password: 'any_password',
      passwordHash: 'hashed_password',
      roleId: Id.create('550e8400-e29b-41d4-a716-446655440002'),
      status: UserStatus.create('active') as UserStatus
    }
    await sut.add(addLoginParams)

    const login = await sut.loadByUserId(user.id)
    expect(login).toBeTruthy()
    expect(login?.userId.value).toBe(user.id)
  })

  test('Should return undefined if loadByUserId fails', async () => {
    const sut = makeSut()
    const login = await sut.loadByUserId('invalid_id')
    expect(login).toBeUndefined()
  })
})
