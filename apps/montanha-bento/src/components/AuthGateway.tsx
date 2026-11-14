import React, { useState } from 'react';
import { User, Lock, Mail, CheckCircle2, Loader2, Sparkles, Music2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthGatewayProps {
  onSuccess: (user: any) => void;
}

export function AuthGateway({ onSuccess }: AuthGatewayProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const cleanEmail = email.trim().includes('@')
      ? email.trim()
      : `${email.trim().toLowerCase()}@ablemusic.app`;

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password.trim()
        });
        if (error) throw error;
        if (data.user) {
          setSuccessMsg('Conta criada com sucesso! Sincronizando sua biblioteca...');
          setTimeout(() => {
            onSuccess(data.user);
          }, 800);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password.trim()
        });
        if (error) {
          // Se as credenciais falharem, tenta criar a conta caso seja o primeiro acesso
          if (error.message?.includes('Invalid login credentials')) {
            const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
              email: cleanEmail,
              password: password.trim()
            });
            if (!signUpErr && signUpData.user) {
              setSuccessMsg('Conta conectada e ativada! Sincronizando playlists...');
              setTimeout(() => {
                onSuccess(signUpData.user);
              }, 800);
              return;
            }
          }
          throw error;
        }
        if (data.user) {
          setSuccessMsg('Conectado com sucesso! Sincronizando playlists...');
          setTimeout(() => {
            onSuccess(data.user);
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl transition-all duration-700 ease-out select-none">
      <div className="w-full max-w-md rounded-[32px] bg-[#181818]/95 border border-white/10 p-6 sm:p-8 space-y-6 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative animate-fade-in backdrop-blur-3xl">
        
        {/* CABEÇALHO DO GATEWAY */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#1DB954] text-black shadow-[0_10px_30px_rgba(29,185,84,0.4)] p-3">
            <img src="/music.svg" alt="Montanha Music Lab" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>Montanha</span>
              <span className="text-[#1DB954]">Music Lab</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {isRegister
                ? 'Crie sua conta para salvar e sincronizar suas playlists no PC, Celular e PWA.'
                : 'Acesse para sincronizar automaticamente suas playlists entre seu celular e computador.'}
            </p>
          </div>
        </div>

        {/* SELETOR DE ABAS: ENTRAR / CRIAR CONTA */}
        <div className="flex rounded-2xl bg-white/5 p-1 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              !isRegister ? 'bg-[#1DB954] text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              isRegister ? 'bg-[#1DB954] text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* FEEDBACK DE ERRO OU SUCESSO */}
        {errorMsg && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 text-center font-medium animate-shake">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/30 p-3.5 text-xs text-[#1DB954] flex items-center justify-center gap-2 font-bold animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORMULÁRIO DE LOGIN/CADASTRO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              E-mail ou Login
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-login ou email@exemplo.com"
                autoComplete="username"
                className="h-12 w-full rounded-2xl bg-[#121212] border border-white/10 pl-11 pr-4 text-base sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Senha
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="h-12 w-full rounded-2xl bg-[#121212] border border-white/10 pl-11 pr-4 text-base sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] active:scale-98 h-12 text-sm font-bold text-black shadow-lg transition disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Criar Conta e Entrar' : 'Entrar no Montanha Music Lab'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* BENEFÍCIOS DO LOGIN */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-neutral-400 text-center">
          <Sparkles size={13} className="text-[#1DB954] flex-shrink-0" />
          <span>Suas músicas e playlists sincronizadas no PC e Celular</span>
        </div>

      </div>
    </div>
  );
}
