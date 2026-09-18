import React, { useState, useRef } from 'react';
import { UserPost } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Tag, 
  Trash2,
  Edit3,
  AlertCircle
} from 'lucide-react';
import { saveImageToFileSystem } from '../utils/fileStorage';

interface EditPostModalProps {
  post: UserPost;
  onClose: () => void;
}

const PRESET_VOLUNTEERING_PHOTOS = [
  { label: '🌲 غرس أشجار', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80' },
  { label: '🎨 طلاء جداريات', url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80' },
  { label: '🤝 فريق شبابي', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
  { label: '🌊 تنظيف شواطئ', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80' }
];

export const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose }) => {
  const { editPost, showToast } = useApp();

  const [content, setContent] = useState(post.content || '');
  const [imageUrl, setImageUrl] = useState(post.imageUrl || '');
  const [activityTag, setActivityTag] = useState(post.activityTag || '');
  const [showMediaOptions, setShowMediaOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast({
        type: 'warning',
        title: 'حجم الصورة كبير',
        message: 'يرجى اختيار صورة بحجم أقل من 8 ميغابايت.'
      });
      return;
    }

    try {
      const { dataUrl } = await saveImageToFileSystem(file, 'post');
      setImageUrl(dataUrl);
      setShowMediaOptions(false);
      showToast({
        type: 'success',
        title: 'تم حفظ الصورة في الملفات بنجاح! 📸',
        message: 'تم تخزين صورة المنشور في مكتبة ملفات المنصة وتطبيقها.'
      });
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImageUrl(event.target.result);
          setShowMediaOptions(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      showToast({
        type: 'warning',
        title: 'نص المنشور مطلوب',
        message: 'لا يمكن حفظ منشور فارغ.'
      });
      return;
    }

    const res = editPost(post.id, {
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      activityTag: activityTag.trim() || undefined,
    });

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              ✏️
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">تعديل المنشور</h2>
              <p className="text-xs text-slate-500">تعديل النص، تغيير الصورة أو استبدالها بصورة من جهازك</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Post Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">
              نص المنشور:
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تفاصيل المنشور أو التحديث..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
            />
            <span className="text-[10px] text-slate-400 block text-left">
              {content.length} حرف
            </span>
          </div>

          {/* Current Attached Image Preview */}
          {imageUrl ? (
            <div className="space-y-1.5">
              <span className="text-xs font-black text-slate-800 block">صورة المنشور الحالية:</span>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100 group">
                <img
                  src={imageUrl}
                  alt="صورة المنشور"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-black/75 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>تغيير بصورة من جهازي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إزالة الصورة</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowMediaOptions(!showMediaOptions)}
                className="w-full py-3 px-4 border border-slate-200 hover:border-emerald-500 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 transition flex items-center justify-center gap-2 text-xs font-black text-slate-700 hover:text-emerald-800 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>+ إضافة صورة للمنشور (من جهازك أو مقترحة)</span>
              </button>
            </div>
          )}

          {/* Media options drawer */}
          {(showMediaOptions || !imageUrl) && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Direct upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-emerald-400 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/50 transition cursor-pointer flex items-center justify-center gap-2 text-xs font-black text-emerald-950"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>📁 اختر صورة خاصة من جهازك</span>
              </button>

              {/* Preset selection */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  أو اختر صورة جاهزة:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_VOLUNTEERING_PHOTOS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setImageUrl(preset.url);
                        setShowMediaOptions(false);
                      }}
                      className="group relative h-16 rounded-xl overflow-hidden cursor-pointer border border-slate-200 hover:border-emerald-500 transition"
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center p-1 text-center">
                        <span className="text-[10px] font-black text-white">
                          {preset.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* URL fallback */}
              <div className="pt-1">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="أو أدخل رابط صورة خارجي مباشر..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* Activity Tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>النشاط المرتبط (اختياري):</span>
            </label>
            <input
              type="text"
              value={activityTag}
              onChange={(e) => setActivityTag(e.target.value)}
              placeholder="مثال: الحملة الوطنية لغرس مليون شجرة"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>حفظ تعديلات المنشور</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
