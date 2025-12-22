# Postman Scenarios - AddUser (Fastify)

**Endpoint**: `POST http://localhost:5050/api/users`

## 1. Success (200 OK)
Creates a new user successfully.

**Body (JSON)**:
```json
{
  "name": "Leo Cardoso",
  "email": "leocardosodev@gmail.com",
  "rg": "12365478",
  "cpf": "12345678901"
}
```

## 2. Error: Missing Name (400 Bad Request)
**Body (JSON)**:
```json
{
  "email": "leocardosodev@gmail.com",
  "rg": "12365478",
  "cpf": "12345678901"
}
```
**Expected Response**:
```json
{
  "error": "Missing param: name"
}
```

## 3. Error: Missing Email (400 Bad Request)
**Body (JSON)**:
```json
{
  "name": "Leo Cardoso",
  "rg": "12365478",
  "cpf": "12345678901"
}
```
**Expected Response**:
```json
{
  "error": "Missing param: email"
}
```

## 4. Error: Invalid Email Format (400 Bad Request)
**Body (JSON)**:
```json
{
  "name": "Leo Cardoso",
  "email": "invalid_mail",
  "rg": "12365478",
  "cpf": "12345678901"
}
```
**Expected Response**:
```json
{
  "error": "Invalid param: email"
}
```
