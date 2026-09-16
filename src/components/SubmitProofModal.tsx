import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProofItem } from '../types';
import { 
  X, 
  Camera, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Image as ImageIcon,
  Compass,
  AlertCircle
} from 'lucide-react';

interface SubmitProofModalProps {
  submissionId: string;
  onClose: () => void;
}

export const SubmitProofModal: React.FC<SubmitProofModalProps> = ({
  submissionId,
  onClose,
}) => {
  const { submissions, activities, submitProof } = useApp();

  const submission = submissions.find(s => s.id === submissionId);
  const activity = activities.find(a => a.id === submission?.activityId);

  // Preset realistic volunteer proof photos for quick addition
  const samplePhotoUrls = [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
  ];

  const sampleLocations = [
    { name: 'غابة باينام - مسلك الصنوبر', coords: { lat: 36.8021, lng: 2.9740 } },
    { name: 'محيط دار الشباب وادي قريش', coords: { lat: 36.7840, lng: 3.0445 } },
    { name: 'ملعب حي ديار البركة الجواري', coords: { lat: 36.6715, lng: 3.0925 } },
    { name: 'حديقة التجارب الحامة', coords: { lat: 36.7490, lng: 3.0720 } },
    { name: 'غابة كاناستيل - وهران', coords: { lat: 35.7335, lng: -0.5895 } },
  ];

  const [items, setItems] = useState<ProofItem[]>([
    {
      id: `proof-${Date.now()}-1`,
      photoUrl: samplePhotoUrls[0],
      locationName: sampleLocations[0].name,
      coordinates: sampleLocations[0].coords,
      description: activity?.allowMultipleProof
        ? `${activity.unitName || 'شجرة'} رقم 1: تم الإنجاز في الموقع المحدد وسقايتها.`
        : 'إتمام كافة المهام المطلوبة وتوثيق النتيجة النهائية.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [generalNotes, setGeneralNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!submission || !activity) return null;

  const handleAddItem = () => {
    const nextIndex = items.length;
    const photo = samplePhotoUrls[nextIndex % samplePhotoUrls.length];
    const loc = sampleLocations[nextIndex % sampleLocations.length];

    setItems([
      ...items,
      {
        id: `proof-${Date.now()}-${nextIndex + 1}`,
        photoUrl: photo,
        locationName: loc.name,
        coordinates: loc.coords,
        description: `${activity.unitName || 'شجرة / إنجاز'} رقم ${nextIndex + 1}: توثيق ميداني مع الموقع.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setErrorMsg('يجب تقديم إثبات واحد على الأقل لإتمام المهمة.');
      return;
    }
    setErrorMsg('');
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof ProofItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('يرجى إضافة إثبات واحد على الأقل.');
      return;
    }

    // Validate requirements
    if (activity.requiresPhotos) {
      const missingPhoto = items.some(i => !i.photoUrl.trim());
      if (missingPhoto) {
        setErrorMsg('هذا النشاط يتطلب إرفاق صورة لكل عنصر منجز.');
        return;
      }
    }

    if (activity.requiresLocation) {
      const missingLoc = items.some(i => !i.locationName.trim());
      if (missingLoc) {
        setErrorMsg('هذا النشاط يتطلب تحديد الموقع الجغرافي لكل عنصر منجز.');
        return;
      }
    }

    submitProof(submission.id, {
      proofItems: items,
      generalNotes,
      unitsCount: items.length,
    });

    onClose();
  };

  // Expected points calculation
  const estimatedPoints = activity.basePoints + (activity.pointsPerUnit ? (items.length * activity.pointsPerUnit) : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">انتهت المهمة — رفع الإثباتات والتوثيق</h3>
              <p className="text-xs text-emerald-200 mt-0.5">{activity.title}</p>
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                {activity.allowMultipleProof 
                  ? `يمكنك إضافة أكثر من موقع وصورة (مثلاً لكل ${activity.unitName || 'شجرة'} أضف صورة وموقعها بدقة)` 
                  : 'أرفق صور إنجاز المهمة وموقعها الميداني ليراجعها مقيّم المنصة.'}
              </p>
              <p className="text-amber-800">
                كل عنصر توثقه يزيد من مجموع النقاط الممنوحة لك فور اعتمادها من لجنة المتابعة.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* List of Proof Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-slate-900">
                عناصر الإثبات والتوثيق ({items.length})
              </h4>
              {activity.allowMultipleProof && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عنصر آخر ({activity.unitName || 'شجرة أخرى'})</span>
                </button>
              )}
            </div>

            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    {activity.allowMultipleProof ? `${activity.unitName || 'الشجرة / العنصر'} رقم ${index + 1}` : 'إثبات الإنجاز الميداني'}
                  </span>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 transition"
                      title="حذف هذا العنصر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Input & Preview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      رابط أو صورة الإنجاز
                      {activity.requiresPhotos && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={item.photoUrl}
                      onChange={(e) => handleUpdateItem(item.id, 'photoUrl', e.target.value)}
                      placeholder="رابط الصورة أو اختر من النماذج أدناه..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      dir="ltr"
                    />

                    {/* Quick photo presets */}
                    <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                      {samplePhotoUrls.slice(0, 4).map((url, uidx) => (
                        <img
                          key={uidx}
                          src={url}
                          alt="sample"
                          onClick={() => handleUpdateItem(item.id, 'photoUrl', url)}
                          className={`w-12 h-10 object-cover rounded-lg cursor-pointer border-2 transition ${
                            item.photoUrl === url ? 'border-emerald-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                          title="اضغط لاختيار هذه الصورة النموذجية"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Location Input & Coordinates */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      الموقع الجغرافي / العنوان
                      {activity.requiresLocation && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={item.locationName}
                      onChange={(e) => handleUpdateItem(item.id, 'locationName', e.target.value)}
                      placeholder="مثال: غابة باينام - مسار الدراجات..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />

                    {/* Coordinates pill */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span className="flex items-center gap-1 font-mono">
                        <Compass className="w-3.5 h-3.5 text-emerald-600" />
                        {item.coordinates ? `${item.coordinates.lat.toFixed(4)}, ${item.coordinates.lng.toFixed(4)}` : 'GPS مفعّل'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          // Simulate getting device GPS location
                          const randomOffset = (Math.random() - 0.5) * 0.01;
                          handleUpdateItem(item.id, 'coordinates', {
                            lat: 36.7538 + randomOffset,
                            lng: 3.0588 + randomOffset,
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 font-bold transition"
                      >
                        تحديث الإحداثيات GPS
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description for this item */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    وصف مختصر لهذا العنصر (نوع الشجرة، الحالة، الملاحظات)
                  </label>
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="مثال: شجرة صنوبر حلبي - تم غرسها وسقيها 10 لتر وتثبيت دعامة خشبية"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                {/* Live Preview Thumbnail */}
                {item.photoUrl && (
                  <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={item.photoUrl}
                      alt="معاينة الإثبات"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{item.locationName}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* General completion notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              ملاحظات عامة لتقرير الإنجاز (اختياري)
            </label>
            <textarea
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="اكتب تقريراً أو كلمة شكر أو توضيحاً لفريق التقييم حول ظروف الإنجاز ومشاركة الشباب..."
              className="w-full p-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Summary Box & Potential Points */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-emerald-950">تقدير النقاط المتوقعة:</div>
              <div className="text-[11px] text-emerald-800">
                {items.length} {activity.unitName || 'إثباتات منجزة'} • تخضع للمراجعة
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-700 font-mono">
                ~{estimatedPoints} نقطة
              </span>
            </div>
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
              <CheckCircle2 className="w-4 h-4" />
              <span>إرسال التقرير للمقيّم واعتماد النقاط</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
