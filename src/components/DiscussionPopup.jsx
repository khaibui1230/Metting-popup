import React, { useState, useEffect } from 'react';
import { Timer, SkipForward, CheckCircle, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscussionPopup({ prompt, isOpen, onClose, onDone, onSkip }) {
  const [timeLeft, setTimeLeft] = useState(prompt?.estimated_minutes * 60 || 180);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (prompt?.estimated_minutes) {
      setTimeLeft(prompt.estimated_minutes * 60);
    }
    setIsActive(false);
  }, [prompt]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsActive(true);

  if (!isOpen) return null;

  const isSpicy = prompt.level === 'spicy' || prompt.level === 'spicy-duo' || prompt.type === 'sex';
  const themeColor = isSpicy ? 'red-600' : 
                    prompt.type === 'career' ? 'slate-600' :
                    prompt.type === 'friendship' ? 'cyan-600' :
                    prompt.type === 'love' ? 'pink-600' : 'pastel-pink-deep';
  
  const bgColor = isSpicy ? 'red-50' : 
                 prompt.type === 'career' ? 'slate-50' :
                 prompt.type === 'friendship' ? 'cyan-50' :
                 prompt.type === 'love' ? 'pink-50' : 'pastel-pink/30';
  
  const borderColor = isSpicy ? 'red-500' : 
                    prompt.type === 'career' ? 'slate-400' :
                    prompt.type === 'friendship' ? 'cyan-400' :
                    prompt.type === 'love' ? 'pink-400' : 'pastel-pink';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] border-4 md:border-8 border-${borderColor}`}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 md:top-6 md:right-6 z-10 p-1.5 md:p-2 text-gray-400 hover:text-gray-600 transition-colors bg-white/80 rounded-full shadow-sm"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <CheckCircle className={`w-20 h-20 md:w-32 md:h-32 text-${themeColor}`} />
          </div>

          <div className="p-6 md:p-10 text-center">
            <div className={`inline-block px-4 md:px-5 py-1 md:1.5 mb-4 md:6 text-[10px] md:text-xs font-black tracking-widest text-white uppercase rounded-full bg-${themeColor} shadow-md`}>
              {prompt.type} {isSpicy && '🔥'}
            </div>

            <h2 className={`mb-4 md:8 text-xl md:3xl font-bold text-gray-800 md:text-4xl font-handwriting leading-tight`}>
              "{prompt.content}"
            </h2>

            {prompt.hint && (
              <p className={`mb-6 md:10 text-sm md:text-base italic text-gray-600 bg-gray-50 p-4 md:5 rounded-xl md:2xl border-l-4 md:border-l-8 border-${themeColor} shadow-inner`}>
                Gợi ý: {prompt.hint}
              </p>
            )}

            {/* Timer Section */}
            <div className={`flex flex-col items-center justify-center p-4 md:8 mb-6 md:10 rounded-2xl md:3xl bg-${bgColor} border-2 border-white shadow-lg`}>
              <div className={`flex items-center gap-3 md:4 mb-2 md:3 text-${themeColor}`}>
                <Timer className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                <span className="text-xl md:text-3xl font-mono font-black tracking-[0.1em] md:tracking-[0.2em]">
                  {formatTime(timeLeft)}
                </span>
              </div>
              {!isActive && timeLeft > 0 && (
                <button
                  onClick={startTimer}
                  className={`flex items-center gap-2 px-4 md:6 py-2 md:3 rounded-full bg-white text-${themeColor} font-bold text-xs md:text-sm shadow-md hover:scale-105 transition-transform`}
                >
                  <Play className="w-3 h-3 md:w-4 md:h-4 fill-current" /> Bắt đầu thảo luận
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={onSkip}
                className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl md:2xl bg-gray-100 text-gray-500 font-bold text-sm md:text-base hover:bg-gray-200 transition-colors"
              >
                <SkipForward className="w-4 h-4 md:w-5 md:h-5" /> Bỏ qua
              </button>
              <button
                onClick={onDone}
                className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl md:2xl bg-${themeColor} text-white font-bold text-sm md:text-base shadow-lg hover:opacity-90 transition-opacity`}
              >
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> Hoàn thành
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
