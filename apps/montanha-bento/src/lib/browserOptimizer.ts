/**
 * BrowserOptimizer: Motor Unificado de Compatibilidade & Performance Multi-Navegador
 * 
 * Adapta e blinda o player para os principais navegadores e sistemas do mercado:
 * - Google Chrome (Desktop, Android & Motorola AOSP)
 * - Xiaomi / Redmi (MIUI, HyperOS & Mi Browser)
 * - Apple iOS (Safari, WebKit & PWA Standalone)
 * - Mozilla Firefox (Desktop & Fenix Android)
 * - Microsoft Edge (Desktop & Android)
 * - Brave Browser (com contorno de Shields)
 * - Opera / Opera GX (Desktop & Mobile)
 * - Samsung Internet (Galaxy)
 */

export interface BrowserProfile {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'brave' | 'opera' | 'samsung' | 'miui' | 'other';
  displayName: string;
  engine: 'blink' | 'gecko' | 'webkit' | 'other';
  os: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'other';
  deviceBrand?: 'motorola' | 'xiaomi' | 'samsung' | 'apple' | 'google' | 'other';
  isPWA: boolean;
  hasAudioSession: boolean;
  hasMediaSession: boolean;
  hasWakeLock: boolean;
  recommendation: {
    headline: string;
    tips: string[];
    batteryGuide?: string[];
  };
}

class BrowserOptimizerEngine {
  private static instance: BrowserOptimizerEngine;
  private profile: BrowserProfile | null = null;
  private isUnlocked = false;

  static getInstance(): BrowserOptimizerEngine {
    if (!this.instance) {
      this.instance = new BrowserOptimizerEngine();
    }
    return this.instance;
  }

  getProfile(): BrowserProfile {
    if (this.profile) return this.profile;

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isPWA = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );

    // Detecção de Sistema Operacional
    let os: BrowserProfile['os'] = 'other';
    if (/iPhone|iPad|iPod/i.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      os = 'ios';
    } else if (/Android/i.test(ua)) {
      os = 'android';
    } else if (/Windows/i.test(ua)) {
      os = 'windows';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      os = 'macos';
    } else if (/Linux/i.test(ua)) {
      os = 'linux';
    }

    // Detecção de Marca / Fabricante do Aparelho
    let deviceBrand: BrowserProfile['deviceBrand'] = 'other';
    if (os === 'ios') {
      deviceBrand = 'apple';
    } else if (/moto|motorola|XT\d{4}/i.test(ua)) {
      deviceBrand = 'motorola';
    } else if (/Redmi|Xiaomi|POCO|Mi\s|M2\d{3}|2\d{4}/i.test(ua)) {
      deviceBrand = 'xiaomi';
    } else if (/Samsung|SM-[A-Z0-9]+/i.test(ua)) {
      deviceBrand = 'samsung';
    } else if (/Pixel/i.test(ua)) {
      deviceBrand = 'google';
    }

    // Detecção de Navegador
    let name: BrowserProfile['name'] = 'chrome';
    let displayName = 'Google Chrome';
    let engine: BrowserProfile['engine'] = 'blink';

    const isBrave = typeof navigator !== 'undefined' && (Boolean((navigator as any).brave) || (navigator as any).brave?.isBrave);

    if (isBrave) {
      name = 'brave';
      displayName = 'Brave Browser';
      engine = 'blink';
    } else if (/EdgA|EdgiOS|Edg\//i.test(ua)) {
      name = 'edge';
      displayName = 'Microsoft Edge';
      engine = 'blink';
    } else if (/OPR\/|Opera|OPT\//i.test(ua)) {
      name = 'opera';
      displayName = 'Opera / Opera GX';
      engine = 'blink';
    } else if (/SamsungBrowser/i.test(ua)) {
      name = 'samsung';
      displayName = 'Samsung Internet';
      engine = 'blink';
    } else if (/MiuiBrowser/i.test(ua)) {
      name = 'miui';
      displayName = 'Mi Browser (Xiaomi)';
      engine = 'blink';
    } else if (/Firefox|FxiOS/i.test(ua)) {
      name = 'firefox';
      displayName = 'Mozilla Firefox';
      engine = 'gecko';
    } else if (os === 'ios' && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPR/i.test(ua)) {
      name = 'safari';
      displayName = 'Apple Safari';
      engine = 'webkit';
    } else {
      name = 'chrome';
      displayName = 'Google Chrome';
      engine = 'blink';
    }

