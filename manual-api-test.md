# Postman Scenarios (Fastify Clean Arch)

## 1. Create User (AddUser)

**Endpoint**: `POST http://localhost:5050/api/users`

### 1.1 Success (200 OK)
Cria um novo usuário. Guarde o ID retornado.

**Body (JSON)**:
```json
{
  "name": "Leo Cardoso",
  "email": "leocardosodev@gmail.com",
  "rg": "12365478",
  "cpf": "12345678901"
}
```

### 1.2 Error: Duplicate Email (403 Forbidden)
Tente enviar o mesmo email novamente.

### 1.3 Error: Duplicate CPF (403 Forbidden)
Tente enviar o mesmo CPF novamente.

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
