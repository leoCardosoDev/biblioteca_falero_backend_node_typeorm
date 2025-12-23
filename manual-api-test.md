# Postman Scenarios (Fastify Clean Arch)

## 1. Create User (AddUser)

**Endpoint**: `POST http://localhost:5050/api/users`

### 2. Add User (Success)
**Endpoint:** `POST http://localhost:5050/api/users`
**Payload:**
```json
{
  "name": "Maria Silva",
  "email": "maria.silva@example.com",
  "rg": "123456789",
  "cpf": "123.456.789-00",
  "dataNascimento": "1990-05-20"
}
```
**Expected Response:** `200 OK`
**Body:** JSON object with the created user (including ID).

### 3. Add User (Duplicate Email)
**Endpoint:** `POST http://localhost:5050/api/users`
**Payload:** (Same as above)
**Expected Response:** `403 Forbidden`
**Body:**
```json
{
  "name": "EmailInUseError",
  "message": "The received email is already in use"
}
```

### 4. Add User (Duplicate CPF)
**Endpoint:** `POST http://localhost:5050/api/users`
**Payload:** (Change email, keep CPF same as user 1)
```json
{
  "name": "Maria Silva",
  "email": "maria.other@example.com",
  "rg": "123456789",
  "cpf": "123.456.789-00",
  "dataNascimento": "1990-05-20"
}
```
**Expected Response:** `403 Forbidden`
**Body:**
```json
{
  "name": "CpfInUseError",
  "message": "The received CPF is already in use"
}
```

---

## 2. Create Login for User (CreateUserLogin)

**Endpoint**: `POST http://localhost:5050/api/users/:userId/login`

> ⚠️ Substitua `:userId` pelo ID retornado na criação do usuário.

### 2.1 Success (200 OK)
Cria credenciais de acesso para o usuário existente.

**URL Params**:
- `userId`: `[Cole o ID aqui]`

**Body (JSON)**:
```json
{
  "password": "mySecurePassword123"
}
```
*Nota: Não é necessário enviar o email, ele já está vinculado ao usuário.*

### 2.2 Error: Missing Password (400 Bad Request)
**Body (JSON)**:
```json
{}
```

### 2.3 Error: Invalid User ID (Server Error or 400 depending on validation)
Se o ID na URL for inválido.

---

## 3. Login (Authentication)

**Endpoint**: `POST http://localhost:5050/api/login`

### 3.1 Success (200 OK)
Retorna o token de acesso e o nome do usuário.

**Body (JSON)**:
```json
{
  "email": "leocardosodev@gmail.com",
  "password": "mySecurePassword123"
}
```

**Response (JSON)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "name": "Leo Cardoso"
}
```

### 3.2 Error: Invalid Credentials (401 Unauthorized)
Tente com senha ou email errados.

---
