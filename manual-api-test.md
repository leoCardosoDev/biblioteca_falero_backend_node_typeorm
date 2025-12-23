# Postman Scenarios (Fastify Clean Arch)

## ⚠️ Autenticação Obrigatória

Todas as rotas (exceto `/login`) exigem autenticação via **Bearer Token**.

### Como obter o token:
1. Execute o **Seed Admin** (ver seção abaixo)
2. Faça login com o Admin
3. Use o token retornado no header: `Authorization: Bearer <token>`

---

## 0. Seed Admin (Primeiro Acesso)

Execute o comando para criar o usuário Admin padrão:

```bash
npm run seed:admin
```

**Usuário Admin criado:**
```json
{
  "name": "Leo Cardoso",
  "email": "leocardosodev@gmail.com",
  "rg": "12345678",
  "cpf": "12345678901",
  "dataNascimento": "1990-05-20",
  "role": "ADMIN",
  "password": "admin123"
}
```

---

## 1. Login (Público)

**Endpoint**: `POST http://localhost:5050/api/login`

### 1.1 Login como Admin
**Body (JSON)**:
```json
{
  "email": "leocardosodev@gmail.com",
  "password": "admin123"
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "name": "Leo Cardoso",
  "role": "ADMIN"
}
```

> 📋 **Copie o `accessToken`** para usar nas próximas requisições.

### 1.2 Error: Invalid Credentials (401 Unauthorized)
Tente com senha ou email errados.

---

## 2. Create User (🔒 LIBRARIAN ou ADMIN)

**Endpoint**: `POST http://localhost:5050/api/users`

**Headers**:
```
Authorization: Bearer <accessToken>
```

### 2.1 Add User (Success)
**Payload:**
```json
{
  "name": "Maria Silva",
  "email": "maria.silva@example.com",
  "rg": "123456789",
  "cpf": "12345678900",
  "dataNascimento": "1990-05-20"
}
```
**Expected Response:** `200 OK`

### 2.2 Add User (Duplicate Email)
**Expected Response:** `403 Forbidden`
```json
{
  "error": "The received email is already in use"
}
```

### 2.3 Add User (No Token)
**Expected Response:** `403 Forbidden`
```json
{
  "error": "Access denied"
}
```

---

## 3. Create Login for User (🔒 LIBRARIAN ou ADMIN)

**Endpoint**: `POST http://localhost:5050/api/users/:userId/login`

> ⚠️ Substitua `:userId` pelo ID retornado na criação do usuário.

**Headers**:
```
Authorization: Bearer <accessToken>
```

### 3.1 Success (200 OK)
**Body (JSON)**:
```json
{
  "password": "userPassword123"
}
```

### 3.2 Error: Missing Password (400 Bad Request)
**Body (JSON)**:
```json
{}
```

### 3.3 Error: Access Denied (403 Forbidden)
Sem token ou com role MEMBER.

---

## Resumo de Permissões

| Rota | Método | Permissão |
|------|--------|-----------|
| `/api/login` | POST | 🌐 Pública |
| `/api/users` | POST | 🔒 LIBRARIAN, ADMIN |
| `/api/users/:userId/login` | POST | 🔒 LIBRARIAN, ADMIN |
