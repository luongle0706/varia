# 🏆 Engineering & Architecture Standards

This document defines mandatory technical standards to ensure **Varia** remains a high-quality, maintainable, extensible, and production-grade monorepo.

---

## 🏗️ 1. Monorepo & Build Pipeline

- **Package Manager:** Use `pnpm` (strictly required). Do not use `npm` or `yarn` to prevent phantom dependencies.
- **Build Orchestration:** `Turborepo` (`turbo.json`) manages pipeline caching and ensures only modified packages are built/tested.
- **Separation of Concerns:**
  - `apps/*`: Contains only View Layer, Routing, Application Shells, and integration.
  - `packages/*`: Houses pure Business Logic (`@varia/core`), Theme & UI components (`@varia/ui`), Web Workers & WASM runners (`@varia/wasm-ffmpeg`).

---

## 🧹 2. Code Quality & Git Automation

- **TypeScript Strictness:** Strict mode is enforced: `strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`.
- **ESLint & Prettier:** Centrally configured via `@varia/eslint-config`.
- **Conventional Commits:** All commit messages must follow standard Conventional Commits format:
  - `feat(media): add audio trimmer waveform visualizer`
  - `fix(ui): resolve glassmorphism contrast on mobile`
  - `test(core): add unit tests for uuid v7 generation`
  - `chore(turbo): update pipeline cache outputs`
- **Husky + lint-staged:** Automatically runs linters and typecheck before each commit.

---

## 🧪 3. Testing Strategy

- **Framework:** `Vitest` + `@testing-library/react`.
- **Unit Testing:** 100% coverage target for pure utilities in `@varia/core` (Crypto, Formatters, Regex, Math).
- **Component Testing:** Test core UI interactions in `@varia/ui` (Dropzones, Sliders, Card hover states).
- **WASM Mocking:** Provide mock interfaces for `@ffmpeg/ffmpeg` so the CI pipeline can test conversion workflows without downloading heavy binary WASM files.

---

## 🚀 4. CI/CD Pipeline (GitHub Actions)

Every Pull Request or commit to `main` must pass 4 verification stages:

1. `pnpm lint` — Syntax and code style verification.
2. `pnpm typecheck` — Strict TypeScript compilation check across all packages.
3. `pnpm test` — Run all unit and integration test suites.
4. `pnpm build` — Production build compilation.
