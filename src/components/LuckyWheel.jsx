import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';

export default function LuckyWheel({ modes, onSelect, onClose }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();

  const triggerHaptic = (duration = 50) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(duration);
    }
  };

  const spin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    triggerHaptic(100);

    const spinDuration = 3;
    const extraSpins = 5;
    const randomDegree = Math.floor(Math.random() * 360);
    const totalDegree = extraSpins * 360 + randomDegree;

    await controls.start({
      rotate: totalDegree,
      transition: { duration: spinDuration, ease: "easeOut" }
    });

    triggerHaptic(200);

    // Calculate result
    const normalizedDegree = randomDegree % 360;
    const sliceDegree = 360 / modes.length;
    // Index calculation: wheel spins clockwise, pointer is at top (0 deg)
    // Degrees are measured counter-clockwise in CSS rotate usually, but here we just need relative
    const resultIndex = Math.floor(((360 - normalizedDegree) % 360) / sliceDegree);
    
    setTimeout(() => {
      onSelect(modes[resultIndex]);
      setIsSpinning(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 p-8 rounded-[3rem] border border-white/20 flex flex-col items-center gap-8 relative"
      >
        <h2 className="text-3xl font-handwriting font-bold text-white text-center">
          Vòng Quay Định Mệnh
        </h2>

        <div className="relative w-64 h-64 md:w-80 md:h-80">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="w-8 h-8 bg-yellow-400 rotate-45 rounded-sm shadow-lg border-2 border-white" />
          </div>

          {/* Wheel */}
          <motion.div 
            animate={controls}
            className="w-full h-full rounded-full border-8 border-white/30 shadow-2xl relative overflow-hidden bg-white"
          >
            {modes.map((m, i) => (
              <div 
                key={m.id}
                className="absolute top-0 left-0 w-full h-full"
                style={{ 
                  transform: `rotate(${i * (360 / modes.length)}deg)`,
                  transformOrigin: '50% 50%',
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((Math.PI * (360 / modes.length)) / 180)}% 0%)`
                }}
              >
                <div 
                  className={`w-full h-full flex items-start justify-center pt-8 ${i % 2 === 0 ? 'bg-pastel-pink' : 'bg-white'}`}
                >
                  <m.icon className="w-6 h-6 text-gray-800 -rotate-0" />
                </div>
              </div>
            ))}
            {/* Center point */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-inner z-10" />
          </motion.div>
        </div>

        <button
          onClick={spin}
          disabled={isSpinning}
          className={`px-12 py-4 rounded-full font-bold text-xl shadow-2xl transition-all flex items-center gap-3 active:scale-95 ${
            isSpinning ? 'bg-gray-400 text-white' : 'bg-yellow-400 text-gray-800 hover:bg-yellow-300'
          }`}
        >
          {isSpinning ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
          {isSpinning ? 'Đang quay...' : 'Quay ngay!'}
        </button>

        <button 
          onClick={onClose}
          className="text-white/50 hover:text-white font-bold text-sm underline"
        >
          Đóng lại
        </button>
      </motion.div>
    </div>
  );
}
