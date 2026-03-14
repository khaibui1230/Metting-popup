import React from 'react';
import { Heart, Star, Flower, Coffee, Music, Camera, Gift, MapPin, Flame, Briefcase, UserPlus, Sparkles, LifeBuoy, Zap } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const icons = {
  question: Heart,
  scenario: MapPin,
  action: Flame,
  compliment: Star,
  fun: Flower,
  value: Coffee,
  spicy: Flame,
  career: Briefcase,
  friendship: UserPlus,
  love: Heart,
  sex: Flame,
  solo: Sparkles,
  healing: LifeBuoy,
  position: Zap,
  default: Star,
};

const typeColors = {
  question: 'bg-rose-50 border-rose-200 text-rose-600',
  scenario: 'bg-blue-50 border-blue-200 text-blue-600',
  action: 'bg-amber-50 border-amber-200 text-amber-600',
  compliment: 'bg-purple-50 border-purple-200 text-purple-600',
  fun: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  value: 'bg-orange-50 border-orange-200 text-orange-600',
  spicy: 'bg-red-50 border-red-300 text-red-700',
  career: 'bg-slate-50 border-slate-200 text-slate-600',
  friendship: 'bg-cyan-50 border-cyan-200 text-cyan-600',
  love: 'bg-pink-50 border-pink-200 text-pink-600',
  sex: 'bg-rose-50 border-rose-300 text-rose-700',
  solo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
  healing: 'bg-teal-50 border-teal-200 text-teal-600',
  position: 'bg-indigo-50 border-indigo-200 text-indigo-600',
  default: 'bg-gray-50 border-gray-200 text-gray-500',
};

export default function Card({ cardUniqueKey, type, content, isFlipped, isMatched, onClick, disabled, isLarge = false }) {
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
    healing: 'from-teal-400 to-teal-600',
    position: 'from-purple-600 to-indigo-800',
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
    healing: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=300&h=200',
    position: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=300&h=200',
    default: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=300&h=200',
  };

  const imageUrl = `${typeImages[type] || typeImages.default}&sig=${cardUniqueKey}`;

  return (
    <div 
      className={twMerge(
        "card-container w-full transition-all duration-500 transform",
        isLarge ? "h-64 sm:h-80 md:h-96" : "h-28 sm:h-40 md:h-48 lg:h-56",
        !isFlipped && !isMatched && "hover:scale-105 hover:-translate-y-1",
        isMatched && "opacity-90 scale-95"
      )}
      onClick={() => !disabled && !isFlipped && !isMatched && onClick()}
    >
      <div className={clsx(
        "card-inner shadow-md sm:shadow-lg md:shadow-xl rounded-lg sm:rounded-xl md:rounded-2xl", 
        isFlipped && "is-flipped",
        isMatched && "ring-2 md:ring-4 ring-pastel-pink-deep ring-offset-1 md:ring-offset-4"
      )}>
        {/* Front of card (Icon/Pattern) */}
        <div className="card-face card-front bg-white border border-gray-100 overflow-hidden">
          <div className={clsx(
            "absolute inset-0 bg-gradient-to-br opacity-10",
            gradientClass
          )} />
          <div className="flex flex-col items-center justify-center h-full p-2 md:p-4 text-center">
            <div className={clsx(
              "p-2 md:p-4 rounded-full mb-1 md:mb-3 shadow-inner",
              colorClass
            )}>
              <Icon className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </div>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-gray-400">
              Connection
            </span>
          </div>
        </div>

        {/* Back of card (Content) */}
        <div className={clsx(
          "card-face card-back border-2 overflow-hidden flex flex-col",
          colorClass
        )}>
          {/* Visual Area (Top half on large, smaller on normal) */}
          <div className={clsx(
            "relative w-full overflow-hidden flex-shrink-0",
            isLarge ? "h-24 sm:h-32 md:h-40" : "h-10 sm:h-16 md:h-20"
          )}>
            <img 
              src={imageUrl} 
              alt={type}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className={clsx(
              "absolute inset-0 bg-gradient-to-t opacity-40",
              gradientClass
            )} />
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
              <Icon className="w-3 h-3 sm:w-5 sm:h-5 text-white drop-shadow-md" />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 text-center overflow-hidden">
            <h4 className={clsx(
              "font-handwriting font-bold leading-tight line-clamp-3 md:line-clamp-4",
              isLarge ? "text-base sm:text-xl md:text-2xl" : "text-[9px] sm:text-xs md:text-sm"
            )}>
              {content}
            </h4>
            {isLarge && (
              <div className="mt-2 md:mt-4 w-8 md:w-12 h-0.5 md:h-1 bg-current opacity-20 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}