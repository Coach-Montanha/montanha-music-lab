import React, { useState, useEffect } from 'react';
import { 
  X, User, Lock, Sliders, HardDrive, CheckCircle2, 
  LogOut, RefreshCw, KeyRound, ShieldCheck, Sparkles, 
  Volume2, Download, Trash2, Upload, Disc, Radio, 
  Check, AlertCircle, Headphones, Smartphone, Moon,
  Globe, Shield, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Playlist } from '../types';
import { browserOptimizer, BrowserProfile } from '../lib/browserOptimizer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChange: (user: any) => void;
  playlists: Playlist[];
  onPlaylistsChange: (playlists: Playlist[]) => void;
  onSyncPlaylists: () => void;
  downloadedCount: number;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  playlists,
  onPlaylistsChange,
  onSyncPlaylists,
  downloadedCount
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'som' | 'dados'>('perfil');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Perfil State
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Senha State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Som & Qualidade State (Persistido no LocalStorage)
  const [soundQuality, setSoundQuality] = useState<'high' | 'standard' | 'economy'>(() => {
    try { return (localStorage.getItem('montanha_sound_quality') as any) || 'high'; } catch { return 'high'; }
  });
  const [volumeNormalization, setVolumeNormalization] = useState<boolean>(() => {
    try { return localStorage.getItem('montanha_volume_norm') !== 'false'; } catch { return true; }
  });
  const [crossfade, setCrossfade] = useState<number>(() => {
    try { return Number(localStorage.getItem('montanha_crossfade')) || 2; } catch { return 2; }
  });
  const [equalizer, setEqualizer] = useState<string>(() => {
    try { return localStorage.getItem('montanha_equalizer') || 'workout'; } catch { return 'workout'; }
  });
  const [wakeLockEnabled, setWakeLockEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('montanha_wakelock') !== 'false'; } catch { return true; }
  });

  const currentBrowserProfile = browserOptimizer.getProfile();
  const [selectedBrowserGuide, setSelectedBrowserGuide] = useState<string>(() => {
    if (currentBrowserProfile.deviceBrand === 'motorola') return 'motorola';
    if (currentBrowserProfile.deviceBrand === 'xiaomi') return 'xiaomi';
    if (currentBrowserProfile.os === 'ios') return 'safari';
    return currentBrowserProfile.name || 'chrome';
  });

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || '');
      setAvatarUrl(currentUser.user_metadata?.avatar_url || '');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Atualizar Perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName.trim(),
          avatar_url: avatarUrl.trim()
        }
      });
      if (error) throw error;
      if (data.user) {
        onUserChange(data.user);
        try {
          localStorage.setItem('montanha_music_user', JSON.stringify(data.user));
        } catch {}
      }
      setSuccessMsg('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Reset / Alterar Senha
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword.trim()
      });
      if (error) throw error;
      setSuccessMsg('Senha alterada com sucesso! A nova senha já está ativa.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações de som
  const handleSaveSoundSetting = (key: string, value: any, setter: (val: any) => void) => {
    setter(value);
    try {
      localStorage.setItem(key, typeof value === 'boolean' ? String(value) : value);
    } catch {}
    setSuccessMsg('Configurações de áudio salvas!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  // Exportar Backup JSON das Playlists
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playlists, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `montanha_music_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setSuccessMsg('Backup das playlists exportado!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Erro ao exportar backup.');
    }
  };

  // Restaurar Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onPlaylistsChange(parsed);
          setSuccessMsg(`Sucesso! ${parsed.length} playlists restauradas do backup.`);
          setTimeout(() => setSuccessMsg(''), 3000);
        } else {
          setErrorMsg('Arquivo de backup inválido.');
        }
      } catch {
        setErrorMsg('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  // Limpar Cache de Imagens
  const handleClearCache = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if ('caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(
          keys
            .filter((k) => k.includes('cover') || k.includes('image'))
            .map((k) => window.caches.delete(k))
        );
        await window.caches.delete('montanha-music-covers-v1');
      }
      setSuccessMsg('Cache de imagens limpo com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Erro ao limpar cache de imagens.');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    onUserChange(null);
    try { localStorage.removeItem('montanha_music_user'); } catch {}
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-[#181818] border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* HEADER DO MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#1f1f1f]/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Configurações & Perfil</h2>
              <p className="text-[11px] text-neutral-400">Personalização, áudio e segurança da sua conta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVEGAÇÃO POR ABAS BENTO */}
        <div className="flex border-b border-white/[0.08] px-6 bg-[#161616] gap-2 overflow-x-auto scrollbar-none py-2.5">
          <button
            onClick={() => { setActiveTab('perfil'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'perfil'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User size={13} />
            <span>Perfil</span>
          </button>

          <button
            onClick={() => { setActiveTab('seguranca'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'seguranca'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock size={13} />
            <span>Segurança & Senha</span>
          </button>

          <button
            onClick={() => { setActiveTab('som'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'som'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Volume2 size={13} />
            <span>Qualidade do Som</span>
          </button>

          <button
            onClick={() => { setActiveTab('dados'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === 'dados'
                ? 'bg-[#1DB954] text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HardDrive size={13} />
            <span>Armazenamento & Backup</span>
          </button>
        </div>

        {/* FEEDBACK MENSAGENS */}
        {successMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/30 p-3 text-xs text-[#1DB954] font-semibold animate-fade-in">
            <Check size={14} />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 font-semibold animate-fade-in">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CORPO DAS ABAS COM SCROLL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ABA 1: PERFIL & DADOS PESSOAIS */}
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1DB954] text-2xl font-black shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase() || 'M'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-white truncate">{displayName || 'Usuário Montanha'}</h3>
                  <p className="text-xs text-neutral-400 truncate">{currentUser?.email || 'Conta Local'}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#1DB954] font-medium">
                    <CheckCircle2 size={13} />
                    <span>Nuvem Supabase Ativa & Isolada</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">Nome de Exibição / Apelido</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Como quer ser chamado no app"
                    className="w-full h-10 rounded-xl bg-[#121212] border border-white/10 px-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">Foto de Perfil (URL da Imagem)</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    className="w-full h-10 rounded-xl bg-[#121212] border border-white/10 px-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                    <span className="block text-lg font-black text-white">{playlists.length}</span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Playlists</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                    <span className="block text-lg font-black text-[#1DB954]">
                      {playlists.reduce((acc, p) => acc + (p.songs?.length || 0), 0)}
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Faixas Totais</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                    <span className="block text-lg font-black text-sky-400">{downloadedCount}</span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Offline</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-black transition active:scale-98 shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações de Perfil'}
                </button>
              </form>
            </div>
          )}

          {/* ABA 2: SEGURANÇA & SENHA */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <ShieldCheck size={16} className="text-[#1DB954]" />
                  <span>Proteção de Conta & Autenticação Segura</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Suas playlists e preferências ficam protegidas sob criptografia de chave de perfil única. 
                  Você pode alterar sua senha a qualquer momento para garantir acesso exclusivo no seu celular e notebook.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">Nova Senha Segura</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full h-10 rounded-xl bg-[#121212] border border-white/10 px-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full h-10 rounded-xl bg-[#121212] border border-white/10 px-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword}
                  className="w-full h-11 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-black transition active:scale-98 shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Salvando Nova Senha...' : 'Atualizar e Salvar Nova Senha'}
                </button>
              </form>

              <div className="pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Encerrar Sessão neste Dispositivo</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 3: QUALIDADE DO SOM & REPRODUÇÃO */}
          {activeTab === 'som' && (
            <div className="space-y-6">
              
              {/* Seletor de Qualidade */}
              <div>
                <label className="block text-xs font-black text-white mb-2 uppercase tracking-wider">
                  Qualidade do Áudio & Streaming
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSaveSoundSetting('montanha_sound_quality', 'high', setSoundQuality)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      soundQuality === 'high'
                        ? 'bg-[#1DB954]/15 border-[#1DB954] text-white'
                        : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">Ultra HD</span>
                      {soundQuality === 'high' && <Check size={14} className="text-[#1DB954]" />}
                    </div>
                    <span className="block text-[11px] text-neutral-400 mt-1">320 kbps (Estúdio)</span>
                    <span className="block text-[9px] text-[#1DB954] mt-0.5 font-semibold">Máxima Fidelidade</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveSoundSetting('montanha_sound_quality', 'standard', setSoundQuality)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      soundQuality === 'standard'
                        ? 'bg-[#1DB954]/15 border-[#1DB954] text-white'
                        : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">Equilibrado</span>
                      {soundQuality === 'standard' && <Check size={14} className="text-[#1DB954]" />}
                    </div>
                    <span className="block text-[11px] text-neutral-400 mt-1">160 kbps</span>
                    <span className="block text-[9px] text-neutral-400 mt-0.5">Padrão Recomendado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveSoundSetting('montanha_sound_quality', 'economy', setSoundQuality)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      soundQuality === 'economy'
                        ? 'bg-[#1DB954]/15 border-[#1DB954] text-white'
                        : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">Econômico</span>
                      {soundQuality === 'economy' && <Check size={14} className="text-[#1DB954]" />}
                    </div>
                    <span className="block text-[11px] text-neutral-400 mt-1">96 kbps</span>
                    <span className="block text-[9px] text-amber-400 mt-0.5 font-semibold">Economiza 4G/5G</span>
                  </button>
                </div>
              </div>

              {/* Preset de Equalizador */}
              <div>
                <label className="block text-xs font-black text-white mb-2 uppercase tracking-wider">
                  Preset de Equalização (Treino & Foco)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'workout', name: 'Treino Pesado', desc: 'Punch & Sub-bass' },
                    { id: 'flat', name: 'Equilibrado', desc: 'Flat Studio' },
                    { id: 'vocal', name: 'Vocal Cristalino', desc: 'Foco na Voz' },
                    { id: 'rock', name: 'Rock & Metal', desc: 'Guitarras Vivas' },
                    { id: 'bass', name: 'Mega Bass Boost', desc: 'Graves Máximos' },
                    { id: 'acoustic', name: 'Acústico & Leve', desc: 'Clareza Natural' },
                  ].map((eq) => (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => handleSaveSoundSetting('montanha_equalizer', eq.id, setEqualizer)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        equalizer === eq.id
                          ? 'bg-[#1DB954]/15 border-[#1DB954] text-white'
                          : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold">{eq.name}</span>
                      <span className="block text-[10px] text-neutral-500">{eq.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Normalização e Crossfade */}
              <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div>
                    <span className="block text-xs font-bold text-white">Normalização de Volume</span>
                    <span className="text-[11px] text-neutral-400">Mantém o mesmo nível de som entre faixas diferentes</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={volumeNormalization}
                    onChange={(e) => handleSaveSoundSetting('montanha_volume_norm', e.target.checked, setVolumeNormalization)}
                    className="h-5 w-5 accent-[#1DB954] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div>
                    <span className="block text-xs font-bold text-white">Manter Tela Ligada no Treino (Wake Lock)</span>
                    <span className="text-[11px] text-neutral-400">Impede que o celular apague sozinho enquanto toca</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={wakeLockEnabled}
                    onChange={(e) => handleSaveSoundSetting('montanha_wakelock', e.target.checked, setWakeLockEnabled)}
                    className="h-5 w-5 accent-[#1DB954] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Crossfade entre Músicas</span>
                    <span className="text-xs font-bold text-[#1DB954]">{crossfade > 0 ? `${crossfade} segundos` : 'Desativado'}</span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 2, 4, 8].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => handleSaveSoundSetting('montanha_crossfade', sec, setCrossfade)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                          crossfade === sec
                            ? 'bg-[#1DB954] text-black border-[#1DB954]'
                            : 'bg-white/[0.05] border-white/[0.08] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {sec === 0 ? 'Off' : `${sec}s`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CENTRAL DE COMPATIBILIDADE E BLINDAGEM MULTI-NAVEGADOR */}
                <div className="p-4 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/25 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <ShieldCheck size={16} className="text-[#1DB954]" />
                      <span>Blindagem & Compatibilidade por Navegador</span>
                    </div>
                    <span className="text-[10px] font-bold bg-[#1DB954]/20 text-[#1DB954] px-2.5 py-0.5 rounded-full border border-[#1DB954]/30">
                      100% Protegido
                    </span>
                  </div>

                  {/* BADGE DE SISTEMA ATIVO DETECTADO */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#1DB954] animate-pulse shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>Seu Aparelho Detectado:</span>
                          <span className="text-[#1DB954] font-black">
                            {currentBrowserProfile.deviceBrand === 'motorola' ? 'Motorola (Android AOSP)' :
                             currentBrowserProfile.deviceBrand === 'xiaomi' ? 'Xiaomi / Redmi (HyperOS/MIUI)' :
                             currentBrowserProfile.deviceBrand === 'apple' ? 'Apple (iPhone/iPad • Safari)' :
                             currentBrowserProfile.deviceBrand === 'samsung' ? 'Samsung Galaxy' :
                             `${currentBrowserProfile.displayName} (${currentBrowserProfile.os.toUpperCase()})`}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {currentBrowserProfile.isPWA ? 'Rodando em Modo Aplicativo Nativo (PWA WebAPK)' : 'Rodando no Navegador Web'} • Motor AudioAnchor PCM Ativo
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const brand = currentBrowserProfile.deviceBrand;
                        if (brand === 'motorola' || brand === 'xiaomi' || brand === 'apple') {
                          setSelectedBrowserGuide(brand === 'apple' ? 'safari' : brand);
                        } else {
                          setSelectedBrowserGuide(currentBrowserProfile.name);
                        }
                      }}
                      className="text-[10px] font-bold text-[#1DB954] hover:underline underline-offset-2 shrink-0 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition"
                    >
                      Ver Guia do Meu Aparelho
                    </button>
                  </div>

                  {/* SELETOR EM ABAS DOS PRINCIPAIS NAVEGADORES */}
                  <div>
                    <span className="block text-[11px] font-semibold text-neutral-300 mb-2">
                      Selecione o navegador ou telefone do seu aluno/cliente:
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: 'motorola', label: 'Motorola', tag: 'AOSP' },
                        { id: 'xiaomi', label: 'Xiaomi / Redmi', tag: 'MIUI' },
                        { id: 'safari', label: 'iPhone (Safari)', tag: 'iOS' },
                        { id: 'chrome', label: 'Chrome', tag: 'Android/PC' },
                        { id: 'firefox', label: 'Firefox', tag: 'Gecko' },
                        { id: 'edge', label: 'Edge', tag: 'Blink' },
                        { id: 'brave', label: 'Brave', tag: 'Shields' },
                        { id: 'opera', label: 'Opera / GX', tag: 'Web' },
                        { id: 'samsung', label: 'Samsung', tag: 'OneUI' }
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBrowserGuide(b.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shrink-0 ${
                            selectedBrowserGuide === b.id
                              ? 'bg-[#1DB954] text-black border-[#1DB954] shadow-sm'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span>{b.label}</span>
                          <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                            selectedBrowserGuide === b.id ? 'bg-black/20 text-black' : 'bg-white/10 text-neutral-400'
                          }`}>
                            {b.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CONTEÚDO ESPECÍFICO DO NAVEGADOR SELECIONADO */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-3">
                    {selectedBrowserGuide === 'motorola' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Smartphone size={14} className="text-[#1DB954]" />
                          <span>Motorola (Android 13/14 AOSP / Moto OS)</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          O Motorola possui o modo de economia mais agressivo do Android. O app já está munido com o <strong>AudioAnchor PCM</strong> para impedir que o sistema congele o player.
                        </p>
                        <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                          <span className="block text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                            Passo Crucial de Bateria (Faça Uma Única Vez):
                          </span>
                          <ol className="text-[11px] text-neutral-300 list-decimal list-inside space-y-1">
                            <li>Segure o ícone do App (ou do Chrome) na tela inicial e toque em <strong className="text-white">Informações do app (ℹ️)</strong></li>
                            <li>Toque em <strong className="text-white">Uso da bateria do app</strong></li>
                            <li>Mude de "Otimizado" para <strong className="text-[#1DB954]">"Sem restrições"</strong></li>
                          </ol>
                        </div>
                      </div>
                    )}

                    {selectedBrowserGuide === 'xiaomi' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Zap size={14} className="text-[#1DB954]" />
                          <span>Xiaomi, Redmi & POCO (HyperOS & MIUI)</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          Funciona tanto no Chrome quanto no Mi Browser. Para evitar que o limpador automático de RAM da Xiaomi feche o player após 15 minutos:
                        </p>
                        <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                          <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                            Fixar no Multitarefas:
                          </span>
                          <ol className="text-[11px] text-neutral-300 list-decimal list-inside space-y-1">
                            <li>Abra o multitarefa (apps recentes), segure o card do App e toque no <strong className="text-white">Cadeado 🔒</strong></li>
                            <li>Vá em Configurações &gt; Bateria &gt; Economia de bateria no app &gt; Escolha <strong className="text-[#1DB954]">"Nenhuma restrição"</strong></li>
                          </ol>
                        </div>
                      </div>
                    )}

                    {selectedBrowserGuide === 'safari' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Smartphone size={14} className="text-[#1DB954]" />
                          <span>Apple iPhone & iPad (iOS Safari)</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          O app integra nativamente a <strong>AudioSession API do iOS</strong>. Toca com a tela bloqueada, na Dynamic Island e mesmo com o botão de silencioso ligado.
                        </p>
                        <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                          <span className="block text-[10px] font-bold text-blue-300 uppercase tracking-wide">
                            Como Instalar no iPhone:
                          </span>
                          <ol className="text-[11px] text-neutral-300 list-decimal list-inside space-y-1">
                            <li>No Safari, toque no botão de <strong className="text-white">Compartilhar</strong> (quadrado com seta para cima)</li>
                            <li>Role para baixo e toque em <strong className="text-[#1DB954]">"Adicionar à Tela de Início"</strong></li>
                            <li>Abra pelo ícone na tela inicial para ter o app em tela cheia sem barras</li>
                          </ol>
                        </div>
                      </div>
                    )}

                    {selectedBrowserGuide === 'chrome' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Globe size={14} className="text-[#1DB954]" />
                          <span>Google Chrome (Android & Desktop)</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          Suporte completo a WebAPK com áudio Ultra HD de 320 kbps. Toque no menu de 3 pontinhos do Chrome e escolha <strong>"Instalar aplicativo"</strong> para desempenho máximo.
                        </p>
                      </div>
                    )}

                    {selectedBrowserGuide === 'firefox' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Globe size={14} className="text-[#1DB954]" />
                          <span>Mozilla Firefox (Gecko / Fenix)</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          O motor do player inclui sanitização estrita de time-stamps contra bugs conhecidos do Firefox Mobile, garantindo transição sem engasgos entre músicas.
                        </p>
                      </div>
                    )}

                    {selectedBrowserGuide === 'edge' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Globe size={14} className="text-[#1DB954]" />
                          <span>Microsoft Edge</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          No celular, acesse <strong className="text-white">Configurações &gt; Configurações do site &gt; Reprodução de vídeo em segundo plano</strong> para reprodução ininterrupta.
                        </p>
                      </div>
                    )}

                    {selectedBrowserGuide === 'brave' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Shield size={14} className="text-[#1DB954]" />
                          <span>Brave Browser</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          Abra o menu do Brave &gt; <strong>Configurações &gt; Exibir &gt; Ative "Reprodução em segundo plano"</strong>. O player usa buffers PCM sem disparar as proteções do Brave Shields.
                        </p>
                      </div>
                    )}

                    {selectedBrowserGuide === 'opera' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Globe size={14} className="text-[#1DB954]" />
                          <span>Opera & Opera GX</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          Totalmente compatível com Opera Touch e GX. Os atalhos de mídia do teclado e controle por fones funcionam nativamente.
                        </p>
                      </div>
                    )}

                    {selectedBrowserGuide === 'samsung' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs">
                          <Smartphone size={14} className="text-[#1DB954]" />
                          <span>Samsung Galaxy (Samsung Internet & One UI)</span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-relaxed">
                          Otimizado para o painel de mídia do Always On Display (AOD). Em Configurações &gt; Aplicativos &gt; Samsung Internet &gt; Bateria, defina como "Irrestrito".
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>💡 Suporta fones Bluetooth, Apple Watch, Android Auto e controles de mídia do volante.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: ARMAZENAMENTO & BACKUP */}
          {activeTab === 'dados' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <HardDrive size={16} className="text-[#1DB954]" />
                  <span>Armazenamento Offline & Cache Inteligente</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Gerencie o espaço do aplicativo no seu dispositivo. As músicas baixadas ficam salvas localmente no navegador (IndexedDB) para tocar mesmo sem internet.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="block text-2xl font-black text-white">{downloadedCount}</span>
                  <span className="text-[11px] text-neutral-400 font-semibold">Faixas Salvas Offline</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="block text-2xl font-black text-[#1DB954]">{playlists.length}</span>
                  <span className="text-[11px] text-neutral-400 font-semibold">Playlists na Nuvem</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setErrorMsg('');
                    setSuccessMsg('');
                    try {
                      await onSyncPlaylists();
                      setSuccessMsg('Playlists sincronizadas com a nuvem!');
                      setTimeout(() => setSuccessMsg(''), 3000);
                    } catch (err: any) {
                      setErrorMsg(err.message || 'Erro ao sincronizar com a nuvem.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin text-[#1DB954]" : "text-[#1DB954]"} />
                  <span>Sincronizar com a Nuvem</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10"
                >
                  <Download size={14} />
                  <span>Exportar Backup (.JSON)</span>
                </button>

                <label className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10 cursor-pointer">
                  <Upload size={14} />
                  <span>Restaurar Backup (.JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleClearCache}
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 text-xs font-bold transition flex items-center justify-center gap-2 border border-red-500/20"
                >
                  <Trash2 size={14} />
                  <span>Limpar Cache de Imagens</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
