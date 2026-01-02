# Postman Scenarios (Fastify Clean Arch)

## ⚠️ Autenticação Obrigatória

Todas as rotas (exceto `/login`) exigem autenticação via **Bearer Token**.

### Como obter o token:
1. Execute o **Seed de Usuários** (ver seção abaixo)
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

3. Recrie os usuários padrão:
   ```bash
   npm run seed:users
   ```

---

## 0. Seed de Usuários (Configuração Inicial)

Execute o comando para criar os usuários padrão (ADMIN, LIBRARIAN, MEMBER):

```bash
npm run seed:users
```

**Usuário Admin criado:**
```json
{
  "name": "Leo Cardoso",
  "email": "admin@falero.com",
  "rg": "12345678",
  "cpf": "20073296031",
  "gender": "MALE",
  "role": "ADMIN",
  "password": "_Falero@admin2025"
}
```

---

## 1. Login (Público)

**Endpoint**: `POST http://localhost:5050/api/login`

### 1.1 Login como Admin
**Body (JSON)**:
```json
{
    "email": "admin@falero.com",
    "password": "_Falero@admin2025"
}
```

**Retorno Esperado (200 OK):**
```json
{
  "accessToken": "ey...",
  "refreshToken": "ey...",
  "name": "Admin User",
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
  "gender": "FEMALE"
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

**Expected Response:**
```json
{
  "id": "...",
  "userId": "...",
  "email": "..."
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
**Response**:
```json
[
  {
    "id": "any_id",
    "name": "Maria Silva",
    "email": "maria.silva@example.com",
    "rg": "123456789",
    "cpf": "123.456.789-00",
    "birthDate": "1990-05-20",
    "status": "ACTIVE"
  }
]
```

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

## 6. Delete User (🔒 ADMIN Only) - **SOFT DELETE**

**Endpoint**: `DELETE http://localhost:5050/api/users/:id`

> ❗ Este endpoint realiza um **Soft Delete**. O registro permanece no banco com `deleted_at` preenchido e deixa de aparecer em listagens padrão.

**Headers**:
```
Authorization: Bearer <accessToken>
```

### 6.1 Success (204 No Content)
Returns empty body.

### 6.2 Error: Access Denied (403 Forbidden)
Requires ADMIN role.

---

## 7. Block User (🔒 LIBRARIAN or ADMIN)

**Endpoint**: `PATCH http://localhost:5050/api/users/:id/status`

> ⚠️ Este endpoint altera o status de acesso do usuário. "BLOCKED" impede login.

**Headers**:
```
Authorization: Bearer <accessToken>
```

### 7.1 Block User (Success)
**Body (JSON)**:
```json
{
  "status": "BLOCKED"
}
```
**Expected Response:** `204 No Content`

### 7.2 Unblock User (Activate)
**Body (JSON)**:
```json
{
  "status": "ACTIVE"
}
```
**Expected Response:** `204 No Content`

### 7.3 Error: Access Denied (403 Forbidden)
Se tentar bloquear um usuário com `powerLevel` maior ou igual ao seu (ex: LIBRARIAN tentando bloquear ADMIN).

---

## 8. Promote User (🔒 ADMIN Only)

**Endpoint**: `PATCH http://localhost:5050/api/users/:id/role`

**Headers**:
```
Authorization: Bearer <accessToken>
```

### 8.1 Promote to Librarian (Success)
**Body (JSON)**:
```json
{
  "roleId": "<uuid-of-librarian-role>"
}
```
**Expected Response:** `204 No Content`

### 8.2 Error: Access Denied (403 Forbidden)
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
| `/api/users/:id/status` | PATCH | 🔒 LIBRARIAN, ADMIN |
| `/api/users/:id/role` | PATCH | 🔒 ADMIN |
