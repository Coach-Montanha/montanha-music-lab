import React, { useState, useRef, useCallback } from 'react';

interface AudioScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
  barHeight?: string;
  thumbSize?: string;
  showThumbAlways?: boolean;
  onScrubbingChange?: (isScrubbing: boolean, scrubTime: number) => void;
}

export const AudioScrubber: React.FC<AudioScrubberProps> = ({
  currentTime,
  duration,
  onSeek,
  className = '',
  barHeight = 'h-1.5',
  thumbSize = 'w-3.5 h-3.5',
  showThumbAlways = false,
  onScrubbingChange,
}) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const safeDuration = Math.max(duration, 1);
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent = Math.min(Math.max((displayTime / safeDuration) * 100, 0), 100);

  const updateScrubFromPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const clampedX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const ratio = rect.width > 0 ? clampedX / rect.width : 0;
      const targetTime = Math.floor(ratio * safeDuration);
      setScrubTime(targetTime);
      onScrubbingChange?.(true, targetTime);
      return targetTime;
    },
    [safeDuration, onScrubbingChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsScrubbing(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateScrubFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.preventDefault();
    e.stopPropagation();
    updateScrubFromPointer(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.preventDefault();
    e.stopPropagation();
    const finalTime = updateScrubFromPointer(e);
    setIsScrubbing(false);
    onScrubbingChange?.(false, finalTime);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    onSeek(finalTime);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      onScrubbingChange?.(false, currentTime);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div
      className={`relative flex items-center cursor-pointer select-none touch-none py-2 group ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: 'none' }}
    >
      {/* Background Track com área ampliada de toque */}
      <div
        ref={trackRef}
        className={`w-full ${barHeight} rounded-full bg-white/20 relative overflow-visible transition-colors group-hover:bg-white/30`}
      >
        {/* Fill Bar de Progresso */}
        <div
          className={`h-full rounded-full transition-all duration-75 ${
            isScrubbing ? 'bg-[#1DB954]' : 'bg-white group-hover:bg-[#1DB954]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />

        {/* Thumb Knob Indicador Arrastável */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ${thumbSize} rounded-full bg-white shadow-lg pointer-events-none transition-transform ${
            isScrubbing || showThumbAlways
              ? 'scale-100 opacity-100 ring-2 ring-white/20'
              : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
          }`}
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
