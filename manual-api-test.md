# Postman Scenarios (Fastify Clean Arch)

## ⚠️ Autenticação Obrigatória

Todas as rotas (exceto `/login`) exigem autenticação via **Bearer Token**.

### Como obter o token:
1. Execute o **Seed Admin** (ver seção abaixo)
2. Faça login com o Admin
3. Use o token retornado no header: `Authorization: Bearer <token>`

---

## 🧹 Reset do Ambiente

Para limpar completamente o banco de dados e recriar o ambiente:

1. Pare os containers e remova volumes/imagens:
   ```bash
   npm run down
   # Remova volumes/imagens do docker se necessário e a pasta mysql_data
   ```

2. Subir o ambiente novamente:
   ```bash
   npm run up
   ```

3. Recrie o usuário admin:
   ```bash
   npm run seed:admin
   ```

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
  "birthDate": "1990-05-20",
  "role": "ADMIN",
  "password": "_Falero@dmin2025"
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
  "password": "_Falero@dmin2025"
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
  "birthDate": "1990-05-20"
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


## 4. List Users (LoadUsers)

**Endpoint**: `GET http://localhost:5050/api/users`

**Headers**:
```
Authorization: Bearer <accessToken>
```

### 4.1 Success (200 OK)
**Response**: JSON Array of users.

### 4.2 Error: Access Denied (403 Forbidden)
Requires ADMIN or LIBRARIAN role.

---

## 5. Update User (🔒 ADMIN Only)

**Endpoint**: `PUT http://localhost:5050/api/users/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

### 5.1 Success (200 OK)
**Body**:
```json
{
  "name": "Maria Updated",
  "email": "maria.updated@example.com"
}
```

### 5.2 Error: Access Denied (403 Forbidden)
Requires ADMIN role. Librarians cannot update users.

---

## 6. Delete User (🔒 ADMIN Only)

**Endpoint**: `DELETE http://localhost:5050/api/users/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

### 6.1 Success (204 No Content)
Returns empty body.

### 6.2 Error: Access Denied (403 Forbidden)
Requires ADMIN role.

---

## Resumo de Permissões

| Rota | Método | Permissão |
|------|--------|-----------|
| `/api/login` | POST | 🌐 Pública |
| `/api/users` | POST | 🔒 LIBRARIAN, ADMIN |
| `/api/users` | GET | 🔒 LIBRARIAN, ADMIN |
| `/api/users/:userId/login` | POST | 🔒 LIBRARIAN, ADMIN |
| `/api/users/:id` | PUT | 🔒 ADMIN |
| `/api/users/:id` | DELETE | 🔒 ADMIN |
