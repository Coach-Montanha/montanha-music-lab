import React, { useState } from 'react';
import {
  X,
  Plus,
  Heart,
  Settings2,
  ChevronDown,
  ChevronLeft,
  Check,
  Music2,
  Radio,
  FileText,
  Volume2,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';

export interface PluginAccount {
  provider: 'youtube' | 'spotify' | 'deezer';
  connected: boolean;
  username?: string;
  avatar?: string;
  token?: string;
}

interface SpotubePluginsProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  accounts: Record<string, PluginAccount>;
  onConnectAccount: (provider: 'youtube' | 'spotify' | 'deezer', credentials: { username?: string; token?: string }) => void;
  onDisconnectAccount: (provider: 'youtube' | 'spotify' | 'deezer') => void;
}

export const SpotubePlugins: React.FC<SpotubePluginsProps> = ({
  isMobile = false,
  isOpen = true,
  onClose,
  accounts,
  onConnectAccount,
  onDisconnectAccount,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'plugins' | 'appearance' | 'playback' | 'about'>('plugins');
  const [connectingProvider, setConnectingProvider] = useState<'youtube' | 'spotify' | 'deezer' | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingProvider) return;
    onConnectAccount(connectingProvider, {
      username: loginInput.trim() || `${connectingProvider}_user`,
      token: passwordInput.trim() || 'token_auth_montanha'
    });
    setConnectingProvider(null);
    setLoginInput('');
    setPasswordInput('');
  };

  // 4 Gradient Cards Data (Exact match to Spotube Screenshots)
  const gradientCards = [
    {
      id: 'yt-metadata',
      title: 'YouTube Music',
      subtitle: 'Metadados • v0.1.2',
      bgGradient: 'from-[#4ade80] via-[#22c55e] to-[#15803d]',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 shadow-md">
          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
        </div>
      ),
      type: 'youtube' as const
    },
    {
      id: 'newpipe-audio',
      title: 'NewPipe YouTube',
      subtitle: 'Áudio • v0.1.0',
      bgGradient: 'from-[#38bdf8] via-[#0284c7] to-[#1d4ed8]',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
          </div>
        </div>
      ),
      type: 'youtube' as const
    },
    {
      id: 'lrclib-lyrics',
      title: 'LRCLib Lyrics',
      subtitle: 'Letras • v0.1.0',
      bgGradient: 'from-[#fbbf24] via-[#f97316] to-[#ea580c]',
      icon: (
        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-black text-[9px] font-black leading-none text-white tracking-tighter shadow-md">
          <span>LRC</span>
          <span>LIB</span>
        </div>
      ),
      type: 'lyrics' as const
    },
    {
      id: 'scrobble-none',
      title: isMobile ? 'Nenhum plugin s...' : 'Nenhum plugin selecionado',
      subtitle: 'Scrobble',
      bgGradient: 'from-[#e879f9] via-[#a855f7] to-[#7e22ce]',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-0.5">
            <div className="h-4 w-1 rounded-full bg-pink-200 animate-pulse" />
            <div className="h-6 w-1 rounded-full bg-pink-300" />
            <div className="h-3 w-1 rounded-full bg-pink-200" />
          </div>
        </div>
      ),
      type: 'scrobble' as const
    }
  ];

  // Installed Plugins List
  const installedPlugins = [
    {
      id: 'newpipe',
      name: 'NewPipe YouTube',
      description: 'Plugin NewPipe para reproducao direta de audio.',
      author: 'Montanha Team',
      tag: 'Áudio',
      status: 'Ativo',
      integrated: true,
      provider: 'youtube' as const,
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
        </div>
      )
    },
    {
      id: 'lrclib',
      name: 'LRCLib Lyrics',
      description: 'LRCLib Lyrics plugin for fetching synchronized lyrics.',
      author: 'Montanha Team',
      tag: 'Letras',
      status: 'Ativo',
      integrated: true,
      provider: 'lyrics' as const,
      icon: (
        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-black text-[9px] font-black leading-none text-white tracking-tighter shadow-sm">
          <span>LRC</span>
          <span>LIB</span>
        </div>
      )
    },
    {
      id: 'spotify',
      name: 'Spotify Connect & Playlists',
      description: 'Sincronização de playlists pessoais, histórico e metadados oficiais do Spotify.',
      author: 'Spotify API Core',
      tag: 'Metadados',
      status: accounts.spotify?.connected ? 'Conectado' : 'Pronto',
      integrated: false,
      provider: 'spotify' as const,
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1db954] text-black shadow-sm">
          <Music2 size={22} className="text-black" />
        </div>
      )
    },
    {
      id: 'deezer',
      name: 'Deezer Premium HiFi Stream',
      description: 'Catálogo oficial Deezer, playlists e áudio de alta fidelidade sem compressão.',
      author: 'Deezer Core',
      tag: 'Streaming',
      status: accounts.deezer?.connected ? 'Conectado' : 'Pronto',
      integrated: false,
      provider: 'deezer' as const,
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9b51e0] to-[#ff007a] text-white shadow-sm">
          <Radio size={22} className="text-white" />
        </div>
      )
    },
    {
      id: 'youtube-music',
      name: 'YouTube Music Geral',
      description: 'Motor nativo de busca, áudio de 256kbps e streaming universal sem anúncios.',
      author: 'Montanha Core Engine',
      tag: 'Áudio & Vídeo',
      status: accounts.youtube?.connected ? 'Conectado' : 'Ativo',
      integrated: true,
      provider: 'youtube' as const,
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
          <Sparkles size={20} className="text-white" />
        </div>
      )
    }
  ];

  // Render Login Modal Overlay if user clicked to login/connect
  const loginOverlay = connectingProvider && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#16171d] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              connectingProvider === 'spotify' ? 'bg-[#1db954] text-black' :
              connectingProvider === 'deezer' ? 'bg-gradient-to-tr from-[#9b51e0] to-[#ff007a] text-white' :
              'bg-red-600 text-white'
            }`}>
              {connectingProvider === 'spotify' ? <Music2 size={20} /> :
               connectingProvider === 'deezer' ? <Radio size={20} /> :
               <Sparkles size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-lg capitalize">Conectar {connectingProvider}</h3>
              <p className="text-xs text-gray-400">Montanha Music Lab Sync</p>
            </div>
          </div>
          <button
            onClick={() => setConnectingProvider(null)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300">Usuário ou E-mail da conta</label>
            <input
              type="text"
              required
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder={`Seu usuário no ${connectingProvider}`}
              className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300">Senha ou Chave de Acesso</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Senha da sua conta"
              className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setConnectingProvider(null)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-500"
            >
              <Check size={16} />
              Salvar e Sincronizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // MOBILE VIEW - 100% FIEL À SCREENSHOT 4
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f0f4f9] text-[#1e293b] pb-32">
        {loginOverlay}

        {/* Header Mobile: < Gerenciador de plugins */}
        <div className="sticky top-0 z-20 flex items-center gap-3 bg-[#f0f4f9]/90 px-4 py-3.5 backdrop-blur-md border-b border-[#e2e8f0]">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/60"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Gerenciador de plugins</h2>
        </div>

        <div className="px-4 py-4 space-y-6">
          {/* 4 Gradient Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3">
            {gradientCards.map((card) => (
              <div
                key={card.id}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.bgGradient} p-4 text-white shadow-md transition transform active:scale-95`}
              >
                {/* Bokeh Circles Background Effect */}
                <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/20 blur-sm" />
                <div className="pointer-events-none absolute -left-4 -bottom-4 h-12 w-12 rounded-full bg-white/10 blur-sm" />

                <div className="flex items-start justify-between">
                  {card.icon}
                  <ChevronDown size={16} className="text-white/80" />
                </div>

                <div className="mt-6">
                  <h3 className="font-bold text-sm leading-tight drop-shadow-sm">{card.title}</h3>
                  <p className="mt-1 text-[11px] text-white/85 font-medium drop-shadow-sm">{card.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Configurar */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Configurar</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">5 plugins instalados</p>
              </div>

              <button
                onClick={() => setConnectingProvider('spotify')}
                className="flex items-center gap-1.5 rounded-2xl bg-[#0066cc] px-4 py-2.5 text-xs font-bold text-white shadow-sm active:opacity-90"
              >
                <Plus size={16} />
                <span>Instalar um plugin</span>
              </button>
            </div>

            {/* Installed List Mobile */}
            <div className="mt-4 space-y-3">
              {installedPlugins.map((plugin) => {
                const isConnected = accounts[plugin.provider as keyof typeof accounts]?.connected;
                return (
                  <div
                    key={plugin.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      {plugin.icon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{plugin.name}</h4>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isConnected || plugin.status === 'Ativo'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            <Check size={10} />
                            {isConnected ? 'Conectado' : plugin.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{plugin.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <User size={12} />
                          {plugin.author}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700 text-[10px]">
                          {plugin.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plugin.integrated && (
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Integrado
                          </span>
                        )}
                        {(plugin.provider === 'spotify' || plugin.provider === 'deezer' || plugin.provider === 'youtube') && (
                          <button
                            onClick={() => {
                              if (isConnected) {
                                onDisconnectAccount(plugin.provider as any);
                              } else {
                                setConnectingProvider(plugin.provider as any);
                              }
                            }}
                            className={`rounded-xl px-2.5 py-1 text-xs font-semibold ${
                              isConnected
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-[#0066cc] text-white hover:bg-blue-700'
                            }`}
                          >
                            {isConnected ? 'Desconectar' : 'Conectar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP MODAL VIEW - 100% FIEL À SCREENSHOT 3
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      {loginOverlay}

      <div className="flex h-[88vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#16171d] shadow-[0_25px_80px_rgba(0,0,0,0.8)] text-white">
        {/* Modal Left Sidebar: Configurações */}
        <aside className="w-64 border-r border-white/10 bg-[#111217] p-5 flex flex-col justify-between select-none">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white px-3 pb-4">Configurações</h2>
            <nav className="space-y-1">
              {[
                { id: 'plugins', label: 'Plugins', icon: <Sparkles size={16} /> },
                { id: 'idioma', label: 'Idioma e região', icon: <FileText size={16} /> },
                { id: 'aparencia', label: 'Aparência', icon: <Settings2 size={16} /> },
                { id: 'reproducao', label: 'Reprodução', icon: <Volume2 size={16} /> },
                { id: 'bloqueio', label: 'Lista de bloqueio', icon: <ShieldCheck size={16} /> },
                { id: 'jam', label: 'Jam em grupo', icon: <Radio size={16} /> },
                { id: 'cache', label: 'Cache', icon: <Settings2 size={16} /> },
                { id: 'downloads', label: 'Downloads', icon: <Music2 size={16} /> },
                { id: 'desktop', label: 'Desktop', icon: <Settings2 size={16} /> },
                { id: 'sobre', label: 'Sobre', icon: <User size={16} /> }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModalTab(item.id as any)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    activeModalTab === item.id || (item.id === 'plugins' && activeModalTab === 'plugins')
                      ? 'bg-blue-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]'
                      : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="px-3 text-[11px] text-gray-500">
            Montanha Music Lab v1.0.0
          </div>
        </aside>

        {/* Modal Right Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <h1 className="text-2xl font-black tracking-tight text-white">Plugins</h1>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* 4 Gradient Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {gradientCards.map((card) => (
              <div
                key={card.id}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bgGradient} p-5 text-white shadow-lg transition transform hover:-translate-y-0.5`}
              >
                {/* Bokeh Effect */}
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-md" />
                <div className="pointer-events-none absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-white/10 blur-md" />

                <div className="flex items-start justify-between">
                  {card.icon}
                  <ChevronDown size={18} className="text-white/80" />
                </div>

                <div className="mt-8">
                  <h3 className="font-bold text-base leading-tight drop-shadow-sm">{card.title}</h3>
                  <p className="mt-1 text-xs text-white/85 font-medium drop-shadow-sm">{card.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Configurar Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">Configurar</h3>
                <p className="text-xs text-gray-400 mt-1">6 plugins instalados</p>
              </div>

              <button
                onClick={() => setConnectingProvider('spotify')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition"
              >
                <Plus size={16} />
                <span>Instalar um plugin</span>
              </button>
            </div>

            {/* List */}
            <div className="mt-5 space-y-3">
              {installedPlugins.map((plugin) => {
                const isConnected = accounts[plugin.provider as keyof typeof accounts]?.connected;
                return (
                  <div
                    key={plugin.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#1b1c24] p-4 transition hover:border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      {plugin.icon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white truncate">{plugin.name}</h4>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isConnected || plugin.status === 'Ativo'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            <Check size={12} />
                            {isConnected ? 'Conectado' : plugin.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-400 leading-relaxed">{plugin.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-gray-300">
                          <User size={13} />
                          {plugin.author}
                        </span>
                        <span className="rounded-md bg-white/5 px-2 py-0.5 font-medium text-gray-300 text-[11px]">
                          {plugin.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {plugin.integrated && (
                          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-gray-300">
                            Integrado
                          </span>
                        )}
                        <button className="text-gray-400 hover:text-white">
                          <Heart size={16} />
                        </button>
                        {(plugin.provider === 'spotify' || plugin.provider === 'deezer' || plugin.provider === 'youtube') && (
                          <button
                            onClick={() => {
                              if (isConnected) {
                                onDisconnectAccount(plugin.provider as any);
                              } else {
                                setConnectingProvider(plugin.provider as any);
                              }
                            }}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                              isConnected
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                          >
                            {isConnected ? 'Desconectar' : 'Conectar conta'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
