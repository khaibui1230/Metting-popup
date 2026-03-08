import React from 'react';
import { Heart, Star, Flower, Coffee, Music, Camera, Gift, MapPin, Flame, Briefcase, UserPlus, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const icons = {
  question: Heart,
  scenario: MapPin,
  action: Star,
  compliment: Gift,
  fun: Coffee,
  value: Flower,
  spicy: Flame,
  career: Briefcase,
  friendship: UserPlus,
  love: Heart,
  sex: Flame,
  solo: Sparkles,
  default: Music,
};

const typeColors = {
  question: 'bg-rose-50 border-rose-200 text-rose-500',
  scenario: 'bg-blue-50 border-blue-200 text-blue-500',
  action: 'bg-amber-50 border-amber-200 text-amber-500',
  compliment: 'bg-purple-50 border-purple-200 text-purple-500',
  fun: 'bg-emerald-50 border-emerald-200 text-emerald-500',
  value: 'bg-orange-50 border-orange-200 text-orange-500',
  spicy: 'bg-red-50 border-red-300 text-red-600',
  career: 'bg-slate-50 border-slate-200 text-slate-600',
  friendship: 'bg-cyan-50 border-cyan-200 text-cyan-600',
  love: 'bg-pink-50 border-pink-200 text-pink-600',
  sex: 'bg-rose-50 border-rose-300 text-rose-700',
  solo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
  default: 'bg-gray-50 border-gray-200 text-gray-500',
};

export default function Card({ cardUniqueKey, type, content, isFlipped, isMatched, onClick, disabled }) {
  const Icon = icons[type] || icons.default;
  const colorClass = typeColors[type] || typeColors.default;

  // Added gradients for the visual area
  const typeGradients = {
    question: 'from-rose-400 to-rose-500',
    scenario: 'from-blue-400 to-blue-500',
    action: 'from-amber-400 to-amber-500',
    compliment: 'from-purple-400 to-purple-500',
    fun: 'from-emerald-400 to-emerald-500',
    value: 'from-orange-400 to-orange-500',
    spicy: 'from-red-600 to-red-800',
    career: 'from-slate-500 to-slate-700',
    friendship: 'from-cyan-400 to-cyan-600',
    love: 'from-pink-400 to-pink-600',
    sex: 'from-rose-600 to-rose-900',
    solo: 'from-indigo-400 to-indigo-600',
    default: 'from-gray-400 to-gray-500',
  };

  const gradientClass = typeGradients[type] || typeGradients.default;

  // Placeholder images based on type
  const typeImages = {
    question: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=300&h=200',
    scenario: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c1a?auto=format&fit=crop&q=80&w=300&h=200',
    action: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=300&h=200',
    compliment: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=300&h=200',
    fun: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300&h=200',
    value: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&q=80&w=300&h=200',
    spicy: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=300&h=200',
    career: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=300&h=200',
    friendship: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=300&h=200',
    love: 'https://images.unsplash.com/photo-1516589174184-c685266e430c?auto=format&fit=crop&q=80&w=300&h=200',
    sex: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=300&h=200',
    default: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=300&h=200',
  };

  const imageUrl = `${typeImages[type] || typeImages.default}&sig=${cardUniqueKey}`;

  return (    <div 
      className={twMerge(
        "card-container w-full h-32 md:h-48 lg:h-56 transition-all duration-500 transform",
        !isFlipped && !isMatched && "hover:scale-105 hover:-translate-y-1",
        isMatched && "opacity-90 scale-95"
      )}
      onClick={() => !disabled && !isFlipped && !isMatched && onClick()}
    >
      <div className={clsx(
        "card-inner shadow-lg md:shadow-xl rounded-xl md:rounded-2xl", 
        isFlipped && "is-flipped",
        isMatched && "ring-2 md:ring-4 ring-pastel-pink-deep ring-offset-2 md:ring-offset-4"
      )}>
        {/* Card Back (Hidden) */}
        <div className="card-face card-back bg-gradient-to-br from-pastel-pink to-pastel-pink-deep flex flex-col items-center justify-center border-2 md:border-4 border-white shadow-inner">
          <div className="bg-white/30 p-3 md:p-5 rounded-full backdrop-blur-md shadow-lg border border-white/50 group-hover:scale-110 transition-transform duration-300">
             <Heart className="w-6 h-6 md:w-10 md:h-10 text-white fill-white animate-heart-beat" />
          </div>
          <div className="absolute bottom-2 md:bottom-4 text-[8px] md:text-[10px] font-bold text-white/60 tracking-widest uppercase">
            Couple Match
          </div>
        </div>

        {/* Card Front (Revealed) */}
        <div className={clsx(
          "card-face card-front border-2 md:border-4 flex flex-col overflow-hidden",
          colorClass
        )}>
          {/* Top visual area with Image */}
          <div className="w-full h-1/3 md:h-2/5 relative overflow-hidden">
            <img 
              src={imageUrl} 
              alt={type}
              className="w-full h-full object-cover opacity-80"
            />
            <div className={clsx("absolute inset-0 bg-gradient-to-t opacity-40", gradientClass)} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
            </div>
          </div>
          
          {/* Content area */}
          <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-3 text-center bg-white/50 backdrop-blur-sm">
            <p className="text-[8px] md:text-xs font-handwriting leading-tight md:leading-relaxed text-gray-700 line-clamp-3 md:line-clamp-4 font-bold px-1">
              {content}
            </p>
          </div>
          
          {/* Footer info */}
          <div className="pb-1 md:pb-2 px-1 md:px-2">
            <span className={clsx(
              "px-2 md:px-3 py-0.5 rounded-full text-[6px] md:text-[8px] font-black uppercase tracking-tighter shadow-sm",
              gradientClass, "text-white"
            )}>
              {type}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}