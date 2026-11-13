import React, { useState } from 'react';
import { X, User, Lock, Mail, CheckCircle, LogOut, Loader2, Sparkles, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChange: (user: any) => void;
  onSyncPlaylists: () => void;
}

export function AuthModal({ isOpen, onClose, currentUser, onUserChange, onSyncPlaylists }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Troca de Senha
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const cleanEmail = email.trim().includes('@') ? email.trim() : `${email.trim().toLowerCase()}@ablemusic.app`;

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password.trim()
        });
        if (error) throw error;
        if (data.user) {
          onUserChange(data.user);
          setSuccessMsg('Conta criada com sucesso! Sincronizando playlists...');
          setTimeout(() => {
            onSyncPlaylists();
            onClose();
          }, 1000);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password.trim()
        });
        if (error) throw error;
        if (data.user) {
          onUserChange(data.user);
          setSuccessMsg('Conectado com sucesso! Sincronizando todos os seus dispositivos...');
          setTimeout(() => {
            onSyncPlaylists();
            onClose();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword.trim()
      });
      if (error) throw error;
      setSuccessMsg('Senha atualizada com sucesso! A nova senha protege sua conta.');
      setNewPassword('');
      setTimeout(() => setIsChangingPassword(false), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setErrorMsg('');
    try {
      await onSyncPlaylists();
      setSuccessMsg('Playlists sincronizadas com sucesso da nuvem!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Erro ao sincronizar. Tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    onUserChange(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#1e1e1e] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1"
        >
          <X size={20} />
        </button>

        {currentUser ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1DB954]">
              <CheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Conta Conectada</h3>
              <p className="text-xs text-neutral-400 mt-1">{currentUser.email}</p>
            </div>

            {successMsg && (
              <div className="rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/30 p-3 text-xs text-[#1DB954] font-medium">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="rounded-2xl bg-white/5 p-4 border border-white/5 text-left text-xs text-neutral-300 space-y-2">
              <div className="flex items-center gap-2 text-[#1DB954] font-bold">
                <Sparkles size={14} />
                <span>Sincronização Ativa Multi-Aparelhos</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Playlists sincronizadas em tempo real entre PC, Telefone 1 e Telefone 2.
              </p>
            </div>

            {/* BOTÃO FORÇAR SINCRONIZAÇÃO */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] active:scale-98 py-3 text-xs font-bold text-black shadow-lg transition"
            >
              <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Sincronizando com a Nuvem..." : "Puxar Playlists Mais Recentes da Nuvem"}</span>
            </button>

            {/* FORMULÁRIO DE TROCA DE SENHA (RESOLVE O AVISO DO GOOGLE) */}
            <div className="pt-2 border-t border-white/10">
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white transition"
                >
                  <KeyRound size={15} className="text-[#1DB954]" />
                  <span>Alterar Minha Senha</span>
                </button>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#1DB954]" /> Nova Senha Segura
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="text-[11px] text-neutral-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha segura"
                    className="h-10 w-full rounded-xl bg-[#121212] border border-white/10 px-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                  <p className="text-[10px] text-neutral-400">
                    Definir uma senha forte remove o aviso vermelho de "senha comprometida" do Google.
                  </p>
                  <button
                    type="submit"
                    disabled={loading || !newPassword.trim()}
                    className="w-full py-2 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-xs font-bold text-black transition disabled:opacity-50"
                  >
                    {loading ? "Salvando..." : "Salvar Nova Senha"}
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 py-2.5 text-xs font-bold text-neutral-400 transition"
            >
              <LogOut size={15} />
              <span>Encerrar Sessão</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1DB954] text-black">
                <User size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  {isRegister ? 'Criar Conta' : 'Acessar Minha Conta'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Sincronize suas playlists em todos os seus dispositivos
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/20 p-3 text-xs text-[#1DB954]">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Login ou E-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="albertosarly@gmail.com"
                    className="h-11 w-full rounded-2xl bg-[#121212] border border-white/10 pl-11 pr-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Senha
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-2xl bg-[#121212] border border-white/10 pl-11 pr-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] py-3.5 text-xs font-bold text-black shadow-lg disabled:opacity-40 transition"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <span>{isRegister ? 'Criar Conta' : 'Entrar'}</span>}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                {isRegister ? 'Já possui conta? Clique para entrar' : 'Não tem conta? Clique para criar uma'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
