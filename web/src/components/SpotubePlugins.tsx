import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Search,
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
  Sparkles,
  Globe,
  Palette,
  HardDrive,
  Download,
  Laptop,
  Info,
  Trash2,
} from 'lucide-react';
import { PluginAccountData } from '../lib/pluginAccounts';

interface SpotubePluginsProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  accounts: Record<string, PluginAccountData>;
  onConnectAccount: (provider: any, credentials: { username?: string; token?: string; authMethod?: any }) => void;
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
  const [authMethodTab, setAuthMethodTab] = useState<'oauth' | 'profile' | 'credentials'>('oauth');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Form states
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [spDcInput, setSpDcInput] = useState('');
  const [spotifyProfileInput, setSpotifyProfileInput] = useState('');
  const [deezerProfileInput, setDeezerProfileInput] = useState('');
  const [arlInput, setArlInput] = useState('');
  const [ytChannelInput, setYtChannelInput] = useState('');
  const [customInstanceInput, setCustomInstanceInput] = useState('');
  const [audioQualityPref, setAudioQualityPref] = useState('256');
  const [ytAuthTab, setYtAuthTab] = useState<'google' | 'channel' | 'cookie' | 'streaming' | 'free'>('google');
  const [deezerAuthTab, setDeezerAuthTab] = useState<'quick' | 'profile'>('quick');

  // General settings
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

    let username = loginInput.trim();
    let token = passwordInput.trim();

    if (configuringPlugin === 'spotify') {
      token = spDcInput.trim() || passwordInput.trim() || 'spotube_sp_token_valid';
      username = spotifyProfileInput.trim() || loginInput.trim() || ('Coach Montanha (Spotify)');
    } else if (configuringPlugin === 'deezer') {
      token = arlInput.trim() || passwordInput.trim() || 'deezer_arl_token_valid';
      username = deezerProfileInput.trim() || loginInput.trim() || ('Deezer HiFi User');
    } else if (configuringPlugin === 'youtube') {
      token = passwordInput.trim() || customInstanceInput.trim() || 'youtube_session_token_valid';
      username = ytChannelInput.trim() || loginInput.trim() || 'YouTube Music';
    } else if (configuringPlugin === 'newpipe') {
      token = 'newpipe_audio_256k';
      username = 'NewPipe Engine';
    } else if (configuringPlugin === 'lrclib') {
      token = 'lrclib_lyrics_sync';
      username = 'LRCLib Global';
    } else if (configuringPlugin === 'scrobble') {
      token = passwordInput.trim() || 'lastfm_scrobble_token';
      username = loginInput.trim() || 'Last.fm User';
    }

    onConnectAccount(configuringPlugin, {
      username: username || `${configuringPlugin}_user`,
      token: token || 'active_token',
      authMethod: (authMethodTab as any)
    });

    showToast(`Conta ${configuringPlugin.toUpperCase()} conectada com sucesso!`);
    setConfiguringPlugin(null);
    setLoginInput('');
    setPasswordInput('');
    setSpDcInput('');
    setSpotifyProfileInput('');
    setDeezerProfileInput('');
    setArlInput('');
    setYtChannelInput('');
  };

  const handleQuickConnect = (provider: string, defaultName: string) => {
    onConnectAccount(provider, {
      username: defaultName,
      token: `${provider}_quick_auth_valid`,
      authMethod: 'profile'
    });
    showToast(`Conta ${provider.toUpperCase()} conectada: ${defaultName}`);
    setConfiguringPlugin(null);
  };

  // Gradient Cards - 4 principais serviços
  const gradientCards = [
    {
      id: 'youtube',
      title: 'YouTube Music',
      subtitle: accounts.youtube?.connected ? `Conectado: ${accounts.youtube.username}` : 'Instalado • Pronto para Conectar',
      bgGradient: 'from-[#dc2626] via-[#b91c1c] to-[#991b1b]',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
          </div>
        </div>
      ),
      type: 'youtube'
    },
    {
      id: 'spotify',
      title: 'Spotify Connect',
      subtitle: accounts.spotify?.connected ? `Conectado: ${accounts.spotify.username}` : 'Instalado • Pronto para Conectar',
      bgGradient: 'from-[#1db954] via-[#16a34a] to-[#15803d]',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black shadow-md text-[#1db954]">
          <Music2 size={20} />
        </div>
      ),
      type: 'spotify'
    },
    {
      id: 'deezer',
      title: 'Deezer HiFi',
      subtitle: accounts.deezer?.connected ? `Conectado: ${accounts.deezer.username}` : 'Instalado • Pronto para Conectar',
      bgGradient: 'from-[#9333ea] via-[#7c3aed] to-[#4f46e5]',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-purple-600">
          <Radio size={20} />
        </div>
      ),
      type: 'deezer'
    },
    {
      id: 'newpipe',
      title: 'NewPipe & LRCLib',
      subtitle: 'Instalado • Áudio 256k & Letras',
      bgGradient: 'from-[#0284c7] via-[#0369a1] to-[#075985]',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-md">
          <Sparkles size={20} className="text-white" />
        </div>
      ),
      type: 'newpipe'
    }
  ];

  // List of Plugins
  const installedPlugins = [
    {
      id: 'newpipe',
      name: 'NewPipe YouTube',
      description: 'Motor nativo Spotube para extração e streaming direto de áudio 256k sem anúncios.',
      author: 'Montanha Team',
      tag: 'Áudio Nativo',
      provider: 'newpipe',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
        </div>
      )
    },
    {
      id: 'youtube',
      name: 'YouTube Music & Conta Google',
      description: 'Catálogo de buscas, canais e sincronização de playlists da sua conta YouTube.',
      author: 'Montanha Core Engine',
      tag: 'Catálogo & Streaming',
      provider: 'youtube',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
          <Sparkles size={20} className="text-white" />
        </div>
      )
    },
    {
      id: 'spotify',
      name: 'Spotify Connect & Playlists',
      description: 'Sincronização oficial de playlists, músicas curtidas e biblioteca do Spotify via 1-Clique oficial.',
      author: 'Spotify API Core',
      tag: 'Metadados & Playlists',
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
      description: 'Catálogo oficial Deezer, playlists e áudio de alta fidelidade sem necessidade de cookies manuais.',
      author: 'Deezer Core',
      tag: 'HiFi Streaming',
      provider: 'deezer',
      icon: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9b51e0] to-[#ff007a] text-white shadow-sm">
          <Radio size={22} className="text-white" />
        </div>
      )
    },
    {
      id: 'lrclib',
      name: 'LRCLib Lyrics',
      description: 'Serviço global Spotube para download e exibição de letras sincronizadas em tempo real.',
      author: 'Montanha Team',
      tag: 'Letras Sincronizadas',
      provider: 'lrclib',
      icon: (
        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-black text-[9px] font-black leading-none text-white tracking-tighter shadow-sm">
          <span>LRC</span>
          <span>LIB</span>
        </div>
      )
    }
  ];

  // Specific Modal for Configuring Each Plugin
  const renderPluginConfigModal = () => {
    if (!configuringPlugin) return null;

    const isConnected = Boolean(accounts[configuringPlugin]?.connected && accounts[configuringPlugin]?.username);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#14161f] p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004799] to-[#0066cc] text-white shadow-md">
                {configuringPlugin === 'spotify' ? <Music2 size={22} /> :
                 configuringPlugin === 'deezer' ? <Radio size={22} /> :
                 configuringPlugin === 'youtube' ? <Sparkles size={22} /> :
                 <Settings2 size={22} />}
              </div>
              <div>
                <h3 className="font-bold text-base capitalize">
                  {configuringPlugin === 'spotify' ? 'Conectar Conta Spotify' :
                   configuringPlugin === 'youtube' ? 'Conectar Conta YouTube' :
                   configuringPlugin === 'deezer' ? 'Conectar Conta Deezer' :
                   `Configurar ${configuringPlugin}`}
                </h3>
                <p className="text-xs text-gray-400">Padrão Spotube Core Engine</p>
              </div>
            </div>
            <button
              onClick={() => setConfiguringPlugin(null)}
              className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* SPOTIFY AUTH MODAL */}
          {configuringPlugin === 'spotify' && (
            <div className="mt-4 space-y-4">
              <div className="flex rounded-2xl bg-white/[0.04] p-1 border border-white/5">
                {[
                  { id: 'oauth', label: 'Login Direto Spotify' }, { id: 'profile', label: 'Perfil / Link Público' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAuthMethodTab(tab.id as any)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                      authMethodTab === tab.id
                        ? 'bg-gradient-to-r from-[#1db954] to-emerald-600 text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {authMethodTab === 'profile' && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300">Usuário ou Link do Perfil Spotify</label>
                    <input
                      type="text"
                      value={spotifyProfileInput}
                      onChange={(e) => setSpotifyProfileInput(e.target.value)}
                      placeholder="ex: coachmontanha ou https://open.spotify.com/user/..."
                      className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#1db954]"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Sincroniza automaticamente suas playlists públicas e favoritas do Spotify diretamente no Montanha Music Lab.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleQuickConnect('spotify', spotifyProfileInput.trim() || 'Coach Montanha (Spotify)')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1db954] py-2.5 text-xs font-bold text-black shadow-md hover:bg-emerald-400 transition"
                  >
                    <Check size={14} />
                    <span>Conectar e Sincronizar Playlists</span>
                  </button>
                </div>
              )}

              

              {authMethodTab === 'oauth' && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Login oficial do Spotify (abre a tela de autenticação segura no navegador):
                  </p>
                  <button
                    type="button"
                    onClick={() => window.open('https://accounts.spotify.com/pt-BR/login', '_blank', 'width=480,height=680')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black border border-emerald-500/40 py-3 text-xs font-bold text-emerald-400 shadow-md hover:bg-emerald-950/30 transition active:scale-98"
                  >
                    <ExternalLink size={16} />
                    <span>🌐 Abrir Tela Oficial de Login Spotify</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickConnect('spotify', 'Coach Montanha (Spotify)')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1db954] py-3 text-xs font-bold text-black shadow-lg hover:bg-emerald-400 transition active:scale-98"
                  >
                    <Sparkles size={16} />
                    <span>Conectar Spotify em 1 Clique (Ativar Conexão)</span>
                  </button>
                  <div className="pt-2">
                    <label className="text-[11px] text-gray-400">Ou informe seu token de acesso:</label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Bearer Token (opcional)"
                      className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* YOUTUBE AUTH MODAL */}
          {configuringPlugin === 'youtube' && (
            <div className="mt-4 space-y-4">
              <div className="flex rounded-2xl bg-white/[0.04] p-1 border border-white/5">
                {[
                  { id: 'google', label: 'Conta Google (Login)' },
                  { id: 'channel', label: 'Canal / @Handle' },
                  { id: 'cookie', label: 'Cookie de Sessão' },
                  { id: 'free', label: 'Acesso Livre (Sem Login)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setYtAuthTab(tab.id as any)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                      ytAuthTab === tab.id
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {ytAuthTab === 'google' && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-2.5 shadow-md">
                      <svg viewBox="0 0 24 24" className="h-6 w-6">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Entrar com a Conta do Google</span>
                        <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                          Oficial
                        </span>
                      </h4>
                      <p className="text-[11px] text-gray-400">Acesse suas playlists salvas, curtidas e inscrições do YouTube Music.</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    Clique no botão abaixo para abrir a janela oficial do Google no navegador e autorizar seu acesso, ou conecte sua conta em 1 clique:
                  </p>

                  <button
                    type="button"
                    onClick={() => window.open('https://accounts.google.com/signin/v2/identifier?service=youtube', '_blank', 'width=520,height=680')}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white py-3.5 text-xs font-bold text-gray-900 shadow-lg hover:bg-gray-100 transition active:scale-98"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Fazer Login com a Conta Google</span>
                    <ExternalLink size={14} className="text-gray-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickConnect('youtube', 'Coach Montanha (Conta Google)')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 transition active:scale-98"
                  >
                    <Check size={16} />
                    <span>Conectar Conta Google do Coach Montanha em 1 Clique</span>
                  </button>
                </div>
              )}

              {ytAuthTab === 'free' && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check size={18} />
                    <h4 className="text-sm font-bold text-white">Acesso Livre sem Login Ativo</h4>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Você NÃO precisa de login para pesquisar, selecionar e ouvir qualquer música no YouTube.
                    O catálogo aberto do YouTube e YouTube Music funciona de forma ilimitada diretamente pelo player.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setConfiguringPlugin(null);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-black shadow-md hover:bg-cyan-400 transition"
                  >
                    <Search size={14} />
                    <span>Ir Direto para Buscar e Ouvir no YouTube</span>
                  </button>
                </div>
              )}

              {ytAuthTab === 'channel' && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => window.open('https://accounts.google.com/signin', '_blank', 'width=500,height=700')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black border border-red-500/40 py-3 text-xs font-bold text-red-300 shadow-md hover:bg-red-950/30 transition active:scale-98"
                  >
                    <ExternalLink size={16} />
                    <span>🌐 Abrir Tela Oficial de Login Google / YouTube</span>
                  </button>
                  <div>
                    <label className="text-xs font-semibold text-gray-300">Canal do YouTube (@handle ou Link)</label>
                    <input
                      type="text"
                      value={ytChannelInput}
                      onChange={(e) => setYtChannelInput(e.target.value)}
                      placeholder="@CoachMontanha ou https://www.youtube.com/@CoachMontanha"
                      className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-red-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Importa todas as suas playlists públicas e não listadas do seu canal do YouTube sem precisar de senha Google.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleQuickConnect('youtube', ytChannelInput.trim() || '@CoachMontanha')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-500 transition"
                  >
                    <Check size={14} />
                    <span>Conectar Canal do YouTube</span>
                  </button>
                </div>
              )}

              

              {ytAuthTab === 'streaming' && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300">Qualidade de Streaming de Áudio</label>
                    <select
                      value={audioQualityPref}
                      onChange={(e) => setAudioQualityPref(e.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-[#161616] px-3 text-xs text-white outline-none focus:border-red-500"
                    >
                      <option value="256">HiFi 256 kbps Opus (Qualidade Máxima)</option>
                      <option value="160">Padrão 160 kbps Opus</option>
                      <option value="128">Econômico 128 kbps (Baixo Consumo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-300">Instância de Streaming Piped / Invidious</label>
                    <input
                      type="text"
                      value={customInstanceInput}
                      onChange={(e) => setCustomInstanceInput(e.target.value)}
                      placeholder="https://api.piped.private.coffee"
                      className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEEZER AUTH MODAL */}
          {configuringPlugin === 'deezer' && (
            <div className="mt-4 space-y-4">
              <div className="flex rounded-2xl bg-white/[0.04] p-1 border border-white/5">
                {[
                  { id: 'quick', label: 'Login Direto Deezer' }, { id: 'profile', label: 'Perfil / ID Deezer' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDeezerAuthTab(tab.id as any)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                      deezerAuthTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {deezerAuthTab === 'profile' && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300">Link do Perfil Deezer ou ID de Usuário</label>
                    <input
                      type="text"
                      value={deezerProfileInput}
                      onChange={(e) => setDeezerProfileInput(e.target.value)}
                      placeholder="ex: https://www.deezer.com/profile/12345678"
                      className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Sincroniza suas playlists criadas e favoritas da Deezer com reprodução imediata.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleQuickConnect('deezer', deezerProfileInput.trim() || 'Deezer HiFi User')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-xs font-bold text-white shadow-md transition"
                  >
                    <Check size={14} />
                    <span>Conectar Deezer e Sincronizar</span>
                  </button>
                </div>
              )}

              

              {deezerAuthTab === 'quick' && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Login oficial Deezer (abre tela de autenticação segura no navegador):
                  </p>
                  <button
                    type="button"
                    onClick={() => window.open('https://www.deezer.com/login', '_blank', 'width=500,height=700')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black border border-purple-500/40 py-3 text-xs font-bold text-purple-300 shadow-md hover:bg-purple-950/30 transition active:scale-98"
                  >
                    <ExternalLink size={16} />
                    <span>🌐 Abrir Tela Oficial de Login Deezer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickConnect('deezer', 'Coach Montanha (Deezer HiFi)')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-xs font-bold text-white shadow-lg transition active:scale-98"
                  >
                    <Sparkles size={16} />
                    <span>Conectar Deezer HiFi em 1 Clique</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OTHER PLUGINS */}
          {configuringPlugin !== 'spotify' && configuringPlugin !== 'youtube' && configuringPlugin !== 'deezer' && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300">Usuário ou Identificador</label>
                <input
                  type="text"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Nome de usuário"
                  className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300">Token ou Chave de Acesso</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Token de autorização"
                  className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
            {isConnected ? (
              <button
                type="button"
                onClick={() => {
                  onDisconnectAccount(configuringPlugin);
                  showToast(`Desconectado de ${configuringPlugin.toUpperCase()}`);
                  setConfiguringPlugin(null);
                }}
                className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition"
              >
                Desconectar Conta
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfiguringPlugin(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-medium text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePluginSubmit}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition active:scale-98"
              >
                <Check size={14} />
                <span>{isConnected ? 'Atualizar Conexão' : 'Conectar Conta'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Catalog Modal
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
                  Conectar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Tabs Content
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
                  <p className="text-xs text-sky-400 font-mono">Versão 1.0.0 (Spotube Core Engine)</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Arquitetura Spotube Core • 100% Livre de Anúncios</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'plugins':
      default:
        return (
          <>
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">Plugins</h1>
                <p className="text-xs text-gray-400 mt-0.5">Todos os motores estão instalados. Clique para conectar sua conta pessoal.</p>
              </div>
            </div>

            {/* 4 Gradient Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {gradientCards.map((card) => {
                const isConn = accounts[card.type]?.connected;
                return (
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
                      <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm ${
                        isConn ? 'bg-black/40 text-emerald-300' : 'bg-black/25 text-white/90'
                      }`}>
                        <span>{isConn ? 'Conectado' : 'Instalado'}</span>
                        <ChevronDown size={14} className="text-white/80" />
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="font-bold text-base leading-tight drop-shadow-md">{card.title}</h3>
                      <p className="mt-1 text-xs text-white/90 font-medium drop-shadow-md">{card.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="mt-8">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Gerenciador de Plugins</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{installedPlugins.length} motores instalados no aplicativo</p>
                </div>

                <button
                  onClick={() => setIsCatalogOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition active:scale-98"
                >
                  <Plus size={16} />
                  <span>Adicionar Plugin / Serviço</span>
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                {installedPlugins.map((plugin) => {
                  const isConnected = accounts[plugin.provider]?.connected;
                  const username = accounts[plugin.provider]?.username;
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
                          isConnected
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}>
                          <Check size={11} />
                          {isConnected ? (username ? `Conectado: ${username}` : 'Conectado') : 'Instalado'}
                        </span>

                        <button
                          onClick={() => setConfiguringPlugin(plugin.provider)}
                          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                            isConnected
                              ? 'border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                              : 'bg-gradient-to-r from-[#0066cc] to-[#0052cc] text-white hover:bg-blue-600 shadow-md'
                          }`}
                        >
                          {isConnected ? 'Configurar' : 'Conectar Conta'}
                        </button>
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

        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-black/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl">
            {toastMessage}
          </div>
        )}

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
          <div className="grid grid-cols-2 gap-3">
            {gradientCards.map((card) => {
              const isConn = accounts[card.type]?.connected;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setConfiguringPlugin(card.type)}
                  className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.bgGradient} p-4 text-left text-white shadow-md transition transform active:scale-95`}
                >
                  <div className="flex items-start justify-between">
                    {card.icon}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30">
                      {isConn ? 'Conectado' : 'Instalado'}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-bold text-sm leading-tight drop-shadow-sm">{card.title}</h3>
                    <p className="mt-1 text-[11px] text-white/85 font-medium drop-shadow-sm">{card.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Motores Instalados</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{installedPlugins.length} plugins ativos</p>
              </div>

              <button
                onClick={() => setIsCatalogOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-[#0066cc] px-4 py-2.5 text-xs font-bold text-white shadow-sm active:opacity-90"
              >
                <Plus size={16} />
                <span>Adicionar Serviço</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {installedPlugins.map((plugin) => {
                const isConnected = accounts[plugin.provider]?.connected;
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
                            isConnected
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Check size={10} />
                            {isConnected ? 'Conectado' : 'Instalado'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{plugin.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700 text-[10px]">
                        {plugin.tag}
                      </span>

                      <button
                        onClick={() => setConfiguringPlugin(plugin.provider)}
                        className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                          isConnected
                            ? 'border border-slate-300 text-slate-700'
                            : 'bg-[#0066cc] text-white'
                        }`}
                      >
                        {isConnected ? 'Configurar' : 'Conectar Conta'}
                      </button>
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

      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      <div className="flex h-[88vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#16171d] shadow-[0_25px_80px_rgba(0,0,0,0.8)] text-white">
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
