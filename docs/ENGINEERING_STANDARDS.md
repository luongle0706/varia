# 🏆 Engineering & Architecture Standards

Tài liệu này quy định các tiêu chuẩn kỹ thuật bắt buộc để đảm bảo **Varia** là một monorepo chất lượng cao, dễ bảo trì, dễ mở rộng và đạt chuẩn production.

---

## 🏗️ 1. Monorepo & Build Pipeline

* **Package Manager:** Sử dụng `pnpm` (bắt buộc). Không dùng npm hoặc yarn để tránh phantom dependencies.
* **Build Orchestration:** `Turborepo` (`turbo.json`) đảm bảo cache pipeline và chỉ build/test những package bị thay đổi.
* **Tách biệt Trách nhiệm (Separation of Concerns):**
  * `apps/*`: Chỉ chứa View Layer, Routing, và tích hợp.
  * `packages/*`: Chứa Business Logic (`@varia/core`), Theme & UI components (`@varia/ui`), Web Workers & WASM (`@varia/wasm-ffmpeg`).

---

## 🧹 2. Code Quality & Git Automation

* **TypeScript Strictness:** Bắt buộc `strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`.
* **ESLint & Prettier:** Cấu hình tập trung tại `@varia/eslint-config`.
* **Conventional Commits:** Mọi commit message phải tuân thủ chuẩn:
  * `feat(media): add audio trimmer waveform visualizer`
  * `fix(ui): resolve glassmorphism contrast on mobile`
  * `test(core): add unit tests for uuid v7 generation`
  * `chore(turbo): update pipeline cache outputs`
* **Husky + lint-staged:** Tự động chạy linter và typecheck trước mỗi commit.

---

## 🧪 3. Testing Strategy

* **Framework:** `Vitest` + `@testing-library/react`.
* **Unit Testing:** Bao phủ 100% các pure functions trong `@varia/core` (Crypto, Formatters, Regex, Math).
* **Component Testing:** Test các tương tác UI cốt lõi trong `@varia/ui` (Dropzone, Sliders, Card hovers).
* **Wasm Mocking:** Viết mock interface cho `@ffmpeg/ffmpeg` để CI pipeline có thể test luồng chuyển đổi mà không cần tải binary wasm nặng.

---

## 🚀 4. CI/CD Pipeline (GitHub Actions)

Mọi Pull Request hoặc commit vào nhánh `main` phải vượt qua 4 bước:
1. `pnpm lint` — Kiểm tra cú pháp và code style.
2. `pnpm typecheck` — Biên dịch TypeScript nghiêm ngặt.
3. `pnpm test` — Chạy toàn bộ test suites.
4. `pnpm build` — Build bundle sản phẩm.
