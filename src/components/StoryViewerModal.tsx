import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { UserStory } from '../types';
import { 
  X, 
  Heart, 
  Send, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Eye,
  Sparkles
} from 'lucide-react';

interface StoryViewerModalProps {
  onSelectUser?: (userId: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  onSelectUser
}) => {
  const { 
    stories, 
    activeStoryModal, 
    setActiveStoryModal, 
    currentUser, 
    toggleStoryLike, 
    markStoryAsViewed, 
    deleteStory, 
    sendDirectMessage,
    canManageAllContent,
    showToast 
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = useCallback(() => {
    setProgress(0);
    setCurrentIndex(prev => {
      if (prev < stories.length - 1) {
        return prev + 1;
      } else {
        setActiveStoryModal(null);
        return prev;
      }
    });
  }, [stories.length, setActiveStoryModal]);

  const handlePrev = useCallback(() => {
    setProgress(0);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Sync index with activeStoryModal
  useEffect(() => {
    if (activeStoryModal) {
      const idx = stories.findIndex(s => s.id === activeStoryModal.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
      setProgress(0);
      markStoryAsViewed(activeStoryModal.id);
    }
  }, [activeStoryModal?.id]);

  const currentStory: UserStory | undefined = stories[currentIndex] || activeStoryModal || undefined;

  // Auto-advance timer (5 seconds duration = 5000ms, step every 50ms)
  useEffect(() => {
    if (!activeStoryModal || !currentStory || isPaused) return;

    markStoryAsViewed(currentStory.id);

    const interval = 50;
    const step = (interval / 5000) * 100;

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoryModal, currentStory?.id, isPaused, handleNext]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory) return;

    sendDirectMessage(
      currentStory.userId,
      `رد على ستوري "${currentStory.caption || 'قصة شمس'}":\n${replyText}`
    );

    showToast({
      type: 'success',
      title: 'تم إرسال ردك في رسالة خاصة 💬',
      message: `تم توجيه رسالتك إلى ${currentStory.userName}.`
    });

    setReplyText('');
  };

  if (!activeStoryModal || !currentStory) return null;

  const isLiked = currentStory.likedBy?.includes(currentUser.id);
  const canDelete = currentStory.userId === currentUser.id || canManageAllContent;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200"
      dir="rtl"
    >
      
      {/* Background click outside on desktop to close */}
      <div 
        className="absolute inset-0 z-0 hidden sm:block" 
        onClick={() => setActiveStoryModal(null)} 
      />

      {/* Main Snap Story Container */}
      <div 
        className="relative z-10 w-full h-full sm:h-[88vh] sm:max-w-md bg-slate-950 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border sm:border-slate-800"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        
        {/* Top Progress Bar Ticks */}
        <div className="absolute top-2.5 left-3 right-3 z-30 flex items-center gap-1.5">
          {stories.map((st, idx) => {
            let width = '0%';
            if (idx < currentIndex) width = '100%';
            else if (idx === currentIndex) width = `${progress}%`;

            return (
              <div 
                key={st.id} 
                className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden"
              >
                <div 
                  className="h-full bg-white transition-all duration-75"
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header Information */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between text-white drop-shadow-md">
          
          {/* Author info */}
          <div className="flex items-center gap-2.5">
            <img 
              src={currentStory.userAvatar} 
              alt={currentStory.userName} 
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-sm cursor-pointer"
              onClick={() => {
                if (onSelectUser) onSelectUser(currentStory.userId);
                setActiveStoryModal(null);
              }}
            />
            <div className="text-right">
              <div className="flex items-center gap-1.5 font-black text-sm">
                <span>{currentStory.userName}</span>
                {(currentStory.userStreak || 0) > 0 && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-500/80 text-slate-950 text-[10px] font-black">
                    <Flame className="w-3 h-3 fill-slate-950" />
                    <span>{currentStory.userStreak}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-200">
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{currentStory.wilaya}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" />
                  <span>{currentStory.viewsCount || 1}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1">
            {canDelete && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteStory(currentStory.id);
                }}
                className="p-2 rounded-full bg-black/40 hover:bg-rose-600/80 text-white transition cursor-pointer"
                title="حذف القصة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveStoryModal(null);
              }}
              className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Story Visual Content */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          
          {currentStory.mediaUrl ? (
            <img 
              src={currentStory.mediaUrl} 
              alt={currentStory.caption || 'ستوري شمس'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${currentStory.backgroundColor || 'from-emerald-700 via-teal-800 to-indigo-900'} p-8 flex flex-col items-center justify-center text-center`}>
              <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="w-8 h-8 text-amber-300" />
              </div>
              <p 
                className="text-2xl sm:text-3xl font-black leading-relaxed max-w-xs drop-shadow-md"
                style={{ color: currentStory.textColor || '#ffffff' }}
              >
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* Tap Zones for Left/Right navigation */}
          <div 
            className="absolute top-16 bottom-20 left-0 w-1/3 z-20 cursor-pointer" 
            onClick={handlePrev}
            title="السابق"
          />
          <div 
            className="absolute top-16 bottom-20 right-0 w-2/3 z-20 cursor-pointer" 
            onClick={handleNext}
            title="التالي"
          />

          {/* Caption banner overlay if media exists */}
          {currentStory.mediaUrl && currentStory.caption && (
            <div className="absolute bottom-20 left-3 right-3 z-30 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-right">
              <p className="text-white text-xs sm:text-sm font-bold leading-relaxed">
                {currentStory.caption}
              </p>
              {currentStory.activityTag && (
                <span className="inline-block mt-1 text-[11px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                  {currentStory.activityTag}
                </span>
              )}
            </div>
          )}

        </div>

        {/* Bottom Interactive Bar (Quick Reply + Like) */}
        <div className="relative z-30 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center gap-2">
          
          <form onSubmit={handleSendReply} className="flex-1 flex items-center gap-1.5">
            <input 
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`أرسل رسالة لـ ${currentStory.userName.split(' ')[0]}...`}
              className="flex-1 bg-white/15 hover:bg-white/20 focus:bg-white/25 text-white placeholder-white/60 text-xs rounded-full px-4 py-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-right transition"
            />
            {replyText.trim() && (
              <button 
                type="submit"
                className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5 rotate-180" />
              </button>
            )}
          </form>

          {/* Like Heart Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleStoryLike(currentStory.id);
            }}
            className={`p-2.5 rounded-full transition flex items-center gap-1 cursor-pointer ${
              isLiked 
                ? 'bg-rose-600 text-white scale-110 shadow-lg' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            {(currentStory.likesCount || 0) > 0 && (
              <span className="text-[10px] font-black">{currentStory.likesCount}</span>
            )}
          </button>

        </div>

        {/* Desktop Left/Right Arrow Helpers */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center transition cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </div>

    </div>
  );
};
