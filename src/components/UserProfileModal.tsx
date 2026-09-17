import React, { useState } from 'react';
import { User, Activity, Submission } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Award, 
  Sparkles, 
  MapPin, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Camera, 
  Trophy, 
  Share2, 
  Printer, 
  ShieldCheck,
  TreePine,
  ExternalLink,
  Medal,
  Clock,
  UserCheck
} from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onSelectActivity?: (activity: Activity) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onSelectActivity
}) => {
  const { activities, submissions, season } = useApp();
  const [showCertificate, setShowCertificate] = useState(false);

  // Submissions by this user
  const userSubmissions = submissions.filter(s => s.userId === user.id);
  const approvedSubmissions = userSubmissions.filter(s => s.status === 'approved');
  
  // Calculate total units (e.g. trees) contributed
  const totalUnits = approvedSubmissions.reduce(
    (sum, s) => sum + (s.unitsCount || s.proofItems?.length || 1), 
    0
  );

  // Get activities user took part in
  const userActivities = activities.filter(a => 
    userSubmissions.some(s => s.activityId === a.id)
  );

  // Badges earned
  const badges = [
    { id: '1', title: 'وسام شمس الوطني', icon: '☀️', desc: 'عضوية معتمدة في منصة شمس', unlocked: true },
    { id: '2', title: 'فارس الميدان', icon: '🌱', desc: 'إتمام مهام تطوعية ميدانية', unlocked: approvedSubmissions.length > 0 },
    { id: '3', title: 'صديق البيئة', icon: '🌳', desc: 'المساهمة في غرس الأشجار والمحافظة على الطبيعة', unlocked: totalUnits >= 5 },
    { id: '4', title: 'نادي النخبة', icon: '🏆', desc: 'تحقيق أكثر من 200 نقطة', unlocked: user.points >= 200 },
    { id: '5', title: 'الموثق الرقمي', icon: '📍', desc: 'توثيق الإثباتات بالصور والإحداثيات', unlocked: approvedSubmissions.length >= 2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
        
        {/* Certificate View Modal if toggled */}
        {showCertificate ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={() => setShowCertificate(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                العودة للبروفايل
              </button>
              <h3 className="font-black text-sm text-slate-900">شهادة التطوع الرسمية</h3>
            </div>

            {/* Printable Certificate Frame */}
            <div className="p-6 sm:p-10 border-8 border-double border-amber-600/60 rounded-3xl bg-amber-50/30 text-center space-y-6 shadow-inner relative">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold border-b border-amber-200 pb-3">
                <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
                <span>وزارة الشباب والرياضة</span>
              </div>

              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-md">
                ☀️
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">شهادة شمس للعمل التطوعي</h2>
                <p className="text-xs text-amber-800 font-bold mt-1">
                  الموسم الوطني للتطوع الشاباني {season.year}
                </p>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed max-w-lg mx-auto">
                تشهد وزارة الشباب والرياضة عبر منصة <strong className="text-emerald-800">شمس التطوع</strong> بأن المتطوع(ة):
                <br />
                <span className="text-xl font-black text-slate-950 underline decoration-amber-500 decoration-2 inline-block my-2">
                  {user.name}
                </span>
                <br />
                قد ساهم(ت) بفعالية في المبادرات التطوعية الوطنية برصيد موثق قدره <strong className="text-amber-700 font-black font-mono">{user.points} نقطة</strong> معتمدة ومسجلة في السجل الوطني للتطوع.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200 text-xs text-slate-600">
                <div>
                  <span className="block text-[10px] text-slate-400">الولاية:</span>
                  <span className="font-bold text-slate-800">{user.wilaya}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">الرقم الوطني للمتطوع:</span>
                  <span className="font-bold font-mono text-slate-800">DZ-SHAMS-{user.id.toUpperCase()}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-[10px] text-slate-500">
                <div>ختم المديرية العامة للشباب</div>
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-600 flex items-center justify-center text-emerald-800 font-black text-[9px]">
                  معتمد ✓
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة الرسمية</span>
              </button>
            </div>
          </div>
        ) : (
          /* Profile Overview View */
          <div>
            {/* Header Banner */}
            <div className="relative bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
                />

                <div className="flex-1 text-center sm:text-right space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-black">{user.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950">
                      {user.role === 'individual' && 'متطوع فرد'}
                      {user.role === 'institution' && 'مؤسسة شبانية'}
                      {user.role === 'general_admin' && 'مدير المنصة'}
                      {user.role === 'evaluator_admin' && 'مقيّم إثباتات'}
                      {user.role === 'institution_admin' && 'مسؤول هيكل شباني'}
                      {user.role === 'media_admin' && 'إعلام المنصة'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      ولاية {user.wilaya}
                    </span>
                    {user.affiliatedInstitutionName && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        {user.affiliatedInstitutionName}
                      </span>
                    )}
                    <span className="font-mono text-slate-400">
                      {user.email}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200/90 max-w-md pt-1">
                    {user.bio || 'متطوع نشط في مبادرات منصة شمس الوطنية التابعة لوزارة الشباب والرياضة.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 bg-slate-50 border-b border-slate-200 text-center py-4">
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-[11px] font-bold text-slate-500">مجموع النقاط</div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                  {approvedSubmissions.length}
                </div>
                <div className="text-[11px] font-bold text-slate-500">نشاطات معتمدة</div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono">
                  {totalUnits}
                </div>
                <div className="text-[11px] font-bold text-slate-500">وحدة منجزة (أشجار/إلخ)</div>
              </div>
            </div>

            {/* Body Tabs / Sections */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              
              {/* Seasonal standing & Certificate CTA */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-amber-950">
                      مرتبة التنافس على جوائز الموسم
                    </div>
                    <div className="text-[11px] text-amber-800">
                      {user.points >= 300 
                        ? 'مرشح للميدالية الذهبية الوطنية 🥇' 
                        : user.points >= 200 
                        ? 'مرشح للميدالية الفضية الوطنية 🥈' 
                        : 'مرشح للميدالية البرونزية الوطنية 🥉'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCertificate(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>عرض الشهادة الرسمية</span>
                </button>
              </div>

              {/* Badges Earned */}
              <div className="space-y-3">
                <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-amber-500" />
                  <span>الأوسمة والشارات المكتسبة</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className={`p-3 rounded-2xl border text-right transition ${
                        b.unlocked
                          ? 'bg-white border-slate-200 shadow-xs'
                          : 'bg-slate-50/60 border-slate-200/50 opacity-50'
                      }`}
                    >
                      <div className="text-xl mb-1">{b.icon}</div>
                      <div className="font-black text-xs text-slate-900">{b.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Accomplished Activities */}
              <div className="space-y-3">
                <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>سجل المشاركات الميدانية المعتمدة ({approvedSubmissions.length})</span>
                </h4>

                {approvedSubmissions.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    لم يتم اعتماد نشاطات بعد. عند إتمام المهام وتقديم الصور والموقع، ستظهر هنا موثقة بالكامل.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {approvedSubmissions.map((sub) => {
                      const act = activities.find(a => a.id === sub.activityId);
                      return (
                        <div
                          key={sub.id}
                          className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {sub.proofItems && sub.proofItems[0]?.photoUrl ? (
                              <img
                                src={sub.proofItems[0].photoUrl}
                                alt={sub.activityTitle}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                            )}

                            <div className="min-w-0 text-right">
                              <div className="font-black text-xs text-slate-900 truncate">
                                {sub.activityTitle}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>{(sub.submittedAt || sub.appliedAt).slice(0, 10)}</span>
                                {sub.wilaya && (
                                  <span className="flex items-center gap-0.5 text-blue-600">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {sub.wilaya}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black font-mono border border-emerald-200">
                              +{sub.pointsAwarded} ن
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">معرف المستخدم: #{user.id}</span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
