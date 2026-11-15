# Graphify Knowledge Graph Report

## 📌 Project Architecture Overview
- **Root Directory:** `C:\Users\Administrator\Documents\Projetos\Ecossistema Montanha\Montanha Music Lab\spotube-core\apps\montanha-bento`
- **Total Indexable Files:** 32
- **Total Relationships:** 37

## 🏛️ Key Modules ("God Nodes")
- **`api/search.js`** (6.2 KB) — Exporta: `handler, query`
- **`api/spotify.js`** (4.6 KB) — Exporta: `handler, input`
- **`api/stream.js`** (5.8 KB) — Exporta: `sanitizeTitle, extractArtistCandidates, handler, title, artist`
- **`api/sync.js`** (4.2 KB) — Exporta: `handler`
- **`api/youtube-search.js`** (2.7 KB) — Exporta: `handler, query`
- **`index.html`** (1.4 KB)
- **`package-lock.json`** (98.8 KB)
- **`package.json`** (0.8 KB)
- **`postcss.config.js`** (0.1 KB)
- **`public/manifest.json`** (0.6 KB)

## 🔗 Dependency Map
### `src/App.tsx`
  Imports: `react`, `lucide-react`, `./types`, `./lib/offlineDb`, `./lib/supabase`, `./lib/playlistExtractor`, `./lib/searchEngine`, `./components/AuthModal`, `./components/AuthGateway`, `./components/SettingsModal`, `./components/AudioScrubber`, `./lib/mediaSession`, `./lib/coverEngine`, `./lib/audioStreamEngine`, `pwa-audio-player`

### `src/components/AudioScrubber.tsx`
  Imports: `react`

### `src/components/AuthGateway.tsx`
  Imports: `react`, `lucide-react`, `../lib/supabase`

### `src/components/AuthModal.tsx`
  Imports: `react`, `lucide-react`, `../lib/supabase`

### `src/components/SettingsModal.tsx`
  Imports: `react`, `lucide-react`, `../lib/supabase`, `../types`

### `src/ErrorBoundary.tsx`
  Imports: `react`

### `src/lib/coverEngine.ts`
  Imports: `../types`

### `src/lib/playlistExtractor.ts`
  Imports: `../types`

### `src/lib/searchEngine.ts`
  Imports: `../types`

### `src/lib/supabase.ts`
  Imports: `@supabase/supabase-js`

### `src/main.tsx`
  Imports: `react`, `react-dom/client`, `./App`, `./ErrorBoundary`

### `vite.config.ts`
  Imports: `vite`, `@vitejs/plugin-react`

## ⚡ Zero-Token Context Usage
Utilize este relatório como referência primária de arquitetura para evitar chamadas de leitura desnecessárias.
