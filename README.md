# Sistema Falero - API Backend

Backend para o Sistema de Gestão de Biblioteca (Falero), construído com princípios de **Clean Architecture**, **TDD** e **SOLID**.

## 🚀 Tecnologias

-   **Runtime**: Node.js (v20+)
-   **Linguagem**: TypeScript (Strict Mode)
-   **Banco de Dados**: MySQL
-   **ORM**: TypeORM (Restrito à camada de Infra)
-   **Testes**: Jest (Unitários e Integração)
-   **Code Quality**: ESLint (Flat Config), Prettier, Husky, Lint-Staged, Commitlint

## 🏗️ Arquitetura

O projeto segue estritamente a Clean Architecture, dividindo o código em 6 camadas:

1.  **Domain**: Regras de negócio puras (Models e Interfaces). Sem dependências externas.
2.  **Application**: Casos de uso e orquestração. Depende apenas do Domain.
3.  **Presentation**: Controllers e Adapters HTTP.
4.  **Validation**: Lógica de validação de dados de entrada.
5.  **Infrastructure**: Implementações de banco de dados, criptografia e libs externas.
6.  **Main**: Composition Root (Factories e Configuração do Server).

### Regra de Ouro (TypeORM)
O TypeORM é utilizado como um detalhe de implementação. O padrão **Data Mapper** é mandatório:
-   Entidades do Domain (`src/domain/models`) **NUNCA** devem ter decorators `@Entity`.
-   Entidades do TypeORM (`src/infra/db/entities`) vivem apenas na camada de infra.
-   Repositórios convertem dados entre as duas representações.

## 🛠️ Instalação e Uso

### Pré-requisitos
-   Node.js 20+
-   npm ou yarn
-   Docker (opcional, para banco de dados)

### Setup Inicial

```bash
# Instalar dependências
npm install

# Preparar Husky (Git Hooks)
npm run prepare
```

### Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor de produção |
| `npm run debug` | Inicia em modo debug com Nodemon |
| `npm test` | Roda todos os testes (rápido) |
| `npm run test:unit` | Roda apenas testes unitários (`.spec.ts`) |
| `npm run test:integration` | Roda testes de integração (`.test.ts`) |
| `npm run test:ci` | Roda testes com cobertura |
| `npm run lint` | Verifica problemas de linting |
| `npm run build` | Compila o TS para JS na pasta `dist` |

### Test Coverage Strategy (TypeORM)
Branches below 100% in `infra/db/typeorm/entities` are expected due to TypeORM decorators.
Internal library code is not unit-testable.
- Statements: 100%
- Lines: 100%
- Branches: <100% (Acceptable for Entities)

## 📂 Estrutura de Pastas

```text
src/
├── domain/         # Interfaces e Modelos de Negócio
├── application/    # Casos de Uso (Business Logic)
├── infra/          # Db (TypeORM), Criptografia, etc.
├── presentation/   # Controllers, Http Helpers
├── validation/     # Validadores
└── main/           # Factories, Express Server, Config
```
