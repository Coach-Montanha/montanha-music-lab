import React, { useState } from 'react';
import { X, User, Lock, Mail, CheckCircle, LogOut, Loader2, Sparkles } from 'lucide-react';
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
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1DB954]">
              <CheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Conta Conectada</h3>
              <p className="text-xs text-neutral-400 mt-1">{currentUser.email}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 border border-white/5 text-left text-xs text-neutral-300 space-y-2">
              <div className="flex items-center gap-2 text-[#1DB954] font-bold">
                <Sparkles size={14} />
                <span>Sincronização em Nuvem Ativa</span>
              </div>
              <p>Todas as suas playlists, músicas salvas e favoritos estão linkados com esta conta e disponíveis em todos os seus celulares, computadores e tablets.</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 py-3 text-xs font-bold text-white transition"
            >
              <LogOut size={16} />
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
                    placeholder="seu-login ou email@exemplo.com"
                    className="h-12 w-full rounded-2xl bg-[#121212] border border-white/10 pl-11 pr-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
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
                    className="h-12 w-full rounded-2xl bg-[#121212] border border-white/10 pl-11 pr-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] active:scale-98 py-3.5 text-xs font-bold text-black shadow-lg transition disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>{isRegister ? 'Criar Conta e Sincronizar' : 'Entrar e Sincronizar'}</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                {isRegister
                  ? 'Já tem uma conta? Clique aqui para entrar'
                  : 'Não tem conta? Clique aqui para criar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
