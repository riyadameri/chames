import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, ActivityCategory, TargetAudience } from '../types';
import { ALGERIAN_WILAYAS } from '../data/mockData';
import { saveImageToFileSystem } from '../utils/fileStorage';
import { 
  ArrowRight, 
  Plus, 
  MapPin, 
  Camera, 
  TreePine, 
  Award, 
  Layers, 
  Sparkles, 
  Trash2,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Calendar,
  Users,
  Eye,
  Info,
  Check
} from 'lucide-react';

interface CreateActivityViewProps {
  onBack: () => void;
  activityToEdit?: Activity | null;
}

const COVER_PRESETS = [
  {
    name: 'واحات النخيل والصحراء (ورقلة وتقرت)',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
    category: 'environment'
  },
  {
    name: 'حملة تشجير الغابات والمدن',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    category: 'environment'
  },
  {
    name: 'الابتكار الرقمي والذكاء الاصطناعي',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    category: 'digital'
  },
  {
    name: 'العمل الخيري والتضامن الإنساني',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
    category: 'social'
  },
  {
    name: 'تنظيف الشواطئ والمحيط',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80',
    category: 'environment'
  },
  {
    name: 'الثقافة والتراث الوطني',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
    category: 'cultural'
  }
];

export const CreateActivityView: React.FC<CreateActivityViewProps> = ({ 
  onBack, 
  activityToEdit 
}) => {
  const { currentUser, addActivity, updateActivity, showToast } = useApp();

  const [title, setTitle] = useState(activityToEdit?.title || '');
  const [shortDesc, setShortDesc] = useState(activityToEdit?.shortDescription || '');
  const [fullDesc, setFullDesc] = useState(activityToEdit?.fullDescription || '');
  const [category, setCategory] = useState<ActivityCategory>(activityToEdit?.category || 'environment');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(activityToEdit?.targetAudience || 'all');
  
  // Specific constraints
  const [requiresPhotos, setRequiresPhotos] = useState(activityToEdit?.requiresPhotos ?? true);
  const [requiresLocation, setRequiresLocation] = useState(activityToEdit?.requiresLocation ?? true);
  const [allowMultipleProof, setAllowMultipleProof] = useState(activityToEdit?.allowMultipleProof ?? true);
  const [unitName, setUnitName] = useState(activityToEdit?.unitName || 'شجرة مغروسة / فسيلة نخيل');
  const [basePoints, setBasePoints] = useState(activityToEdit?.basePoints || 150);
  const [pointsPerUnit, setPointsPerUnit] = useState(activityToEdit?.pointsPerUnit || 30);

  const [wilaya, setWilaya] = useState(activityToEdit?.wilaya || currentUser.wilaya || '30 - ورقلة');
  const [municipality, setMunicipality] = useState(activityToEdit?.municipality || 'ورقلة الكبرى / حاسي مسعود');
  const [startDate, setStartDate] = useState(activityToEdit?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(activityToEdit?.endDate || new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [targetParticipants, setTargetParticipants] = useState(activityToEdit?.targetParticipants || 500);

  // Cover image
  const [coverImage, setCoverImage] = useState(activityToEdit?.coverImage || COVER_PRESETS[0].url);
  const [isUploading, setIsUploading] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { dataUrl, record } = await saveImageToFileSystem(file, 'activity');
      setCoverImage(dataUrl);
      showToast({
        type: 'success',
        title: 'تم حفظ صورة النشاط في الملفات 📁',
        message: `تم حفظ "${record.name}" بنجاح في مجلدات النظام وتحديث صورة المشروع التطوعي.`,
      });
    } catch (err) {
      console.error(err);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (typeof loadEvent.target?.result === 'string') {
          setCoverImage(loadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast({ type: 'warning', title: 'بيانات ناقصة', message: 'يرجى كتابة عنوان المشروع التطوعي.' });
      return;
    }
    if (!shortDesc.trim()) {
      showToast({ type: 'warning', title: 'بيانات ناقصة', message: 'يرجى كتابة ملخص موجز للمشروع.' });
      return;
    }

    if (activityToEdit) {
      const result = updateActivity(activityToEdit.id, {
        title: title.trim(),
        shortDescription: shortDesc.trim(),
        fullDescription: fullDesc.trim() || shortDesc.trim(),
        category,
        targetAudience,
        basePoints: Number(basePoints),
        requiresPhotos,
        requiresLocation,
        allowMultipleProof,
        unitName: allowMultipleProof ? unitName.trim() : undefined,
        pointsPerUnit: allowMultipleProof ? Number(pointsPerUnit) : undefined,
        wilaya,
        municipality: municipality.trim(),
        startDate,
        endDate,
        targetParticipants: Number(targetParticipants),
        coverImage,
      });

      if (result.success) {
        onBack();
      }
    } else {
      const result = addActivity({
        title: title.trim(),
        shortDescription: shortDesc.trim(),
        fullDescription: fullDesc.trim() || shortDesc.trim(),
        category,
        targetAudience,
        basePoints: Number(basePoints),
        requiresPhotos,
        requiresLocation,
        allowMultipleProof,
        unitName: allowMultipleProof ? unitName.trim() : undefined,
        pointsPerUnit: allowMultipleProof ? Number(pointsPerUnit) : undefined,
        creatorRole: (currentUser.role === 'general_admin' || currentUser.username === 'riyad') ? 'general_admin' : 'institution_admin',
        institutionId: currentUser.role === 'institution_admin' ? currentUser.id : undefined,
        institutionName: currentUser.role === 'institution_admin' ? currentUser.name : undefined,
        wilaya,
        municipality: municipality.trim(),
        startDate,
        endDate,
        status: 'active',
        coverImage,
        targetParticipants: Number(targetParticipants),
        enrolledCount: 0,
        completedCount: 0,
        featured: true
      });

      if (result.success) {
        onBack();
      }
    }
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300 pb-12" dir="rtl">
      
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة المشاريع والأنشطة</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{activityToEdit ? 'تعديل بيانات النشاط التطوعي' : 'نشر مشروع تطوعي ميداني جديد'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {currentUser.role === 'general_admin' ? 'اعتماد وزاري مباشر 🇩🇿' : 'هيكل شباني معتمد'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            املأ نموذج المشروع لنشره وتعميمه على متطوعي الولاية وكافة ربوع الوطن مع احتساب النقاط والستريك.
          </p>
        </div>

        {/* Quick Wilaya Highlights: Ouargla & Touggourt */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setWilaya('30 - ورقلة');
              setMunicipality('ورقلة - حاسي مسعود - سيدي خويلد');
              setUnitName('فسيلة نخيل / شتلة صحراوية');
              setCoverImage(COVER_PRESETS[0].url);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              wilaya.includes('ورقلة')
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <span>🌴 نموذج ورقلة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWilaya('55 - تقرت');
              setMunicipality('تقرت - تماسين - المقارين');
              setUnitName('ورشة تدريبية / نخلة مخدومة');
              setCoverImage(COVER_PRESETS[2].url);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              wilaya.includes('تقرت')
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <span>🌴 نموذج تقرت</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left/Center + Live Preview Right */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Body (2 Columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>1. المعلومات الأساسية للمشروع التطوعي</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                عنوان المشروع التطوعي <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مبادرة غرس مليون نخلة وشجرة صادة للرمال بواحات ورقلة وتقرت"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-semibold bg-slate-50/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">مجال / تصنيف النشاط</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white font-medium"
                >
                  <option value="environment">🌲 بيئة، غرس وتشجير واحات</option>
                  <option value="digital">💻 مهارات رقمية وابتكار تكنولوجي</option>
                  <option value="social">🤝 عمل خيري وتضامن اجتماعي</option>
                  <option value="sports">🏃 رياضة جوارية وصحة مجتمعية</option>
                  <option value="cultural">🏺 تراث وطني وثقافة وفنون</option>
                  <option value="disaster">🚨 استجابة وطوارئ وإغاثة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">الفئة المستهدفة للمشاركة</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white font-medium"
                >
                  <option value="all">الجميع (أفراد ونوادي ومؤسسات)</option>
                  <option value="individuals">المتطوعون الأفراد فقط</option>
                  <option value="institutions">الجمعيات والنوادي الشبانية فقط</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                ملخص سريع (يظهر على بطاقة المشروع وفي الخريطة) <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                rows={2}
                placeholder="سطرين يوضحان الهدف الجوهري للمشروع وأهميته..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                الوصف التفصيلي وخطة العمل الميداني
              </label>
              <textarea
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                rows={4}
                placeholder="اشرح بالتفصيل برنامج النشاط، نقطة التجمع، الأدوات المتوفرة، والتعليمات الخاصة بالمتطوعين..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-slate-50/50"
              />
            </div>
          </div>

          {/* Section 2: Location & Wilaya */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>2. الموقع الجغرافي والولاية (58 ولاية)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">الولاية الحاضنة للمشروع</label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white font-medium"
                >
                  <optgroup label="⭐ واحات الجنوب والتركيز الخاص">
                    <option value="30 - ورقلة">30 - ورقلة (واحات الجنوب 🌴)</option>
                    <option value="55 - تقرت">55 - تقرت (وادي ريغ والواحات 🌴)</option>
                  </optgroup>
                  <optgroup label="كافة ولايات الوطن (58 ولاية)">
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">البلدية أو الموقع الميداني الدقيق</label>
                <input
                  type="text"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  placeholder="مثال: بلدية تماسين / واحة القصر العتيق"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Proof Rules & Points System */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-4 h-4 text-amber-600" />
              <span>3. شروط التقييم، إثبات الإنجاز والنقاط التطوعية</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">نقاط المشاركة الأساسية</label>
                <input
                  type="number"
                  value={basePoints}
                  onChange={(e) => setBasePoints(Number(e.target.value))}
                  min={10}
                  max={2000}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold"
                />
                <p className="text-[10px] text-slate-600 mt-1">تُمنح للمتطوع فور اعتماد مشاركته الأساسية في النشاط.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">العدد المستهدف من المتطوعين</label>
                <input
                  type="number"
                  value={targetParticipants}
                  onChange={(e) => setTargetParticipants(Number(e.target.value))}
                  min={1}
                  max={10000}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold"
                />
              </div>
            </div>

            {/* Checkboxes for conditions */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresPhotos}
                  onChange={(e) => setRequiresPhotos(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">اشتراط رفع صور فوتوغرافية حية كإثبات ميداني</div>
                  <div className="text-slate-600 text-[11px]">يلزم المتطوع برفع صور قبل/أثناء/بعد النشاط للمصادقة عليها من المقيّم.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresLocation}
                  onChange={(e) => setRequiresLocation(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">التحقق الجغرافي من الموقع الميداني (GPS)</div>
                  <div className="text-slate-600 text-[11px]">تسجيل إحداثيات الموقع عند رفع الإثبات للتأكد من التواجد بالولاية المحددة.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowMultipleProof}
                  onChange={(e) => setAllowMultipleProof(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <div className="text-xs">
                  <div className="font-bold text-amber-950">تحدي تراكمي متكرر بنقاط إضافية (مثل غرس الأشجار أو السلال)</div>
                  <div className="text-amber-800 text-[11px]">يسمح باحتساب وحدات منجزة (أشجار، سلات، حقائب) ومنح نقاط مضاعفة على كل وحدة!</div>
                </div>
              </label>

              {allowMultipleProof && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 mt-2 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">اسم الوحدة المنجزة</label>
                    <input
                      type="text"
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      placeholder="مثال: فسيلة نخيل، حقيبة مدرسية، شتلة"
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">النقاط الإضافية لكل وحدة</label>
                    <input
                      type="number"
                      value={pointsPerUnit}
                      onChange={(e) => setPointsPerUnit(Number(e.target.value))}
                      min={5}
                      max={500}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">تاريخ البداية والانطلاق</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">تاريخ انتهاء المبادرة</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Cover Image & File System Upload */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>4. صورة الغلاف وحفظها في ملفات المنصة</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">اختر نموذجاً جاهزاً أو ارفع صورة خاصة:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                {COVER_PRESETS.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCoverImage(p.url)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition group ${
                      coverImage === p.url ? 'border-emerald-600 ring-4 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-24 object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-bold text-white leading-tight">{p.name}</span>
                    </div>
                    {coverImage === p.url && (
                      <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload to file system input */}
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'جاري حفظ الصورة في الملفات...' : 'أو رفع صورة من جهازك (تُحفظ تلقائياً في ملفات المنصة)'}</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{activityToEdit ? 'حفظ التعديلات على المشروع' : 'نشر المشروع وتفعيله على مستوى الوطن 🚀'}</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer"
            >
              إلغاء والعودة
            </button>
          </div>

        </div>

        {/* Right Column: Live Interactive Preview */}
        <div className="space-y-4">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-2 text-xs font-black text-slate-800">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>معاينة حية للمشروع (كما يظهر للمتطوعين):</span>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={coverImage}
                  alt="معاينة الغلاف"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{wilaya}</span>
                </div>
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs">
                  +{basePoints} نقطة
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    نشط ميدانياً
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    {municipality || 'موقع محدد'}
                  </span>
                </div>

                <h3 className="font-black text-sm text-slate-900 leading-snug line-clamp-2">
                  {title || 'عنوان المشروع التطوعي الجديد'}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {shortDesc || 'سيظهر هنا ملخص سريع للمبادرة التطوعية وشرح الأهداف الأساسية...'}
                </p>

                {allowMultipleProof && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between">
                    <span className="font-bold">تحدي تراكمي:</span>
                    <span className="font-black">+{pointsPerUnit} نقطة لكل {unitName}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>مستهدف: {targetParticipants}</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    تسجيل ومشاركة فورية ←
                  </span>
                </div>
              </div>
            </div>

            {/* Note box */}
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-right text-xs text-emerald-950 space-y-1.5">
              <div className="font-black flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>تنبيه وإشعار:</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                فور الضغط على "نشر المشروع"، ستتم إضافته فوراً إلى خريطة شمس ماب وقائمة المشاريع وستصل تنبيهات فورية لكافة المتطوعين في ولاية {wilaya}.
              </p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
