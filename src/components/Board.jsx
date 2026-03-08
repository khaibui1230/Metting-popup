import React, { useState, useEffect } from 'react';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';

export default function Board({ prompts, onMatch, gridConfig, onGameEnd, instantMode }) {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [moves, setMoves] = useState(0);

  // Initialize cards
  useEffect(() => {
    // If instantMode, we don't need pairs
    const dataToShuffle = instantMode 
      ? prompts.map((p, index) => ({ ...p, uniqueId: `${p.id}-${index}` }))
      : [...prompts, ...prompts].map((p, index) => ({
          ...p,
          uniqueId: `${p.id}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        }));
    
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
    setFlippedCards([]);
  }, [prompts, instantMode]);

  const handleCardClick = (card) => {
    if (isProcessing || flippedCards.some(f => f.uniqueId === card.uniqueId) || matchedIds.includes(card.uniqueId)) return;

    if (instantMode) {
      setMatchedIds([...matchedIds, card.uniqueId]);
      onMatch(card);
      return;
    }

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsProcessing(true);
      
      const [first, second] = newFlipped;
      if (first.id === second.id) {
        // Match!
        setTimeout(() => {
          setMatchedIds([...matchedIds, first.uniqueId, second.uniqueId]);
          setFlippedCards([]);
          setIsProcessing(false);
          onMatch(first); // Trigger the discussion popup
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
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
    if (count === 8) return 'grid-cols-2 md:grid-cols-4'; // Easy: 8 cards -> 2x4 on mobile, 4x2 on desktop
    if (count === 12) return 'grid-cols-3 md:grid-cols-4'; // 12 cards
    if (count === 16) return 'grid-cols-3 md:grid-cols-4';
    if (count === 24) return 'grid-cols-4 md:grid-cols-6';
    if (count === 36) return 'grid-cols-4 md:grid-cols-6';
    return gridClasses[gridConfig] || 'grid-cols-2 md:grid-cols-4';
  };

  return (
    <div className={`grid gap-2 md:gap-4 p-2 md:p-4 mx-auto max-w-6xl ${getGridCols()}`}>
      <AnimatePresence>
        {cards.map((card) => (
          <motion.div
            key={card.uniqueId}
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              cardUniqueKey={card.uniqueId}
              type={card.type}
              content={card.content}
              isFlipped={flippedCards.some(f => f.uniqueId === card.uniqueId) || matchedIds.includes(card.uniqueId)}
              isMatched={matchedIds.includes(card.uniqueId)}
              onClick={() => handleCardClick(card)}
              disabled={isProcessing}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
