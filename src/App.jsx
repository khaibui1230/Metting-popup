import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import DiscussionPopup from './components/DiscussionPopup';
import { Heart, Trophy, RefreshCw, ChevronRight, Info, Play, User, Users, CalendarHeart, Flame, Zap, Briefcase, UserPlus, ArrowLeft, Music } from 'lucide-react';
import database from './database.json';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const MODES = [
  { id: 'co-op', icon: Users, label: 'Co-op Mode', description: 'Hai người cùng nhau lật thẻ và trò chuyện.' },
  { id: 'solo', icon: User, label: 'Solo Reflection', description: 'Tự suy nghĩ và ghi chú cảm xúc.' },
  { id: 'date-night', icon: CalendarHeart, label: 'Date Night', description: 'Chủ đề trò chuyện sâu và ý nghĩa.' },
  { id: 'spicy', icon: Flame, label: 'Spicy 18+', description: 'Tăng nhiệt cho mối quan hệ với các thử thách táo bạo.' },
  { id: 'instant-spicy', icon: Zap, label: 'Spicy Secret', description: 'Bốc thẻ nào - Làm ngay việc đó (Chỉ dành cho 18+).' },
  { id: 'spicy-duo', icon: Heart, label: 'Spicy Duo', description: 'Thử thách bắt buộc cho cả hai người (18+).' },
  { id: 'deep-talk', icon: Music, label: 'Deep Talk', description: '50 câu hỏi chữa lành và thấu hiểu dành cho cặp đôi.' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', grid: '4x4', pairs: 8, level: 'icebreaker' },
  { id: 'medium', label: 'Medium', grid: '6x4', pairs: 12, level: 'medium' },
  { id: 'hard', label: 'Hard', grid: '6x6', pairs: 18, level: 'deep' },
];

export default function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'finished'
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [mode, setMode] = useState(MODES[0]);
  const [prompts, setPrompts] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [stats, setStats] = useState({ moves: 0, completed: 0, points: 0, time: 0 });
  const [timerInterval, setTimerInterval] = useState(null);

  const startGame = () => {
    if (timerInterval) clearInterval(timerInterval);
    
    let pairsCount = difficulty.pairs;
    let levelFilter = [difficulty.level];

    // Handle Date Night Mode specifically
    if (mode.id === 'date-night') {
      pairsCount = 8; // Consistent count
      levelFilter = ['medium', 'deep']; 
    }

    // Handle Spicy Mode
    if (mode.id === 'spicy' || mode.id === 'instant-spicy' || mode.id === 'spicy-duo') {
      pairsCount = difficulty.pairs;
      levelFilter = ['spicy', 'spicy-duo'];
    }

    // Handle Solo Mode
    if (mode.id === 'solo') {
      pairsCount = difficulty.pairs;
      levelFilter = ['solo', 'icebreaker', 'medium', 'deep']; 
    }

    // Handle Deep Talk Mode
    if (mode.id === 'deep-talk') {
      pairsCount = difficulty.pairs;
      levelFilter = ['deep-connection'];
    }

    // Select random prompts based on difficulty and mode
    const filtered = database.prompts.filter(p => {
      if (mode.id === 'deep-talk') {
        return p.level === 'deep-connection';
      }
      if (mode.id === 'spicy' || mode.id === 'instant-spicy' || mode.id === 'spicy-duo') {
        if (mode.id === 'spicy-duo') return p.level === 'spicy-duo';
        return p.level === 'spicy';
      }
      if (mode.id === 'solo') {
        return p.level === 'solo' || p.level === difficulty.level;
      }
      if (mode.id === 'date-night') {
        return levelFilter.includes(p.level);
      }
      return p.level === difficulty.level || (difficulty.id === 'hard' && p.level === 'deep');
    });

    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, pairsCount);
    
    setPrompts(selected);
    setGameState('playing');
    setStats({ moves: 0, completed: 0, points: 0, time: 0 });
    
    const interval = setInterval(() => {
      setStats(prev => ({ ...prev, time: prev.time + 1 }));
    }, 1000);
    setTimerInterval(interval);
  };

  const handleMatch = (prompt) => {
    setActivePrompt(prompt);
  };

  const finishDiscussion = (isSkipped = false) => {
    if (!isSkipped) {
      setStats(prev => ({ 
        ...prev, 
        completed: prev.completed + 1,
        points: prev.points + 10 
      }));
    }
    setActivePrompt(null);
  };

  const endGame = (moves) => {
    clearInterval(timerInterval);
    setStats(prev => ({ ...prev, moves }));
    setGameState('finished');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F8BBD0', '#FCE4EC', '#FFF9E3']
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetGame = () => {
    clearInterval(timerInterval);
    setGameState('menu');
    setActivePrompt(null);
  };

  return (
    <div className="min-h-screen font-sans">
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6 py-12 text-center"
          >
            <div className="mb-8 inline-block">
               <Heart className="w-20 h-20 text-pastel-pink-deep mx-auto animate-heart-beat fill-pastel-pink-deep" />
            </div>
            <h1 className="text-3xl md:text-5xl font-handwriting font-bold text-gray-800 mb-4">
              Couple Connection
            </h1>
            <p className="text-gray-500 mb-8 md:12 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
              Trò chơi lật hình giúp bạn và người ấy thấu hiểu nhau hơn qua từng mảnh ghép cảm xúc.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-left">
              {/* Difficulty Selection */}
              <div>
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-pastel-pink-deep mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Mức độ thử thách
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d)}
                      className={`w-full p-3 md:p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        difficulty.id === d.id 
                        ? 'border-pastel-pink-deep bg-pastel-pink/20 shadow-sm' 
                        : 'border-transparent bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 text-sm md:text-base">{d.label}</span>
                        <span className="text-[10px] md:text-xs text-gray-400">{d.grid} - {d.pairs} pairs</span>
                      </div>
                      {difficulty.id === d.id && <div className="w-2 h-2 rounded-full bg-pastel-pink-deep" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-pastel-pink-deep mb-4 flex items-center gap-2">
                  <Play className="w-4 h-4" /> Chế độ chơi
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {MODES.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMode(m)}
                        className={`w-full p-3 md:p-4 rounded-2xl border-2 transition-all flex items-center gap-3 md:gap-4 ${
                          mode.id === m.id 
                          ? 'border-pastel-pink-deep bg-pastel-pink/20 shadow-sm' 
                          : 'border-transparent bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${mode.id === m.id ? 'bg-pastel-pink-deep text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <Icon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-gray-700 text-sm md:text-base">{m.label}</span>
                          <span className="text-[10px] md:text-xs text-gray-400">{m.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="mt-12 md:mt-16 px-8 md:px-12 py-4 md:py-5 bg-pastel-pink-deep text-white rounded-full font-bold text-lg md:text-xl shadow-xl hover:bg-pink-400 hover:shadow-pink-200 transition-all flex items-center gap-3 mx-auto group"
            >
              Bắt đầu trò chơi
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto py-8"
          >
            {/* HUD */}
            <div className="max-w-4xl mx-auto px-2 md:px-4 mb-4 md:mb-8 flex items-center justify-between bg-white/60 backdrop-blur-md p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border-2 border-white">
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={resetGame} 
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg md:rounded-xl transition-all font-bold text-[10px] md:text-sm"
                  title="Quay lại Menu"
                >
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Menu</span>
                </button>
                
                <button 
                  onClick={() => startGame()} 
                  className="p-1.5 md:p-2 hover:bg-white rounded-full text-gray-400 transition-colors"
                  title="Chơi lại ván mới"
                >
                  <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                
                <div className="h-6 md:h-8 w-[1px] bg-gray-200 mx-1 md:mx-2" />
                
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Thời gian</span>
                  <span className="text-sm md:text-xl font-mono font-bold text-gray-700">{formatTime(stats.time)}</span>
                </div>
              </div>
              
              <div className="flex gap-4 md:gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Moves</span>
                  <span className="text-sm md:text-xl font-bold text-gray-700">{stats.moves}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Points</span>
                  <span className="text-sm md:text-xl font-bold text-pastel-pink-deep">{stats.points}</span>
                </div>
              </div>
            </div>

            <Board 
              prompts={prompts} 
              onMatch={handleMatch} 
              gridConfig={difficulty.grid}
              onGameEnd={endGame}
              instantMode={mode.id === 'instant-spicy' || mode.id === 'solo' || mode.id === 'spicy-duo'}
            />

            <DiscussionPopup 
              prompt={activePrompt}
              isOpen={!!activePrompt}
              onClose={() => setActivePrompt(null)}
              onDone={() => finishDiscussion(false)}
              onSkip={() => finishDiscussion(true)}
            />
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto px-4 md:px-6 py-10 md:py-20 text-center"
          >
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl border-4 md:border-8 border-pastel-pink relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 md:h-2 bg-gradient-to-r from-pastel-pink to-pastel-pink-deep" />
              
              <Trophy className="w-12 h-12 md:w-20 md:h-20 text-pastel-gold mx-auto mb-4 md:6" />
              <h2 className="text-2xl md:text-4xl font-handwriting font-bold text-gray-800 mb-2">
                Chúc mừng hai bạn!
              </h2>
              <p className="text-sm md:text-base text-gray-500 mb-8 md:10">
                Hai bạn đã hoàn thành tất cả các mảnh ghép.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8 md:12">
                <div className="bg-pastel-cream p-3 md:p-6 rounded-2xl md:3xl border-2 border-white">
                  <span className="block text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Thời gian</span>
                  <span className="text-lg md:text-2xl font-bold text-gray-700">{formatTime(stats.time)}</span>
                </div>
                <div className="bg-pastel-pink/20 p-3 md:p-6 rounded-2xl md:3xl border-2 border-white">
                  <span className="block text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Points</span>
                  <span className="text-lg md:text-2xl font-bold text-pastel-pink-deep">{stats.points}</span>
                </div>
                <div className="bg-pastel-lavender/40 p-3 md:p-6 rounded-2xl md:3xl border-2 border-white">
                  <span className="block text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Moves</span>
                  <span className="text-lg md:text-2xl font-bold text-gray-700">{stats.moves}</span>
                </div>
                <div className="bg-pastel-soft/40 p-3 md:p-6 rounded-2xl md:3xl border-2 border-white">
                  <span className="block text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Prompts</span>
                  <span className="text-lg md:text-2xl font-bold text-gray-700">{stats.completed}</span>
                </div>
              </div>

              <button
                onClick={resetGame}
                className="w-full py-4 md:py-5 bg-pastel-pink-deep text-white rounded-xl md:rounded-2xl font-bold text-lg md:text-xl shadow-lg hover:bg-pink-400 transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-5 h-5 md:w-6 md:h-6" /> Chơi lại
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
