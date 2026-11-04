import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserStory } from '../types';
import { Plus, Flame, Sparkles, MapPin, Play } from 'lucide-react';
import { CreateStoryModal } from './CreateStoryModal';

interface StoriesTrayProps {
  onSelectStory?: (story: UserStory) => void;
  className?: string;
}

export const StoriesTray: React.FC<StoriesTrayProps> = ({
  onSelectStory,
  className = ''
}) => {
  const { 
    stories, 
    currentUser, 
    setActiveStoryModal, 
    isLoggedIn, 
    openAuthModal 
  } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Group stories by user or display unique recent ones
  const myStories = stories.filter(s => s.userId === currentUser.id);
  const otherStories = stories.filter(s => s.userId !== currentUser.id);

  const handleOpenMyStoryOrAdd = () => {
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }
    if (myStories.length > 0) {
      if (onSelectStory) onSelectStory(myStories[0]);
      else setActiveStoryModal(myStories[0]);
    } else {
      setIsCreateOpen(true);
    }
  };

  const handleSelect = (story: UserStory) => {
    if (onSelectStory) onSelectStory(story);
    else setActiveStoryModal(story);
  };

  return (
    <div className={`bg-white/90 backdrop-blur-md rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-200/80 ${className}`}>
      
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 px-1 text-right">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-black text-xs sm:text-sm text-slate-800">ستوريات المتطوعين</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
            24 ساعة
          </span>
        </div>

        <button
          onClick={() => {
            if (!isLoggedIn) openAuthModal('login');
            else setIsCreateOpen(true);
          }}
          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة ستوري جديد</span>
        </button>
      </div>

      {/* Stories list carousel */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none text-center">
        
        {/* Item 1: My Story button */}
        <div className="flex flex-col items-center shrink-0 group cursor-pointer" onClick={handleOpenMyStoryOrAdd}>
          <div className="relative">
            <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl p-0.5 transition transform group-hover:scale-105 ${
              myStories.length > 0 
                ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-emerald-500 animate-pulse' 
                : 'border-2 border-dashed border-slate-300 group-hover:border-emerald-500'
            }`}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-[14px] bg-slate-100"
              />
            </div>

            {/* Plus or Flame Badge */}
            {myStories.length > 0 ? (
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white p-1 rounded-full shadow-xs text-[10px] font-black">
                🔥
              </span>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLoggedIn) openAuthModal('login');
                  else setIsCreateOpen(true);
                }}
                className="absolute -bottom-1 -right-1 bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-full shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-[11px] font-bold text-slate-800 mt-1.5 max-w-[70px] truncate">
            {myStories.length > 0 ? 'قصتي' : 'أضف قصتك'}
          </span>
          <span className="text-[9px] text-slate-600 font-medium">
            {myStories.length > 0 ? `${myStories.length} قصة` : 'الآن'}
          </span>
        </div>

        {/* Other Users' Stories */}
        {otherStories.map((story) => {
          const isViewed = story.viewedBy?.includes(currentUser.id);
          return (
            <div
              key={story.id}
              onClick={() => handleSelect(story)}
              className="flex flex-col items-center shrink-0 group cursor-pointer"
            >
              <div className="relative">
                <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl p-0.5 transition transform group-hover:scale-105 shadow-xs ${
                  isViewed
                    ? 'border-2 border-slate-200'
                    : 'bg-gradient-to-tr from-amber-400 via-rose-500 to-emerald-500 p-[2.5px]'
                }`}>
                  <div className="w-full h-full rounded-[13px] overflow-hidden bg-slate-900 relative">
                    <img
                      src={story.mediaUrl || story.userAvatar}
                      alt={story.userName}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    
                    {/* Small avatar overlay */}
                    <img 
                      src={story.userAvatar}
                      alt={story.userName}
                      className="absolute top-1 left-1 w-4 h-4 rounded-full border border-white shadow-xs object-cover"
                    />
                  </div>
                </div>

                {/* Streak flame badge if user has streak */}
                {(story.userStreak || 0) > 0 && (
                  <span className="absolute -bottom-1 -right-1 bg-slate-900/90 text-amber-400 px-1 py-0.2 rounded-md text-[9px] font-black border border-amber-500/40 flex items-center gap-0.5 shadow-xs">
                    <Flame className="w-2.5 h-2.5 fill-amber-400" />
                    <span>{story.userStreak}</span>
                  </span>
                )}
              </div>

              <span className="text-[11px] font-bold text-slate-800 mt-1.5 max-w-[75px] truncate">
                {story.userName.split(' ')[0]}
              </span>
              <span className="text-[9px] text-emerald-800 font-bold max-w-[75px] truncate flex items-center justify-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                <span>{story.wilaya.replace(/^\d+\s*-\s*/, '')}</span>
              </span>
            </div>
          );
        })}

        {otherStories.length === 0 && (
          <div className="flex items-center gap-2 text-slate-600 text-xs py-2 px-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <span>كن أول من ينشر ستوري تطوعي اليوم!</span>
          </div>
        )}

      </div>

      {/* Modal to create a new story */}
      <CreateStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

    </div>
  );
};
