import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BlogPost, ReactionType } from '../types';
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
  ArrowLeft,
  Flame,
  MessageCircle,
  Repeat,
  Send,
  LayoutTemplate,
  Layers,
  Edit3,
  Trash2,
  Upload
} from 'lucide-react';
import { EditMediaPostModal } from './EditMediaPostModal';
import { saveImageToFileSystem } from '../utils/fileStorage';

interface MediaBlogViewProps {
  onSelectActivityForDetails?: (activityId: string) => void;
}

export const MediaBlogView: React.FC<MediaBlogViewProps> = () => {
  const { 
    blogPosts, 
    addBlogPost, 
    updateBlogPost,
    deleteBlogPost,
    toggleLikePost, 
    currentUser, 
    toggleBlogPostReaction, 
    addBlogPostComment, 
    repostToProfile,
    isShamsAdmin,
    canManageAllContent,
    showToast 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewStyle, setViewStyle] = useState<'poster' | 'cards'>('poster');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // New post state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'تغطية ميدانية' | 'بلاغ وزاري' | 'قصة نجاح' | 'توجيهات وإرشادات'>('تغطية ميدانية');
  const [tagsInput, setTagsInput] = useState('شمس التطوع, شباب الجزائر, بيئة');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  const canPublishMedia = currentUser.role === 'media_admin' || currentUser.role === 'general_admin' || canManageAllContent;

  const canManagePost = (post: BlogPost) => {
    return canManageAllContent || currentUser.role === 'general_admin' || currentUser.role === 'media_admin' || isShamsAdmin || post.authorId === currentUser.id;
  };

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

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    addBlogPostComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  const filteredPosts = blogPosts.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-8 text-right animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-800/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs font-bold mb-2">
            <Megaphone className="w-4 h-4 text-teal-400" />
            <span>شمس ميديا — المركز الإعلامي والتوعوي الوطني</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            بوسترات وأخبار وقصص نجاح المبادرات الشبانية
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-xl">
            شاهد المنشورات بأسلوب البوستر التفاعلي، تفاعل باللايك والتعليقات والرياكت، وانشر أي بوستر في ملفك الشخصي بنقرة زر!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewStyle('poster')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewStyle === 'poster'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>نمط بوستر (Poster)</span>
            </button>
            <button
              onClick={() => setViewStyle('cards')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewStyle === 'cards'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>بطاقات مقالات</span>
            </button>
          </div>

          {canPublishMedia && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>نشر بوستر / مقال جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-500 ml-2">التصنيف:</span>
        {[
          { id: 'all', label: 'كل المنشورات' },
          { id: 'بلاغ وزاري', label: '📢 بلاغات وزارية' },
          { id: 'تغطية ميدانية', label: '📸 تغطيات ميدانية' },
          { id: 'قصة نجاح', label: '🌟 قصص نجاح ملهمة' },
          { id: 'توجيهات وإرشادات', label: '💡 توجيهات وإرشادات' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* POSTER STYLE VIEW (المطلوب: نرى المنشورات مثل بوستر يمكن عمل لايك تعليق الخ) */}
      {/* ========================================================================= */}
      {viewStyle === 'poster' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => {
            const commentsList = post.comments || [];
            const isCommentsOpen = expandedComments[post.id];

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Poster Graphic Top */}
                <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-slate-900 overflow-hidden group">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                  {/* Top Badges & Actions */}
                  <div className="absolute top-4 right-4 left-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-xl text-xs font-black bg-amber-400 text-slate-950 shadow-md">
                        {post.category}
                      </span>
                      <span className="hidden sm:inline-block px-3 py-1 rounded-xl text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                        بوستر شمس ميديا ☀️
                      </span>
                    </div>

                    {canManagePost(post) && (
                      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl backdrop-blur-md shadow-lg border border-white/10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPost(post);
                          }}
                          className="px-2.5 py-1 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1 transition cursor-pointer shadow-xs"
                          title="تعديل المنشور واستبدال الصورة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`هل أنت متأكد من حذف منشور "${post.title}" نهائياً؟`)) {
                              deleteBlogPost(post.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 transition cursor-pointer shadow-xs"
                          title="حذف هذا المنشور"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom of poster image with title */}
                  <div className="absolute bottom-4 right-4 left-4 text-white">
                    <h3 
                      onClick={() => setSelectedPost(post)}
                      className="text-lg sm:text-xl font-black leading-snug drop-shadow-md hover:text-amber-300 transition cursor-pointer"
                    >
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-200 mt-2">
                      <span>بواسطة: {post.authorName}</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString('ar-DZ')}</span>
                    </div>
                  </div>
                </div>

                {/* Poster Summary & Text */}
                <div className="p-5 sm:p-6 space-y-4">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {post.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag, tidx) => (
                      <span key={tidx} className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Poster Interactive Bar: Like, React, Comment, Repost to Profile */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Reactions group */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      {/* Like */}
                      <button
                        onClick={() => toggleBlogPostReaction(post.id, 'like')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          post.reactions?.like?.includes(currentUser.id)
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="إعجاب"
                      >
                        <Heart className={`w-4 h-4 ${post.reactions?.like?.includes(currentUser.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                        <span>{post.reactions?.like?.length || post.likes || 0}</span>
                      </button>

                      {/* Love */}
                      <button
                        onClick={() => toggleBlogPostReaction(post.id, 'love')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          post.reactions?.love?.includes(currentUser.id)
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="أحببته"
                      >
                        <span>❤️</span>
                        <span>{post.reactions?.love?.length || 0}</span>
                      </button>

                      {/* Fire */}
                      <button
                        onClick={() => toggleBlogPostReaction(post.id, 'fire')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          post.reactions?.fire?.includes(currentUser.id)
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="رائع"
                      >
                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>{post.reactions?.fire?.length || 0}</span>
                      </button>

                      {/* Clap */}
                      <button
                        onClick={() => toggleBlogPostReaction(post.id, 'clap')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          post.reactions?.clap?.includes(currentUser.id)
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="تصفيق"
                      >
                        <span>👏</span>
                        <span>{post.reactions?.clap?.length || 0}</span>
                      </button>
                    </div>

                    {/* Repost to Personal Profile Button */}
                    <button
                      onClick={() => repostToProfile(post.id, 'blog')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black shadow-xs transition cursor-pointer"
                      title="نشر هذا البوستر مباشرة في ملفك الشخصي"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>نشر في ملفي الشخصي</span>
                    </button>
                  </div>

                  {/* Comments Expand Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>
                        {isCommentsOpen ? 'إخفاء التعليقات' : `التعليقات (${commentsList.length})`}
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedPost(post)}
                      className="text-xs font-bold text-slate-600 hover:text-teal-800 transition flex items-center gap-1"
                    >
                      <span>قراءة التفاصيل كاملة</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {isCommentsOpen && (
                    <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {commentsList.length === 0 ? (
                          <div className="text-center py-3 text-xs text-slate-400">
                            كن أول من يعلق على هذا البوستر!
                          </div>
                        ) : (
                          commentsList.map(comm => (
                            <div key={comm.id} className="bg-slate-50 p-2.5 rounded-2xl flex items-start gap-2.5 text-right">
                              <img
                                src={comm.authorAvatar}
                                alt={comm.authorName}
                                className="w-7 h-7 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-slate-900">{comm.authorName}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(comm.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 mt-0.5">{comm.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendComment(post.id);
                          }}
                          placeholder="اكتب تعليقك حول هذا البوستر..."
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          onClick={() => handleSendComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          إرسال
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* STANDARD CARDS VIEW */
        /* ========================================================================= */
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
                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-xl text-[10px] font-bold bg-white/95 text-teal-900 backdrop-blur-md shadow-xs">
                      {post.category}
                    </span>

                    {canManagePost(post) && (
                      <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl backdrop-blur-md shadow-sm">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPost(post);
                          }}
                          className="px-2 py-0.5 text-[10px] font-black bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition cursor-pointer flex items-center gap-1"
                          title="تعديل المنشور"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`هل أنت متأكد من حذف منشور "${post.title}"؟`)) {
                              deleteBlogPost(post.id);
                            }
                          }}
                          className="p-1 text-rose-300 hover:text-white rounded-lg hover:bg-rose-600/50 transition cursor-pointer"
                          title="حذف المنشور"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
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
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <button
                    onClick={() => toggleBlogPostReaction(post.id, 'like')}
                    className={`flex items-center gap-1 font-bold transition ${
                      post.reactions?.like?.includes(currentUser.id) ? 'text-rose-600' : 'hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.reactions?.like?.includes(currentUser.id) ? 'fill-rose-600' : ''}`} />
                    <span>{post.reactions?.like?.length || post.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => repostToProfile(post.id, 'blog')}
                    className="hover:text-emerald-700 transition"
                    title="نشر في بروفايلي"
                  >
                    <Repeat className="w-4 h-4 text-emerald-600" />
                  </button>
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
      )}

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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBlogPostReaction(selectedPost.id, 'like')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    selectedPost.reactions?.like?.includes(currentUser.id)
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedPost.reactions?.like?.includes(currentUser.id) ? 'fill-rose-600' : ''}`} />
                  <span>إعجاب ({selectedPost.reactions?.like?.length || selectedPost.likes || 0})</span>
                </button>

                <button
                  onClick={() => {
                    repostToProfile(selectedPost.id, 'blog');
                    setSelectedPost(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>نشر في ملفي الشخصي</span>
                </button>

                {canManagePost(selectedPost) && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedPost;
                        setSelectedPost(null);
                        setEditingPost(target);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
                      title="تعديل المنشور واستبدال الصورة"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف منشور "${selectedPost.title}" نهائياً؟`)) {
                          deleteBlogPost(selectedPost.id);
                          setSelectedPost(null);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
                      title="حذف هذا المنشور"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </>
                )}
              </div>

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
                  <h3 className="text-lg font-black">تحرير ونشر بوستر في شمس ميديا</h3>
                  <p className="text-xs text-teal-100">نشر التغطيات والبلاغات والبوسترات للمتطوعين</p>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البوستر أو البلاغ *</label>
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="تغطية ميدانية">تغطية ميدانية</option>
                    <option value="بلاغ وزاري">بلاغ وزاري</option>
                    <option value="قصة نجاح">قصة نجاح</option>
                    <option value="توجيهات وإرشادات">توجيهات وإرشادات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوسوم (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">صورة البوستر الميداني (حفظ في الملفات)</label>
                  <button
                    type="button"
                    onClick={() => createFileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[11px] font-bold border border-teal-200 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-teal-600" />
                    <span>{isUploadingImage ? 'جاري الحفظ...' : 'رفع من ملفات الجهاز 📁'}</span>
                  </button>
                </div>
                <input
                  ref={createFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setIsUploadingImage(true);
                      const { dataUrl, record } = await saveImageToFileSystem(file, 'media');
                      setImageUrl(dataUrl);
                      showToast({
                        type: 'success',
                        title: 'تم حفظ الصورة في الملفات 📁',
                        message: `تم حفظ "${record.name}" في مكتبة ملفات المنصة.`
                      });
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsUploadingImage(false);
                    }
                  }}
                />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... أو ارفع من الملفات"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الملخص القصير (يظهر على البوستر) *</label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="نبذة سريعة تشد انتباه المتطوعين..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المحتوى الكامل للمقال والتفاصيل *</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب كامل التغطية، الأرقام المحققة، والتوجيهات..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white"
                >
                  نشر البوستر الآن
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* EDIT MEDIA POST MODAL */}
      {editingPost && (
        <EditMediaPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
        />
      )}

    </div>
  );
};
