import React, { useState, useEffect } from 'react';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, HelpCircle } from 'lucide-react';

export default function Board({ prompts, onMatch, gridConfig, onGameEnd, mode, choiceMode }) {
  const [cards, setCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moves, setMoves] = useState(0);
  const [choosingIds, setChoosingIds] = useState([]);

  // Initialize cards
  useEffect(() => {
    // All modes now use unique cards
    const dataToShuffle = prompts.map((p, index) => ({ ...p, uniqueId: `${p.id}-${index}` }));
    
    // Proper Fisher-Yates shuffle
    const shuffle = (array) => {
      let currentIndex = array.length, randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }
      return array;
    };

    setCards(shuffle([...dataToShuffle]));
    setMatchedIds([]);
    setChoosingIds([]);
  }, [prompts]);

  const drawThree = () => {
    if (isProcessing) return;
    const unrevealed = cards.filter(c => !matchedIds.includes(c.uniqueId));
    if (unrevealed.length === 0) return;
    
    setIsProcessing(true);
    
    const count = Math.min(3, unrevealed.length);
    const shuffled = [...unrevealed].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count);
    
    setChoosingIds(picked.map(p => p.uniqueId));
    setIsProcessing(false);
  };

  const handleCardClick = (card) => {
    if (isProcessing || matchedIds.includes(card.uniqueId)) return;

    if (choosingIds.length === 0) {
      drawThree();
      return;
    }
    
    if (!choosingIds.includes(card.uniqueId)) return;
    
    setMoves(prev => prev + 1);
    setMatchedIds([...matchedIds, card.uniqueId]);
    setChoosingIds([]);
    onMatch(card);
  };

  useEffect(() => {
    if (cards.length > 0 && matchedIds.length === cards.length) {
      setTimeout(() => {
        onGameEnd(moves);
      }, 1000);
    }
  }, [matchedIds, cards.length, moves, onGameEnd]);

  const gridClasses = {
    '4x4': 'grid-cols-4',
    '6x4': 'grid-cols-4 md:grid-cols-6',
    '6x6': 'grid-cols-6',
  };

  // Determine grid based on card count if not explicit
  const getGridCols = () => {
    const count = cards.length;
    if (count === 8) return 'grid-cols-2 sm:grid-cols-4'; 
    if (count === 12) return 'grid-cols-3 sm:grid-cols-4'; 
    if (count === 16) return 'grid-cols-4';
    if (count === 24) return 'grid-cols-4 md:grid-cols-6';
    if (count === 36) return 'grid-cols-4 md:grid-cols-6';
    return gridClasses[gridConfig] || 'grid-cols-2 md:grid-cols-4';
  };

  const ModeIcon = mode?.icon || HelpCircle;

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full">
      <div className="flex flex-col items-center gap-3 md:gap-4 bg-white/40 backdrop-blur-md p-4 md:p-6 rounded-2xl md:3xl border border-white shadow-xl max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-2 md:gap-3 text-pastel-pink-deep mb-1">
          <ModeIcon className="w-5 h-5 md:w-6 md:h-6" />
          <h3 className="font-bold text-base md:text-lg">{mode?.label || 'Game Mode'}</h3>
        </div>
        <p className="text-gray-600 text-[10px] md:text-sm text-center italic leading-relaxed px-2">
          "Khi sẵn sàng, hãy nhấn nút dưới đây hoặc chọn một thẻ bất kỳ để lật 3 thẻ ngẫu nhiên. Hai bạn hãy chọn 1 thẻ muốn chia sẻ nhất."
        </p>
        <button
          onClick={drawThree}
          disabled={isProcessing || choosingIds.length > 0}
          className={`flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl md:2xl font-black text-xs md:text-base text-white transition-all shadow-lg active:scale-95 ${
            choosingIds.length > 0 
            ? 'bg-gray-300 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-r from-pastel-pink-deep to-pink-400 hover:shadow-pink-200'
          }`}
        >
          <Zap className={`w-4 h-4 md:w-5 md:h-5 ${choosingIds.length === 0 && 'animate-pulse'}`} />
          Lật 3 thẻ ngẫu nhiên
        </button>
        
        {choosingIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-pink-600 font-bold text-[10px] md:text-sm animate-bounce mt-1 md:2"
          >
            ↓ Hãy chọn 1 thẻ bên dưới ↓
          </motion.div>
        )}
      </div>

      <div className={`grid gap-2 md:gap-4 p-2 md:p-4 mx-auto max-w-6xl w-full ${getGridCols()}`}>
        <AnimatePresence>
          {cards.map((card) => {
            const isBeingChosen = choosingIds.includes(card.uniqueId);
            return (
              <motion.div
                key={card.uniqueId}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  filter: (choosingIds.length > 0 && !isBeingChosen) ? 'grayscale(0.5) blur(2px)' : 'none'
                }}
                transition={{ duration: 0.3 }}
                className={isBeingChosen ? 'z-0' : 'z-0'}
              >
                <Card
                  cardUniqueKey={card.uniqueId}
                  type={card.type}
                  content={card.content}
                  isFlipped={matchedIds.includes(card.uniqueId) || isBeingChosen}
                  isMatched={matchedIds.includes(card.uniqueId)}
                  onClick={() => handleCardClick(card)}
                  disabled={isProcessing || (choosingIds.length > 0 && !isBeingChosen)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Choice Overlay for all modes */}
      <AnimatePresence>
        {choosingIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8"
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-6 md:mb-12 px-4"
            >
              <h3 className="text-white text-xl md:text-4xl font-handwriting font-bold mb-2">
                {mode?.label}: Chọn 1 chủ đề
              </h3>
              <p className="text-pastel-pink text-[11px] md:text-base italic">
                Cùng nhau xem qua và chọn chủ đề hai bạn muốn khám phá ngay bây giờ
              </p>
            </motion.div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-5xl items-center justify-center">
              {cards.filter(c => choosingIds.includes(c.uniqueId)).map((card, idx) => (
                <motion.div
                  key={`choice-${card.uniqueId}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="w-full max-w-[280px] md:max-w-xs cursor-pointer active:scale-95 transition-transform"
                  onClick={() => handleCardClick(card)}
                >
                  <Card
                    cardUniqueKey={card.uniqueId}
                    type={card.type}
                    content={card.content}
                    isFlipped={true}
                    isLarge={true}
                    onClick={() => handleCardClick(card)}
                  />
                </motion.div>
              ))}
            </div>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setChoosingIds([])}
              className="mt-8 md:mt-12 px-6 md:px-8 py-2 md:py-3 text-white/60 hover:text-white text-xs md:text-sm font-bold flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" /> Quay lại bàn chơi
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
