import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Flame, 
  Shield, 
  Award, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Zap, 
  Trophy,
  ArrowRight
} from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboard?: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  onOpenLeaderboard
}) => {
  const { 
    currentUser, 
    allUsers, 
    claimDailyStreak, 
    useStreakFreeze, 
    isLoggedIn, 
    openAuthModal 
  } = useApp();

  if (!isOpen) return null;

  const streak = currentUser?.streakCount || 0;
  const longest = currentUser?.longestStreak || streak;
  const tokens = currentUser?.streakFreezeTokens || 0;
  const isCheckedInToday = !!currentUser?.dailyCheckInDone;

  // Streak leaderboard top 5
  const streakChampions = [...allUsers]
    .sort((a, b) => (b.streakCount || 0) - (a.streakCount || 0))
    .slice(0, 5);

  const handleClaim = () => {
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }
    claimDailyStreak();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 text-right animate-in fade-in duration-200"
      dir="rtl"
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Banner with burning fire aesthetic */}
        <div className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white p-6 sm:p-8 text-center overflow-hidden shrink-0">
          
          {/* Animated decorative shapes */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Flame Icon with Pulsing Effect */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl transform rotate-3">
              <Flame className="w-16 h-16 sm:w-20 sm:h-20 text-amber-300 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-bounce" />
            </div>
            
            <span className="absolute -bottom-2 bg-slate-950 text-amber-400 border border-amber-400/50 px-3 py-0.5 rounded-full text-xs font-black shadow-lg">
              {streak} يوم متتالي
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            الستريك التطوعي المستمر
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-sm mx-auto font-medium">
            كل يوم تساهم فيه بنشاط أو تسجل حضورك يحافظ على توهج شعلتك ويرفع ترتيبك الوطني!
          </p>

          {/* Stats quick row */}
          <div className="grid grid-cols-3 gap-2 mt-5 max-w-md mx-auto">
            <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] text-amber-200 font-bold">الستريك الحالي</div>
              <div className="text-lg font-black text-white flex items-center justify-center gap-1">
                <span>{streak}</span>
                <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              </div>
            </div>

            <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] text-amber-200 font-bold">أطول ستريك</div>
              <div className="text-lg font-black text-amber-300 flex items-center justify-center gap-1">
                <span>{longest}</span>
                <Trophy className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-2.5 border border-white/10">
              <div className="text-[10px] text-amber-200 font-bold">دروع التجميد</div>
              <div className="text-lg font-black text-cyan-200 flex items-center justify-center gap-1">
                <span>{tokens}</span>
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Main Action: Claim Streak Today */}
          <div className={`p-4 rounded-2xl border transition ${
            isCheckedInToday 
              ? 'bg-emerald-50/70 border-emerald-200' 
              : 'bg-amber-50/80 border-amber-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  isCheckedInToday ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950 animate-pulse'
                }`}>
                  {isCheckedInToday ? <CheckCircle2 className="w-6 h-6" /> : <Flame className="w-6 h-6 fill-slate-950" />}
                </div>

                <div>
                  <div className="font-black text-xs sm:text-sm text-slate-900">
                    {isCheckedInToday ? 'تم تثبيت ستريك اليوم بنجاح!' : 'شعلة اليوم بانتظار تثبيتك 🔥'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isCheckedInToday 
                      ? 'واصلت التحدي بنجاح، ستتمكن من التثبيت مجدداً غداً.' 
                      : 'انقر لتسجيل نشاطك اليومي وكسب +50 إلى +500 نقطة إضافية.'}
                  </div>
                </div>
              </div>

              {!isCheckedInToday ? (
                <button
                  onClick={handleClaim}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs shadow-md transition cursor-pointer shrink-0"
                >
                  تثبيت الستريك اليوم
                </button>
              ) : (
                <span className="text-emerald-700 font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-100 shrink-0">
                  مكتمل اليوم ✓
                </span>
              )}
            </div>
          </div>

          {/* Streak Freeze Shield Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-700" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-800">
                  درع حماية الستريك (تجميد يوم واحد)
                </div>
                <div className="text-[10px] text-slate-500">
                  يحمي شعلتك من الانكسار إذا انشغلت يوماً عن التطوع
                </div>
              </div>
            </div>

            <button
              onClick={() => useStreakFreeze()}
              disabled={tokens <= 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                tokens > 0 
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              استخدام درع ({tokens})
            </button>
          </div>

          {/* Milestones Road */}
          <div>
            <h4 className="text-xs font-black text-slate-900 mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>محطات جوائز الستريك:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className={`p-2.5 rounded-xl border ${streak >= 3 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className="text-base font-black text-slate-800">3 أيام</div>
                <div className="text-[10px] text-amber-700 font-bold">+100 نقطة</div>
                <span className="text-[9px] text-slate-500">شعلة الانطلاق</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${streak >= 7 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className="text-base font-black text-slate-800">7 أيام</div>
                <div className="text-[10px] text-amber-700 font-bold">+250 نقطة + 🛡️</div>
                <span className="text-[9px] text-slate-500">أسبوع الالتزام</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${streak >= 14 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className="text-base font-black text-slate-800">14 يوم</div>
                <div className="text-[10px] text-amber-700 font-bold">+500 نقطة + 🛡️</div>
                <span className="text-[9px] text-slate-500">بطل الاستمرارية</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${streak >= 30 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className="text-base font-black text-slate-800">30 يوم</div>
                <div className="text-[10px] text-amber-700 font-bold">+1500 نقطة 👑</div>
                <span className="text-[9px] text-slate-500">أسطورة شمس</span>
              </div>
            </div>
          </div>

          {/* Top Streak Leaders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>أعلى شعلات الستريك في الجزائر:</span>
              </h4>
              {onOpenLeaderboard && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLeaderboard();
                  }}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                >
                  لوحة الشرف كاملة ←
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {streakChampions.map((u, index) => (
                <div 
                  key={u.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-black text-slate-400 text-center">
                      #{index + 1}
                    </span>
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      className="w-7 h-7 rounded-lg object-cover" 
                    />
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.wilaya}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{u.streakCount || 7} يوم</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
