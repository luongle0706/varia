# VARIA — Agent Harness & Engineering Invariants

This document establishes the mandatory engineering standards, architectural invariants, design system guidelines, and verification harness for Antigravity (and all developers) working across the **Varia** monorepo workspace.

---

## 1. Monorepo Architecture & Invariants

- **Package Manager:** Strictly `pnpm` (`pnpm@9.15.0`). Never invoke `npm` or `yarn` (prevents phantom dependencies and lockfile corruption).
- **Build & Pipeline Orchestrator:** `Turborepo`. Execute tasks via `pnpm turbo run <task>` or scoped `pnpm --filter <pkg> <task>`.
- **Monorepo Topology & Separation of Concerns:**
  - `apps/*`: Application shells, UI compositions, routing, server endpoints, and extensions (`apps/hub`, `apps/extension`, `apps/server`).
  - `packages/*`: Pure headless business logic (`@varia/core`), design system tokens and reusable UI (`@varia/ui`), background Web Workers and WASM binaries (`@varia/wasm-ffmpeg`).
- **Dependency Flow Rule:** Apps depend on packages; packages must **NEVER** import from `apps/*`. Packages must remain strictly decoupled and portable.

---

## 2. The 5-Stage Harness Engineering Workflow

Every feature, refactor, or bug fix must follow this deterministic lifecycle:

```
[1. Contract & Spec] ➔ [2. Test & Fixture Harness First] ➔ [3. Implementation] ➔ [4. Verification Gate] ➔ [5. Evidence & Knowledge]
```

1. **Stage 1: Contract & Boundary Definition**:
   - Define exact inputs, outputs, schemas, and constraints before touching application code.
   - Establish error states, edge cases, and performance requirements upfront.
2. **Stage 2: Test & Fixture Harness First (TDD & Simulation)**:
   - Create deterministic test fixtures (mock DOM trees, simulated media streams, mock API responses).
   - Write failing Vitest unit/integration tests covering both happy paths and edge cases prior to implementation.
3. **Stage 3: Implementation inside the Harness**:
   - Write clean, modular, and minimal implementation code to satisfy the harness and contracts.
4. **Stage 4: Mandatory 4-Tier Verification Gate**:
   - `pnpm typecheck` — Strict TypeScript compilation check across all packages (zero errors).
   - `pnpm lint` — ESLint syntax, style, and import hygiene.
   - `pnpm test` — 100% passing unit, integration, and fixture test suites.
   - `pnpm build` — Successful production compilation across all apps and packages.
5. **Stage 5: Evidence & Knowledge Persistence**:
   - Provide verifiable proof of correctness (test results, diffs, or visual previews).
   - Persist any newly learned project patterns, quirks, or edge cases into documentation or agent skills.

---

## 3. UI Component Reuse & Design System Standards (`@varia/ui`)

- **The "Rule of Two" Component Promotion**:
  - If a UI pattern (e.g., file dropzone, media scrubber, quality selector, status chip, copy button, metric card) is used in more than one tool or application, it **must** be extracted and promoted to `@varia/ui`. Never copy-paste UI markup across tools.
- **Strict Design Token Adherence**:
  - Never hardcode arbitrary CSS values or hex codes (e.g. `color: "#2a2a2a"`, `margin: "17px"`).
  - Use centralized `@varia/ui` theme tokens:
    - **Background Canvas:** Deep Obsidian (`#09090b`).
    - **Card & Surface Layer:** Dark Zinc (`#18181b`) with glowing borders (`rgba(255, 255, 255, 0.08)`).
    - **Glassmorphism:** `backdrop-filter: blur(16px)` on elevated surfaces and modals.
    - **Typography:** `Plus Jakarta Sans` for primary UI elements; `JetBrains Mono` for code, hashes, UUIDs, and technical outputs.
- **Headless Logic vs Presentation Separation**:
  - Mini-tools in `apps/hub` and views in `apps/extension` should focus strictly on composition. Pure computation, state reducers, and parsers belong in `@varia/core`.

---

## 4. Performance & Resource Lifecycle Management

- **Strict Resource & Buffer Cleanup (Zero Memory Leaks)**:
  - In media processing (Canvas, WebAssembly, Web Audio, Video), unreleased memory causes browser crashes.
  - **Object URLs:** Every `URL.createObjectURL(blob)` **must** have a corresponding `URL.revokeObjectURL(url)` on component unmount or file replacement.
  - **Web Workers:** Must be explicitly terminated when components unmount: `worker.terminate()`.
  - **Web Audio:** Audio contexts must be closed when idle: `audioContext.close()`.
  - **Canvas & Bitmaps:** Image bitmaps and canvas contexts must be cleared and dereferenced after rendering.
