import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Sparkles, 
  Award, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Camera, 
  ShieldCheck, 
  ArrowRight,
  TreePine,
  Layers,
  Building2
} from 'lucide-react';

interface UserWorkspaceViewProps {
  onOpenSubmitProof: (submissionId: string) => void;
  onExploreActivities: () => void;
}

export const UserWorkspaceView: React.FC<UserWorkspaceViewProps> = ({
  onOpenSubmitProof,
  onExploreActivities,
}) => {
  const { currentUser, submissions, activities, individualUsers, institutionUsers } = useApp();

  // Find user's submissions
  const mySubmissions = submissions.filter(s => s.userId === currentUser.id);
  const inProgressSubmissions = mySubmissions.filter(s => s.status === 'in_progress');
  const pendingSubmissions = mySubmissions.filter(s => s.status === 'submitted');
  const approvedSubmissions = mySubmissions.filter(s => s.status === 'approved');

  // Find current user ranking
  const isInst = currentUser.role === 'institution' || currentUser.role === 'institution_admin';
  const list = isInst ? institutionUsers : individualUsers;
  const userRankIndex = list.findIndex(u => u.id === currentUser.id);
  const currentRank = userRankIndex >= 0 ? userRankIndex + 1 : currentUser.rank || 1;

  return (
    <div className="space-y-8 text-right">
      
      {/* Profile & Stats Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-3xl object-cover border-4 border-emerald-500/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                  الترتيب الوطني #{currentRank}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.wilaya}
                </span>
                <span>•</span>
                <span>{currentUser.role === 'institution' ? 'مؤسسة شبانية' : 'متطوع مسجل'}</span>
                {currentUser.affiliatedInstitutionName && (
                  <>
                    <span>•</span>
                    <span className="text-blue-700 font-medium">{currentUser.affiliatedInstitutionName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Points & Stats counter */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-28">
              <span className="text-[11px] text-amber-900 font-bold block">رصيد النقاط</span>
              <span className="text-xl font-black text-amber-600 font-mono">
                {currentUser.points.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-28">
              <span className="text-[11px] text-emerald-900 font-bold block">المهام المعتمدة</span>
              <span className="text-xl font-black text-emerald-600 font-mono">
                {approvedSubmissions.length}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center min-w-28">
              <span className="text-[11px] text-blue-900 font-bold block">ساعات التطوع</span>
              <span className="text-xl font-black text-blue-600 font-mono">
                {currentUser.hoursVolunteered || approvedSubmissions.length * 4} س
              </span>
            </div>
          </div>

        </div>

        {/* User Badges */}
        {currentUser.badges && currentUser.badges.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 mb-2.5">الشارات والأوسمة الشرفية المكتسبة:</div>
            <div className="flex flex-wrap gap-2">
              {currentUser.badges.map(b => (
                <div
                  key={b.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{b.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Sections: 1. Tasks in Progress (Awaiting Proof) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-lg text-slate-900">
              مهام قيد الإنجاز — بانتظار رفع الإثباتات الميدانية ({inProgressSubmissions.length})
            </h3>
          </div>
          <button
            onClick={onExploreActivities}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1"
          >
            <span>استعراض نشاطات جديدة</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {inProgressSubmissions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-3">
            <p>لا توجد مهام قيد الإنجاز حالياً.</p>
            <button
              onClick={onExploreActivities}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition"
            >
              انضم لنشاط تطوعي الآن (Apply)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressSubmissions.map(sub => {
              const act = activities.find(a => a.id === sub.activityId);

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 text-right flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                        قيد التنفيذ
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        +{act?.basePoints || 100} نقطة
                      </span>
                    </div>

                    <h4 className="font-black text-base text-slate-900 leading-snug">
                      {sub.activityTitle}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {act?.shortDescription || 'قم بإنجاز المهمة ميدانياً وتوثيقها بالصور والموقع الجغرافي.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onOpenSubmitProof(sub.id)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>انتهت المهمة — ارفع الصور والمواقع</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Submissions Awaiting Evaluation */}
      {pendingSubmissions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-lg text-slate-900">
              تقارير مرفوعة قيد فحص المقيّم ومطابقة الصور والمواقع ({pendingSubmissions.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSubmissions.map(sub => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    في انتظار مصادقة المقيّم
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {sub.proofItems.length} إثباتات مرفقة
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{sub.activityTitle}</h4>

                {sub.proofItems.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {sub.proofItems.map((p, i) => (
                      <img
                        key={i}
                        src={p.photoUrl}
                        alt="proof"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Approved Submissions History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-black text-lg text-slate-900">
            سجل النشاطات المعتمدة والنقاط المكتسبة ({approvedSubmissions.length})
          </h3>
        </div>

        {approvedSubmissions.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            لم يتم اعتماد نشاطات بعد. بعد إتمام مهامك ومصادقة المقيّم ستظهر نقاطك وتفاصيل إنجازاتك هنا.
          </div>
        ) : (
          <div className="space-y-3">
            {approvedSubmissions.map(sub => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-slate-900">{sub.activityTitle}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                      معتمد رسمياً
                    </span>
                  </div>
                  {sub.evaluatorFeedback && (
                    <p className="text-xs text-slate-600 italic">
                      "{sub.evaluatorFeedback}"
                    </p>
                  )}
                  <div className="text-[11px] text-slate-400">
                    مقيّم المنصة: {sub.evaluatorName || 'لجنة التحكيم'} • {sub.proofItems.length} صور ومواقع موثقة
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block">النقاط الممنوحة</span>
                    <span className="text-lg font-black text-emerald-700 font-mono">
                      +{(sub.pointsAwarded || 0) + (sub.bonusPoints || 0)} ن
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
