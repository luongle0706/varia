# 🧰 Master Mini-Tools Catalog (Draft & Specifications)

Tài liệu này lưu trữ danh mục toàn bộ các mini-tools dự kiến triển khai cho **Varia**. Khi bắt tay vào code bất kỳ tool nào, có thể tham chiếu lại thông số, tính năng và cơ chế hoạt động tại đây.

---

## 🎞️ Nhóm 1: Media & Audio Studio *(Client-side WebAssembly / Canvas)*

### 1. `tool-audio-converter` — MP4 to MP3 Studio
* **Inspiration:** [FreeConvert.com MP4 to MP3](https://www.freeconvert.com/mp4-to-mp3)
* **Tính năng:**
  * Tách âm thanh từ file video (MP4, MKV, WebM, AVI, MOV) sang MP3, WAV, AAC, OGG.
  * Tùy chỉnh chất lượng âm thanh: CBR/VBR Bitrate (64kbps, 128kbps, 192kbps, 256kbps, 320kbps).
  * Điều chỉnh âm lượng (Volume Boost lên đến 200%).
  * Hiệu ứng âm thanh: Audio Fade-in / Fade-out.
  * Cắt đoạn âm thanh (Audio Trimmer) trực quan với sóng âm thanh (Waveform visualizer).
  * Batch Conversion: Xử lý nhiều file cùng lúc trên Web Worker đa luồng.
* **Tech:** `@ffmpeg/ffmpeg` (WASM) + Web Worker.

### 2. `tool-gif-studio` — GIF Maker & Editor
* **Inspiration:** [Ezgif.com](https://ezgif.com/)
* **Tính năng:**
  * **Video to GIF & Images to GIF**: Chuyển đổi video ngắn hoặc chuỗi ảnh thành GIF.
  * **Cut / Trim**: Cắt thời lượng GIF chính xác từng frame.
  * **Crop & Resize**: Cắt khung hình (1:1, 16:9, 4:5, 9:16) và scale kích thước.
  * **Speed & Reverse**: Tăng/giảm tốc độ (FPS), tua ngược GIF.
  * **GIF Optimizer**: Giảm dung lượng file bằng Color Quantization (256/128/64/32 màu) và Lossy LZW Compression.
  * **Split Frames**: Trích xuất tất cả frame của GIF thành từng file ảnh PNG/ZIP.
* **Tech:** FFmpeg WASM + Canvas API + gifshot/omggif.

### 3. `tool-image-studio` — Image Compressor & WebP Converter
* **Inspiration:** TinyPNG / Squoosh
* **Tính năng:**
  * Nén ảnh JPEG, PNG, WebP, AVIF ngay trên trình duyệt mà không tải lên server.
  * Bulk Resize kích thước ảnh hàng loạt.
  * Chuyển đổi qua lại giữa JPG <-> PNG <-> WebP <-> AVIF.
* **Tech:** Browser Native Canvas + Web Worker.

### 4. `tool-svg-studio` — SVG to JSX & Vector Optimizer
* **Inspiration:** SVGOMG / SVGR
* **Tính năng:**
  * Tối ưu hóa dung lượng SVG bằng cách loại bỏ metadata thừa.
  * Chuyển đổi mã SVG thành React/TypeScript JSX Component sẵn sàng copy.
  * Trình xem vector trực quan, đổi màu fill/stroke trực tiếp.
* **Tech:** SVGO in browser.

---

## 🛠️ Nhóm 2: Developer & Everyday Utilities *(Instant Zero-Latency)*

### 5. `tool-uuid-forge` — UUID / ULID / NanoID Forge
* **Tính năng:**
  * Sinh UUID v4 (Random) & UUID v7 (Timestamp-ordered mới nhất chuẩn RFC 9562).
  * Sinh ULID, NanoID, CUID2.
  * Batch generation (1 đến 1000 IDs).
  * Format options: chữ hoa/thường, có/không dấu gạch nối, định dạng JSON array hoặc CSV.
* **Tech:** Pure TypeScript + Web Crypto API.

### 6. `tool-jwt-base64` — JWT & Base64 Inspector
* **Tính năng:**
  * Giải mã token JWT (Header, Payload, Signature).
  * Phân tích và highlight hạn dùng (Expiration Time / Issued At) dưới dạng ngày giờ chuẩn.
  * Encode / Decode chuỗi Base64 cho văn bản, URL, và file hình ảnh (kèm preview).
* **Tech:** Pure TypeScript.

### 7. `tool-hash-studio` — Hash & Checksum Studio
* **Tính năng:**
  * Sinh mã băm MD5, SHA-1, SHA-256, SHA-384, SHA-512.
  * Hỗ trợ băm chuỗi văn bản hoặc kéo thả file dung lượng lớn (Checksum verification).
  * So sánh nhanh 2 mã hash để kiểm tra tính toàn vẹn file.
* **Tech:** Native `crypto.subtle` API.

### 8. `tool-regex-playground` — RegEx Playground
* **Tính năng:**
  * Kiểm tra biểu thức chính quy thời gian thực (real-time regex test).
  * Tô màu highlight các capture groups và match indices.
  * Kèm bảng tra cứu Cheat-sheet các ký tự đặc biệt.
* **Tech:** JavaScript RegExp engine.

### 9. `tool-json-studio` — JSON Studio & Diff
* **Tính năng:**
  * JSON Formatter, Validator, Beautifier & Minifier.
  * Trình so sánh khác biệt (JSON Diff Viewer) trực quan giữa 2 cấu trúc JSON.
  * Tự động chuyển đổi JSON sang TypeScript Interfaces hoặc YAML.
* **Tech:** Monaco Editor / CodeMirror.

### 10. `tool-cron-explainer` — Cron Expression Builder
* **Tính năng:**
  * Dịch biểu thức Cron 5/6 ký tự thành câu mô tả tiếng người dễ hiểu.
  * Giao diện tương tác chọn giờ/phút/ngày để tự sinh biểu thức Cron.
* **Tech:** cronstrue.

### 11. `tool-color-studio` — Color Studio & Contrast
* **Tính năng:**
  * Color Picker và chuyển đổi mã màu (HEX, RGB, HSL, HSB, OKLCH).
  * Kiểm tra độ tương phản màu chuẩn WCAG 2.1 (AA / AAA).
  * Tự động sinh bảng phối màu (Complementary, Analogous, Triadic).
* **Tech:** `@varia/ui` color math.

---

## ⚡ Nhóm 3: Network & Connectivity Tools

### 12. `tool-speedtest` — Varia SpeedTest
* **Tính năng:**
  * Đo tốc độ Download & Upload băng thông mạng thực tế.
  * Đo Ping (Latency) và Jitter (độ biến động mạng) theo ms.
  * Đồng hồ Gauge meter hiển thị tốc độ với hiệu ứng mượt mà.
* **Tech:** WebRTC & Chunked Fetch Streams.

### 13. `tool-ip-inspector` — Public IP & Geo Inspector
* **Tính năng:**
  * Xem địa chỉ IP công khai (IPv4 & IPv6), nhà mạng (ISP), Quốc gia, Thành phố.
  * Kiểm tra User-Agent, độ phân giải màn hình, WebRTC Leak Test.
* **Tech:** Lightweight IP lookup API.

### 14. `tool-dns-lookup` — DNS Lookup & Ping
* **Tính năng:**
  * Tra cứu các bản ghi DNS: A, AAAA, CNAME, MX, TXT, NS, SOA.
  * Đo thời gian phản hồi của DNS resolver.
* **Tech:** DNS over HTTPS (Cloudflare / Google 1.1.1.1 & 8.8.8.8).

### 15. `tool-http-tester` — cURL & HTTP Quick Tester
* **Tính năng:**
  * Kiểm tra nhanh phản hồi API HTTP (GET, POST, PUT, DELETE).
  * Chuyển đổi lệnh `curl` thành mã nguồn `fetch` / `axios`.
* **Tech:** Native Fetch API.

---

## 📥 Nhóm 4: Social Media & Downloaders *(Hybrid)*

### 16. `tool-social-grabber` — Social Media Media Grabber
* **Tính năng:**
  * Trích xuất và tải video/audio/GIF từ các nền tảng mạng xã hội phổ biến.
  * Lựa chọn chất lượng video (1080p, 720p) và trích xuất chỉ phần âm thanh MP3.
* **Tech:** Serverless Proxy / API.

---

## 📝 Nhóm 5: Text & Productivity Utilities

### 17. `tool-markdown-studio` — Markdown Live Studio
* **Tính năng:**
  * Soạn thảo Markdown 2 cột real-time preview.
  * Hỗ trợ GitHub Flavored Markdown (GFM), Mermaid Diagrams, MathJax.
  * Xuất tài liệu ra định dạng HTML hoặc PDF.
* **Tech:** Marked + Highlight.js.

### 18. `tool-qr-studio` — QR Code Studio
* **Tính năng:**
  * Tạo mã QR đa năng (Text, URL, Wi-Fi, vCard) với tùy biến màu sắc, gradient, logo giữa.
  * Quét đọc mã QR trực tiếp từ Webcam hoặc upload file ảnh.
* **Tech:** qrcode + jsQR.

### 19. `tool-text-diff` — Text Diff & Case Converter
* **Tính năng:**
  * So sánh văn bản (Text Diff) từng ký tự và từng dòng.
  * Bộ chuyển đổi quy ước đặt tên: camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE.
  * Đếm từ, ký tự, số dòng và ước tính thời gian đọc.
* **Tech:** diff-match-patch.
