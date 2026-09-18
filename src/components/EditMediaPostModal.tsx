import React, { useState, useRef } from 'react';
import { BlogPost } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  Sparkles, 
  Tag,
  FileText,
  Bookmark
} from 'lucide-react';
import { saveImageToFileSystem } from '../utils/fileStorage';

interface EditMediaPostModalProps {
  post: BlogPost;
  onClose: () => void;
}

const PRESET_MEDIA_IMAGES = [
  { label: '🌿 غرس وتطوع', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80' },
  { label: '🏛️ ملتقى شبابي', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80' },
  { label: '📜 بلاغ رسمي', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80' },
  { label: '🏆 تكريم وجوائز', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80' },
  { label: '🌊 حملة بيئية', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80' },
];

export const EditMediaPostModal: React.FC<EditMediaPostModalProps> = ({ post, onClose }) => {
  const { updateBlogPost, showToast } = useApp();

  const [title, setTitle] = useState(post.title || '');
  const [summary, setSummary] = useState(post.summary || '');
  const [content, setContent] = useState(post.content || '');
  const [category, setCategory] = useState<BlogPost['category']>(post.category || 'تغطية ميدانية');
  const [imageUrl, setImageUrl] = useState(post.imageUrl || '');
  const [tagsInput, setTagsInput] = useState((post.tags || []).join('، '));
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle uploading an image directly from device files and saving in the files repository
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast({
        type: 'warning',
        title: 'حجم الصورة كبير جداً',
        message: 'يرجى اختيار صورة بحجم لا يتجاوز 10 ميغابايت.'
      });
      return;
    }

    try {
      setIsUploading(true);
      const { dataUrl, record } = await saveImageToFileSystem(file, 'media');
      setImageUrl(dataUrl);
      showToast({
        type: 'success',
        title: 'تم رفع وحفظ الصورة في الملفات 📁',
        message: `تم حفظ "${record.name}" (${record.sizeFormatted}) واستبدال صورة المنشور بنجاح.`
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'تعذر قراءة الصورة',
        message: 'حدث خطأ أثناء معالجة ملف الصورة المرفوع.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !summary.trim() || !content.trim()) {
      showToast({
        type: 'warning',
        title: 'بيانات غير مكتملة',
        message: 'يرجى ملء العنوان والملخص ومحتوى المقال كاملاً.'
      });
      return;
    }

    const cleanTags = tagsInput
      .split(/[,،]/)
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const res = updateBlogPost(post.id, {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      imageUrl: imageUrl.trim() || post.imageUrl,
      tags: cleanTags.length > 0 ? cleanTags : post.tags,
    });

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shadow-md">
              ✏️
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">تعديل مقال / بوستر شمس ميديا</h3>
              <p className="text-xs text-teal-200 mt-0.5">
                تعديل العناوين، المحتوى، التصنيف واستبدال الصورة مع حفظها في الملفات
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-700" />
              <span>عنوان المقال / البوستر الإعلامي:</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: انطلاق القافلة الوطنية للتشجير 2026"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Category & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-teal-700" />
                <span>تصنيف المحتوى:</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="تغطية ميدانية">تغطية ميدانية 📸</option>
                <option value="بلاغ وزاري">بلاغ وزاري 📜</option>
                <option value="قصة نجاح">قصة نجاح 🌟</option>
                <option value="توجيهات وإرشادات">توجيهات وإرشادات 💡</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-teal-700" />
                <span>الوسوم (مفصولة بفواصل):</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="تشجير، بيئة، عمل_ميداني"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Image Upload & Change Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-teal-950 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-700" />
                <span>صورة المنشور أو البوستر (حفظ في الملفات):</span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'جاري المعالجة...' : 'اختيار صورة من ملفاتك 📁'}</span>
              </button>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileUpload}
            />

            {/* Preview current/selected image */}
            {imageUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-slate-900 border border-slate-200 group">
                <img
                  src={imageUrl}
                  alt="معاينة الصورة"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3 text-white text-xs">
                  <span>الصورة الحالية للمنشور</span>
                </div>
              </div>
            )}

            {/* Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-600 block">أو اختر من المعرض المقترح:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_MEDIA_IMAGES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      imageUrl === p.url 
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{p.label}</span>
                    {imageUrl === p.url && <Check className="w-3 h-3 text-amber-300" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">
              ملخص المقال / نص البوستر القصير:
            </label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="ملخص يظهر في البطاقة والبوستر..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">
              المحتوى الكامل للمقال أو البيان:
            </label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب التفاصيل الكاملة للمقال..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>حفظ التعديلات وتحديث المنشور</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
