import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  LogIn,
  UserPlus,
  X,
  Check,
  AlertCircle,
  LoaderCircle,
  Cloud,
  LogOut,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  isMandatory?: boolean;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  isMandatory = false
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  // Normalização universal: se não contém '@', transforma em email canônico do Supabase
  // Normalização universal: mapeia para identificador seguro no Supabase (@montanha.com)
  const formatEmailFromLogin = (input: string): string => {
    const cleaned = input.trim().toLowerCase();
    if (cleaned.includes('@')) return cleaned;
    const sanitized = cleaned.replace(/[^a-z0-9._-]/g, '');
    return `${sanitized || 'usuario'}@montanha.com`;
  };

  const getCleanLoginName = (emailString?: string | null): string => {
    if (!emailString) return 'Usuário';
    if (emailString.endsWith('@montanha.com')) {
      return emailString.replace('@montanha.com', '');
    }
    if (emailString.endsWith('@montanhamusiclab.app')) {
      return emailString.replace('@montanhamusiclab.app', '');
    }
    return emailString;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const canonicalEmail = formatEmailFromLogin(usernameInput);

    if (password.length < 6) {
      setErrorMessage('A senha precisa ter no mínimo 6 dígitos para segurança.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: canonicalEmail,
          password
        });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Login ou senha incorretos. Verifique suas credenciais.');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Acesso pendente de liberação. Fale com o Coach Montanha.');
          }
          if (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network') || (error as any).status === 0) {
            const fallbackUser: any = {
              id: 'user-' + usernameInput.trim().toLowerCase(),
              email: canonicalEmail,
              user_metadata: { name: usernameInput.trim() }
            };
            onUserChange(fallbackUser);
            setSuccessMessage('Conectado em modo offline!');
            setTimeout(() => onClose(), 600);
            return;
          }
          throw error;
        }
        onUserChange(data.user);
        setSuccessMessage('Conectado com sucesso! Sincronizando biblioteca...');
        setTimeout(() => onClose(), 600);
      } else {
        const displayName = name.trim() || usernameInput.trim() || 'Usuário Montanha';
        
        // Chamada ao backend para criar com email auto-confirmado instantaneamente
        try {
          const apiRes = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              login: usernameInput.trim().toLowerCase(),
              password,
              name: displayName
            })
          });
          const apiJson = await apiRes.json();
          if (!apiRes.ok) {
            throw new Error(apiJson.error || 'Erro ao registrar usuário.');
          }
        } catch (apiErr: any) {
          if (apiErr.message && apiErr.message.includes('em uso')) {
            throw apiErr;
          }
          // Fallback para registro direto no Supabase
          const { error: signUpError } = await supabase.auth.signUp({
            email: canonicalEmail,
            password,
            options: {
              data: {
                name: displayName,
                username: usernameInput.trim().toLowerCase()
              }
            }
          });
          if (signUpError && !signUpError.message.includes('already registered')) {
            throw signUpError;
          }
        }

        // Login automático imediato pós-cadastro
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: canonicalEmail,
          password
        });
        if (loginError) {
          setSuccessMessage('Conta cadastrada com sucesso! Clique na aba "Entrar".');
          setMode('login');
        } else {
          onUserChange(loginData.user);
          setSuccessMessage('Conta criada com sucesso! Sincronização em nuvem ativa.');
          setTimeout(() => onClose(), 600);
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-[#0d0f17] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-white">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl" />

        {/* Close Button (oculto se o login for obrigatório para acesso) */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Header */}
        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004799] to-[#0066cc] text-white shadow-[0_0_25px_rgba(0,102,204,0.5)] border border-blue-400/30">
            <Cloud size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Montanha Music Lab</h2>
            <p className="text-xs text-sky-400 font-medium flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={13} className="text-sky-400" />
              Sincronização em Nuvem (Supabase)
            </p>
          </div>
        </div>

        {currentUser ? (
          /* Profile view when already logged in */
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-base font-bold text-white shadow-md">
                  {(currentUser.user_metadata?.name?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {currentUser.user_metadata?.name || getCleanLoginName(currentUser.email)}
                  </p>
                  <p className="truncate text-xs text-sky-300/80 font-mono">
                    Login: {getCleanLoginName(currentUser.email)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Sincronização ativa (Playlists, Likes e Plugins)
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
                  setSuccessMessage(null);
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-[#0066cc] to-[#0052cc] text-white shadow-md'
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
                  setSuccessMessage(null);
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-[#0066cc] to-[#0052cc] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Criar Conta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-300">Seu Nome Completo</label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Coach Montanha"
                      className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Login / Usuário (SEM precisar de e-mail obrigatório) */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-300">
                  Login ou Nome de Usuário
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Ex: montanha ou aluno1"
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-500">
                  Não precisa de e-mail. Use apenas seu nome ou apelido.
                </p>
              </div>

              {/* Senha */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-300">
                    Senha {mode === 'register' && <span className="text-gray-500 font-normal">(mínimo 6 dígitos)</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelp((v) => !v)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                  >
                    <HelpCircle size={11} />
                    Recuperação?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha (6+ dígitos)"
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {showHelp && (
                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-200">
                  <p className="font-bold">Como gerenciar e recuperar senha:</p>
                  <p className="mt-1 leading-relaxed text-[11px] text-sky-300/90">
                    O administrador gerencia e redefine senhas diretamente no painel do Supabase com 1 clique. Para suporte ou nova senha, fale direto com o Coach Montanha.
                  </p>
                </div>
              )}

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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0066cc] to-[#0052cc] font-bold text-sm text-white shadow-[0_4px_20px_rgba(0,102,204,0.4)] transition hover:opacity-95 active:scale-98 disabled:opacity-50"
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
