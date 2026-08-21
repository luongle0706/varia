# 🌌 VARIA

> **A minimalist, high-performance, production-grade toolbox monorepo built with Vite, TypeScript, Turborepo & Custom Material UI.**

---

## 📖 Architecture & Design Documentation

All architectural blueprints, design decisions, tool specifications, and engineering standards are documented in the [`docs/`](./docs/) directory:

* 🗺️ **[Architecture Canvas & Blueprint](./docs/CANVAS.md)**: Monorepo architectural diagram, Plug-and-play Manifest Pattern, and Custom Material UI Design System.
* 🧰 **[Master Mini-Tools Catalog](./docs/TOOL_CATALOG.md)**: Detailed specifications for 20+ mini-tools (Media Studio, Dev Tools, Network, Social Grabber, Text Utilities).
* 🏆 **[Engineering Standards](./docs/ENGINEERING_STANDARDS.md)**: Engineering practices, Turborepo pipelines, Vitest unit/component testing, Conventional Commits, and CI/CD workflows.

---

## 🏗️ Tech Stack

* **Monorepo Engine:** [Turborepo](https://turbo.build/) + [pnpm Workspaces](https://pnpm.io/)
* **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **UI & Styling:** [Material UI v6](https://mui.com/) with Custom Dark Obsidian Theme & Glassmorphism
* **Media Processing:** WebAssembly ([@ffmpeg/ffmpeg](https://ffmpegwasm.netlify.app/)) + Web Workers
* **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
* **Code Quality:** ESLint + Prettier + Husky + lint-staged + Commitlint

