import React, { useState, useEffect } from 'react';
import { Timer, SkipForward, CheckCircle, Play, X, Gift, AlertCircle, Zap, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAnswerHint } from '../aiService';

export default function DiscussionPopup({ 
  prompt, isOpen, onClose, onDone, onSkip, 
  activePlayer, players, powerCards, usePowerCard, 
  apiKey
}) {
  const [timeLeft, setTimeLeft] = useState(prompt?.estimated_minutes * 60 || 180);
  const [isActive, setIsActive] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [isAskBackUsed, setIsAskBackUsed] = useState(false);
  const [aiHint, setAiHint] = useState("");
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);

  const challenges = {
    normal: [
      "Ai trả lời xong trước được đối phương pha cho 1 ly nước cam/trà.",
      "Người trả lời sau phải massage vai cho người kia trong 2 phút.",
      "Cả hai cùng nắm tay nhau trong suốt quá trình thảo luận câu này.",
      "Người trả lời hay hơn được quyền yêu cầu đối phương làm 1 việc nhà.",
    ],
    spicy: [
      "Ai thua cuộc (trả lời ngắn hơn) phải cởi 1 chiếc tất.",
      "Người thắng được quyền yêu cầu đối phương hôn vào bất kỳ đâu.",
      "Người trả lời phải thì thầm vào tai đối phương trong suốt câu này.",
      "Hình phạt: Uống 1 ngụm đồ uống bất kỳ nếu ngập ngừng quá 5 giây.",
    ]
  };

  useEffect(() => {
    if (prompt?.estimated_minutes) {
      setTimeLeft(prompt.estimated_minutes * 60);
    }
    setIsActive(false);
    setIsAskBackUsed(false);

    // Random challenge logic (30% chance)
    if (isOpen && Math.random() < 0.3) {
      const isSpicy = prompt?.level?.startsWith('spicy-') || prompt?.type === 'sex';
      const pool = isSpicy ? challenges.spicy : challenges.normal;
      setChallenge(pool[Math.floor(Math.random() * pool.length)]);
    } else {
      setChallenge(null);
    }
  }, [prompt, isOpen]);

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

  const handlePassCard = () => {
    if (usePowerCard(activePlayer, 'pass')) {
      onSkip();
    }
  };

  const handleAskBackCard = () => {
    if (usePowerCard(activePlayer, 'askBack')) {
      setIsAskBackUsed(true);
    }
  };

  const handleGenerateHint = async () => {
    if (!apiKey) {
      alert("Vui lòng thiết lập Gemini API Key trong phần Cài đặt ở Menu chính!");
      return;
    }
    setIsGeneratingHint(true);
    const hint = await generateAnswerHint(prompt.content, apiKey);
    setAiHint(hint);
    setIsGeneratingHint(false);
  };

  if (!isOpen) return null;

  const isSpicy = prompt.level?.startsWith('spicy-') || prompt.type === 'sex';
  const themeColor = isSpicy ? 'red-600' : 
                    prompt.type === 'healing' ? 'cyan-600' :
                    prompt.type === 'value' ? 'slate-600' :
                    prompt.type === 'love' ? 'pink-600' : 'pastel-pink-deep';
  
  const colorMapping = {
    'red-600': { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-500', lightBg: 'bg-red-50' },
    'slate-600': { bg: 'bg-slate-600', text: 'text-slate-600', border: 'border-slate-400', lightBg: 'bg-slate-50' },
    'cyan-600': { bg: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-400', lightBg: 'bg-cyan-50' },
    'pink-600': { bg: 'bg-pink-600', text: 'text-pink-600', border: 'border-pink-400', lightBg: 'bg-pink-50' },
    'pastel-pink-deep': { bg: 'bg-pastel-pink-deep', text: 'text-pastel-pink-deep', border: 'border-pastel-pink', lightBg: 'bg-pastel-pink/30' }
  };

  const currentTheme = colorMapping[themeColor] || colorMapping['pastel-pink-deep'];
  const currentPlayerName = players[activePlayer] || (activePlayer === 'me' ? 'Bạn' : 'Người ấy');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] border-[3px] md:border-8 ${currentTheme.border} max-h-[90vh] flex flex-col`}
        >
          {/* Power Cards Status */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <div className={`px-3 py-1 rounded-full bg-white/90 shadow-sm border border-gray-100 flex items-center gap-2`}>
              <span className="text-[8px] font-black uppercase text-gray-400">Thẻ của {currentPlayerName}:</span>
              <div className="flex gap-1">
                {[...Array(powerCards[activePlayer].pass)].map((_, i) => (
                  <Zap key={`pass-${i}`} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
                {[...Array(powerCards[activePlayer].askBack)].map((_, i) => (
                  <RefreshCw key={`ask-${i}`} className="w-3 h-3 text-blue-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 md:top-6 md:right-6 z-20 p-1.5 md:p-2 text-gray-400 hover:text-gray-600 transition-colors bg-white/80 rounded-full shadow-sm active:scale-90"
          >
            <X className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 p-4 opacity-5 md:opacity-10 pointer-events-none">
            <CheckCircle className={`w-16 h-16 md:w-32 md:h-32 ${currentTheme.text}`} />
          </div>

          <div className="p-5 md:p-10 text-center overflow-y-auto">
            <div className={`inline-block px-3 md:px-5 py-1 md:py-1.5 mb-3 md:mb-6 text-[9px] md:text-xs font-black tracking-widest text-white uppercase rounded-full ${currentTheme.bg} shadow-md`}>
              {prompt.type} {isSpicy && '🔥'}
            </div>

            <div className="mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${currentTheme.text}`}>
                Lượt của: {currentPlayerName}
              </span>
            </div>

            <h2 className={`mb-4 md:mb-8 text-lg md:text-3xl font-bold text-gray-800 md:text-4xl font-handwriting leading-tight px-2`}>
              {isAskBackUsed ? (
                <span className="text-blue-600">"Bây giờ đến lượt đối phương trả lời: {prompt.content}"</span>
              ) : (
                `"${prompt.displayContent || prompt.content}"`
              )}
            </h2>

            {/* AI Hint Section */}
            <div className="mb-6">
              {!aiHint ? (
                <button
                  onClick={handleGenerateHint}
                  disabled={isGeneratingHint}
                  className="mx-auto flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] md:text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingHint ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      AI đang suy nghĩ...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 fill-indigo-600" />
                      Gợi ý cách trả lời (AI)
                    </>
                  )}
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-50/50 p-4 md:p-6 rounded-2xl border border-indigo-100 text-left relative group"
                >
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Tư vấn</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed italic">
                    {aiHint}
                  </p>
                  <button 
                    onClick={() => setAiHint("")}
                    className="absolute top-2 right-2 p-1 text-gray-300 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </div>

            {/* Power Card Actions */}
            {!isAskBackUsed && !isActive && (
              <div className="flex justify-center gap-3 mb-6">
                <button 
                  onClick={handlePassCard}
                  disabled={powerCards[activePlayer].pass === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                    powerCards[activePlayer].pass > 0 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-50 text-gray-300'
                  }`}
                >
                  <Zap className="w-3 h-3" /> Pass Quyền Lực ({powerCards[activePlayer].pass})
                </button>
                <button 
                  onClick={handleAskBackCard}
                  disabled={powerCards[activePlayer].askBack === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                    powerCards[activePlayer].askBack > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-50 text-gray-300'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" /> Thẻ Hỏi Lại ({powerCards[activePlayer].askBack})
                </button>
              </div>
            )}

            {/* Challenge Display */}
            {challenge && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`mb-5 p-3 rounded-2xl border-2 border-dashed ${isSpicy ? 'border-red-300 bg-red-50/50' : 'border-yellow-300 bg-yellow-50/50'} flex items-center gap-3 text-left`}
              >
                <div className={`p-2 rounded-full ${isSpicy ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
                  {isSpicy ? <AlertCircle className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                </div>
                <div>
                  <span className={`block text-[10px] font-black uppercase tracking-widest ${isSpicy ? 'text-red-600' : 'text-yellow-600'}`}>
                    Thử thách đi kèm!
                  </span>
                  <p className="text-xs md:text-sm font-bold text-gray-700 italic">
                    "{challenge}"
                  </p>
                </div>
              </motion.div>
            )}

            {prompt.hint && (
              <p className={`mb-5 md:mb-10 text-[11px] md:text-base italic text-gray-600 bg-gray-50 p-3 md:p-5 rounded-xl md:rounded-2xl border-l-[3px] md:border-l-8 ${currentTheme.border} shadow-inner text-left`}>
                <span className="font-bold not-italic mr-1">Gợi ý:</span> {prompt.hint}
              </p>
            )}

            {/* Timer Section */}
            <div className={`flex flex-col items-center justify-center p-3 md:p-8 mb-5 md:mb-10 rounded-xl md:rounded-3xl ${currentTheme.lightBg} border border-white shadow-lg`}>
              <div className={`flex items-center gap-2 md:gap-4 mb-1 md:mb-3 ${currentTheme.text}`}>
                <Timer className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
                <span className="text-lg md:text-3xl font-mono font-black tracking-[0.1em] md:tracking-[0.2em]">
                  {formatTime(timeLeft)}
                </span>
              </div>
              {!isActive && timeLeft > 0 && (
                <button
                  onClick={startTimer}
                  className={`mt-2 px-4 md:px-6 py-1.5 md:py-2 ${currentTheme.bg} text-white text-[10px] md:text-sm font-bold rounded-lg md:rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-transform`}
                >
                  <Play className="w-3 h-3 md:w-4 md:h-4 fill-white" /> Bắt đầu thảo luận
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <button
                onClick={onDone}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 md:py-4 ${currentTheme.bg} text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-xl shadow-lg active:scale-95 transition-all`}
              >
                <CheckCircle className="w-4 h-4 md:w-6 md:h-6" /> Hoàn thành
              </button>
              <button
                onClick={onSkip}
                className="flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-gray-100 text-gray-500 rounded-xl md:rounded-2xl font-bold text-sm md:text-xl hover:bg-gray-200 active:scale-95 transition-all"
              >
                <SkipForward className="w-4 h-4 md:w-6 md:h-6" /> Bỏ qua
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
