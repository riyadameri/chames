import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ALGERIAN_WILAYAS } from '../data/mockData';
import { saveImageToFileSystem } from '../utils/fileStorage';
import { 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  Palette, 
  MapPin, 
  Tag, 
  Send, 
  Upload, 
  Flame,
  Check
} from 'lucide-react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADIENT_PRESETS = [
  { id: 'emerald', name: 'شمس الأخضر', class: 'from-emerald-700 via-teal-800 to-slate-900', text: '#ffffff' },
  { id: 'sunset', name: 'غروب ذهبي', class: 'from-amber-600 via-rose-600 to-indigo-900', text: '#ffffff' },
  { id: 'desert', name: 'طاسيلي وصحراء', class: 'from-orange-500 via-amber-600 to-yellow-800', text: '#ffffff' },
  { id: 'night', name: 'سماء ليلية', class: 'from-slate-900 via-indigo-950 to-emerald-950', text: '#ffffff' },
  { id: 'ocean', name: 'بحر الجزائر', class: 'from-cyan-600 via-blue-700 to-slate-950', text: '#ffffff' },
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, createStory, showToast } = useApp();

  const [mode, setMode] = useState<'media' | 'text'>('media');
  const [caption, setCaption] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);
  const [selectedWilaya, setSelectedWilaya] = useState<string>(currentUser.wilaya || '16 - الجزائر العاصمة');
  const [activityTag, setActivityTag] = useState<string>('#شمس_التطوع');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast({
        type: 'warning',
        title: 'حجم الصورة كبير',
        message: 'يرجى اختيار صورة أقل من 8 ميغابايت.'
      });
      return;
    }

    setIsUploading(true);
    try {
      const { dataUrl, record } = await saveImageToFileSystem(file, 'post');
      setMediaUrl(dataUrl);
      showToast({
        type: 'success',
        title: 'تم إرفاق صورة الستوري 📸',
        message: `تم حفظ "${record.name}" بنجاح.`
      });
    } catch (err) {
      console.error(err);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (typeof loadEvent.target?.result === 'string') {
          setMediaUrl(loadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'text' && !caption.trim()) {
      showToast({
        type: 'warning',
        title: 'اكتب نص القصة',
        message: 'يرجى كتابة نص أو رسالة للستوري.'
      });
      return;
    }

    if (mode === 'media' && !mediaUrl) {
      showToast({
        type: 'warning',
        title: 'ارفع صورة',
        message: 'يرجى اختيار صورة لقصتك أو التبديل لوضع النص الملون.'
      });
      return;
    }

    createStory({
      caption: caption.trim(),
      mediaUrl: mode === 'media' ? mediaUrl : undefined,
      backgroundColor: mode === 'text' ? selectedGradient.class : undefined,
      textColor: selectedGradient.text,
      activityTag: activityTag.trim() || undefined,
      wilaya: selectedWilaya
    });

    onClose();
    // Reset state
    setCaption('');
    setMediaUrl('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 text-right animate-in fade-in duration-200"
      dir="rtl"
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">إضافة ستوري تطوعي جديد</h3>
              <p className="text-[11px] text-emerald-200">يظهر لمدة 24 ساعة على خريطة سناب واللوحة العامة</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          {/* Mode Switch (Photo Story vs Text Story) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('media')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'media'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>ستوري صورة / فيديو</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('text')}
              className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'text'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>ستوري نصي ملون</span>
            </button>
          </div>

          {/* Mode 1: Media Upload Preview */}
          {mode === 'media' && (
            <div className="space-y-3">
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {mediaUrl ? (
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-200 group">
                  <img 
                    src={mediaUrl} 
                    alt="معاينة الستوري" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-black shadow-md cursor-pointer"
                    >
                      تغيير الصورة
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black shadow-md cursor-pointer"
                    >
                      إزالة
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 p-8 flex flex-col items-center justify-center gap-2.5 text-center bg-slate-50 hover:bg-emerald-50/50 transition cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">
                      {isUploading ? 'جارٍ رفع الصورة...' : 'انقر لاختيار صورة من جهازك'}
                    </div>
                    <div className="text-[11px] text-slate-600">JPG, PNG حتى 8 ميغابايت</div>
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  تعليق أو رسالة القصة (اختياري):
                </label>
                <input 
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="مثال: غرس أشجار اليوم بمنتزه صابلات 🌲..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Mode 2: Stylized Text Preview & Gradient Picker */}
          {mode === 'text' && (
            <div className="space-y-3">
              {/* Live Preview Card */}
              <div className={`rounded-2xl p-6 bg-gradient-to-br ${selectedGradient.class} text-center flex flex-col items-center justify-center min-h-[160px] shadow-sm`}>
                <p 
                  className="text-lg font-black leading-relaxed"
                  style={{ color: selectedGradient.text }}
                >
                  {caption.trim() || 'اكتب رسالتك أو تحديك التطوعي هنا لتظهر بالمعاينة...'}
                </p>
              </div>

              {/* Gradient Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر تدرج الخلفية:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {GRADIENT_PRESETS.map((grad) => (
                    <button
                      key={grad.id}
                      type="button"
                      onClick={() => setSelectedGradient(grad)}
                      className={`h-9 px-3 rounded-xl bg-gradient-to-r ${grad.class} text-white text-[11px] font-bold shrink-0 flex items-center gap-1.5 border-2 transition cursor-pointer ${
                        selectedGradient.id === grad.id ? 'border-amber-400 scale-105 shadow-md' : 'border-transparent'
                      }`}
                    >
                      {selectedGradient.id === grad.id && <Check className="w-3.5 h-3.5" />}
                      <span>{grad.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text input */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  نص القصة:
                </label>
                <textarea 
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="شارك المتطوعين رسالة محفزة أو إنجازاً يومياً..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Location & Tag metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>الولاية (موقع الستوري):</span>
              </label>
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ALGERIAN_WILAYAS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>وسم النشاط:</span>
              </label>
              <input 
                type="text"
                value={activityTag}
                onChange={(e) => setActivityTag(e.target.value)}
                placeholder="#حملة_التشجير"
                className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>نشر الستوري الآن (24 ساعة)</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
