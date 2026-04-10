import React, { useState, useEffect } from 'react';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, RefreshCw, Sparkles, Smile, Laugh, Frown, Angry, HelpCircle as Thinking, Flame } from 'lucide-react';

const MOODS = [
  { id: 'happy', icon: Smile, emoji: '😊', label: 'Hạnh phúc' },
  { id: 'funny', icon: Laugh, emoji: '😂', label: 'Vui vẻ' },
  { id: 'sad', icon: Frown, emoji: '😢', label: 'Sâu lắng' },
  { id: 'angry', icon: Angry, emoji: '😡', label: 'Hóa giải' },
  { id: 'thinking', icon: Thinking, emoji: '🤔', label: 'Trăn trở' },
  { id: 'spicy', icon: Flame, emoji: '😏', label: 'Kịch tính' },
];

export default function Board({ prompts, onMatch, onGameEnd, mode, isVaultMode }) {
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState('selection'); // 'selection' or 'vault'

  // Initialize available prompts
  useEffect(() => {
    setAvailablePrompts([...prompts]);
    setCurrentOptions([]);
    setAnsweredCount(0);
    setView(isVaultMode ? 'vault' : 'selection');
  }, [prompts, isVaultMode]);

  const drawThree = () => {
    if (isProcessing || availablePrompts.length === 0) return;
    
    setIsProcessing(true);
    
    // Pick 3 random prompts from available ones
    const shuffled = [...availablePrompts].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(3, shuffled.length));
    
    setCurrentOptions(picked);
    setIsProcessing(false);
  };

  const handleVaultSelect = (moodId) => {
    if (isProcessing || availablePrompts.length === 0) return;
    setIsProcessing(true);

    // Find prompts with matching mood
    let matched = availablePrompts.filter(p => p.mood === moodId);
    
    // Fallback if no matching mood in current pool
    if (matched.length === 0) {
      matched = [...availablePrompts];
    }

    const shuffled = matched.sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(3, shuffled.length));
    
    setCurrentOptions(picked);
    setView('selection');
    setIsProcessing(false);
  };

  // Auto draw if currentOptions is empty and there are prompts left (and not in vault mode)
  useEffect(() => {
    if (!isVaultMode && availablePrompts.length > 0 && currentOptions.length === 0) {
      setTimeout(() => {
        drawThree();
      }, 300);
    } else if (availablePrompts.length === 0 && currentOptions.length === 0 && answeredCount > 0) {
      onGameEnd(answeredCount);
    }
  }, [availablePrompts, currentOptions, isVaultMode]);

  const handleSelect = (prompt) => {
    if (isProcessing) return;

    // Remove the selected prompt from available prompts
    setAvailablePrompts(prev => prev.filter(p => p.id !== prompt.id));
    
    // Clear current options for next round
    setCurrentOptions([]);
    
    setAnsweredCount(prev => prev + 1);
    
    // If in vault mode, go back to vault view for next round
    if (isVaultMode) {
      setView('vault');
    }
    
    onMatch(prompt);
  };

  const ModeIcon = mode?.icon || HelpCircle;

  return (
    <div className="flex flex-col items-center gap-6 md:gap-12 w-full max-w-7xl mx-auto px-4 py-6 md:py-12">
      {/* Header Info - More compact and modern */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white shadow-2xl w-full max-w-5xl text-center md:text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles className="w-32 h-32 text-pastel-pink-deep" />
        </div>
        
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-3 text-pastel-pink-deep mb-2">
            <div className="p-2 bg-pastel-pink-deep text-white rounded-2xl shadow-lg shadow-pink-100">
              <ModeIcon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="font-handwriting font-bold text-2xl md:text-4xl text-gray-800">{mode?.label || 'Game Mode'}</h3>
          </div>
          <p className="text-gray-500 text-sm md:text-lg italic max-w-md leading-relaxed">
            {isVaultMode && view === 'vault' 
              ? "Hãy chọn một biểu tượng cảm xúc đại diện cho tâm trạng hiện tại của hai bạn."
              : "Hãy cùng nhau chọn một trong ba chủ đề dưới đây để bắt đầu cuộc trò chuyện."}
          </p>
        </div>
        
        <div className="flex flex-row md:flex-col gap-3 md:gap-4 relative z-10">
          <div className="flex flex-col items-center md:items-end px-6 py-3 bg-white/80 rounded-2xl shadow-sm border border-gray-50 min-w-[140px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Câu hỏi còn lại</span>
            <span className="text-xl md:text-3xl font-black text-pastel-pink-deep">{availablePrompts.length}</span>
          </div>
          <div className="flex flex-col items-center md:items-end px-6 py-3 bg-green-50/80 rounded-2xl shadow-sm border border-green-100 min-w-[140px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-1">Đã trả lời</span>
            <span className="text-xl md:text-3xl font-black text-green-600">{answeredCount}</span>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="w-full flex flex-col items-center gap-8 md:gap-12">
         <h2 className="text-xl md:text-3xl font-handwriting font-bold text-gray-700 flex items-center gap-3 animate-pulse">
           <div className="w-8 h-[2px] bg-pastel-pink-deep" />
           {isVaultMode && view === 'vault' ? "The Vault - Chọn Tâm Trạng" : "Chọn 1 trong 3 chủ đề"}
           <div className="w-8 h-[2px] bg-pastel-pink-deep" />
         </h2>

         <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {isVaultMode && view === 'vault' ? (
              <motion.div 
                key="vault-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
              >
                {MOODS.map((mood, idx) => (
                  <motion.button
                    key={mood.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVaultSelect(mood.id)}
                    className="flex flex-col items-center gap-4 p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white shadow-xl hover:shadow-2xl transition-all group"
                  >
                    <div className="text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
                      {mood.emoji}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-pastel-pink-deep transition-colors">
                      {mood.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="selection-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-stretch justify-center"
              >
                {currentOptions.map((prompt, idx) => (
                  <motion.div
                    key={`option-${prompt.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.2 } }}
                    transition={{ 
                      delay: idx * 0.15,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20
                    }}
                    className="w-full h-full"
                  >
                    <Card
                      cardUniqueKey={`card-${prompt.id}`}
                      type={prompt.type}
                      content={prompt.content}
                      isMatched={false}
                      isLarge={true}
                      onClick={() => handleSelect(prompt)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Manual Refresh - Only in non-vault mode or when options are shown */}
      {(!isVaultMode || view === 'selection') && availablePrompts.length > 3 && (
        <button
          onClick={isVaultMode ? () => setView('vault') : drawThree}
          disabled={isProcessing}
          className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-gray-500 hover:text-pastel-pink-deep hover:shadow-xl hover:shadow-pink-100 transition-all shadow-lg text-base font-bold group border border-gray-100"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          {isVaultMode ? "Chọn tâm trạng khác" : "Đổi 3 chủ đề khác"}
        </button>
      )}
    </div>
  );
}
