# 🧰 Master Mini-Tools Catalog (Specifications & Blueprint)

This document maintains the complete catalog of all mini-tools planned for **Varia**. When developing any tool, reference its technical specifications, features, and operating mechanics here.

---

## 🎞️ Category 1: Media & Audio Studio *(Client-side WebAssembly / Canvas)*

### 1. `tool-audio-converter` — MP4 to MP3 Studio
* **Inspiration:** [FreeConvert.com MP4 to MP3](https://www.freeconvert.com/mp4-to-mp3)
* **Features:**
  * Extract audio from video containers (MP4, MKV, WebM, AVI, MOV) to MP3, WAV, AAC, OGG.
  * Configurable audio quality: CBR/VBR Bitrate options (64kbps, 128kbps, 192kbps, 256kbps, 320kbps).
  * Volume adjustment (Volume Boost up to 200%).
  * Audio effects: Audio Fade-in / Fade-out curves.
  * Visual Audio Trimmer with interactive waveform visualizer.
  * Batch Conversion: Parallel multi-file processing on multi-threaded Web Workers.
* **Tech:** `@ffmpeg/ffmpeg` (WASM) + Web Worker.

### 2. `tool-gif-studio` — GIF Maker & Editor
* **Inspiration:** [Ezgif.com](https://ezgif.com/)
* **Features:**
  * **Video to GIF & Images to GIF**: Convert short video clips or image sequences into animated GIFs.
  * **Cut / Trim**: Frame-accurate GIF duration trimming.
  * **Crop & Resize**: Aspect ratio cropping (1:1, 16:9, 4:5, 9:16) and resolution scaling.
  * **Speed & Reverse**: Adjust frame rates (FPS), playback speed multiplier, reverse GIF playback.
  * **GIF Optimizer**: File size compression via Color Quantization (256/128/64/32 colors) and Lossy LZW Compression.
  * **Split Frames**: Extract all GIF frames into individual PNG files or a bundled ZIP.
* **Tech:** FFmpeg WASM + Canvas API + gifshot/omggif.

### 3. `tool-image-studio` — Image Compressor & WebP Converter
* **Inspiration:** TinyPNG / Squoosh
* **Features:**
  * In-browser JPEG, PNG, WebP, AVIF compression with zero server upload.
  * Bulk batch image resizing.
  * Format cross-conversion between JPG <-> PNG <-> WebP <-> AVIF.
* **Tech:** Browser Native Canvas + Web Worker.

### 4. `tool-svg-studio` — SVG to JSX & Vector Optimizer
* **Inspiration:** SVGOMG / SVGR
* **Features:**
  * Optimize SVG payload by removing redundant metadata, comments, and hidden layers.
  * Convert raw SVG markup into ready-to-copy React/TypeScript JSX components.
  * Interactive vector preview with real-time fill/stroke color palette manipulation.
* **Tech:** SVGO in browser.

---

## 🛠️ Category 2: Developer & Everyday Utilities *(Instant Zero-Latency)*

### 5. `tool-uuid-forge` — UUID / ULID / NanoID Forge
* **Features:**
  * Generate RFC 4122 Version 4 (Random) & RFC 9562 Version 7 (Timestamp-Ordered) UUIDs.
  * Generate ULID, NanoID, and CUID2 identifiers.
  * Batch generation (1 to 1,000 IDs at once).
  * Output formatting options: uppercase/lowercase, with/without hyphens, JSON array, or plain CSV.
* **Tech:** Pure TypeScript + Web Crypto API.

### 6. `tool-jwt-base64` — JWT & Base64 Inspector
* **Features:**
  * Decode JWT tokens into formatted Header, Payload, and Signature JSON.
  * Parse and highlight token lifetime (Expiration Time / Issued At) in human-readable local time and countdowns.
  * Encode / Decode Base64 strings for raw text, URLs, and image/binary files (with inline preview).
* **Tech:** Pure TypeScript.

### 7. `tool-hash-studio` — Hash & Checksum Studio
* **Features:**
  * Compute MD5, SHA-1, SHA-256, SHA-384, and SHA-512 cryptographic digests.
  * Support both direct string input and large file drag-and-drop chunked checksum hashing.
  * Instant dual-hash verification and checksum comparison indicator.
* **Tech:** Native `crypto.subtle` API + JS MD5 fallback.

### 8. `tool-regex-playground` — RegEx Playground
* **Features:**
  * Real-time regular expression testing and matching.
  * Syntax color highlighting for match indices and named/numbered capture groups.
  * Integrated interactive regex cheat-sheet and common pattern presets (Email, URL, IP, etc.).
* **Tech:** JavaScript RegExp engine.

### 9. `tool-json-studio` — JSON Studio & Diff
* **Features:**
  * JSON Formatter, Validator, Beautifier, and Minifier.
  * Side-by-side visual JSON Diff viewer highlighting additions, modifications, and removals.
  * Automatic schema conversion from JSON to TypeScript Interfaces or YAML.
* **Tech:** Monaco Editor / CodeMirror.

### 10. `tool-cron-explainer` — Cron Expression Builder
* **Features:**
  * Translate 5/6-part Cron expressions into plain-language human readable schedules.
  * Interactive time-picker UI (minute/hour/day/month/weekday) to visually generate Cron strings.
* **Tech:** cronstrue.

### 11. `tool-color-studio` — Color Studio & Contrast
* **Features:**
  * Color Picker and format conversion (HEX, RGB, HSL, HSB, OKLCH).
  * WCAG 2.1 Contrast ratio checker (AA / AAA compliance scores for normal and large text).
  * Automatic harmonic color palette generation (Complementary, Analogous, Triadic, Monochromatic).
* **Tech:** `@varia/ui` color tokens & math.

---

## ⚡ Category 3: Network & Connectivity Tools

### 12. `tool-speedtest` — Varia SpeedTest
* **Features:**
  * Measure real-world network Download and Upload bandwidth throughput.
  * Measure Ping Latency and Jitter variation in milliseconds.
  * Smooth animated speedometer gauge visualization.
* **Tech:** WebRTC & Chunked Fetch Streams.

### 13. `tool-ip-inspector` — Public IP & Geo Inspector
* **Features:**
  * Detect public IPv4 & IPv6 addresses, Internet Service Provider (ISP), ASN, Country, and City.
  * Inspect client browser parameters, screen resolution, and perform WebRTC IP leak checks.
* **Tech:** Lightweight IP lookup API.

### 14. `tool-dns-lookup` — DNS Lookup & Ping
* **Features:**
  * Query all major DNS records: A, AAAA, CNAME, MX, TXT, NS, SOA.
  * Benchmark DNS resolver response latencies.
* **Tech:** DNS over HTTPS (Cloudflare / Google 1.1.1.1 & 8.8.8.8).

### 15. `tool-http-tester` — cURL & HTTP Quick Tester
* **Features:**
  * Quick API test client for HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD).
  * Auto-convert `curl` command strings into executable `fetch` / `axios` code snippets.
* **Tech:** Native Fetch API.

---

## 📥 Category 4: Social Media & Downloaders *(Hybrid)*

### 16. `tool-social-grabber` — Social Media Media Grabber
* **Features:**
  * Extract and download video, GIF, and audio streams from supported social media platforms.
  * Quality selection (1080p, 720p, 480p) and dedicated MP3 audio extraction.
* **Tech:** Serverless Proxy / API.

---

## 📝 Category 5: Text & Productivity Utilities

### 17. `tool-markdown-studio` — Markdown Live Studio
* **Features:**
  * Dual-pane live Markdown editor with synchronized scrolling preview.
  * Support for GitHub Flavored Markdown (GFM), Mermaid Diagrams, and MathJax formulas.
  * Export rendered documents to clean HTML or print-ready PDF.
* **Tech:** Marked + Highlight.js.

### 18. `tool-qr-studio` — QR Code Studio
* **Features:**
  * Generate versatile QR codes (Plain Text, URL, Wi-Fi configuration, vCard) with custom colors, gradients, and central logo branding.
  * Decode QR codes directly via Webcam scanner or image file upload.
* **Tech:** qrcode + jsQR.

### 19. `tool-text-diff` — Text Diff & Case Converter
* **Features:**
  * Side-by-side character-level and line-level text diff comparison.
  * Naming convention casing converter: camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE.
  * Word count, character count, line count, and estimated reading time statistics.
* **Tech:** diff-match-patch.

