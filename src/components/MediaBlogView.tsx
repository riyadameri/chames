import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BlogPost } from '../types';
import { 
  Newspaper, 
  Heart, 
  Eye, 
  Calendar, 
  Tag, 
  Plus, 
  X, 
  Sparkles, 
  Share2, 
  Megaphone,
  ArrowLeft
} from 'lucide-react';

interface MediaBlogViewProps {
  onSelectActivityForDetails?: (activityId: string) => void;
}

export const MediaBlogView: React.FC<MediaBlogViewProps> = () => {
  const { blogPosts, addBlogPost, toggleLikePost, currentUser } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // New post state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'تغطية ميدانية' | 'بلاغ وزاري' | 'قصة نجاح' | 'توجيهات وإرشادات'>('تغطية ميدانية');
  const [tagsInput, setTagsInput] = useState('شمس التطوع, شباب الجزائر, بيئة');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80');

  const canPublishMedia = currentUser.role === 'media_admin' || currentUser.role === 'general_admin';

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    addBlogPost({
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      content: content.trim(),
      category,
      authorName: currentUser.name,
      authorRole: currentUser.role === 'media_admin' ? 'مسؤول الإعلام والميديا' : 'إدارة المنصة',
      imageUrl,
      tags: tags.length ? tags : ['شمس التطوع'],
    });

    setTitle('');
    setSummary('');
    setContent('');
    setShowAddModal(false);
  };

  const filteredPosts = blogPosts.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-8 text-right">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs font-bold mb-2">
            <Megaphone className="w-4 h-4 text-teal-400" />
            <span>شمس ميديا — خلية الإعلام والاتصال لوزارة الشباب والرياضة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            أخبار، تغطيات ميدانية وقصص نجاح المتطوعين
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-xl">
            نافذة الإعلام المفتوحة لنقل صدى المبادرات الشبابية، متابعة قوافل التطوع بالصور، ونشر البلاغات الوزارية الرسمية.
          </p>
        </div>

        {canPublishMedia && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>كتابة ونشر مقال جديد في شمس ميديا</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-500 ml-2">التصنيف:</span>
        {[
          { id: 'all', label: 'الكل' },
          { id: 'بلاغ وزاري', label: '📢 بلاغات وزارية' },
          { id: 'تغطية ميدانية', label: '📸 تغطيات ميدانية' },
          { id: 'قصة نجاح', label: '🌟 قصص نجاح ملهمة' },
          { id: 'توجيهات وإرشادات', label: '💡 توجيهات وإرشادات' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === c.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Cover Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-xl text-[10px] font-bold bg-white/95 text-teal-900 backdrop-blur-md shadow-xs">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(post.publishedAt).toLocaleDateString('ar-DZ')}
                  </span>
                  <span>بواسطة: {post.authorName}</span>
                </div>

                <h3 
                  onClick={() => setSelectedPost(post)}
                  className="font-black text-base text-slate-900 leading-snug group-hover:text-teal-700 transition cursor-pointer line-clamp-2"
                >
                  {post.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {post.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {post.tags.map((tag, tidx) => (
                    <span key={tidx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Post Footer */}
            <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center gap-1 font-bold transition ${
                    post.likedByMe ? 'text-rose-600' : 'hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-rose-600' : ''}`} />
                  <span>{post.likes}</span>
                </button>

                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views}</span>
                </span>
              </div>

              <button
                onClick={() => setSelectedPost(post)}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 transition flex items-center gap-1"
              >
                <span>قراءة المقال</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

          </article>
        ))}
      </div>

      {/* FULL POST MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
            
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 right-4 left-4 text-white">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500 text-slate-950 mb-2 inline-block">
                  {selectedPost.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-md">
                  {selectedPost.title}
                </h2>
                <div className="text-xs text-slate-200 mt-2 flex items-center gap-4">
                  <span>المؤلف: {selectedPost.authorName} ({selectedPost.authorRole})</span>
                  <span>{new Date(selectedPost.publishedAt).toLocaleDateString('ar-DZ')}</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 font-bold text-teal-950 text-xs sm:text-sm">
                {selectedPost.summary}
              </div>

              <div>
                {selectedPost.content}
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                {selectedPost.tags.map((t, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => toggleLikePost(selectedPost.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  selectedPost.likedByMe
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${selectedPost.likedByMe ? 'fill-rose-600' : ''}`} />
                <span>إعجاب ({selectedPost.likes})</span>
              </button>

              <button
                onClick={() => setSelectedPost(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE BLOG POST MODAL (لمسؤول الإعلام والميديا) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">تحرير ونشر مقال في شمس ميديا</h3>
                  <p className="text-xs text-teal-100">نشر التغطيات والبلاغات الرسمية للمتطوعين</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المقال أو البلاغ *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: انطلاق القوافل التطوعية لغرس 50 ألف شجرة بالهضاب العليا..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع المنشور</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="تغطية ميدانية">تغطية ميدانية</option>
                    <option value="بلاغ وزاري">بلاغ وزاري رسمي</option>
                    <option value="قصة نجاح">قصة نجاح ملهمة</option>
                    <option value="توجيهات وإرشادات">توجيهات وإرشادات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوسوم (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="شمس, بيئة, وهران, تطوع..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الملخص الموجز</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="سطران يوضحان فحوى المقال..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص المقال الكامل *</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب تفاصيل التغطية الميدانية أو نص البلاغ..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط صورة المقال</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>نشر المقال فوراً</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
