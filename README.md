# 🌌 VARIA

> **A minimalist, high-performance, production-grade toolbox monorepo built with Vite, TypeScript, Turborepo & Custom Material UI.**

---

## 📖 Architecture & Design Documentation

Tất cả tài liệu thiết kế, canvas kiến trúc, danh mục công cụ và tiêu chuẩn kỹ thuật được lưu trữ tại thư mục [`docs/`](./docs/):

* 🗺️ **[Architecture Canvas & Blueprint](./docs/CANVAS.md)**: Sơ đồ kiến trúc Monorepo, Plug-and-play Manifest Pattern, và Chiến lược Custom Material UI.
* 🧰 **[Master Mini-Tools Catalog](./docs/TOOL_CATALOG.md)**: Danh mục 20+ Mini-tools draft chi tiết (Media Studio, Dev Tools, Network, Social Grabber, Text Utilities).
* 🏆 **[Engineering Standards](./docs/ENGINEERING_STANDARDS.md)**: Tiêu chuẩn phát triển phần mềm, Monorepo Turborepo, Testing Vitest, Conventional Commits và CI/CD.

---

## 🏗️ Tech Stack

* **Monorepo Engine:** [Turborepo](https://turbo.build/) + [pnpm Workspaces](https://pnpm.io/)
* **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **UI & Styling:** [Material UI v6](https://mui.com/) với Custom Dark Obsidian Theme & Glassmorphism
* **Media Processing:** WebAssembly ([@ffmpeg/ffmpeg](https://ffmpegwasm.netlify.app/)) + Web Workers
* **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
* **Code Quality:** ESLint + Prettier + Husky + lint-staged + Commitlint