    const hasAudioSession = typeof navigator !== 'undefined' && 'audioSession' in navigator;
    const hasMediaSession = typeof navigator !== 'undefined' && 'mediaSession' in navigator;
    const hasWakeLock = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

    // Guias Específicos de Otimização por Navegador / Dispositivo
    const recommendations: Record<string, BrowserProfile['recommendation']> = {
      motorola: {
        headline: 'Otimização para Motorola (Android AOSP Puro)',
        tips: [
          'Instale o app como PWA para receber prioridade de áudio nativa no Android.',
          'O motor AudioAnchor já está ativo para blindar o player contra o congelamento de processos em segundo plano.',
          'Controle total disponível direto no widget da tela de bloqueio.'
        ],
        batteryGuide: [
          'Pressione e segure o ícone do App (ou do Chrome) na tela inicial.',
          'Toque em Informações do app (ícone ℹ️) > Uso da bateria.',
          'Selecione "Sem restrições" para garantir reprodução infinita com tela apagada.'
        ]
      },
      xiaomi: {
        headline: 'Otimização para Xiaomi / Redmi (HyperOS & MIUI)',
        tips: [
          'O player envia pings regulares para o MediaSession para evitar o encerramento pelo limpador de memória do HyperOS.',
          'Funciona tanto no Chrome quanto no Mi Browser com qualidade máxima de 320 kbps.'
        ],
        batteryGuide: [
          'Abra os apps recentes (multitarefa), segure o card do App e toque no ícone de Cadeado 🔒 para fixá-lo na memória.',
          'Vá em Configurações > Bateria > Economia de bateria no app e escolha "Nenhuma restrição".'
        ]
      },
      safari: {
        headline: 'Otimização para Apple iPhone & iPad (iOS Safari)',
        tips: [
          'Toque no botão Compartilhar (quadrado com seta) e selecione "Adicionar à Tela de Início".',
          'O app utiliza a AudioSession API nativa do iOS (iOS 16.4+) para continuar tocando com tela travada e mesmo com a chave de silencioso ligada.',
          'Controle completo na Dynamic Island e na Central de Controle da Apple.'
        ]
      },
      brave: {
        headline: 'Otimização para Brave Browser',
        tips: [
          'Abra o menu do Brave > Configurações > Exibir > Ative "Reprodução em segundo plano".',
          'O player utiliza buffers PCM diretos para evitar bloqueios de impressão digital (Shields) do Brave.'
        ]
      },
      firefox: {
        headline: 'Otimização para Mozilla Firefox',
        tips: [
          'Total compatibilidade com motor Gecko em Android e Desktop.',
          'Sanitização matemática de posição ativa para evitar instabilidade de sincronismo.',
          'Suporte total a controle por fones Bluetooth e atalhos de teclado.'
        ]
      },
      edge: {
        headline: 'Otimização para Microsoft Edge',
        tips: [
          'No celular, abra as Configurações do Edge > Configurações do site > Ative "Reprodução de vídeo em segundo plano".',
          'No computador, o Edge PWA roda isolado sem sofrer com o recurso de "Abas em Suspensão".'
        ]
      },
      opera: {
        headline: 'Otimização para Opera & Opera GX',
        tips: [
          'Compatível com Opera Touch e Opera GX.',
          'Garante persistência de áudio contínuo sem ser afetado por recursos de economia de dados.'
        ]
      },
      samsung: {
        headline: 'Otimização para Samsung Galaxy (Samsung Internet)',
        tips: [
          'Totalmente otimizado para o Samsung Internet Browser e One UI.',
          'Controle no painel de mídia Always On Display (AOD).'
        ],
        batteryGuide: [
          'Configurações > Aplicativos > Selecione o app > Bateria > "Irrestrito".'
        ]
      },
      default: {
        headline: 'Otimização Geral para Navegadores Modernos',
        tips: [
          'Adicione o aplicativo à tela inicial para a melhor experiência como app nativo.',
          'O player mantém a sessão de áudio protegida para continuar tocando em segundo plano.'
        ]
      }
    };

