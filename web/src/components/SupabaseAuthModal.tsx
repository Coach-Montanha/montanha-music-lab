import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, X, Check, AlertCircle, LoaderCircle, Cloud, LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        onUserChange(data.user);
        setSuccessMessage('Login efetuado com sucesso! Sincronizando dados...');
        setTimeout(() => onClose(), 1200);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() || 'Usuário Montanha' }
          }
        });
        if (error) throw error;
        if (data.user) {
          onUserChange(data.user);
          setSuccessMessage('Conta criada com sucesso! Você já está conectado.');
          setTimeout(() => onClose(), 1500);
        } else {
          setSuccessMessage('Verifique seu e-mail para confirmar o cadastro!');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    onUserChange(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f17] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Cloud size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Montanha Music Lab</h2>
            <p className="text-xs text-sky-400 font-medium">Sincronização em Nuvem (Supabase)</p>
          </div>
        </div>

        {currentUser ? (
          /* Profile view when already logged in */
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {(currentUser.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {currentUser.user_metadata?.name || currentUser.email?.split('@')[0]}
                  </p>
                  <p className="truncate text-xs text-gray-400">{currentUser.email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Sincronização em tempo real ativa
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 active:scale-98"
            >
              <LogOut size={16} />
              Encerrar Sessão
            </button>
          </div>
        ) : (
          /* Login / Register form */
          <>
            {/* Tabs */}
            <div className="mb-5 flex rounded-2xl bg-white/[0.04] p-1 border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Criar Conta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-300">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Coach Montanha"
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-sky-500/60 focus:bg-white/[0.05]"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-300">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-sky-500/60 focus:bg-white/[0.05]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-300">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-sky-500/60 focus:bg-white/[0.05]"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/20">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-300 border border-emerald-500/20">
                  <Check size={16} className="shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 font-semibold text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition hover:opacity-95 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : mode === 'login' ? (
                  <>
                    <LogIn size={18} />
                    Entrar e Sincronizar
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Criar Conta
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-[11px] text-gray-500">
              Suas playlists, favoritas e downloads ficam salvos no servidor e sincronizam automaticamente entre seu PC e celular.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
