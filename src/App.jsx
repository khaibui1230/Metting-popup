import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import DiscussionPopup from './components/DiscussionPopup';
import LuckyWheel from './components/LuckyWheel';
import { Heart, Trophy, RefreshCw, ChevronRight, Info, Play, User, Users, CalendarHeart, Flame, Zap, Briefcase, UserPlus, ArrowLeft, Music, LifeBuoy, Sparkles, BookOpen, Save, Trash2, Settings, X } from 'lucide-react';
import database from './database.json';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateDatePlan } from './aiService';

const MODES = [
  { id: 'co-op', icon: Users, label: 'Co-op Mode', description: 'Hai người cùng nhau lật thẻ và trò chuyện.', theme: 'bg-pastel-pink/30', gradient: 'from-pink-100 to-rose-100' },
  { id: 'date-night', icon: CalendarHeart, label: 'Date Night', description: 'Chủ đề trò chuyện sâu và ý nghĩa.', theme: 'bg-indigo-900/10', gradient: 'from-indigo-200 to-purple-200' },
  { id: 'spicy-foreplay', icon: Sparkles, label: 'Dạo đầu', description: 'Nhẹ nhàng, mơn trớn và đánh thức cảm giác (18+).', theme: 'bg-red-500/10', gradient: 'from-orange-100 to-red-100' },
  { id: 'spicy-intense', icon: Flame, label: 'Nhập cuộc', description: 'Mạnh bạo, ra lệnh và những yêu cầu kịch tính (18+).', theme: 'bg-red-900/20', gradient: 'from-red-200 to-orange-200' },
  { id: 'deep-talk', icon: Music, label: 'Deep Talk', description: '50 câu hỏi chữa lành và thấu hiểu dành cho cặp đôi.', theme: 'bg-blue-500/10', gradient: 'from-blue-100 to-indigo-100' },
  { id: 'healing', icon: LifeBuoy, label: 'Healing Path', description: 'Kiến thức chữa lành và nhìn nhận lại mối quan hệ.', theme: 'bg-teal-500/10', gradient: 'from-teal-100 to-emerald-100' },
];

