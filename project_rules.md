# Project Rules and Conventions

## General
- **Language**: Always respond in English.
- **Comments**: Do not use comments in code.

## Naming Conventions
- **Variables/Functions/Constants**: `camelCase`
- **Classes/Types/Interfaces/Components**: `PascalCase`
- **Files/Folders**: `kebab-case`
- **Booleans**: Use verbs (e.g., `isLoading`, `hasError`)

## TypeScript Rules
- **Returns**: Use early returns when possible.
- **Types**:
    - Prefer `unknown` over `any`.
    - Prefer `undefined` over `null`.
- **Linting**: Follow `eslint.config.mjs`.

## Formatting (ESLint/Prettier)
- **Trailing Commas**: Do NOT use trailing commas.
- **Semicolons**: Do NOT use semicolons.
- **Quotes**: Prefer single quotes (`'`).

## Imports
- **Internal Imports**: Use `@/`.
- **Ordering**:
    1. External imports
    2. (Blank Line)
    3. Internal imports
- **Format**: Use single line for imports (avoid removing unused imports yourself, let linter handle/warn).
- **Cleanup**: Remove unused imports and variables.

## Previous Rules (Context)
- **TDD**: strict Red -> Green -> Refactor.
- **Commits**: `chore`, `test`, `feat`, `refactor`.
- **Husky**: Must prevent bad commits.
