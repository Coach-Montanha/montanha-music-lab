import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
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
  Sparkles,
  Globe,
  Palette,
  HardDrive,
  Download,
  Laptop,
  Info,
  Trash2,
} from 'lucide-react';

export interface PluginAccount {
  provider: 'youtube' | 'spotify' | 'deezer' | 'lrclib' | 'newpipe' | 'scrobble';
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
  onConnectAccount: (provider: any, credentials: { username?: string; token?: string }) => void;
  onDisconnectAccount: (provider: any) => void;
}

type ModalTabId =
  | 'plugins'
  | 'idioma'
  | 'aparencia'
  | 'reproducao'
  | 'bloqueio'
  | 'jam'
  | 'cache'
  | 'downloads'
  | 'desktop'
  | 'sobre';

export const SpotubePlugins: React.FC<SpotubePluginsProps> = ({
  isMobile = false,
  isOpen = true,
  onClose,
  accounts,
  onConnectAccount,
  onDisconnectAccount,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<ModalTabId>('plugins');
  const [configuringPlugin, setConfiguringPlugin] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Form states for plugin configuration
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [customInstanceInput, setCustomInstanceInput] = useState('');
  const [audioQualityPref, setAudioQualityPref] = useState('256');

  // General settings stored in localStorage
  const [language, setLanguage] = useState(() => localStorage.getItem('montanha-lang') || 'pt-BR');
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('montanha-theme') || 'oled');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('montanha-accent') || 'blue');
  const [audioQuality, setAudioQuality] = useState(() => localStorage.getItem('montanha-audio-quality') || 'high');
  const [crossfade, setCrossfade] = useState(() => localStorage.getItem('montanha-crossfade') || '3');
  const [normalizeAudio, setNormalizeAudio] = useState(() => localStorage.getItem('montanha-normalize') !== 'false');
  const [cacheSizeMb, setCacheSizeMb] = useState('42.8');
  const [downloadFormat, setDownloadFormat] = useState(() => localStorage.getItem('montanha-dl-format') || 'mp3');
  const [autoLyrics, setAutoLyrics] = useState(() => localStorage.getItem('montanha-auto-lyrics') !== 'false');
  const [minimizeToTray, setMinimizeToTray] = useState(() => localStorage.getItem('montanha-tray') !== 'false');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('montanha-lang', language);
    localStorage.setItem('montanha-theme', themeMode);
    localStorage.setItem('montanha-accent', accentColor);
    localStorage.setItem('montanha-audio-quality', audioQuality);
    localStorage.setItem('montanha-crossfade', crossfade);
    localStorage.setItem('montanha-normalize', String(normalizeAudio));
    localStorage.setItem('montanha-dl-format', downloadFormat);
    localStorage.setItem('montanha-auto-lyrics', String(autoLyrics));
    localStorage.setItem('montanha-tray', String(minimizeToTray));
  }, [language, themeMode, accentColor, audioQuality, crossfade, normalizeAudio, downloadFormat, autoLyrics, minimizeToTray]);

  if (!isOpen) return null;

  const handlePluginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringPlugin) return;
    onConnectAccount(configuringPlugin, {
      username: loginInput.trim() || `${configuringPlugin}_user`,
      token: passwordInput.trim() || customInstanceInput.trim() || 'token_ativo'
    });
    showToast(`Plugin ${configuringPlugin.toUpperCase()} configurado com sucesso!`);
    setConfiguringPlugin(null);
    setLoginInput('');
    setPasswordInput('');
    setCustomInstanceInput('');
  };

  // 4 Gradient Cards Data (Exact match to Spotube Screenshots)
  const gradientCards = [
    {
      id: 'youtube',
      title: 'YouTube Music',
      subtitle: 'Metadados • v0.1.2',
      bgGradient: 'from-[#4ade80] via-[#22c55e] to-[#15803d]',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 shadow-md">
          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
        </div>
      ),
      type: 'youtube'
    },
    {
      id: 'newpipe',
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
      type: 'newpipe'
    },
    {
      id: 'lrclib',
      title: 'LRCLib Lyrics',
      subtitle: 'Letras • v0.1.0',
      bgGradient: 'from-[#fbbf24] via-[#f97316] to-[#ea580c]',
      icon: (
        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-black text-[9px] font-black leading-none text-white tracking-tighter shadow-md">
          <span>LRC</span>
          <span>LIB</span>
        </div>
      ),
      type: 'lrclib'
    },
    {
      id: 'scrobble',
      title: accounts.scrobble?.connected ? 'Last.fm / Scrobble' : (isMobile ? 'Nenhum plugin s...' : 'Nenhum plugin selecionado'),
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
      type: 'scrobble'
    }
  ];

  // Installed Plugins List
  const installedPlugins = [
    {
      id: 'newpipe',
      name: 'NewPipe YouTube',
      description: 'Plugin NewPipe para reproducao direta de audio sem anúncios.',
      author: 'Montanha Team',
      tag: 'Áudio',
      status: 'Ativo',
      integrated: true,
      provider: 'newpipe',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
        </div>
      )
    },
    {
      id: 'lrclib',
      name: 'LRCLib Lyrics',
      description: 'Plugin LRCLib oficial para sincronização automática de letras em tempo real.',
      author: 'Montanha Team',
      tag: 'Letras',
      status: 'Ativo',
      integrated: true,
      provider: 'lrclib',
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
      description: 'Importação de playlists pessoais, histórico e biblioteca oficial do Spotify.',
      author: 'Spotify API Core',
      tag: 'Metadados',
      status: accounts.spotify?.connected ? 'Conectado' : 'Pronto',
      integrated: false,
      provider: 'spotify',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1db954] text-black shadow-sm">
          <Music2 size={22} className="text-black" />
        </div>
      )
    },
    {
      id: 'deezer',
      name: 'Deezer Premium HiFi Stream',
      description: 'Catálogo oficial Deezer, playlists e áudio de alta fidelidade FLAC.',
      author: 'Deezer Core',
      tag: 'Streaming',
      status: accounts.deezer?.connected ? 'Conectado' : 'Pronto',
      integrated: false,
      provider: 'deezer',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9b51e0] to-[#ff007a] text-white shadow-sm">
          <Radio size={22} className="text-white" />
        </div>
      )
    },
    {
      id: 'youtube',
      name: 'YouTube Music Geral',
      description: 'Motor nativo de busca, áudio de 256kbps e streaming universal sem anúncios.',
      author: 'Montanha Core Engine',
      tag: 'Áudio & Vídeo',
      status: accounts.youtube?.connected ? 'Conectado' : 'Ativo',
      integrated: true,
      provider: 'youtube',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
          <Sparkles size={20} className="text-white" />
        </div>
      )
    }
  ];

  // Specific Modal for Configuring Each Plugin
  const renderPluginConfigModal = () => {
    if (!configuringPlugin) return null;

    const titles: Record<string, { name: string; desc: string; icon: React.ReactNode; color: string }> = {
      youtube: {
        name: 'Configurar YouTube Music',
        desc: 'Defina a instância de streaming Piped/Invidious ou chave de API.',
        icon: <Sparkles size={20} />,
        color: 'bg-red-600 text-white'
      },
      newpipe: {
        name: 'Configurar NewPipe YouTube',
        desc: 'Motor de extração de áudio direto de alta fidelidade.',
        icon: <Volume2 size={20} />,
        color: 'bg-blue-600 text-white'
      },
      lrclib: {
        name: 'Configurar LRCLib Letras',
        desc: 'Sincronização instantânea de letras musicais (LRC).',
        icon: <FileText size={20} />,
        color: 'bg-amber-600 text-white'
      },
      scrobble: {
        name: 'Configurar Scrobble (Last.fm / ListenBrainz)',
        desc: 'Registre suas músicas tocadas no seu perfil pessoal.',
        icon: <Radio size={20} />,
        color: 'bg-purple-600 text-white'
      },
      spotify: {
        name: 'Conectar Spotify',
        desc: 'Sincronize suas playlists, músicas curtidas e álbuns do Spotify.',
        icon: <Music2 size={20} />,
        color: 'bg-[#1db954] text-black'
      },
      deezer: {
        name: 'Conectar Deezer',
        desc: 'Acesse suas playlists e áudio sem perdas (HiFi) do Deezer.',
        icon: <Radio size={20} />,
        color: 'bg-gradient-to-tr from-[#9b51e0] to-[#ff007a] text-white'
      }
    };

    const currentInfo = titles[configuringPlugin] || {
      name: `Configurar ${configuringPlugin}`,
      desc: 'Ajuste os parâmetros deste plugin.',
      icon: <Settings2 size={20} />,
      color: 'bg-blue-600 text-white'
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#14161f] p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${currentInfo.color} shadow-md`}>
                {currentInfo.icon}
              </div>
              <div>
                <h3 className="font-bold text-base">{currentInfo.name}</h3>
                <p className="text-xs text-gray-400">{currentInfo.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setConfiguringPlugin(null)}
              className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handlePluginSubmit} className="mt-5 space-y-4">
            {configuringPlugin === 'youtube' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-300">Instância de Streaming (Piped / Invidious)</label>
                  <input
                    type="text"
                    value={customInstanceInput}
                    onChange={(e) => setCustomInstanceInput(e.target.value)}
                    placeholder="https://api.piped.private.coffee (Automático)"
                    className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white placeholder-gray-500 outline-none focus:border-red-500"
                  />
                  <p className="mt-1 text-[10px] text-gray-500">Deixe em branco para usar o balanceador automático de alta velocidade.</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300">Modo Restrito</label>
                  <select className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#1e2029] px-4 text-xs text-white outline-none">
                    <option value="off">Desativado (Todas as faixas liberadas)</option>
                    <option value="on">Ativado (Filtrar conteúdo explícito)</option>
                  </select>
                </div>
              </>
            )}

            {configuringPlugin === 'newpipe' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-300">Taxa de Bits de Áudio (Bitrate)</label>
                  <select
                    value={audioQualityPref}
                    onChange={(e) => setAudioQualityPref(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#1e2029] px-4 text-xs text-white outline-none"
                  >
                    <option value="256">Alta Qualidade (256 kbps Opus / AAC)</option>
                    <option value="160">Média Qualidade (160 kbps)</option>
                    <option value="128">Econômica (128 kbps)</option>
                  </select>
                </div>
              </>
            )}

            {configuringPlugin === 'lrclib' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-300">Servidor LRCLib Oficial</label>
                  <input
                    type="text"
                    disabled
                    value="https://lrclib.net/api"
                    className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-xs text-gray-300">Buscar letras automaticamente ao tocar música</span>
                  <input
                    type="checkbox"
                    checked={autoLyrics}
                    onChange={(e) => setAutoLyrics(e.target.checked)}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                </div>
              </>
            )}

            {configuringPlugin === 'scrobble' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-300">Serviço de Scrobble</label>
                  <select className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#1e2029] px-4 text-xs text-white outline-none">
                    <option value="lastfm">Last.fm</option>
                    <option value="listenbrainz">ListenBrainz</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300">Nome de Usuário</label>
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Seu usuário no Last.fm"
                    className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300">API Key / Token de Sessão</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Cole seu token de autenticação"
                    className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500"
                  />
                </div>
              </>
            )}

            {(configuringPlugin === 'spotify' || configuringPlugin === 'deezer') && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-300">Usuário ou E-mail da conta</label>
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder={`Seu usuário no ${configuringPlugin}`}
                    className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300">
                    {configuringPlugin === 'spotify' ? 'Senha ou Client Secret' : 'ARL Token ou Senha'}
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Chave de acesso seguro"
                    className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfiguringPlugin(null)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition"
              >
                <Check size={14} />
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal to Install New Plugins (Catalog)
  const renderCatalogModal = () => {
    if (!isCatalogOpen) return null;

    const catalog = [
      { id: 'spotify', name: 'Spotify Music', cat: 'Playlists & Metadados', icon: <Music2 size={20} className="text-[#1db954]" /> },
      { id: 'deezer', name: 'Deezer HiFi', cat: 'Áudio sem perdas (FLAC)', icon: <Radio size={20} className="text-pink-500" /> },
      { id: 'soundcloud', name: 'SoundCloud Direct', cat: 'Mixes, Sets e Indie', icon: <Volume2 size={20} className="text-orange-500" /> },
      { id: 'jamendo', name: 'Jamendo Music', cat: 'Creative Commons Livre', icon: <Globe size={20} className="text-sky-400" /> },
      { id: 'scrobble', name: 'Last.fm Scrobbler', cat: 'Histórico & Estatísticas', icon: <Radio size={20} className="text-purple-400" /> }
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#14161f] p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="font-bold text-lg">Catálogo de Plugins Spotube</h3>
              <p className="text-xs text-gray-400">Instale ou configure novas fontes de áudio e metadados.</p>
            </div>
            <button
              onClick={() => setIsCatalogOpen(false)}
              className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
            {catalog.map((plugin) => (
              <div
                key={plugin.id}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                    {plugin.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{plugin.name}</h4>
                    <p className="text-xs text-gray-400">{plugin.cat}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCatalogOpen(false);
                    setConfiguringPlugin(plugin.id);
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm"
                >
                  Configurar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Content for each of the Settings Tabs
  const renderTabContent = () => {
    switch (activeModalTab) {
      case 'idioma':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Idioma e Região</h2>
              <p className="text-xs text-gray-400 mt-1">Configure o idioma da interface e a região geográfica para sugestões de músicas.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300">Idioma da Interface</label>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    showToast('Idioma atualizado com sucesso!');
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#1a1c26] px-4 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (United States)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Região de Busca e Tendências</label>
                <select className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#1a1c26] px-4 text-xs text-white outline-none focus:border-blue-500">
                  <option value="BR">Brasil (BR) - Tendências e Top Músicas Nacionais</option>
                  <option value="US">Estados Unidos (US) - Billboard & Global</option>
                  <option value="GL">Global (Internacional)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'aparencia':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Aparência</h2>
              <p className="text-xs text-gray-400 mt-1">Personalize os temas e a paleta de cores do Montanha Music Lab.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-300">Tema do Aplicativo</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { id: 'oled', label: 'Escuro OLED', desc: 'Preto puro (#050505) com bokeh' },
                    { id: 'spotube', label: 'Spotube Blue', desc: 'Azul escuro e grafite (#090b10)' },
                    { id: 'glass', label: 'Apple Glass', desc: 'Vidro translúcido escuro' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setThemeMode(t.id);
                        showToast(`Tema ${t.label} selecionado!`);
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        themeMode === t.id
                          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <h4 className="font-bold text-xs text-white">{t.label}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Cor de Destaque</label>
                <div className="flex items-center gap-3 mt-2">
                  {[
                    { id: 'blue', color: 'bg-blue-600', name: 'Azul Spotube' },
                    { id: 'cyan', color: 'bg-cyan-500', name: 'Ciano Montanha' },
                    { id: 'emerald', color: 'bg-emerald-500', name: 'Esmeralda' },
                    { id: 'purple', color: 'bg-purple-600', name: 'Roxo Neon' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setAccentColor(c.id);
                        showToast(`Cor de destaque ${c.name} aplicada!`);
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color} shadow-md transition transform hover:scale-110 ${
                        accentColor === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#16171d]' : ''
                      }`}
                      title={c.name}
                    >
                      {accentColor === c.id && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'reproducao':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Reprodução de Áudio</h2>
              <p className="text-xs text-gray-400 mt-1">Calibre a qualidade acústica, normalização de volume e transições entre faixas.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-300">Qualidade de Streaming de Áudio</label>
                <select
                  value={audioQuality}
                  onChange={(e) => {
                    setAudioQuality(e.target.value);
                    showToast('Qualidade de áudio atualizada!');
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#1a1c26] px-4 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="ultra">Máxima Fidelidade (320 kbps / FLAC se disponível)</option>
                  <option value="high">Alta Qualidade (256 kbps Opus / AAC Spotube)</option>
                  <option value="standard">Padrão Econômico (128 kbps)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300">Transição Suave (Crossfade)</label>
                  <span className="text-xs text-sky-400 font-mono font-bold">{crossfade}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={crossfade}
                  onChange={(e) => setCrossfade(e.target.value)}
                  className="mt-2 w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>Desativado (0s)</span>
                  <span>6s</span>
                  <span>12s</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white">Normalização de Volume (ReplayGain)</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Mantém o mesmo nível de volume entre músicas de diferentes fontes.</p>
                </div>
                <input
                  type="checkbox"
                  checked={normalizeAudio}
                  onChange={(e) => {
                    setNormalizeAudio(e.target.checked);
                    showToast(`Normalização ${e.target.checked ? 'ativada' : 'desativada'}!`);
                  }}
                  className="h-4 w-4 rounded accent-blue-600"
                />
              </div>
            </div>
          </div>
        );

      case 'cache':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Gerenciamento de Cache</h2>
              <p className="text-xs text-gray-400 mt-1">Monitore o espaço ocupado por músicas em cache offline e capas no dispositivo.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/20 text-sky-400 border border-blue-500/30">
                    <HardDrive size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Armazenamento Local em Cache</h4>
                    <p className="text-xs text-gray-400">Total ocupado: <span className="text-emerald-400 font-mono font-bold">{cacheSizeMb} MB</span></p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    localStorage.removeItem('montanha-cached-songs');
                    setCacheSizeMb('0.0');
                    showToast('Cache de músicas limpo com sucesso!');
                  }}
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
                >
                  <Trash2 size={14} />
                  Limpar Cache
                </button>
              </div>

              <div className="pt-2 text-xs text-gray-400">
                O cache armazena temporariamente trechos de músicas e capas para economizar dados e acelerar a reprodução instantânea.
              </div>
            </div>
          </div>
        );

      case 'downloads':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Configurações de Download</h2>
              <p className="text-xs text-gray-400 mt-1">Ajuste os parâmetros de salvamento local e extração de áudio.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300">Formato de Áudio Preferido</label>
                <select
                  value={downloadFormat}
                  onChange={(e) => {
                    setDownloadFormat(e.target.value);
                    showToast(`Formato ${e.target.value.toUpperCase()} definido!`);
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#1a1c26] px-4 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="mp3">MP3 (Universal 320 kbps)</option>
                  <option value="m4a">M4A / AAC (Otimizado para iPhone / Mac)</option>
                  <option value="flac">FLAC (Lossless sem perdas)</option>
                  <option value="opus">Opus (Alta fidelidade compacta)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white">Baixar Letras Sincronizadas (.lrc)</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Salva o arquivo de letras junto da música para karaokê offline.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoLyrics}
                  onChange={(e) => setAutoLyrics(e.target.checked)}
                  className="h-4 w-4 rounded accent-blue-600"
                />
              </div>
            </div>
          </div>
        );

      case 'desktop':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Configurações de Desktop</h2>
              <p className="text-xs text-gray-400 mt-1">Comportamento da janela, bandeja do sistema e atalhos.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white">Minimizar para a Bandeja do Sistema</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Mantém o áudio tocando em segundo plano ao fechar a janela.</p>
                </div>
                <input
                  type="checkbox"
                  checked={minimizeToTray}
                  onChange={(e) => {
                    setMinimizeToTray(e.target.checked);
                    showToast(`Bandeja ${e.target.checked ? 'ativada' : 'desativada'}!`);
                  }}
                  className="h-4 w-4 rounded accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white">Aceleração por Hardware (GPU)</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Renderização ultra-suave a 60 FPS com baixo uso de CPU.</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 rounded accent-blue-600"
                />
              </div>
            </div>
          </div>
        );

      case 'bloqueio':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Lista de Bloqueio</h2>
              <p className="text-xs text-gray-400 mt-1">Artistas ou termos que você nunca deseja ver nos resultados de busca.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <p className="text-xs text-gray-400">Nenhum artista ou termo bloqueado no momento.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome do artista para bloquear..."
                  className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => showToast('Adicionado à lista de bloqueio!')}
                  className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                >
                  Bloquear
                </button>
              </div>
            </div>
          </div>
        );

      case 'jam':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Jam em Grupo</h2>
              <p className="text-xs text-gray-400 mt-1">Ouça músicas em sincronia em tempo real com outros dispositivos e alunos.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-sky-900/20 border border-blue-500/30">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sessão Jam Disponível
                </h4>
                <p className="text-[11px] text-sky-200 mt-1">Conecte seu celular e seu computador na mesma fila de reprodução via Supabase Realtime.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300">Código da Sala de Jam</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    defaultValue="MONTANHA-JAM-01"
                    className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 font-mono text-xs text-sky-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => showToast('Código copiado!')}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sobre':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Sobre o Montanha Music Lab</h2>
              <p className="text-xs text-gray-400 mt-1">Informações de versão, arquitetura e conexões ativas.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004799] to-[#0066cc] text-white shadow-[0_0_30px_rgba(0,102,204,0.4)] border border-blue-400/30">
                  <Music2 size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Montanha Music Lab</h3>
                  <p className="text-xs text-sky-400 font-mono">Versão 1.0.0 (Produção Vercel & PWA)</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Arquitetura Spotube Core Engine • 100% Livre de Anúncios</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Serviço de Nuvem</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Realtime Ativo
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Engine de Streaming</p>
                  <p className="text-xs font-bold text-sky-400 mt-1">Piped + Invidious + iTunes</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-sky-200">
                Criado com padrão de excelência para o Ecossistema Coach Montanha. Sincronização contínua entre Desktop (Windows/Mac/Linux), Web e Celular (Android/iOS PWA).
              </div>
            </div>
          </div>
        );

      case 'plugins':
      default:
        return (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">Plugins</h1>
                <p className="text-xs text-gray-400 mt-0.5">Clique em qualquer cartão ou plugin da lista para abrir suas configurações específicas.</p>
              </div>
            </div>

            {/* 4 Gradient Cards (2x2 Grid) - Interativos */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {gradientCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setConfiguringPlugin(card.type)}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bgGradient} p-5 text-left text-white shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl active:scale-98`}
                >
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-md group-hover:scale-125 transition" />
                  <div className="pointer-events-none absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-white/10 blur-md" />

                  <div className="flex items-start justify-between">
                    {card.icon}
                    <div className="flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm group-hover:bg-black/40 transition">
                      <span>Configurar</span>
                      <ChevronDown size={14} className="text-white/80" />
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-bold text-base leading-tight drop-shadow-md">{card.title}</h3>
                    <p className="mt-1 text-xs text-white/90 font-medium drop-shadow-md">{card.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Section: Configurar & Lista */}
            <div className="mt-8">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Gerenciador de Plugins Instalados</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{installedPlugins.length} plugins disponíveis</p>
                </div>

                <button
                  onClick={() => setIsCatalogOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition active:scale-98"
                >
                  <Plus size={16} />
                  <span>Instalar um plugin</span>
                </button>
              </div>

              {/* Installed List Desktop */}
              <div className="mt-3 space-y-2.5">
                {installedPlugins.map((plugin) => {
                  const isConnected = accounts[plugin.provider as keyof typeof accounts]?.connected;
                  return (
                    <div
                      key={plugin.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/10 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {plugin.icon}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-bold text-sm text-white truncate">{plugin.name}</h4>
                            <span className="rounded-md bg-white/10 px-2 py-0.5 font-bold text-gray-300 text-[10px]">
                              {plugin.tag}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-400 leading-relaxed truncate">{plugin.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          isConnected || plugin.status === 'Ativo'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-blue-500/10 text-sky-400 border border-blue-500/20'
                        }`}>
                          <Check size={11} />
                          {isConnected ? 'Conectado' : plugin.status}
                        </span>

                        <button
                          onClick={() => setConfiguringPlugin(plugin.provider)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                        >
                          Configurar
                        </button>

                        {(plugin.provider === 'spotify' || plugin.provider === 'deezer') && isConnected && (
                          <button
                            onClick={() => onDisconnectAccount(plugin.provider as any)}
                            className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
                          >
                            Desconectar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
    }
  };

  // MOBILE VIEW
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f0f4f9] text-[#1e293b] pb-32">
        {renderPluginConfigModal()}
        {renderCatalogModal()}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-black/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl">
            {toastMessage}
          </div>
        )}

        {/* Header Mobile: < Configurações & Plugins */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-[#f0f4f9]/90 px-4 py-3.5 backdrop-blur-md border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-200/60"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Configurações & Plugins</h2>
          </div>
        </div>

        <div className="px-4 py-4 space-y-6">
          {/* 4 Gradient Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3">
            {gradientCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setConfiguringPlugin(card.type)}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.bgGradient} p-4 text-left text-white shadow-md transition transform active:scale-95`}
              >
                <div className="flex items-start justify-between">
                  {card.icon}
                  <ChevronDown size={16} className="text-white/80" />
                </div>

                <div className="mt-6">
                  <h3 className="font-bold text-sm leading-tight drop-shadow-sm">{card.title}</h3>
                  <p className="mt-1 text-[11px] text-white/85 font-medium drop-shadow-sm">{card.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Section: Configurar */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Configurar</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{installedPlugins.length} plugins disponíveis</p>
              </div>

              <button
                onClick={() => setIsCatalogOpen(true)}
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
                        <button
                          onClick={() => setConfiguringPlugin(plugin.provider)}
                          className="rounded-xl border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Configurar
                        </button>
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

  // DESKTOP MODAL VIEW
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      {renderPluginConfigModal()}
      {renderCatalogModal()}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      <div className="flex h-[88vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#16171d] shadow-[0_25px_80px_rgba(0,0,0,0.8)] text-white">
        {/* Modal Left Sidebar: Configurações */}
        <aside className="w-64 border-r border-white/10 bg-[#111217] p-5 flex flex-col justify-between select-none">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white px-3 pb-4">Configurações</h2>
            <nav className="space-y-1">
              {[
                { id: 'plugins', label: 'Plugins', icon: <Sparkles size={16} /> },
                { id: 'idioma', label: 'Idioma e região', icon: <FileText size={16} /> },
                { id: 'aparencia', label: 'Aparência', icon: <Palette size={16} /> },
                { id: 'reproducao', label: 'Reprodução', icon: <Volume2 size={16} /> },
                { id: 'bloqueio', label: 'Lista de bloqueio', icon: <ShieldCheck size={16} /> },
                { id: 'jam', label: 'Jam em grupo', icon: <Radio size={16} /> },
                { id: 'cache', label: 'Cache', icon: <HardDrive size={16} /> },
                { id: 'downloads', label: 'Downloads', icon: <Download size={16} /> },
                { id: 'desktop', label: 'Desktop', icon: <Laptop size={16} /> },
                { id: 'sobre', label: 'Sobre', icon: <Info size={16} /> }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModalTab(item.id as ModalTabId)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    activeModalTab === item.id
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
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition z-10"
          >
            <X size={18} />
          </button>

          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};