export default function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'finished', 'memories', 'insights'
  const [mode, setMode] = useState(MODES[0]);
  const [players, setPlayers] = useState({ me: '', partner: '' });
  const [activePlayer, setActivePlayer] = useState('me'); // 'me' or 'partner'
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [dateSuggestion, setDateSuggestion] = useState(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('gemini_api_key') || "");
  const [stats, setStats] = useState({ moves: 0, completed: 0, points: 0, time: 0 });
  const [timerInterval, setTimerInterval] = useState(null);
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem('couple_memories');
    return saved ? JSON.parse(saved) : [];
  });
  const [unfinishedQuestions, setUnfinishedBusiness] = useState(() => {
    const saved = localStorage.getItem('couple_unfinished');
    return saved ? JSON.parse(saved) : [];
  });
  const [loveInsights, setLoveInsights] = useState(() => {
    const saved = localStorage.getItem('couple_insights');
    return saved ? JSON.parse(saved) : { words: 0, service: 0, gifts: 0, time: 0, touch: 0 };
  });
  const [powerCards, setPowerCards] = useState({
    me: { pass: 2, askBack: 2 },
    partner: { pass: 2, askBack: 2 }
  });
  const [isVaultMode, setIsVaultMode] = useState(false);
  const [note, setNote] = useState('');

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const usePowerCard = (player, cardType) => {
    if (powerCards[player][cardType] > 0) {
      triggerHaptic();
      setPowerCards(prev => ({
        ...prev,
        [player]: { ...prev[player], [cardType]: prev[player][cardType] - 1 }
      }));
      return true;
    }
    return false;
  };

  const updateInsights = (language) => {
    if (!language) return;
    const updated = { ...loveInsights, [language]: loveInsights[language] + 1 };
    setLoveInsights(updated);
    localStorage.setItem('couple_insights', JSON.stringify(updated));
  };

  const skipQuestion = (prompt) => {
    triggerHaptic();
    const updated = [prompt, ...unfinishedQuestions].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    setUnfinishedBusiness(updated);
    localStorage.setItem('couple_unfinished', JSON.stringify(updated));
    setActivePrompt(null);
  };

  const removeUnfinished = (id) => {
    const updated = unfinishedQuestions.filter(q => q.id !== id);
    setUnfinishedBusiness(updated);
    localStorage.setItem('couple_unfinished', JSON.stringify(updated));
  };

  const saveMemory = () => {
    const newMemory = {
      id: Date.now(),
      date: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      mode: mode.label,
      completed: stats.completed,
      points: stats.points,
      note: note,
      players: players.me && players.partner ? `${players.me} & ${players.partner}` : 'Hai bạn'
    };
    const updatedMemories = [newMemory, ...memories];
    setMemories(updatedMemories);
    localStorage.setItem('couple_memories', JSON.stringify(updatedMemories));
    setNote('');
    // resetGame(); // Tạm thời bỏ chuyển về menu để hiện AI Planner
  };

  const handleGenerateSuggestion = async () => {
      if (!geminiApiKey) {
        alert("Vui lòng nhập Gemini API Key để sử dụng tính năng này!");
        return;
      }
      
      setIsGeneratingSuggestion(true);
      const suggestion = await generateDatePlan({
        mode,
        completedPrompts,
        stats
      }, geminiApiKey);
      setDateSuggestion(suggestion);
      setIsGeneratingSuggestion(false);
    };
    
    const saveApiKey = (key) => {
      setGeminiApiKey(key);
      localStorage.setItem('gemini_api_key', key);
    };

  const deleteMemory = (id) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    localStorage.setItem('couple_memories', JSON.stringify(updated));
  };

  const startGame = (selectedMode = null) => {
    triggerHaptic();
    if (timerInterval) clearInterval(timerInterval);
    
    // Update mode if passed directly (for quick entry)
    const activeMode = selectedMode || mode;
    if (selectedMode) setMode(selectedMode);

    // Reset power cards for new session
    setPowerCards({
      me: { pass: 2, askBack: 2 },
      partner: { pass: 2, askBack: 2 }
    });
    
    let levelFilter = [];

    // Filter based on mode
    if (activeMode.id === 'date-night') {
      levelFilter = ['medium', 'deep']; 
    } else if (activeMode.id === 'spicy-foreplay') {
      levelFilter = ['spicy-foreplay'];
    } else if (activeMode.id === 'spicy-intense') {
      levelFilter = ['spicy-intense'];
    } else if (activeMode.id === 'deep-talk') {
      levelFilter = ['deep-connection'];
    } else if (activeMode.id === 'healing') {
      levelFilter = ['healing'];
    } else if (activeMode.id === 'co-op') {
      levelFilter = ['icebreaker'];
    }

    // Select random prompts based on mode and time filter
    let filtered = database.prompts.filter(p => levelFilter.includes(p.level));
    
    if (isQuickMode) {
      filtered = filtered.filter(p => p.estimated_minutes <= 3);
    }

    setPrompts(filtered.sort(() => 0.5 - Math.random()));
    setGameState('playing');
    setStats({ moves: 0, completed: 0, points: 0, time: 0 });
    
    const interval = setInterval(() => {
      setStats(prev => ({ ...prev, time: prev.time + 1 }));
    }, 1000);
    setTimerInterval(interval);
  };

  const handleMatch = (prompt) => {
    triggerHaptic();
    // Inject player names if available
    let processedContent = prompt.content;
    if (players.me || players.partner) {
      const names = [players.me || 'Bạn', players.partner || 'Người ấy'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      processedContent = `${randomName} ơi, ${processedContent.charAt(0).toLowerCase()}${processedContent.slice(1)}`;
    }
    setActivePrompt({ ...prompt, displayContent: processedContent });
  };

  const finishDiscussion = (isSkipped = false) => {
    triggerHaptic();
    if (!isSkipped) {
      if (activePrompt?.language) {
        updateInsights(activePrompt.language);
      }
      setStats(prev => ({ 
        ...prev, 
        completed: prev.completed + 1,
        points: prev.points + 10 
      }));
      setActivePrompt(null);
      setActivePlayer(activePlayer === 'me' ? 'partner' : 'me');
    } else {
      skipQuestion(activePrompt);
      setActivePlayer(activePlayer === 'me' ? 'partner' : 'me');
    }
  };

  const endGame = (moves) => {
    triggerHaptic();
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
    triggerHaptic();
    clearInterval(timerInterval);
    setGameState('menu');
    setActivePrompt(null);
  };

  const activeThemeClass = (gameState === 'playing' || gameState === 'finished') ? mode.theme : 'bg-pastel-cream/30';
  const activeGradientClass = (gameState === 'playing' || gameState === 'finished') ? mode.gradient : 'from-pastel-cream to-white';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-1000 ${activeThemeClass} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className={`absolute inset-0 bg-gradient-to-br ${activeGradientClass} opacity-50 pointer-events-none`} />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-pastel-pink-deep rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-300 rounded-full blur-[100px]"
        />
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 text-center"
          >
            {/* Settings Button */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="absolute top-0 right-0 p-3 bg-white/80 rounded-full text-gray-400 hover:text-indigo-400 hover:rotate-90 transition-all shadow-sm z-20"
              title="Cài đặt"
            >
              <Settings className="w-6 h-6" />
            </button>

            <div className="mb-6 md:8 inline-block relative">
               <motion.div
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ duration: 2, repeat: Infinity }}
               >
                 <Heart className="w-16 h-16 md:w-20 md:h-20 text-pastel-pink-deep mx-auto fill-pastel-pink-deep drop-shadow-lg" />
               </motion.div>
               <motion.div 
                 animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
                 transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                 className="absolute -top-4 -right-4"
               >
                 <Sparkles className="w-6 h-6 text-yellow-400" />
               </motion.div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-handwriting font-bold text-gray-800 mb-2 md:4 px-2">
              Couple Connection
            </h1>
            <p className="text-gray-500 mb-6 md:12 max-w-lg mx-auto leading-relaxed text-[11px] md:text-base px-6">
              Khám phá tâm hồn đối phương qua những câu hỏi được chọn lọc. Mỗi lượt chơi, bạn sẽ chọn 1 trong 3 câu hỏi để cùng nhau chia sẻ.
            </p>

            {/* Top Actions */}
            <div className="flex justify-center gap-3 md:gap-4 mb-6 md:8">
              <button 
                onClick={() => setGameState('insights')}
                className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl border border-white shadow-lg text-gray-600 font-bold hover:bg-white transition-all active:scale-95 text-[10px] md:text-sm"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                Couple Insight
              </button>
              <button 
                onClick={() => setGameState('memories')}
                className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl border border-white shadow-lg text-gray-600 font-bold hover:bg-white transition-all active:scale-95 text-[10px] md:text-sm"
              >
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                Kỷ Niệm ({memories.length})
              </button>
            </div>

            {/* Personalization Section */}
            <div className="max-w-md mx-auto mb-8 md:10 bg-white/60 backdrop-blur-md p-4 md:6 rounded-2xl md:3xl border border-white shadow-xl">
              <h3 className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 md:4 flex items-center justify-center gap-2">
                <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Tùy chỉnh người chơi
              </h3>
              <div className="flex flex-col sm:flex-row gap-2.5 md:3">
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Tên của bạn..."
                    value={players.me}
                    onChange={(e) => setPlayers({ ...players, me: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white/80 border border-pastel-pink-deep/10 focus:outline-none focus:ring-2 focus:ring-pastel-pink-deep text-xs md:text-sm"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Tên người ấy..."
                    value={players.partner}
                    onChange={(e) => setPlayers({ ...players, partner: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white/80 border border-pastel-pink-deep/10 focus:outline-none focus:ring-2 focus:ring-pastel-pink-deep text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 md:gap-12 text-left px-2 max-w-2xl mx-auto">
              {/* Mode Selection */}
              <div className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-pastel-pink-deep flex items-center gap-2">
                      <Play className="w-3.5 h-3.5 md:w-4 md:h-4" /> Chọn chủ đề trò chuyện
                    </h3>
                    <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Mẹo: Chạm vào chủ đề để bắt đầu ngay
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Lucky Wheel Toggle */}
                    <button 
                      onClick={() => { triggerHaptic(); setIsWheelOpen(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all shadow-sm"
                    >
                      <RefreshCw className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      Vòng quay
                    </button>

                    {/* Quick Mode Toggle */}
                    <button 
                      onClick={() => { triggerHaptic(); setIsQuickMode(!isQuickMode); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${
                        isQuickMode ? 'bg-yellow-400 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Zap className={`w-2.5 h-2.5 md:w-3 md:h-3 ${isQuickMode && 'fill-white'}`} />
                      Nhanh {isQuickMode ? 'ON' : 'OFF'}
                    </button>

                    {/* Vault Mode Toggle */}
                    <button 
                      onClick={() => { triggerHaptic(); setIsVaultMode(!isVaultMode); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold transition-all ${
                        isVaultMode ? 'bg-indigo-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Sparkles className={`w-2.5 h-2.5 md:w-3 md:h-3 ${isVaultMode && 'fill-white'}`} />
                      The Vault {isVaultMode ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {MODES.map((m) => {
                    const Icon = m.icon;
                    return (
                      <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { triggerHaptic(); startGame(m); }}
                        className={`w-full p-3 md:p-6 rounded-2xl md:3xl border-2 transition-all flex items-center md:flex-col text-left md:text-center gap-3 md:gap-4 ${
                          mode.id === m.id 
                          ? 'border-pastel-pink-deep bg-pastel-pink/20 shadow-lg' 
                          : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
                        }`}
                      >
                        <div className={`p-2.5 md:p-4 rounded-xl md:2xl flex-shrink-0 ${mode.id === m.id ? 'bg-pastel-pink-deep text-white shadow-pink-200 shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                          <Icon className="w-5 h-5 md:w-8 md:h-8" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className={`font-bold text-xs md:text-lg ${mode.id === m.id ? 'text-gray-800' : 'text-gray-600'}`}>{m.label}</span>
                          <span className="text-[9px] md:text-xs text-gray-400 mt-0.5 line-clamp-1 md:line-clamp-2 leading-relaxed">{m.description}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button
                onClick={startGame}
                className="w-full md:w-auto px-12 md:px-20 py-4 md:py-6 bg-pastel-pink-deep text-white rounded-2xl md:rounded-full font-bold text-lg md:text-2xl shadow-2xl hover:bg-pink-400 hover:shadow-pink-200 transition-all flex items-center justify-center gap-4 mx-auto group active:scale-95"
              >
                Bắt đầu ngay
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="container mx-auto py-4 md:py-8 px-2 md:px-4 relative z-10"
          >
            {/* HUD */}
            <div className="max-w-4xl mx-auto mb-4 md:mb-8 flex items-center justify-between bg-white/60 backdrop-blur-xl p-2.5 md:p-6 rounded-xl md:rounded-3xl shadow-xl border border-white/50 sticky top-2 z-30">
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={resetGame} 
                  className="flex items-center gap-1 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-2 bg-white/80 hover:bg-white text-gray-600 rounded-lg md:rounded-xl shadow-sm transition-all font-bold text-[9px] md:text-sm active:scale-90"
                >
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Menu</span>
                </button>
                
                <div className="h-5 md:h-8 w-[1px] bg-gray-200 mx-1 md:mx-2" />
                
                <div className="flex flex-col">
                  <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Thời gian</span>
                  <span className="text-xs md:text-xl font-mono font-bold text-gray-700">{formatTime(stats.time)}</span>
                </div>
              </div>
              
              <div className="flex gap-3 md:gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Đã chọn</span>
                  <span className="text-xs md:text-xl font-bold text-gray-700">{stats.completed}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Points</span>
                  <span className="text-xs md:text-xl font-bold text-pastel-pink-deep">{stats.points}</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-6xl mx-auto pb-20 md:pb-0">
              <Board 
                prompts={prompts} 
                onMatch={handleMatch} 
                onGameEnd={endGame}
                mode={mode}
                isVaultMode={isVaultMode}
              />
            </div>

            <DiscussionPopup 
              prompt={activePrompt}
              isOpen={!!activePrompt}
              onClose={() => setActivePrompt(null)}
              onDone={() => finishDiscussion(false)}
              onSkip={() => finishDiscussion(true)}
              activePlayer={activePlayer}
              players={players}
              powerCards={powerCards}
              usePowerCard={usePowerCard}
              apiKey={geminiApiKey}
            />

            {isWheelOpen && (
              <LuckyWheel 
                modes={MODES} 
                onSelect={(m) => { setMode(m); setIsWheelOpen(false); triggerHaptic(); }} 
                onClose={() => setIsWheelOpen(false)}
              />
            )}
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            key="finished"
            initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-20 text-center relative z-10"
          >
            <div className="bg-white/80 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[3rem] p-5 md:p-12 shadow-2xl border-4 md:border-8 border-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-gradient-to-r from-pastel-pink via-pastel-pink-deep to-purple-300" />
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Trophy className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mx-auto mb-4 md:6 drop-shadow-lg" />
              </motion.div>
              
              <h2 className="text-xl md:text-4xl font-handwriting font-bold text-gray-800 mb-1 md:2 px-2">
                Chúc mừng {players.me || players.partner ? `${players.me} & ${players.partner}` : 'hai bạn'}!
              </h2>
              <p className="text-[11px] md:text-base text-gray-500 mb-6 md:10">
                Hai bạn đã cùng nhau tạo nên những khoảnh khắc thấu hiểu tuyệt vời.
              </p>

              <div className="grid grid-cols-2 gap-2.5 md:gap-6 mb-8 md:12 text-left">
                <div className="bg-white/50 p-3 md:p-6 rounded-2xl md:3xl border border-white shadow-sm">
                  <span className="block text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5 md:1">Thời gian</span>
                  <span className="text-sm md:text-2xl font-bold text-gray-700">{formatTime(stats.time)}</span>
                </div>
                <div className="bg-pastel-pink/20 p-3 md:p-6 rounded-2xl md:3xl border border-white shadow-sm">
                  <span className="block text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5 md:1">Điểm số</span>
                  <span className="text-sm md:text-2xl font-bold text-pastel-pink-deep">{stats.points}</span>
                </div>
              </div>

              {/* Memory Box Note */}
              <div className="mb-8 text-left">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <Save className="w-4 h-4 text-pastel-pink-deep" /> Lưu lại khoảnh khắc này
                </h3>
                <textarea 
                  placeholder="Hôm nay hai bạn cảm thấy thế nào? Có điều gì đáng nhớ không?..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-pastel-cream/30 border-2 border-white focus:outline-none focus:border-pastel-pink-deep transition-all text-sm italic min-h-[100px] resize-none shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={saveMemory}
                  disabled={memories.some(m => m.id > Date.now() - 5000)} // Chặn nhấn liên tục
                  className="flex-1 py-4 md:py-6 bg-pastel-pink-deep text-white rounded-2xl md:rounded-full font-bold text-lg md:text-xl shadow-xl hover:bg-pink-400 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" /> Lưu vào Hộp Kỷ Niệm
                </button>
                <button
                  onClick={resetGame}
                  className="py-4 px-8 md:py-6 bg-white text-gray-400 rounded-2xl md:rounded-full font-bold text-lg hover:bg-gray-50 transition-all active:scale-95 border border-gray-100"
                >
                  Quay lại
                </button>
              </div>

              {/* AI Date Planner Suggestion Section */}
              <AnimatePresence>
                {memories.some(m => m.id > Date.now() - 10000) && ( // Hiện sau khi vừa lưu memory
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-white shadow-xl relative overflow-hidden"
                  >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <Sparkles className="w-20 h-20 text-indigo-400" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                        AI Kế hoạch Hẹn hò
                      </div>
                      {!geminiApiKey && (
                        <div className="relative group/key">
                          <Info className="w-4 h-4 text-gray-300 hover:text-indigo-400 cursor-help" />
                          <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover/key:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                            Chưa thiết lập API Key
                          </div>
                        </div>
                      )}
                    </h3>

                    {!dateSuggestion ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-500 italic mb-6">
                          {geminiApiKey 
                            ? "Dựa trên cuộc trò chuyện tối nay, AI sẽ gợi ý cho hai bạn một kế hoạch hẹn hò tuyệt vời..."
                            : "Vui lòng vào phần Cài đặt ở Menu chính để thiết lập Gemini API Key trước khi sử dụng tính năng này."
                          }
                        </p>
                        {geminiApiKey ? (
                          <button
                            onClick={handleGenerateSuggestion}
                            disabled={isGeneratingSuggestion}
                            className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                          >
                            {isGeneratingSuggestion ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                AI đang suy nghĩ...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5" />
                                Khám phá ý tưởng từ AI
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              resetGame();
                              setIsSettingsOpen(true);
                            }}
                            className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
                          >
                            <Settings className="w-5 h-5" /> Thiết lập ngay
                          </button>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-left space-y-4"
                      >
                        <div className="bg-white/80 p-6 rounded-2xl border border-white shadow-sm">
                          <h4 className="text-indigo-600 font-black text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CalendarHeart className="w-4 h-4" />
                            {dateSuggestion.title}
                          </h4>
                          <p className="text-gray-800 font-medium text-lg leading-relaxed mb-4">
                            "{dateSuggestion.activity}"
                          </p>
                          <div className="pt-4 border-t border-dashed border-gray-100">
                            <p className="text-xs text-gray-500 italic leading-relaxed">
                              <span className="font-bold not-italic text-indigo-400">Tại sao:</span> {dateSuggestion.reason}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDateSuggestion(null)}
                          className="text-xs text-gray-400 hover:text-indigo-400 transition-colors font-medium mx-auto flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Gợi ý khác
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
        {gameState === 'insights' && (
          <motion.div 
            key="insights"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="container mx-auto py-8 px-4 max-w-4xl relative z-10"
          >
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setGameState('menu')}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl text-gray-600 font-bold shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
              <h2 className="text-3xl font-handwriting font-bold text-gray-800 text-center">Couple Insight</h2>
              <div className="w-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Love Language Radar Chart */}
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pastel-pink-deep fill-pastel-pink-deep" />
                  Ngôn ngữ Yêu thương
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'words', label: 'Lời nói yêu thương', color: 'bg-rose-400' },
                    { key: 'time', label: 'Thời gian chất lượng', color: 'bg-indigo-400' },
                    { key: 'service', label: 'Hành động giúp đỡ', color: 'bg-emerald-400' },
                    { key: 'gifts', label: 'Quà tặng ý nghĩa', color: 'bg-amber-400' },
                    { key: 'touch', label: 'Đụng chạm cơ thể', color: 'bg-red-400' }
                  ].map(lang => {
                    const total = Object.values(loveInsights).reduce((a, b) => a + b, 0) || 1;
                    const percentage = Math.round((loveInsights[lang.key] / total) * 100);
                    return (
                      <div key={lang.key}>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                          <span>{lang.label}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className={`h-full ${lang.color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-6 text-[10px] text-gray-400 italic text-center">
                  "Dựa trên các câu hỏi bạn đã chọn trả lời nhiều nhất."
                </p>
              </div>

              {/* Unfinished Business */}
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-xl flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Sau này hãy hỏi
                </h3>
                <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2 custom-scrollbar">
                  {unfinishedQuestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                      <Zap className="w-12 h-12 mb-2" />
                      <p className="text-sm italic">Chưa có câu hỏi nào bị bỏ qua.</p>
                    </div>
                  ) : (
                    unfinishedQuestions.map(q => (
                      <div key={q.id} className="p-3 bg-pastel-cream/30 rounded-xl border border-dashed border-pastel-cream group relative">
                        <p className="text-xs text-gray-700 font-medium pr-6">"{q.content}"</p>
                        <button 
                          onClick={() => removeUnfinished(q.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <p className="mt-4 text-[10px] text-gray-400 italic text-center">
                  "Những câu hỏi bạn đã bỏ qua sẽ nằm ở đây."
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'memories' && (
          <motion.div 
            key="memories"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="container mx-auto py-8 px-4 max-w-4xl relative z-10"
          >
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setGameState('menu')}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl text-gray-600 font-bold shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
              <h2 className="text-3xl font-handwriting font-bold text-gray-800">Hộp Kỷ Niệm</h2>
              <div className="w-20" /> {/* Spacer */}
            </div>

            {memories.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md p-12 rounded-[2rem] text-center border border-white">
                <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 italic">Chưa có kỷ niệm nào được lưu lại...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {memories.map((m) => (
                  <motion.div 
                    key={m.id}
                    layout
                    className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl flex flex-col md:flex-row gap-6 relative group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-pastel-pink/30 text-pastel-pink-deep rounded-full">
                          {m.mode}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">{m.date}</span>
                      </div>
                      <h4 className="font-bold text-gray-800 mb-2">{m.players}</h4>
                      {m.note && (
                        <p className="text-sm text-gray-600 italic leading-relaxed bg-pastel-cream/20 p-4 rounded-xl border border-dashed border-pastel-cream">
                          "{m.note}"
                        </p>
                      )}
                      <div className="mt-4 flex gap-4 text-[10px] font-bold text-gray-400">
                        <span>Đã trả lời: {m.completed} câu</span>
                        <span>Điểm số: {m.points}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteMemory(m.id)}
                      className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3 font-handwriting">
                <Settings className="w-6 h-6 text-indigo-400" />
                Cài đặt ứng dụng
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                    Gemini API Key (Dành cho AI Date Planner)
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      placeholder="Dán API Key của bạn vào đây..."
                      value={geminiApiKey}
                      onChange={(e) => saveApiKey(e.target.value)}
                      className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                    />
                    <Zap className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 ${geminiApiKey ? 'text-indigo-400' : 'text-gray-200'}`} />
                  </div>
                  <p className="mt-3 text-[10px] text-gray-400 px-1 leading-relaxed">
                    Lấy API Key miễn phí tại <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Google AI Studio</a>. Key này sẽ được lưu an toàn trên trình duyệt của bạn.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full py-4 bg-pastel-pink-deep text-white rounded-2xl font-bold shadow-lg hover:bg-pink-400 transition-all active:scale-95"
                  >
                    Lưu và Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
