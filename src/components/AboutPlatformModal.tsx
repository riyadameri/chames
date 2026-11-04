import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Compass, 
  Trophy, 
  Flame, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  Users, 
  Award, 
  Heart, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

interface AboutPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenActivities?: () => void;
  onOpenMap?: () => void;
}

export const AboutPlatformModal: React.FC<AboutPlatformModalProps> = ({
  isOpen,
  onClose,
  onOpenActivities,
  onOpenMap
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'points' | 'streak' | 'map' | 'roles'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-md shrink-0">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black">دليل منصة شمس التطوع</h2>
                <span className="text-[10px] font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  الجمهورية الجزائرية 🇩🇿
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                المنصة الرقمية الوطنية الأولى لتأطير ومتابعة العمل التطوعي الشاباني تحت رعاية وزارة الشباب والرياضة.
              </p>
            </div>
          </div>

          {/* Navigation Bar inside modal */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-5 mt-4 border-t border-white/10">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeSection === 'overview'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🌟 نبذة عن المنصة
            </button>

            <button
              onClick={() => setActiveSection('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeSection === 'map'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🗺️ شمس ماب (58 ولاية)
            </button>

            <button
              onClick={() => setActiveSection('points')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeSection === 'points'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🏆 نظام النقاط والجوائز
            </button>

            <button
              onClick={() => setActiveSection('streak')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeSection === 'streak'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🔥 الستريك والمحادثات
            </button>

            <button
              onClick={() => setActiveSection('roles')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeSection === 'roles'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🛡️ الفئات والصلاحيات
            </button>
          </div>
        </div>

        {/* Modal Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Section 1: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                <h3 className="font-black text-sm text-emerald-950 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>الرؤية الوطنية لمنصة شمس</span>
                </h3>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  تُعد منصة <strong>شمس</strong> المنظومة الرقمية المركزية لوزارة الشباب والرياضة في الجزائر لتوثيق كل جهد تطوعي، وربط الشباب بالجمعيات ودور الشباب والمركبات الرياضية الجوارية عبر 58 ولاية، لتحويل العمل التطوعي إلى مسار موثق ومكافئ بالنقاط والشهادات الرسمية.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">مشاريع ميدانية معتمدة</h4>
                  <p className="text-[11px] text-slate-600">
                    مبادرات في البيئة والتشجير، الرقمنة والذكاء الاصطناعي، العمل الخيري، والتراث.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">توثيق بالصور وGPS</h4>
                  <p className="text-[11px] text-slate-600">
                    رفع إثباتات مصورة وإحداثيات جغرافية دقيقة يُصادق عليها مقيمون معتمدون.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">شهادات رسمية PDF</h4>
                  <p className="text-[11px] text-slate-600">
                    شهادة تطوع وطنية رسمية برقم تسجيل وزاري وساعات معتمدة قابلة للطباعة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Shams Map (خريطة شمس ماب وورقلة وتقرت) */}
          {activeSection === 'map' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <h3 className="font-black text-sm text-amber-950 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>خريطة شمس ماب (Shams Map) والتمثيل الحقيقي للجزائر</span>
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  تعتمد منصة شمس خريطة تفاعلية حقيقية تُمثل التضاريس والحدود الوطنية للجزائر بالكامل من الساحل الشمالي حتى أقصى الجنوب. كما تركز المنصة بشكل استراتيجي على <strong>واحات الجنوب الكبرى: ورقلة (30) وتقرت (55)</strong> باعتبارهما قطبين محوريين للعمل التطوعي البيئي وتشجير النخيل والابتكار التقني.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xl">🌴</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">قطب واحات ورقلة وتقرت (التركيز الخاص)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      تضم الخريطة دبابيس متوهجة خاصة بولايتي ورقلة وتقرت ومسار الربط الواحاتي مع إمكانية التكبير السريع بضغطة زر وتصفح مشاريع الواحات والستوريات الجغرافية.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xl">🇩🇿</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">تغطية شاملة لـ 58 ولاية جزائرية</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      كل ولاية لديها رصيد نقاط، مشاريع محلية، متطوعون مسجلون، ونوادي شبانية تظهر نبض العمل الميداني.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xl">📸</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">ستوريات الولايات اللحظية (24 ساعة)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      يمكن لكل متطوع ونادي نشر قصص مصورة ونصوص ملونة توثق نشاطه الميداني وتظهر مباشرة على الخريطة وشريط الستوريات.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Points & Rewards */}
          {activeSection === 'points' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-black text-sm text-amber-400 mb-1 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>الموسم الوطني السنوي وجوائز شمس الثلاثية</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  يتنافس المتطوعون والنوادي طيلة الموسم التطوعي على المراكز الثلاثة الأولى:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-1">
                  <div className="text-2xl font-black">🥇</div>
                  <h4 className="font-black text-xs text-amber-950">جائزة شمس الذهبية</h4>
                  <p className="text-[10px] text-amber-800 font-medium">
                    وسام التميز الوطني + درع شمس الذهبي + تمويل تجهيزات وشهادة فخرية عليا.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-center space-y-1">
                  <div className="text-2xl font-black">🥈</div>
                  <h4 className="font-black text-xs text-slate-900">جائزة شمس الفضية</h4>
                  <p className="text-[10px] text-slate-700 font-medium">
                    وسام المتطوع الفضي + درع شمس الفضي + تمويل مشاريع ولائية.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-300 text-center space-y-1">
                  <div className="text-2xl font-black">🥉</div>
                  <h4 className="font-black text-xs text-orange-950">جائزة شمس البرونزية</h4>
                  <p className="text-[10px] text-orange-800 font-medium">
                    وسام المبادرة الشبابية البرونزي + دعم لوجستي وشهادة تقدير.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Streak & Chat */}
          {activeSection === 'streak' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-2xl p-4">
                <h3 className="font-black text-sm mb-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-white" />
                  <span>نظام الستريك التطوعي (Volunteer Streak) ومحادثات شمس</span>
                </h3>
                <p className="text-xs text-orange-100 leading-relaxed">
                  يُكافئ الستريك المتطوعين على الحضور والتفاعل اليومي بزيادة الشعلات ونقاط إضافية مجانية، إلى جانب نظام محادثة مباشر وسلس مدمج داخل المحتوى.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <h4 className="font-black text-slate-900 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>تأكيد الحضور اليومي:</span>
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    تسجيل الدخول يومياً يمنح +25 نقطة ويزيد عداد الستريك. في حال السفر، يحمي درع التجميد (Streak Freeze) تقدمك.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <h4 className="font-black text-slate-900 flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>المحادثات المباشرة (Direct Chat):</span>
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    واجهة محادثات كاملة ضمن صفحة التطبيق (بدون نوافذ منبثقة) تُمكنك من التواصل الصوتي والكتابي وتبادل الصور مع أي متطوع أو قائد نادي.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Roles & Permissions */}
          {activeSection === 'roles' && (
            <div className="space-y-3 animate-in fade-in duration-200 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  👑
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">المدير العام للمنصة ومسؤول ميديا (إشراف كامل)</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    المدير العام (عامري رياض يوسف - riyad) ومسؤولة ميديا لديهما الصلاحية المطلقة لحذف أو تعديل أي منشور أو نشاط تطوعي على مستوى المنصة لحماية جودة المحتوى.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0">
                  🏛️
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">المؤسسات، الجمعيات ودور الشباب</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    نشر المشاريع والأنشطة الولائية، تأسيس النوادي وإدارتها، وتعبئة المتطوعين في الميدان.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0">
                  🛡️
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">مقيّم الإثباتات المعتمد</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    فحص الإثباتات الميدانية والصور وإحداثيات GPS، واعتماد النقاط ومنح المكافآت للمشاركين.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                  🌟
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">المتطوع الفرد (Individual)</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    المشاركة في الأنشطة، نشر المنشورات والستوريات، تعديل وحذف منشوراته الخاصة، وتغيير صورة البروفايل والغلاف بحرية.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            وزارة الشباب والرياضة • الجمهورية الجزائرية الديمقراطية الشعبية
          </div>

          <div className="flex items-center gap-2">
            {onOpenMap && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMap();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                فتح شمس ماب 🗺️
              </button>
            )}

            {onOpenActivities && (
              <button
                onClick={() => {
                  onClose();
                  onOpenActivities();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer"
              >
                استكشاف المشاريع التطوعية
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
