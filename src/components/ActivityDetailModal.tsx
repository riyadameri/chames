import React from 'react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import { 
  X, 
  MapPin, 
  Camera, 
  Award, 
  Users, 
  Building2, 
  Calendar, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  TreePine,
  Layers
} from 'lucide-react';

interface ActivityDetailModalProps {
  activity: Activity;
  onClose: () => void;
  onOpenSubmitProof: (submissionId: string) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onOpenSubmitProof,
}) => {
  const { 
    currentUser, 
    applyToActivity, 
    submissions, 
    getActivityLeaderboard 
  } = useApp();

  // Check if current user has enrolled in this activity
  const mySubmission = submissions.find(
    s => s.activityId === activity.id && s.userId === currentUser.id
  );

  const leaderboard = getActivityLeaderboard(activity.id);

  const handleApply = () => {
    applyToActivity(activity.id);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'environment': return 'بيئة وتشجير';
      case 'sports': return 'رياضة وصحة جوارية';
      case 'social': return 'تضامن وعمل خيري';
      case 'cultural': return 'تراث وثقافة';
      case 'digital': return 'رقميات وتطوير';
      default: return 'نشاط شبابي';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cover Header */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-4 right-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
              {getCategoryLabel(activity.category)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${
              activity.targetAudience === 'individuals'
                ? 'bg-emerald-600'
                : activity.targetAudience === 'institutions'
                ? 'bg-blue-600'
                : 'bg-purple-600'
            }`}>
              {activity.targetAudience === 'individuals' && 'موجه للأفراد'}
              {activity.targetAudience === 'institutions' && 'موجه للمؤسسات والهياكل'}
              {activity.targetAudience === 'all' && 'مفتوح للجميع (أفراد ومؤسسات)'}
            </span>
          </div>

          {/* Bottom title in cover */}
          <div className="absolute bottom-4 right-4 left-4 text-white">
            <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-md">
              {activity.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {activity.wilaya} • {activity.municipality}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                تاريخ النشاط: {activity.startDate} إلى {activity.endDate}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Points & Requirements Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">النقاط الأساسية</span>
              <span className="text-lg font-black text-amber-600 font-mono">+{activity.basePoints} نقطة</span>
            </div>

            {activity.pointsPerUnit && (
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">نقاط إضافية / {activity.unitName}</span>
                <span className="text-lg font-black text-emerald-600 font-mono">+{activity.pointsPerUnit} نقطة</span>
              </div>
            )}

            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">إرفاق الصور</span>
              <span className="text-xs font-bold flex items-center gap-1 text-slate-800 mt-1">
                <Camera className="w-4 h-4 text-emerald-600" />
                {activity.requiresPhotos ? 'إلزامي للتوثيق' : 'اختياري'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">تحديد الموقع الجغرافي</span>
              <span className="text-xs font-bold flex items-center gap-1 text-slate-800 mt-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                {activity.requiresLocation ? 'إلزامي بالإحداثيات' : 'غير مطلوب'}
              </span>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h3 className="text-base font-black text-slate-900 mb-2">عن النشاط وأهدافه</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {activity.fullDescription}
            </p>
          </div>

          {/* Multiple Proof Challenge Explanation */}
          {activity.allowMultipleProof && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <TreePine className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-amber-900">نظام الإثبات المتعدد والمستمر</h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  هذا النشاط يسمح لك بإدراج عدة إنجازات (مثل غرس عدة أشجار). لكل شجرة ترفع صورتها وموقعها الميداني، وتتضاعف نقاطك الممنوحة تلقائياً بعد مصادقة مقيّم المنصة!
                </p>
              </div>
            </div>
          )}

          {/* Suggested Locations / Sites */}
          {activity.locationsList && activity.locationsList.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                المواقع المحددة لهذا النشاط
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activity.locationsList.map((loc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-slate-800">{loc.name}</span>
                    {loc.coordinates && (
                      <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border">
                        {loc.coordinates}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity-Specific Leaderboard (المتصدرين في هذا النشاط بالذات) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">
                  لوحة المتصدرين في هذا النشاط
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {leaderboard.length} متطوع ومؤسسة معتمدة
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-xs text-slate-500">
                  كن أول من ينجز هذا النشاط ويوثق صوره ومواقعه ليتصدر قائمة الشرف هنا!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((item, index) => (
                  <div
                    key={item.user.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                      index === 0
                        ? 'bg-amber-50/70 border-amber-200'
                        : index === 1
                        ? 'bg-slate-50 border-slate-200'
                        : index === 2
                        ? 'bg-orange-50/50 border-orange-200'
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        index === 0
                          ? 'bg-amber-500 text-white'
                          : index === 1
                          ? 'bg-slate-400 text-white'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {index + 1}
                      </span>

                      <img
                        src={item.user.avatar}
                        alt={item.user.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />

                      <div>
                        <div className="font-bold text-slate-900">{item.user.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {item.user.wilaya} • {item.user.role === 'institution' ? 'مؤسسة / نادي' : 'متطوع فرد'}
                        </div>
                      </div>
                    </div>

                    <div className="text-left flex items-center gap-3">
                      {activity.unitName && (
                        <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                          {item.units} {activity.unitName}
                        </span>
                      )}
                      <span className="font-black text-amber-700 font-mono text-sm">
                        +{item.points} نقطة
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {mySubmission ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                حالة التسجيل: {
                  mySubmission.status === 'in_progress' ? 'قيد الإنجاز في الميدان' :
                  mySubmission.status === 'submitted' ? 'تم رفع الإثباتات (قيد التقييم)' :
                  mySubmission.status === 'approved' ? 'مكتمل ومعتمد بالنقاط' : 'مسجل'
                }
              </span>
            ) : (
              <span>انضم للنشاط الآن وابدأ برفع إثباتاتك</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
            >
              إغلاق
            </button>

            {/* If enrolled and can submit proof */}
            {mySubmission ? (
              mySubmission.status === 'in_progress' ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubmitProof(mySubmission.id);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>انتهت المهمة (رفع الصور والمواقع)</span>
                </button>
              ) : mySubmission.status === 'submitted' ? (
                <span className="px-4 py-2.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                  إثباتاتك قيد مراجعة المقيّم
                </span>
              ) : (
                <span className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
                  تم اعتماد المهمة (+{mySubmission.pointsAwarded} نقطة)
                </span>
              )
            ) : (
              <button
                onClick={handleApply}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>تقديم الآن (Apply)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
