import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserPost, ReactionType } from '../types';
import { 
  Heart, 
  MessageCircle, 
  Flame, 
  Sparkles, 
  Share2, 
  Send, 
  Compass, 
  Grid, 
  List, 
  UserCheck, 
  UserPlus, 
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronDown,
  Repeat,
  Tag,
  X,
  Edit3,
  Trash2
} from 'lucide-react';
import { RichPostPublisher } from './RichPostPublisher';
import { RichTextRenderer } from './RichTextRenderer';
import { EditPostModal } from './EditPostModal';

interface GeneralFeedViewProps {
  onSelectUser: (user: User) => void;
  onSelectActivity?: (activityId: string) => void;
  onOpenRegister?: () => void;
}

export const GeneralFeedView: React.FC<GeneralFeedViewProps> = ({
  onSelectUser,
  onOpenRegister
}) => {
  const { 
    posts, 
    currentUser, 
    allUsers, 
    createPost, 
    deletePost,
    togglePostReaction, 
    addPostComment, 
    repostToProfile,
    toggleSubscription,
    isSubscribedTo,
    isLoggedIn,
    isShamsAdmin,
    canManageAllContent,
    showToast
  } = useApp();

  const [layoutMode, setLayoutMode] = useState<'feed' | 'grid'>('feed');
  const [selectedPostModal, setSelectedPostModal] = useState<UserPost | null>(null);
  const [editingPost, setEditingPost] = useState<UserPost | null>(null);
  
  // Hashtag filter state
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'with_images' | 'following'>('all');

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    addPostComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  const handleOpenAuthorProfile = (authorId: string, authorName?: string) => {
    const found = allUsers.find(u => u.id === authorId);
    if (found) {
      onSelectUser(found);
    } else {
      // Fallback pseudo user
      const pseudo: User = {
        id: authorId,
        name: authorName || 'مستخدم شمس',
        role: 'individual',
        email: '',
        phone: '',
        wilaya: 'الجزائر العاصمة',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        points: 120,
        rank: 1,
        completedTasksCount: 1,
        hoursVolunteered: 5,
        badges: []
      };
      onSelectUser(pseudo);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (selectedHashtag) {
      const matchesHashtag = p.activityTag === selectedHashtag || p.content.includes(selectedHashtag);
      if (!matchesHashtag) return false;
    }
    if (filterType === 'with_images') return !!p.imageUrl;
    if (filterType === 'following') return isSubscribedTo(p.authorId);
    return true;
  });

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>اللوحة العامة التفاعلية — نبض المجتمع المتطوع</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            تصفح منشورات وصور المتطوعين على طريقة إنستغرام
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
            شاهد نشاطات وإنجازات الشباب الميدانية مباشرة، اضغط على أي ناشر للاطلاع على بطاقته ورصيده، وتفاعل باللايكات والرياكت والتعليقات!
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setLayoutMode('feed')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              layoutMode === 'feed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span>تغذية كاملة (Feed)</span>
          </button>
          <button
            onClick={() => setLayoutMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              layoutMode === 'grid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>شبكة الصور (Grid)</span>
          </button>
        </div>
      </div>

      {/* ENHANCED RICH POST PUBLISHER (Rich text formatting, dynamic counter, emojis & hashtags) */}
      <RichPostPublisher 
        onPublishSuccess={() => {
          showToast({
            type: 'success',
            title: 'تم النشر بنجاح!',
            message: 'ظهر منشورك الآن في اللوحة العامة للجميع وعلى صفحتك الشخصية.'
          });
        }}
      />

      {/* Feed Filters & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 ml-1">تصفية العرض:</span>
          {[
            { id: 'all', label: `كل المنشورات (${posts.length})` },
            { id: 'with_images', label: `منشورات مصورة (${posts.filter(p => p.imageUrl).length})` },
            { id: 'following', label: `المتابعون فقط` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterType === f.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Active Hashtag Filter Pill */}
          {selectedHashtag && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black animate-in fade-in">
              <Tag className="w-3.5 h-3.5 text-emerald-700" />
              <span>الوسم: {selectedHashtag}</span>
              <button
                onClick={() => setSelectedHashtag(null)}
                className="w-4 h-4 rounded-full bg-emerald-200 hover:bg-emerald-300 flex items-center justify-center text-[10px] text-emerald-950 transition cursor-pointer"
                title="إلغاء التصفية"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500">
          اضغط على صورة أو اسم أي متطوع للانتقال لصفحته الشخصية 👤
        </div>
      </div>

      {/* ======================= LAYOUT 1: INSTAGRAM GRID VIEW ======================= */}
      {layoutMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredPosts.map(post => {
            const totalLikes = (post.reactions?.like?.length || 0) + 
                               (post.reactions?.love?.length || 0) + 
                               (post.reactions?.fire?.length || 0) + 
                               (post.reactions?.clap?.length || 0);

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPostModal(post)}
                className="group relative aspect-square bg-slate-900 rounded-3xl overflow-hidden cursor-pointer shadow-xs border border-slate-200 transition-all hover:shadow-xl"
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.content}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full p-4 bg-gradient-to-br from-slate-900 to-teal-950 text-white flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-[10px] font-bold truncate">{post.authorName}</span>
                    </div>
                    <p className="text-xs line-clamp-4 leading-relaxed text-slate-200">{post.content}</p>
                    <span className="text-[9px] text-teal-400 font-bold">#شمس_التطوع</span>
                  </div>
                )}

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 sm:p-4 text-white">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAuthorProfile(post.authorId, post.authorName);
                    }}
                    className="flex items-center gap-2 hover:underline cursor-pointer"
                  >
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-white"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate">{post.authorName}</div>
                      <div className="text-[9px] text-emerald-300 truncate">ولاية {post.authorWilaya}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-sm font-black">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      {totalLikes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-white" />
                      {post.comments?.length || 0}
                    </span>
                  </div>

                  <div className="text-[10px] text-center text-slate-300">
                    انقر للعرض والتفاعل
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ======================= LAYOUT 2: INSTAGRAM FEED VIEW ======================= */
        <div className="max-w-2xl mx-auto space-y-6">
          {filteredPosts.map(post => {
            const isSubscribed = isSubscribedTo(post.authorId);
            const isOwn = currentUser.id === post.authorId;
            const commentsList = post.comments || [];
            const isCommentsExpanded = expandedComments[post.id];

            const totalLikes = (post.reactions?.like?.length || 0) + 
                               (post.reactions?.love?.length || 0) + 
                               (post.reactions?.fire?.length || 0) + 
                               (post.reactions?.clap?.length || 0);

            return (
              <article
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition text-right"
              >
                {/* Post Author Header (Clickable to Author Profile) */}
                <div className="p-3 sm:p-4 flex items-center justify-between gap-2 border-b border-slate-100">
                  <div 
                    onClick={() => handleOpenAuthorProfile(post.authorId, post.authorName)}
                    className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-emerald-500 group-hover:scale-105 transition"
                      />
                      <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-[8px] text-white">
                        ✓
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition truncate">
                          {post.authorName}
                        </span>
                        <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 shrink-0">
                          {post.authorRole === 'individual' ? 'متطوع فرد' : post.authorRole === 'institution' ? 'مؤسسة' : 'مسؤول'}
                        </span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          ولاية {post.authorWilaya}
                        </span>
                        <span>•</span>
                        <span className="shrink-0">{new Date(post.createdAt).toLocaleDateString('ar-DZ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow Button & Profile link */}
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {!isOwn && (
                      <button
                        onClick={() => toggleSubscription(post.authorId)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          isSubscribed
                            ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        }`}
                      >
                        {isSubscribed ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>متابع</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>متابعة</span>
                          </>
                        )}
                      </button>
                    )}

                    {(isOwn || canManageAllContent || isShamsAdmin || currentUser.role === 'general_admin' || currentUser.role === 'media_admin') && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingPost(post)}
                          className="p-1 sm:p-1.5 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                          title="تعديل المنشور واستبدال الصورة"
                        >
                          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف هذا المنشور؟`)) {
                              deletePost(post.id);
                            }
                          }}
                          className="p-1 sm:p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="حذف المنشور"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenAuthorProfile(post.authorId, post.authorName)}
                      className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="زيارة البروفايل"
                    >
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Post Image (if present) */}
                {post.imageUrl && (
                  <div 
                    onClick={() => setSelectedPostModal(post)}
                    className="relative w-full max-h-[460px] overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.content}
                      className="w-full h-full object-cover hover:scale-102 transition duration-500"
                    />
                    {post.activityTag && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-xl text-[11px] font-bold bg-black/70 text-white backdrop-blur-md">
                        {post.activityTag}
                      </span>
                    )}
                  </div>
                )}

                {/* Interactions Bar: Like, Love, Fire, Clap, Comment, Repost */}
                <div className="p-3 sm:p-4 space-y-3">
                  
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      {/* React 1: Like */}
                      <button
                        onClick={() => togglePostReaction(post.id, 'like')}
                        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          post.reactions?.like?.includes(currentUser.id)
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${post.reactions?.like?.includes(currentUser.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                        <span>{post.reactions?.like?.length || 0}</span>
                      </button>

                      {/* React 2: Love */}
                      <button
                        onClick={() => togglePostReaction(post.id, 'love')}
                        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          post.reactions?.love?.includes(currentUser.id)
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="text-xs sm:text-sm">❤️</span>
                        <span>{post.reactions?.love?.length || 0}</span>
                      </button>

                      {/* React 3: Fire */}
                      <button
                        onClick={() => togglePostReaction(post.id, 'fire')}
                        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          post.reactions?.fire?.includes(currentUser.id)
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${post.reactions?.fire?.includes(currentUser.id) ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
                        <span>{post.reactions?.fire?.length || 0}</span>
                      </button>

                      {/* React 4: Clap */}
                      <button
                        onClick={() => togglePostReaction(post.id, 'clap')}
                        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          post.reactions?.clap?.includes(currentUser.id)
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="text-xs sm:text-sm">👏</span>
                        <span>{post.reactions?.clap?.length || 0}</span>
                      </button>
                    </div>

                    {/* Repost to personal profile */}
                    <button
                      onClick={() => repostToProfile(post.id, 'post')}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-[11px] sm:text-xs font-bold transition cursor-pointer"
                      title="إعادة نشر هذا المحتوى في ملفك الشخصي"
                    >
                      <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                      <span>نشر في بروفايلي</span>
                    </button>
                  </div>

                  {/* Post Content with Rich Text formatting and interactive hashtags */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-1">
                    <span 
                      onClick={() => handleOpenAuthorProfile(post.authorId, post.authorName)}
                      className="font-black text-slate-900 ml-1.5 hover:text-emerald-700 cursor-pointer"
                    >
                      {post.authorName}:
                    </span>
                    <div className="mt-1">
                      <RichTextRenderer 
                        content={post.content} 
                        onHashtagClick={(tag) => {
                          setSelectedHashtag(tag);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                      />
                    </div>
                  </div>

                  {/* Comments Toggle */}
                  {commentsList.length > 0 && (
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      {isCommentsExpanded 
                        ? 'إخفاء التعليقات' 
                        : `عرض جميع التعليقات (${commentsList.length})...`}
                    </button>
                  )}

                  {/* Render Comments */}
                  {isCommentsExpanded && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                      {commentsList.map(comm => (
                        <div key={comm.id} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-2xl">
                          <img
                            src={comm.authorAvatar}
                            alt={comm.authorName}
                            onClick={() => handleOpenAuthorProfile(comm.authorId, comm.authorName)}
                            className="w-7 h-7 rounded-xl object-cover cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span 
                                onClick={() => handleOpenAuthorProfile(comm.authorId, comm.authorName)}
                                className="font-black text-xs text-slate-900 hover:text-emerald-700 cursor-pointer"
                              >
                                {comm.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(comm.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-0.5">{comm.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendComment(post.id);
                      }}
                      placeholder="أضف تعليقاً محفزاً للمتطوع..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 rounded-xl text-xs text-slate-900 placeholder-slate-400 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleSendComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      إرسال
                    </button>
                  </div>

                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL FOR SINGLE POST IN DETAIL (When clicked in Grid) */}
      {selectedPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div 
                onClick={() => {
                  setSelectedPostModal(null);
                  handleOpenAuthorProfile(selectedPostModal.authorId, selectedPostModal.authorName);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={selectedPostModal.authorAvatar}
                  alt={selectedPostModal.authorName}
                  className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div>
                  <div className="font-black text-sm text-slate-900 group-hover:text-emerald-700 transition">
                    {selectedPostModal.authorName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    ولاية {selectedPostModal.authorWilaya} • انقر لفتح الملف الشخصي
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPostModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedPostModal.imageUrl && (
              <div className="w-full max-h-96 overflow-hidden bg-slate-900">
                <img
                  src={selectedPostModal.imageUrl}
                  alt={selectedPostModal.content}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 space-y-4">
              <div className="text-sm text-slate-800 leading-relaxed">
                <RichTextRenderer 
                  content={selectedPostModal.content}
                  onHashtagClick={(tag) => {
                    setSelectedPostModal(null);
                    setSelectedHashtag(tag);
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePostReaction(selectedPostModal.id, 'like')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs"
                  >
                    <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                    <span>إعجاب ({selectedPostModal.reactions?.like?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => {
                      repostToProfile(selectedPostModal.id, 'post');
                      setSelectedPostModal(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    <Repeat className="w-3.5 h-3.5 text-emerald-600" />
                    <span>نشر في ملفي الشخصي</span>
                  </button>

                  {(currentUser.id === selectedPostModal.authorId || canManageAllContent || isShamsAdmin || currentUser.role === 'general_admin' || currentUser.role === 'media_admin') && (
                    <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-2">
                      <button
                        type="button"
                        onClick={() => {
                          const p = selectedPostModal;
                          setSelectedPostModal(null);
                          setEditingPost(p);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition flex items-center gap-1"
                        title="تعديل المنشور واستبدال الصورة"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف هذا المنشور؟`)) {
                            deletePost(selectedPostModal.id);
                            setSelectedPostModal(null);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold transition flex items-center gap-1"
                        title="حذف المنشور"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>حذف</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const authId = selectedPostModal.authorId;
                    const authName = selectedPostModal.authorName;
                    setSelectedPostModal(null);
                    handleOpenAuthorProfile(authId, authName);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                >
                  زيارة بروفايل {selectedPostModal.authorName}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
        />
      )}

    </div>
  );
};
