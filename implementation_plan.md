# ManageUserAccess UseCase Implementation Plan

## 1. Domain Layer
- [ ] Create `src/domain/usecases/manage-user-access.ts` defining `ManageUserAccess` interface and params.

## 2. Infrastructure Layer (Repo Extension)
- [ ] Create `src/application/protocols/db/update-login-password-repository.ts` (Protocol).
- [ ] Update `src/infra/db/typeorm/login-repository.ts` to implement `UpdateLoginPasswordRepository`.

## 3. Application Layer
- [ ] Create `src/application/usecases/db-manage-user-access.ts`.
    - Implement the logic: guard clauses, loading actors, checking hierarchy, updating Role/Status/Password.

## 4. Main Layer
- [ ] Create `src/presentation/controllers/manage-user-access-controller.ts` (Presentation).
- [ ] Create `src/main/factories/usecases/db-manage-user-access-factory.ts`.
- [ ] Create `src/main/factories/controllers/manage-user-access-controller-factory.ts`.
- [ ] Register route in `src/main/routes/user-routes.ts`.

## 5. Verification
- [ ] Run tests (if any existing ones are relevant, or create new ones).
