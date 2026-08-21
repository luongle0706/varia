# 🌌 VARIA — Architecture Canvas & Blueprint

> **A modern, minimalist, production-grade toolbox monorepo built with Vite, TypeScript, Turborepo & Custom Material UI.**

---

## 🏛️ 1. Monorepo Architecture Overview

```mermaid
graph TD
    subgraph "Root (Turborepo + pnpm)"
        Turbo[⚡ Turborepo Pipeline & Caching]
    end

    subgraph "Apps Layer (apps/*)"
        Hub["🌐 apps/hub<br/><b>Varia Launchpad</b><br/>(Bento Grid, Spotlight Search, Category Filter)"]
        
        subgraph "Mini Applications (Independent Modules)"
            Cat1["🎞️ Media Studio (GIF, Audio, Image, SVG)"]
            Cat2["🛠️ Dev Utilities (UUID, JWT, Hash, RegEx, JSON)"]
            Cat3["⚡ Network & Connectivity (SpeedTest, IP, DNS)"]
            Cat4["📥 Social & Downloader (Video/GIF Grabber)"]
            Cat5["📝 Text & Productivity (Markdown, QR, Diff)"]
        end
    end

    subgraph "Shared Packages Layer (packages/*)"
        PkgTheme["🎨 @varia/ui (Custom Dark MUI Theme, Glassmorphism, Bento Cards)"]
        PkgWasm["⚡ @varia/wasm-ffmpeg (FFmpeg Web Worker & Buffer Manager)"]
        PkgCore["🧠 @varia/core (Crypto, Stream Helpers, Parsers, Formatters)"]
        PkgTS["⚙️ @varia/tsconfig"]
        PkgESLint["🧹 @varia/eslint-config"]
    end

    Hub -.-> Cat1 & Cat2 & Cat3 & Cat4 & Cat5
    PkgTheme --> Hub & Cat1 & Cat2 & Cat3 & Cat4 & Cat5
    PkgCore --> Cat1 & Cat2 & Cat3 & Cat4 & Cat5
    PkgWasm --> Cat1
```

---

## 🔌 2. Plug-and-Play Tool Manifest Contract

Every mini-tool added to the ecosystem follows an isolated manifest contract (preventing Hub bundle bloating via dynamic imports):

```typescript
export type ToolCategory = 'media' | 'dev' | 'network' | 'social' | 'text';

export interface VariaToolManifest<TComponent = unknown> {
  id: string; // e.g. 'tool-audio-converter'
  name: string; // 'MP4 to MP3 Converter'
  description: string;
  category: ToolCategory;
  icon: string; // Lucide / MUI Icon identifier
  tags: string[];
  isOfflineReady: boolean;
  requiresServer?: boolean;
  wasmRequired?: boolean;
  route: string; // '/tools/audio-converter'
  component?: () => Promise<{ default: TComponent }>;
}
```

---

## 🎨 3. Custom Material UI Design System (`@varia/ui`)

* **Deep Obsidian / Zinc Palette**: Background `#09090b`, Card Surface `#18181b` with subtle glowing borders `rgba(255, 255, 255, 0.08)`.
* **Glassmorphism Effects**: `backdrop-filter: blur(16px)` on AppBar, Modals, and Bento Cards.
* **Typography**: `Plus Jakarta Sans` for primary UI elements, `JetBrains Mono` / monospace for Code, UUIDs, and Base64 strings.
* **Bento Grid**: Modular, responsive card layout powering the Hub launchpad at `apps/hub`.

---

## 📚 Related Documentation
* 🧰 **Detailed 20+ Mini-Tools Catalog:** [docs/TOOL_CATALOG.md](./TOOL_CATALOG.md)
* 🏆 **Engineering Standards & CI/CD:** [docs/ENGINEERING_STANDARDS.md](./ENGINEERING_STANDARDS.md)
