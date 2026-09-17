import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sun, 
  Trophy, 
  Award, 
  Calendar, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  TreePine, 
  ShieldCheck,
  Building2,
  ChevronLeft,
  X
} from 'lucide-react';

interface HeroSeasonBannerProps {
  onOpenLeaderboard?: () => void;
  onOpenActivities?: () => void;
}

export const HeroSeasonBanner: React.FC<HeroSeasonBannerProps> = ({
  onOpenLeaderboard,
  onOpenActivities
}) => {
  const { season, allUsers, activities, submissions } = useApp();
  const [showPrizesModal, setShowPrizesModal] = useState(false);

  // Compute live aggregates
  const totalPointsAwarded = allUsers.reduce((sum, u) => sum + u.points, 0);
  const totalVolunteers = allUsers.filter(u => u.role === 'individual').length;
  const totalInstitutions = allUsers.filter(u => u.role === 'institution').length;
  const totalCompletedSubmissions = submissions.filter(s => s.status === 'approved').length;
  
  // Calculate total units (e.g. trees planted) from approved submissions
  const totalUnitsAccomplished = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (s.unitsCount || s.proofItems.length || 1), 0);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-10 shadow-2xl border border-emerald-800/40">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 translate-y-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-5 text-right">
            
            {/* Season Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold backdrop-blur-md">
              <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>{season.name} • {season.edition}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-white/90">موسم التنافس الوطني 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              ازرع أثراً.. اكسب نقاطاً، <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400">
                وتصدّر منصة شمس الوطنية
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              المنصة الرقمية الرسمية التابعة لوزارة الشباب والرياضة لنشر النشاطات التطوعية الموجهة للأفراد والهياكل الشبانية. شارك في الميدان، وثّق أعمالك بالصور والإحداثيات الجغرافية، واحصد وسام شمس وجوائز الموسم.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setShowPrizesModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>عرض جوائز الموسم (3 للأفراد و 3 للمؤسسات)</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              {onOpenLeaderboard && (
                <button
                  onClick={onOpenLeaderboard}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-xs font-bold transition cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>لوحة المتصدرين الوطنية</span>
                </button>
              )}

              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold backdrop-blur-md">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>نهاية الموسم: 31 ديسمبر 2026</span>
              </div>
            </div>

          </div>

          {/* Season Podium Preview & Live Statistics */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-300 font-bold">مجموع النقاط الممنوحة</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {totalPointsAwarded.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">نقاط متراكمة وموثقة</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-300 font-bold">الأشجار والإنجازات الميدانية</span>
                  <TreePine className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  +{totalUnitsAccomplished}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">موثقة بالصور والمواقع</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-300 font-bold">المتطوعون الأفراد</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  +{totalVolunteers}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">عبر 58 ولاية</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-300 font-bold">الهياكل والنوادي</span>
                  <Building2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  +{totalInstitutions}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">دور شباب ومركبات وجمعيات</div>
              </div>

            </div>

            {/* Quick Top Mini Preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-300">أوسمة شمس الثلاثة (ذهب، فضة، برونز)</div>
                  <div className="text-[11px] text-slate-300">مخصصة للمتصدرين الـ 3 أفراد والـ 3 مؤسسات نهاية الموسم</div>
                </div>
              </div>
              <button
                onClick={() => setShowPrizesModal(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition"
              >
                تفاصيل
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Season Prizes Modal */}
      {showPrizesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 text-right animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">جوائز موسم شمس الوطني 2026</h3>
                  <p className="text-xs text-slate-500">رعاية وتكريم رسمي من وزارة الشباب والرياضة</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrizesModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 my-4 leading-relaxed bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
              يُختتم الموسم في 31 ديسمبر 2026 بحفل تكريم وزاري رسمي. يمنح النظام 3 جوائز لأعلى 3 أفراد في الترتيب التراكمي للنقاط، و 3 جوائز لأعلى 3 مؤسسات شبانية وجمعيات.
            </p>

            {/* Individual Prizes Grid */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h4 className="font-black text-base text-slate-900">1. جوائز فئة الأفراد (المتطوعون الشباب)</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {season.individualPrizes.map(prize => (
                  <div
                    key={`ind-${prize.place}`}
                    className={`p-5 rounded-2xl border text-right relative overflow-hidden ${
                      prize.type === 'gold'
                        ? 'bg-gradient-to-b from-amber-50 to-amber-100/40 border-amber-300 shadow-md ring-2 ring-amber-400/20'
                        : prize.type === 'silver'
                        ? 'bg-gradient-to-b from-slate-50 to-slate-100/60 border-slate-300'
                        : 'bg-gradient-to-b from-orange-50 to-orange-100/40 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        prize.type === 'gold'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : prize.type === 'silver'
                          ? 'bg-slate-500 text-white'
                          : 'bg-amber-700 text-white'
                      }`}>
                        {prize.type === 'gold' ? 'المركز الأول (ذهبي)' : prize.type === 'silver' ? 'المركز الثاني (فضي)' : 'المركز الثالث (برونزي)'}
                      </span>
                      <Award className={`w-6 h-6 ${
                        prize.type === 'gold' ? 'text-amber-500' : prize.type === 'silver' ? 'text-slate-400' : 'text-amber-700'
                      }`} />
                    </div>

                    <h5 className="font-bold text-sm text-slate-900 mb-1">{prize.title}</h5>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{prize.description}</p>
                    
                    <div className="pt-2 border-t border-slate-200/80">
                      <div className="text-[10px] text-slate-500">القيمة والتقدير:</div>
                      <div className="text-xs font-black text-emerald-700">{prize.rewardValue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institution Prizes Grid */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h4 className="font-black text-base text-slate-900">2. جوائز فئة المؤسسات والجمعيات والهياكل الشبانية</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {season.institutionPrizes.map(prize => (
                  <div
                    key={`inst-${prize.place}`}
                    className={`p-5 rounded-2xl border text-right relative overflow-hidden ${
                      prize.type === 'gold'
                        ? 'bg-gradient-to-b from-amber-50 to-amber-100/40 border-amber-300 shadow-md ring-2 ring-amber-400/20'
                        : prize.type === 'silver'
                        ? 'bg-gradient-to-b from-slate-50 to-slate-100/60 border-slate-300'
                        : 'bg-gradient-to-b from-orange-50 to-orange-100/40 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        prize.type === 'gold'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : prize.type === 'silver'
                          ? 'bg-slate-500 text-white'
                          : 'bg-amber-700 text-white'
                      }`}>
                        {prize.type === 'gold' ? 'المركز الأول (ذهبي)' : prize.type === 'silver' ? 'المركز الثاني (فضي)' : 'المركز الثالث (برونزي)'}
                      </span>
                      <Building2 className={`w-6 h-6 ${
                        prize.type === 'gold' ? 'text-amber-500' : prize.type === 'silver' ? 'text-slate-400' : 'text-amber-700'
                      }`} />
                    </div>

                    <h5 className="font-bold text-sm text-slate-900 mb-1">{prize.title}</h5>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">{prize.description}</p>
                    
                    <div className="pt-2 border-t border-slate-200/80">
                      <div className="text-[10px] text-slate-500">الدعم والتجهيز الوزاري:</div>
                      <div className="text-xs font-black text-blue-700">{prize.rewardValue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPrizesModal(false)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
