import React from 'react';
import { Sparkles, Music, Compass } from 'lucide-react';
import { GenreCategory, GENRES_CATALOG } from '../lib/genresData';

interface GenreExploreGridProps {
  onSelectGenre: (genre: GenreCategory) => void;
}

export const GenreExploreGrid: React.FC<GenreExploreGridProps> = ({ onSelectGenre }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-base font-black tracking-wide text-white flex items-center gap-2">
          <Compass size={18} className="text-[#1DB954]" />
          <span>Navegar por Estilos</span>
        </h3>
        <span className="text-xs text-neutral-400 font-medium">Toque para explorar</span>
      </div>

      {/* Grid de 2 colunas no mobile estilo eSound */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {GENRES_CATALOG.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelectGenre(genre)}
            className="group relative h-24 sm:h-28 w-full rounded-2xl p-3.5 flex flex-col justify-between text-left overflow-hidden transition-all duration-200 active:scale-95 hover:brightness-110 shadow-lg border border-white/10"
            style={{
              background: genre.gradient,
              boxShadow: `0 8px 20px -8px ${genre.glowColor}`
            }}
          >
            {/* Ícone sutil no topo esquerdo estilo eSound */}
            <div className="flex items-center justify-between w-full">
              <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white/80">
                <Music size={13} className="drop-shadow" />
              </div>
              <Sparkles size={12} className="text-white/40 group-hover:text-white/80 transition" />
            </div>

            {/* Nome do Gênero */}
            <div className="relative z-10">
              <span className="block font-black text-base sm:text-lg text-white drop-shadow leading-tight tracking-tight line-clamp-2">
                {genre.name}
              </span>
            </div>

            {/* Brilho decorativo de fundo */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/15 blur-xl pointer-events-none group-hover:scale-125 transition duration-300" />
          </button>
        ))}
      </div>
    </div>
  );
};
