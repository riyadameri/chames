import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivitySubmission } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Camera, 
  Sparkles, 
  Award, 
  Calendar, 
  AlertCircle, 
  Clock, 
  TreePine,
  ExternalLink,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export const EvaluationQueueView: React.FC = () => {
  const { submissions, activities, evaluateSubmission, currentUser } = useApp();

  const [selectedSub, setSelectedSub] = useState<ActivitySubmission | null>(null);
  const [pointsInput, setPointsInput] = useState<number>(100);
  const [bonusInput, setBonusInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>('عمل ممتاز وتوثيق ميداني دقيق ومطابق للمعايير. شكراً لمساهمتك الفعالة في إنجاح المبادرة.');
  const [tabFilter, setTabFilter] = useState<'pending' | 'evaluated'>('pending');

  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const evaluatedSubmissions = submissions.filter(s => s.status === 'approved' || s.status === 'rejected');

  const activeList = tabFilter === 'pending' ? pendingSubmissions : evaluatedSubmissions;

  const handleOpenEvaluate = (sub: ActivitySubmission) => {
    setSelectedSub(sub);
    const act = activities.find(a => a.id === sub.activityId);
    if (act) {
      const base = act.basePoints || 100;
      const units = sub.unitsCount || sub.proofItems.length || 1;
      const unitPts = act.pointsPerUnit ? (units * act.pointsPerUnit) : 0;
      setPointsInput(base + unitPts);
      setBonusInput(0);
      setFeedbackInput(`إنجاز متميز وموثق في الميدان لـ ${units} ${act.unitName || 'إثبات'}. تم اعتماد النقاط رسمياً في رصيدك.`);
    }
  };

  const handleConfirmEvaluation = (approved: boolean) => {
    if (!selectedSub) return;

    evaluateSubmission(selectedSub.id, {
      approved,
      pointsAwarded: Number(pointsInput) || 50,
      bonusPoints: Number(bonusInput) || 0,
      feedback: feedbackInput.trim() || (approved ? 'تم الاعتماد بنجاح.' : 'يرجى مراجعة وتحديث الإثباتات.'),
    });

    setSelectedSub(null);
  };

  return (
    <div className="space-y-8 text-right">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>بوابة المتابعة، التحقق الميداني، ومنح النقاط المستمرة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            إدارة وتقييم إثباتات المشاريع المنجزة
          </h2>
          <p className="text-xs sm:text-sm text-rose-100/80 mt-1 max-w-xl">
            تفقد الصور المرفقة والإحداثيات الجغرافية المسجلة لكل متطوع ومؤسسة، ثم اعتمد النقاط الأساسية والإضافية لترقية ترتيبهم في لوحة الصدارة.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-lg">
            {pendingSubmissions.length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">تقارير بانتظار التقييم</div>
            <div className="text-[11px] text-rose-200">تحتاج مراجعة الصور والمواقع</div>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setTabFilter('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
            tabFilter === 'pending'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>قيد المراجعة والمطابقة ({pendingSubmissions.length})</span>
        </button>

        <button
          onClick={() => setTabFilter('evaluated')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
            tabFilter === 'evaluated'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>السجل والتقارير المعتمدة سابقاً ({evaluatedSubmissions.length})</span>
        </button>
      </div>

      {/* Submissions List */}
      {activeList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="font-bold text-base text-slate-800">
            {tabFilter === 'pending' ? 'لا توجد تقارير معلقة بانتظار التقييم حالياً' : 'لا توجد تقارير معتمدة سابقة'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {tabFilter === 'pending'
              ? 'كافة التقارير الميدانية المرفوعة تم فحصها ومنح النقاط لأصحابها.'
              : 'عند اعتماد تقارير جديدة ستظهر هنا في الأرشيف.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((sub) => {
            const act = activities.find(a => a.id === sub.activityId);

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Submission Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={sub.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                      alt={sub.userName}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{sub.userName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {sub.userRole === 'institution' ? 'مؤسسة / نادي' : 'متطوع فرد'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sub.wilaya} • تاريخ التقديم: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('ar-DZ') : 'حديثاً'}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Action */}
                  <div className="flex items-center gap-2">
                    {sub.status === 'submitted' ? (
                      <button
                        onClick={() => handleOpenEvaluate(sub)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>فحص الإثباتات واعتماد النقاط</span>
                      </button>
                    ) : sub.status === 'approved' ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        معتمد (+{(sub.pointsAwarded || 0) + (sub.bonusPoints || 0)} نقطة)
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs border border-rose-300">
                        مرفوض أو مطلوب تعديل
                      </span>
                    )}
                  </div>
                </div>

                {/* Activity Info */}
                <div>
                  <h4 className="font-black text-sm text-slate-900">
                    النشاط: <span className="text-emerald-800">{sub.activityTitle}</span>
                  </h4>
                  {sub.generalNotes && (
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800">ملاحظات المشارك: </span>
                      {sub.generalNotes}
                    </p>
                  )}
                </div>

                {/* Proof Items Preview (Photos & Locations) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>الإثباتات الميدانية المرفوعة ({sub.proofItems.length} عنصر):</span>
                    {act?.allowMultipleProof && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                        تحدي متكرر ({sub.unitsCount || sub.proofItems.length} {act.unitName})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {sub.proofItems.map((proof, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 group">
                        <div className="relative h-32 overflow-hidden bg-slate-200">
                          <img
                            src={proof.photoUrl}
                            alt="proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="p-2.5 space-y-1 text-[11px]">
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{proof.locationName}</span>
                          </div>
                          {proof.coordinates && (
                            <div className="text-[10px] font-mono text-slate-500">
                              GPS: {proof.coordinates.lat.toFixed(4)}, {proof.coordinates.lng.toFixed(4)}
                            </div>
                          )}
                          {proof.description && (
                            <div className="text-slate-600 text-[10px] line-clamp-2">
                              {proof.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback if already evaluated */}
                {sub.evaluatorFeedback && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">ملاحظة التقييم المعتمدة ({sub.evaluatorName || 'المقيّم'}): </span>
                      <span>{sub.evaluatorFeedback}</span>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* EVALUATION MODAL (نافذة فحص التقرير وتحديد النقاط) */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-rose-700 to-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-rose-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">تقييم المهمة واعتماد النقاط</h3>
                  <p className="text-xs text-rose-100">المشارك: {selectedSub.userName} ({selectedSub.wilaya})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900">{selectedSub.activityTitle}</div>
                <div className="text-slate-600 flex items-center gap-4">
                  <span>عدد الإثباتات: {selectedSub.proofItems.length} عنصر</span>
                  <span>النوع: {selectedSub.userRole === 'institution' ? 'مؤسسة شبانية' : 'متطوع فرد'}</span>
                </div>
              </div>

              {/* Points to award */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    النقاط الأساسية المستحقة
                  </label>
                  <input
                    type="number"
                    value={pointsInput}
                    onChange={(e) => setPointsInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">محسوبة حسب قاعدة النشاط وعدد الإنجازات</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نقاط تميز إضافية (بونص اختياري)
                  </label>
                  <input
                    type="number"
                    value={bonusInput}
                    onChange={(e) => setBonusInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono font-bold"
                  />
                  <span className="text-[10px] text-emerald-600 mt-1 block">للإتقان العالي، السرعة، أو العمل المتميز</span>
                </div>
              </div>

              {/* Total points summary */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950">إجمالي النقاط التي ستضاف لرصيد المتطوع:</span>
                <span className="text-xl font-black text-amber-700 font-mono">
                  +{(Number(pointsInput) || 0) + (Number(bonusInput) || 0)} نقطة
                </span>
              </div>

              {/* Evaluator feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظة وشهادة المقيّم (تظهر للمشارك في ملفه)
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="اكتب كلمة تشجيع أو توجيه للمشارك..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleConfirmEvaluation(false)}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-50 transition"
                >
                  طلب إعادة التوثيق أو رفض
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmEvaluation(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد المهمة وضخ النقاط فوراً</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
