import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, ActivityCategory, TargetAudience } from '../types';
import { 
  Search, 
  Filter, 
  MapPin, 
  Camera, 
  Sparkles, 
  Award, 
  Users, 
  Building2, 
  TreePine, 
  CheckCircle2, 
  Calendar,
  Layers,
  Compass,
  Edit3,
  Trash2
} from 'lucide-react';

interface ActivitiesViewProps {
  onSelectActivity: (activity: Activity) => void;
  onOpenSubmitProof: (submissionId: string) => void;
  onOpenCreateActivity: () => void;
  onEditActivity?: (activity: Activity) => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  onSelectActivity,
  onOpenSubmitProof,
  onOpenCreateActivity,
  onEditActivity,
}) => {
  const { activities, submissions, currentUser, applyToActivity, deleteActivity, isShamsAdmin, canManageAllContent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<TargetAudience | 'all_filter'>('all_filter');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyRequiresPhotos, setOnlyRequiresPhotos] = useState(false);
  const [onlyRequiresLocation, setOnlyRequiresLocation] = useState(false);
  const [onlyMultipleProof, setOnlyMultipleProof] = useState(false);

  // Filter logic
  const filteredActivities = activities.filter(act => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.shortDescription.toLowerCase().includes(q);
      const matchWilaya = act.wilaya.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchWilaya) return false;
    }

    // Target
    if (selectedTarget !== 'all_filter') {
      if (selectedTarget === 'individuals' && act.targetAudience !== 'individuals' && act.targetAudience !== 'all') return false;
      if (selectedTarget === 'institutions' && act.targetAudience !== 'institutions' && act.targetAudience !== 'all') return false;
    }

    // Category
    if (selectedCategory !== 'all' && act.category !== selectedCategory) {
      return false;
    }

    // Requirements
    if (onlyRequiresPhotos && !act.requiresPhotos) return false;
    if (onlyRequiresLocation && !act.requiresLocation) return false;
    if (onlyMultipleProof && !act.allowMultipleProof) return false;

    return true;
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'environment': return 'بيئة وتشجير';
      case 'sports': return 'رياضة وصحة';
      case 'social': return 'تضامن وعمل خيري';
      case 'cultural': return 'تراث وثقافة';
      case 'digital': return 'رقميات وتطوير';
      default: return 'نشاط شبابي';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Search and Filters Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الولاية، أو نوع النشاط (مثلاً: غرس، ملاعب)..."
              className="w-full pr-10 pl-4 py-2.5 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          </div>

          {/* Quick Target Audience Tabs (الجمهور المستهدف: الجميع / أفراد / مؤسسات) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedTarget('all_filter')}
              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex-1 md:flex-initial text-center ${
                selectedTarget === 'all_filter'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({activities.length})
            </button>

            <button
              onClick={() => setSelectedTarget('individuals')}
              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex-1 md:flex-initial flex items-center justify-center gap-1 ${
                selectedTarget === 'individuals'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>للأفراد</span>
            </button>

            <button
              onClick={() => setSelectedTarget('institutions')}
              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition whitespace-nowrap flex-1 md:flex-initial flex items-center justify-center gap-1 ${
                selectedTarget === 'institutions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>مؤسسات ونوادي</span>
            </button>
          </div>

          {/* Create Button for Admins */}
          {(currentUser.role === 'general_admin' || currentUser.role === 'institution_admin') && (
            <button
              onClick={onOpenCreateActivity}
              className="w-full md:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>+</span>
              <span>نشر نشاط جديد</span>
            </button>
          )}

        </div>

        {/* Secondary filters: Categories & Requirement tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Categories pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 ml-2">المجال:</span>
            {[
              { id: 'all', label: 'كافة المجالات' },
              { id: 'environment', label: '🌱 بيئة وتشجير' },
              { id: 'sports', label: '⚽ رياضة جوارية' },
              { id: 'social', label: '🤝 تضامن اجتماعي' },
              { id: 'digital', label: '💻 مهارات ورقميات' },
              { id: 'cultural', label: '🏛️ تراث وثقافة' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Toggles for specific features */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyMultipleProof(!onlyMultipleProof)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 ${
                onlyMultipleProof
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <TreePine className="w-3.5 h-3.5 text-amber-600" />
              <span>تحدي تكراري (مثل غرس الأشجار)</span>
            </button>

            <button
              onClick={() => setOnlyRequiresLocation(!onlyRequiresLocation)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 ${
                onlyRequiresLocation
                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>يتطلب موقع جغرافي</span>
            </button>

            <button
              onClick={() => setOnlyRequiresPhotos(!onlyRequiresPhotos)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 ${
                onlyRequiresPhotos
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>يتطلب صور توثيق</span>
            </button>
          </div>

        </div>

      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-800">لا توجد نشاطات تطابق خيارات البحث</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            جرب إزالة بعض التصفيات أو البحث بكلمات أخرى لاستعراض المزيد من المبادرات الشبابية.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTarget('all_filter');
              setSelectedCategory('all');
              setOnlyRequiresPhotos(false);
              setOnlyRequiresLocation(false);
              setOnlyMultipleProof(false);
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => {
            const mySub = submissions.find(
              s => s.activityId === activity.id && s.userId === currentUser.id
            );

            const canManageActivity = canManageAllContent || isShamsAdmin || currentUser.role === 'general_admin' || currentUser.role === 'media_admin' || (currentUser.role === 'institution_admin' && (activity.creatorRole === 'institution_admin' || activity.institutionId === currentUser.affiliatedInstitutionId));

            return (
              <div
                key={activity.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group text-right"
              >
                
                {/* Cover Image & Badges */}
                <div 
                  onClick={() => onSelectActivity(activity)}
                  className="relative h-48 w-full overflow-hidden bg-slate-100 cursor-pointer"
                  title="انقر لعرض تفاصيل المشروع والمتصدرين فيه"
                >
                  <img
                    src={activity.coverImage}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  {/* Top Badges Bar: Right (Category & Audience) and Left (Points) */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between gap-1.5 pointer-events-none">
                    <div className="flex flex-wrap items-center gap-1 max-w-[65%]">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-xs truncate">
                        {getCategoryLabel(activity.category)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black text-white shadow-xs ${
                        activity.targetAudience === 'individuals'
                          ? 'bg-emerald-600'
                          : activity.targetAudience === 'institutions'
                          ? 'bg-blue-600'
                          : 'bg-purple-600'
                      }`}>
                        {activity.targetAudience === 'individuals' && 'أفراد'}
                        {activity.targetAudience === 'institutions' && 'مؤسسات'}
                        {activity.targetAudience === 'all' && 'للجميع'}
                      </span>
                    </div>

                    <div className="shrink-0">
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-amber-500 text-slate-950 shadow-md flex items-center gap-1 font-mono whitespace-nowrap">
                        <Sparkles className="w-3 h-3 text-slate-950 shrink-0" />
                        <span>+{activity.basePoints} ن</span>
                        {activity.pointsPerUnit && <span className="text-[10px] opacity-80">(+{activity.pointsPerUnit})</span>}
                      </span>
                    </div>
                  </div>

                  {/* Wilaya pill */}
                  <div className="absolute bottom-3 right-3 text-white text-xs font-bold flex items-center gap-1 drop-shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activity.wilaya}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-2">
                    <h3 
                      onClick={() => onSelectActivity(activity)}
                      className="font-black text-base text-slate-900 leading-snug group-hover:text-emerald-700 transition cursor-pointer line-clamp-2"
                    >
                      {activity.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {activity.shortDescription}
                    </p>
                  </div>

                  {/* Requirements & Rules Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-[10px]">
                    {activity.requiresPhotos && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold flex items-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-600" />
                        يتطلب صور
                      </span>
                    )}
                    {activity.requiresLocation && (
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        يتطلب موقع
                      </span>
                    )}
                    {activity.allowMultipleProof && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 font-bold flex items-center gap-1">
                        <TreePine className="w-3 h-3 text-amber-600" />
                        تحدي متعدد ({activity.unitName})
                      </span>
                    )}
                  </div>

                  {/* Progress info */}
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between font-semibold">
                      <span>المشاركون: {activity.enrolledCount} مسجل</span>
                      <span className="text-emerald-700 font-bold">{activity.completedCount} أنجزوا المهمة</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(15, (activity.completedCount / (activity.enrolledCount || 1)) * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    
                    {mySub ? (
                      mySub.status === 'in_progress' ? (
                        <button
                          onClick={() => onOpenSubmitProof(mySub.id)}
                          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>انتهت المهمة (رفع الإثبات)</span>
                        </button>
                      ) : mySub.status === 'submitted' ? (
                        <div className="flex-1 py-2 px-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 text-center">
                          قيد مراجعة المقيّم
                        </div>
                      ) : (
                        <div className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 text-center">
                          معتمد (+{mySub.pointsAwarded} ن)
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => applyToActivity(activity.id)}
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>تقديم (Apply)</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectActivity(activity)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                      title="عرض التفاصيل الكاملة والمتصدرين"
                    >
                      التفاصيل
                    </button>

                    {canManageActivity && (
                      <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditActivity?.(activity);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                          title="تعديل بيانات النشاط واستبدال الصورة"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`هل أنت متأكد من حذف النشاط التطوعي "${activity.title}"؟`)) {
                              deleteActivity(activity.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 transition"
                          title="حذف النشاط التطوعي"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