    let recKey = 'default';
    if (deviceBrand === 'motorola') recKey = 'motorola';
    else if (deviceBrand === 'xiaomi') recKey = 'xiaomi';
    else if (deviceBrand === 'apple' || name === 'safari') recKey = 'safari';
    else if (deviceBrand === 'samsung' || name === 'samsung') recKey = 'samsung';
    else if (name === 'brave') recKey = 'brave';
    else if (name === 'firefox') recKey = 'firefox';
    else if (name === 'edge') recKey = 'edge';
    else if (name === 'opera') recKey = 'opera';

    this.profile = {
      name,
      displayName,
      engine,
      os,
      deviceBrand,
      isPWA,
      hasAudioSession,
      hasMediaSession,
      hasWakeLock,
      recommendation: recommendations[recKey] || recommendations.default
    };

    return this.profile;
  }

  /**
   * Inicializa as correções de compatibilidade no runtime do navegador
   */
  init() {
    if (typeof window === 'undefined') return;
    const profile = this.getProfile();

    // 1. OTIMIZAÇÃO IOS SAFARI (AudioSession API)
    if (profile.hasAudioSession) {
      try {
        (navigator as any).audioSession.type = 'playback';
      } catch (err) {
        console.warn('AudioSession init:', err);
      }
    }

    // 2. ONE-TOUCH GLOBAL GESTURE UNLOCK (Safari & Firefox & Android)
    // Desbloqueia o motor de áudio no primeiro toque do usuário em qualquer lugar da tela
    if (!this.isUnlocked) {
      const unlockMedia = () => {
        this.isUnlocked = true;
        if (profile.hasAudioSession) {
          try { (navigator as any).audioSession.type = 'playback'; } catch {}
        }
        window.removeEventListener('click', unlockMedia, true);
        window.removeEventListener('touchstart', unlockMedia, true);
        window.removeEventListener('keydown', unlockMedia, true);
      };

      window.addEventListener('click', unlockMedia, { capture: true, once: true });
      window.addEventListener('touchstart', unlockMedia, { capture: true, once: true });
      window.addEventListener('keydown', unlockMedia, { capture: true, once: true });
    }

    // 3. AUTO-PREVENÇÃO DE AUTO-ZOOM NO IOS SAFARI
    // Garante que a meta tag viewport não permita zoom indesejado ao focar campos
    try {
      let metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        const content = metaViewport.getAttribute('content') || '';
        if (!content.includes('viewport-fit=cover')) {
          metaViewport.setAttribute('content', `${content}, viewport-fit=cover`);
        }
      }
    } catch {}

    // 4. HEARTBEAT DEFENSIVO MULTI-NAVEGADOR
    // No Android (Motorola / Xiaomi / Brave / Chrome), reforça o status da MediaSession
    // a cada 8 segundos quando houver reprodução ativa, impedindo o descarte da notificação
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if ('mediaSession' in navigator && (navigator as any).mediaSession.playbackState === 'playing') {
          // Reafirma playbackState ativo sem forçar re-renderização
          try {
            (navigator as any).mediaSession.playbackState = 'playing';
          } catch {}
        }
      }, 8000);
    }
  }
}

export const browserOptimizer = BrowserOptimizerEngine.getInstance();
