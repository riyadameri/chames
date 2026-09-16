import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityCategory, TargetAudience } from '../types';
import { 
  X, 
  Plus, 
  MapPin, 
  Camera, 
  TreePine, 
  Award, 
  Layers, 
  Sparkles, 
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

interface CreateActivityModalProps {
  onClose: () => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ onClose }) => {
  const { currentUser, addActivity } = useApp();

  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('environment');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('all');
  
  // Specific constraints requested in prompt:
  const [requiresPhotos, setRequiresPhotos] = useState(true);
  const [requiresLocation, setRequiresLocation] = useState(true);
  const [allowMultipleProof, setAllowMultipleProof] = useState(true); // e.g. tree challenge
  const [unitName, setUnitName] = useState('شجرة مغروسة');
  const [basePoints, setBasePoints] = useState(150);
  const [pointsPerUnit, setPointsPerUnit] = useState(25);

  const [wilaya, setWilaya] = useState(currentUser.wilaya || 'الجزائر العاصمة');
  const [municipality, setMunicipality] = useState('مختلف البلديات');
  const [startDate, setStartDate] = useState('2026-09-20');
  const [endDate, setEndDate] = useState('2026-11-20');
  const [targetParticipants, setTargetParticipants] = useState(500);

  // Cover image preset or custom
  const coverPresets = [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
  ];
  const [coverImage, setCoverImage] = useState(coverPresets[0]);

  // Designated locations list
  const [locations, setLocations] = useState<{ name: string; coordinates?: string }[]>([
    { name: 'غابة باينام - مسار التشجير', coordinates: '36.8012, 2.9734' },
    { name: 'محيط دار الشباب النموذجية', coordinates: '36.7845, 3.0450' },
  ]);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCoords, setNewLocCoords] = useState('');

  const handleAddLocation = () => {
    if (!newLocName.trim()) return;
    setLocations([...locations, { name: newLocName.trim(), coordinates: newLocCoords.trim() || undefined }]);
    setNewLocName('');
    setNewLocCoords('');
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDesc.trim()) return;

    addActivity({
      title: title.trim(),
      shortDescription: shortDesc.trim(),
      fullDescription: fullDesc.trim() || shortDesc.trim(),
      category,
      targetAudience,
      basePoints: Number(basePoints) || 100,
      requiresPhotos,
      requiresLocation,
      allowMultipleProof,
      unitName: allowMultipleProof ? unitName : undefined,
      pointsPerUnit: allowMultipleProof ? Number(pointsPerUnit) : undefined,
      creatorRole: currentUser.role === 'institution_admin' ? 'institution_admin' : 'general_admin',
      institutionId: currentUser.role === 'institution_admin' ? currentUser.affiliatedInstitutionId : undefined,
      institutionName: currentUser.role === 'institution_admin' ? currentUser.affiliatedInstitutionName : undefined,
      wilaya,
      municipality,
      startDate,
      endDate,
      status: 'active',
      coverImage,
      targetParticipants: Number(targetParticipants) || 100,
      locationsList: locations,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">نشر نشاط أو مشروع تطوعي جديد</h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                {currentUser.role === 'general_admin' ? 'إشراف المديرية العامة (وزارة الشباب والرياضة)' : `إشراف: ${currentUser.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Target Audience Selection (Crucial from prompt) */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800">
              الجمهور المستهدف من النشاط * (حدد هل يستهدف مؤسسات أو أفراد)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setTargetAudience('individuals')}
                className={`p-3.5 rounded-2xl border text-right transition flex items-center gap-3 ${
                  targetAudience === 'individuals'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  targetAudience === 'individuals' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  👤
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">موجه للأفراد فقط</div>
                  <div className="text-[10px] text-slate-500">متطوعون شباب</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience('institutions')}
                className={`p-3.5 rounded-2xl border text-right transition flex items-center gap-3 ${
                  targetAudience === 'institutions'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  targetAudience === 'institutions' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  🏢
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">موجه للمؤسسات والهياكل</div>
                  <div className="text-[10px] text-slate-500">دور شباب، مركبات، جمعيات</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience('all')}
                className={`p-3.5 rounded-2xl border text-right transition flex items-center gap-3 ${
                  targetAudience === 'all'
                    ? 'border-purple-500 bg-purple-50/80 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  targetAudience === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  🌟
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">مفتوح للجميع</div>
                  <div className="text-[10px] text-slate-500">أفراد + مؤسسات معاً</div>
                </div>
              </button>

            </div>
          </div>

          {/* 2. Basic details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عنوان النشاط أو المشروع التطوعي *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: حملة التشجير الكبرى في محيط دار الشباب والغابات الحضرية"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">مجال النشاط</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="environment">بيئة وتشجير واستدامة</option>
                  <option value="sports">رياضة وصحة جوارية</option>
                  <option value="social">تضامن وعمل خيري</option>
                  <option value="cultural">ثقافة وتراث وطني</option>
                  <option value="digital">رقمنة ومهارات شبابية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الولاية والمكان</label>
                <input
                  type="text"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  placeholder="مثال: الجزائر العاصمة، وهران، قسنطينة..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الوصف المختصر (يظهر في بطاقة النشاط)
              </label>
              <input
                type="text"
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="نبذة تشويقية توضح أهداف المبادرة..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                التفاصيل الكاملة ودليل المشاركة
              </label>
              <textarea
                rows={3}
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                placeholder="وضح شروط المشاركة، طريقة التوثيق، والتوجيهات الميدانية للمتطوعين..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 3. Verification Rules (Required from prompt: هل يجب ادراج صور؟ هل يجب ادراج موقع؟ اكثر من موقع وصورة؟) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-black text-xs text-slate-900">
                شروط الإثبات واعتماد النقاط (الصور والمواقع)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Requires Photos toggle */}
              <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  هل يجب إدراج صور؟
                </span>
                <input
                  type="checkbox"
                  checked={requiresPhotos}
                  onChange={(e) => setRequiresPhotos(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              {/* Requires Location toggle */}
              <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  هل يجب إدراج موقع جغرافي؟
                </span>
                <input
                  type="checkbox"
                  checked={requiresLocation}
                  onChange={(e) => setRequiresLocation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>

            {/* Multiple Proofs challenge toggle (e.g. tree challenge where each tree has photo & location) */}
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-amber-700" />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      السماح بإضافة أكثر من موقع وصورة (تحدي تكراري مستمر)
                    </span>
                    <span className="text-[10px] text-amber-800">
                      مثل تحدي الغرس: لكل شجرة يضيف المشارك صورة مع موقعها وتزداد النقاط باستمرار
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowMultipleProof}
                  onChange={(e) => setAllowMultipleProof(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
              </label>

              {allowMultipleProof && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/80">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      اسم الوحدة المنجزة (مثلاً: شجرة، سلة، كتاب)
                    </label>
                    <input
                      type="text"
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      النقاط المضافة لكل وحدة موثقة
                    </label>
                    <input
                      type="number"
                      value={pointsPerUnit}
                      onChange={(e) => setPointsPerUnit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Base Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  النقاط الأساسية للمهمة
                </label>
                <input
                  type="number"
                  value={basePoints}
                  onChange={(e) => setBasePoints(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العدد المستهدف من المشاركين
                </label>
                <input
                  type="number"
                  value={targetParticipants}
                  onChange={(e) => setTargetParticipants(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Designated Locations list (إضافة أكثر من موقع للنشاط) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>المواقع المقترحة والمحددة للنشاط ميدانياً</span>
              <span className="text-[11px] text-slate-500">({locations.length} مواقع مسجلة)</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                placeholder="اسم الموقع (مثلاً: غابة باينام، حديقة الحرية)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
              <input
                type="text"
                value={newLocCoords}
                onChange={(e) => setNewLocCoords(e.target.value)}
                placeholder="الإحداثيات إن وجدت (اختياري)..."
                className="w-40 px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono text-left"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleAddLocation}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition"
              >
                + إضافة
              </button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {locations.map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-slate-800">{loc.name}</span>
                    {loc.coordinates && (
                      <span className="text-[10px] text-slate-500 font-mono">{loc.coordinates}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Cover Image selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              صورة الغلاف للنشاط
            </label>
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
              {coverPresets.map((preset, idx) => (
                <img
                  key={idx}
                  src={preset}
                  alt="cover"
                  onClick={() => setCoverImage(preset)}
                  className={`w-16 h-12 object-cover rounded-xl cursor-pointer border-2 transition ${
                    coverImage === preset ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="أو أدخل رابط صورة مخصصة..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
              dir="ltr"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>نشر النشاط في المنصة فوراً</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
