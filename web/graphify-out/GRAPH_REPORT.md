# Graphify Knowledge Graph Report

## 📌 Project Architecture Overview
- **Root Directory:** `c:\Users\Administrator\Documents\Projetos\Ecossistema Montanha\Montanha Music Lab\montanha-desktop-web`
- **Total Indexable Files:** 71
- **Total Relationships:** 86

## 🏛️ Key Modules ("God Nodes")
- **`.eslintrc.cjs`** (0.4 KB)
- **`api/signup.js`** (2.3 KB) — Exporta: `handler`
- **`dist-electron/main.js`** (32.3 KB) — Exporta: `fe, pe, me, m, h`
- **`dist-electron/preload.cjs`** (1.2 KB)
- **`electron/electron-env.d.ts`** (3.0 KB)
- **`electron/main.ts`** (47.5 KB) — Exporta: `log, isServiceMode, shouldLaunchHiddenInTray, resolvePreferencesPath, loadPreferences`
- **`electron/preload.cjs`** (1.4 KB) — Exporta: `handler`
- **`electron/preload.ts`** (1.8 KB) — Exporta: `handler`
- **`electron/service-controller.ts`** (10.3 KB) — Exporta: `delay, resolveBackendRoot, resolveBackendEntry, resolveRuntimeStatePath, buildServiceConfig`
- **`index.html`** (4.2 KB)

## 🔗 Dependency Map
### `dist-electron/main.js`
  Imports: `electron`, `child_process`, `fs`, `path`, `url`, `module`, `net`, `os`

### `dist-electron/preload.cjs`
  Imports: `electron`

### `electron/main.ts`
  Imports: `electron`, `child_process`, `electron`, `fs`, `path`, `url`, `module`, `electron`, `electron-updater`, `builder-util-runtime`, `./service-controller`, `electron-updater`

### `electron/preload.cjs`
  Imports: `electron`

### `electron/preload.ts`
  Imports: `electron`

### `electron/service-controller.ts`
  Imports: `electron`, `module`, `child_process`, `fs`, `net`, `os`, `path`, `url`

### `scripts/build-web.cjs`
  Imports: `child_process`

### `scripts/publish-github-release.cjs`
  Imports: `fs`, `path`, `child_process`

### `src/App.tsx`
  Imports: `react`, `framer-motion`, `react`, `lucide-react`, `./lib/supabase`, `./components/SupabaseAuthModal`, `@supabase/supabase-js`, `./services/api`, `./assets/app.png`, `./components/SpotubePlugins`, `./lib/pluginAccounts`, `./components/DesktopOnboardingOverlay`, `./lib/offlineAudioStore`, `./lib/playbackUrl`, `./lib/youtubeRecentSearches`

### `src/components/SpotubePlugins.tsx`
  Imports: `react`, `lucide-react`

### `src/components/SupabaseAuthModal.tsx`
  Imports: `react`, `../lib/supabase`, `lucide-react`, `@supabase/supabase-js`

### `src/lib/browserClientEntry.test.ts`
  Imports: `node:fs`, `node:path`, `vitest`

### `src/lib/downloadRefresh.test.ts`
  Imports: `node:fs`, `node:path`, `vitest`

### `src/lib/installerDataSafety.test.ts`
  Imports: `node:fs`, `node:path`, `vitest`

### `src/lib/offlineAudioStore.test.ts`
  Imports: `vitest`, `./offlineAudioStore`

### `src/lib/offlineAudioStore.ts`
  Imports: `localforage`

### `src/lib/playbackUrl.test.ts`
  Imports: `vitest`, `./playbackUrl`

### `src/lib/pluginAccounts.ts`
  Imports: `./supabase`

### `src/lib/supabase.ts`
  Imports: `@supabase/supabase-js`

### `src/lib/youtubePlaylistUx.test.ts`
  Imports: `node:fs`, `node:path`, `vitest`

### `src/lib/youtubeRecentSearches.test.ts`
  Imports: `vitest`, `./youtubeRecentSearches`

### `src/main.tsx`
  Imports: `react`, `react-dom/client`, `./App.tsx`

### `src/services/api.ts`
  Imports: `axios`

### `vite.config.ts`
  Imports: `vite`, `@vitejs/plugin-react`, `vite-plugin-electron`, `vite-plugin-electron-renderer`

### `vitest.config.ts`
  Imports: `vitest/config`

## ⚡ Zero-Token Context Usage
Utilize este relatório como referência primária de arquitetura para evitar chamadas de leitura desnecessárias.