- **Off-Main-Thread Architecture (60 FPS Invariant)**:
  - Heavy tasks (WASM transcoding, SHA/MD5 hashing, batch image compression, GIF quantization, heavy regex processing) **must never block the main UI thread**.
  - Always offload heavy computational workloads to Web Workers or chunked asynchronous streams.
- **Dynamic Code-Splitting & Lazy Loading**:
  - All mini-tools must implement dynamic `React.lazy()` imports via the `VariaToolManifest.component` contract. Adding dozens of tools must never degrade the initial Hub landing page bundle size or load time.

---

## 5. Scalability & Architectural Tradeoffs

- **Client-First & Privacy-First Principle**:
  - Varia's core value is **zero-upload, zero-telemetry client-side processing**. Always prefer WebAssembly, Web Crypto, and Canvas in the browser.
  - Route workloads to `apps/server` only when browser hardware constraints (e.g. multi-gigabyte encoding, network CORS proxies) make client execution impossible.
- **Plug-and-Play Isolation over Global Couplings**:
  - Tools must **never** depend on global application state. Every tool must operate as a self-contained module that can run seamlessly in `apps/hub`, as an extension popup in `apps/extension`, or inside a headless test fixture.
- **Extensibility over Feature Creep**:
  - Avoid adding heavy third-party NPM packages (e.g. monolithic PDF or CAD engines) into `@varia/core` for minor niche features. Isolate heavy binary dependencies into dedicated packages or load them on-demand.

---

## 6. Structured Logging, Error Handling & Diagnostics

- **Standardized Log Envelope**:
  - Never use unstructured `console.log`. Use structured log messages with subsystem context and metadata:
    ```typescript
    // Format: [Subsystem:Module] [LEVEL] Message { metadata }
    logger.info('[Core:ImageCompressor] Image compression completed', { inputSize, outputSize, ratio: '42%' });
    logger.error('[Extension:MessengerEmbed] Failed to fetch tweet metadata', { tweetId, error: err.message });
    ```
- **Granular Tool Error Boundaries**:
  - Every mini-tool in `apps/hub` and popup view in `apps/extension` must be wrapped in a localized `<ToolErrorBoundary>`. An unexpected error in one tool must never crash the entire application or lose work in other tools.
- **Actionable User Diagnostics**:
  - Never show blank screens or generic `Error: Failed`. Provide user-friendly diagnostics, remediation steps (e.g. *"File exceeds memory quota: try smaller image batches"*), and a **"Copy Diagnostic Trace"** button for bug reporting.

---

## 7. Storage, Persistence & Type Safety

- **Storage Tiering**:
  - `localStorage`: Strictly for small primitive settings, theme toggles, and UI preferences.
  - `IndexedDB`: Mandatory for large binary payloads, media history, and cached processing outputs (with automated quota management).
- **Schema Versioning & Migrations**:
  - Persisted storage models must specify a `version` field and define migration strategies to prevent data corruption during upgrades.
- **Strict TypeScript & State Machines**:
  - Strict mode enabled (`noImplicitAny`, `noUncheckedIndexedAccess`). The `any` type is strictly prohibited.
  - Model asynchronous tool states using **Discriminated Unions**:
    ```typescript
    type ToolState<TData> =
      | { status: 'idle' }
      | { status: 'loading'; progress: number; message: string }
      | { status: 'success'; data: TData }
      | { status: 'error'; error: Error; code: string };
    ```

---

## 8. Subsystem Domain Guardrails

### `apps/extension` (Browser Extension)
- **Manifest V3 Architecture:** Clean separation between Popup (React), Content Scripts (IIFE), and Service Worker (ESM).
- **Host Page Isolation:** Injected CSS into host pages (e.g. Messenger, X) must never pollute host styles (use scoped class prefixes, Shadow DOM, or isolated style resets).
- **Privacy Guarantee:** Zero tracking or external transmission of user messages or tokens. Process only explicitly targeted URLs.
- **CORS / CSP Etiquette:** Delegate external network fetches through the background service worker to respect CSP constraints.

### `packages/core` & `packages/wasm-ffmpeg`
- Pure, side-effect-free functions with high test coverage.
- Provide deterministic offline mocks for WASM and FFmpeg binaries so test suites execute fast without external downloads.

### `apps/hub` (Varia Launchpad)
- Bento Grid layout with responsive glassmorphism.
- All tools registered via `VariaToolManifest` with lazy component loaders.

### `apps/server` (Backend & Proxy)
- High-performance, lightweight Fastify / Node microservice.
- Validate all incoming payloads with strict schema validators (e.g., Zod / TypeBox).
