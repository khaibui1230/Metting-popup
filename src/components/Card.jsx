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
  question: 'text-rose-600',
  scenario: 'text-blue-600',
  action: 'text-amber-600',
  compliment: 'text-purple-600',
  fun: 'text-emerald-600',
  value: 'text-orange-600',
  spicy: 'text-red-700',
  career: 'text-slate-600',
  friendship: 'text-cyan-600',
  love: 'text-pink-600',
  sex: 'text-rose-700',
  solo: 'text-indigo-600',
  healing: 'text-teal-600',
  position: 'text-indigo-600',
  default: 'text-gray-500',
};

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

const typeBgColors = {
  question: 'bg-rose-50',
  scenario: 'bg-blue-50',
  action: 'bg-amber-50',
  compliment: 'bg-purple-50',
  fun: 'bg-emerald-50',
  value: 'bg-orange-50',
  spicy: 'bg-red-50',
  career: 'bg-slate-50',
  friendship: 'bg-cyan-50',
  love: 'bg-pink-50',
  sex: 'bg-rose-50',
  solo: 'bg-indigo-50',
  healing: 'bg-teal-50',
  position: 'bg-indigo-50',
  default: 'bg-gray-50',
};

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

export default function Card({ cardUniqueKey, type, content, isMatched, onClick, disabled, isLarge = false }) {
  const Icon = icons[type] || icons.default;
  const colorClass = typeColors[type] || typeColors.default;
  const gradientClass = typeGradients[type] || typeGradients.default;
  const bgColor = typeBgColors[type] || typeBgColors.default;
  const imageUrl = `${typeImages[type] || typeImages.default}&sig=${cardUniqueKey}`;

  return (
    <div 
      className={twMerge(
        "group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-500 ease-out border border-white/50",
        isLarge ? "h-[300px] sm:h-[400px] md:h-[480px]" : "h-40 sm:h-52 md:h-64",
        !disabled && "hover:shadow-2xl hover:-translate-y-2 cursor-pointer active:scale-95",
        isMatched && "opacity-50 grayscale scale-95 pointer-events-none"
      )}
      onClick={() => !disabled && onClick()}
    >
      {/* Decorative Gradient Overlay (Visible on Hover) */}
      <div className={clsx(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
        gradientClass
      )} />

      {/* Visual Header */}
      <div className={clsx(
        "relative w-full overflow-hidden flex-shrink-0",
        isLarge ? "h-32 sm:h-48 md:h-56" : "h-14 sm:h-20 md:h-24"
      )}>
        <img 
          src={imageUrl} 
          alt={type}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className={clsx(
          "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60",
          gradientClass
        )} />
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
          <div className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/20 border border-white/30 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg"
          )}>
            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            {type}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 p-4 opacity-20 transform translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500">
           <Icon className="w-24 h-24 sm:w-32 sm:h-32 text-white" />
        </div>
      </div>

      {/* Card Content */}
      <div className={clsx(
        "flex-1 flex flex-col items-center justify-center p-5 sm:p-8 md:p-10 text-center relative",
        bgColor
      )}>
        {/* Quote marks */}
        <div className={clsx("absolute top-4 left-4 opacity-10", colorClass)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017C10.4647 13 10.017 12.5523 10.017 12V9C10.017 6.79086 11.8079 5 14.017 5H19.017C21.2261 5 23.017 6.79086 23.017 9V15C23.017 18.3137 20.3307 21 17.017 21H14.017ZM1.017 21L1.017 18C1.017 16.8954 1.91243 16 3.017 16H6.017C6.56928 16 7.017 15.5523 7.017 15V9C7.017 8.44772 6.56928 8 6.017 8H2.017C1.46472 8 1.017 8.44772 1.017 9V12C1.017 12.5523 0.569282 13 0.017 13H-1.983C-2.53528 13 -2.983 12.5523 -2.983 12V9C-2.983 6.79086 -1.19214 5 1.017 5H6.017C8.22614 5 10.017 6.79086 10.017 9V15C10.017 18.3137 7.33072 21 4.017 21H1.017Z" /></svg>
        </div>

        <h4 className={clsx(
          "font-handwriting font-bold leading-tight text-gray-800 transition-colors duration-300",
          isLarge ? "text-xl sm:text-3xl md:text-4xl" : "text-sm sm:text-xl md:text-2xl"
        )}>
          {content}
        </h4>
        
        <div className={clsx(
          "mt-6 sm:mt-8 w-12 sm:w-16 h-1 rounded-full opacity-20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500",
          gradientClass.split(' ')[1] // Get the 'to-...' color
        )} />
      </div>

      {/* Select button (Mobile only or visible on hover) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
         <span className={clsx(
           "px-4 py-2 rounded-full text-[10px] font-bold text-white shadow-lg",
           gradientClass
         )}>
           Chọn chủ đề này
         </span>
      </div>
    </div>
  );
}
