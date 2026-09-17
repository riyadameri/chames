import React, { useState } from 'react';
import { User, Activity, ReactionType, UserPost } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  MapPin, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Trophy, 
  Share2, 
  Printer, 
  ShieldCheck,
  Medal,
  Clock,
  UserCheck,
  Bell,
  BellRing,
  Heart,
  ThumbsUp,
  Flame,
  MessageCircle,
  Send,
  Image as ImageIcon,
  Trash2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  PlusCircle,
  X,
  Edit3,
  Camera,
  Upload
} from 'lucide-react';
import { RichPostPublisher } from './RichPostPublisher';
import { RichTextRenderer } from './RichTextRenderer';
import { EditProfileModal } from './EditProfileModal';
import { EditPostModal } from './EditPostModal';

interface ProfilePageViewProps {
  user: User;
  onBack?: () => void;
  onSelectUser?: (user: User) => void;
  onSelectActivity?: (activity: Activity) => void;
}

export const ProfilePageView: React.FC<ProfilePageViewProps> = ({
  user,
  onBack,
  onSelectUser,
  onSelectActivity
}) => {
  const { 
    currentUser, 
    allUsers, 
    activities, 
    submissions, 
    season, 
    posts, 
    createPost, 
    deletePost, 
    togglePostReaction, 
    addPostComment, 
    toggleSubscription, 
    isSubscribedTo, 
    getUserSubscribersCount, 
    getUserSubscriptionsCount,
    showToast 
  } = useApp();

  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [feedFilter, setFeedFilter] = useState<'user' | 'all'>('user');

  // Modals states
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editProfileTab, setEditProfileTab] = useState<'info' | 'avatar' | 'cover'>('info');
  const [editingPost, setEditingPost] = useState<UserPost | null>(null);

  // Active comment input tracking: postId -> comment text
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const isOwnProfile = currentUser.id === user.id;
  // Always get fresh user data from state if available
  const activeUser = (isOwnProfile ? currentUser : allUsers.find(u => u.id === user.id)) || user;

  const isSubscribed = isSubscribedTo(activeUser.id);
  const subscribersCount = getUserSubscribersCount(activeUser.id);
  const subscriptionsCount = getUserSubscriptionsCount(activeUser.id);

  // Submissions and stats for this user
  const userSubmissions = submissions.filter(s => s.userId === activeUser.id);
  const approvedSubmissions = userSubmissions.filter(s => s.status === 'approved');
  const totalUnits = approvedSubmissions.reduce(
    (sum, s) => sum + (s.unitsCount || s.proofItems?.length || 1), 
    0
  );

  const userActivities = activities.filter(a => 
    userSubmissions.some(s => s.activityId === a.id)
  );

  // Badges earned
  const badges = [
    { id: '1', title: 'وسام شمس الوطني', icon: '☀️', desc: 'عضوية معتمدة في منصة شمس', unlocked: true },
    { id: '2', title: 'فارس الميدان', icon: '🌱', desc: 'إتمام مهام تطوعية ميدانية', unlocked: approvedSubmissions.length > 0 },
    { id: '3', title: 'صديق البيئة', icon: '🌳', desc: 'المساهمة في غرس الأشجار والمحافظة على الطبيعة', unlocked: totalUnits >= 5 },
    { id: '4', title: 'نادي النخبة', icon: '🏆', desc: 'تحقيق أكثر من 200 نقطة', unlocked: activeUser.points >= 200 },
    { id: '5', title: 'الموثق الرقمي', icon: '📍', desc: 'توثيق الإثباتات بالصور والإحداثيات', unlocked: approvedSubmissions.length >= 2 },
  ];

  // Filter posts
  const filteredPosts = feedFilter === 'user' 
    ? posts.filter(p => p.authorId === activeUser.id)
    : posts;

  // Handle Comment Submit
  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    addPostComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast({
      type: 'success',
      title: 'تم نسخ الرابط',
      message: 'تم نسخ رابط الملف الشخصي إلى الحافظة بنجاح.'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-right pb-12">
      
      {/* Top Navigation Bar for Profile */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </button>
          )}
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>الملف الشخصي والمنشورات</span>
              {isOwnProfile && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  حسابك الشخصي
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">بطاقة المتطوع الرسمية، إحصائيات الميدان، ومنشورات المجتمع</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCertificate(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl shadow-xs transition cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">شهادة التطوع الرسمية</span>
            <span className="sm:hidden">الشهادة</span>
          </button>

          <button
            onClick={handleCopyLink}
            title="مشاركة الرابط"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Certificate Modal / Preview if opened */}
      {showCertificate && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-double border-amber-600/40 shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-200">
          <button
            onClick={() => setShowCertificate(false)}
            className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-8 border-4 border-amber-500/30 rounded-2xl bg-amber-50/20 text-center space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-b border-amber-200 pb-3">
              <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
              <span>وزارة الشباب والرياضة</span>
            </div>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center text-3xl font-black shadow-md">
              ☀️
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">شهادة شمس للعمل التطوعي الوطني</h2>
              <p className="text-xs text-amber-800 font-bold mt-1">
                الموسم الوطني للتطوع الشاباني {season.year} - الدفعة {season.edition}
              </p>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed max-w-lg mx-auto">
              تشهد وزارة الشباب والرياضة عبر منصة <strong className="text-emerald-800 font-black">شمس التطوع</strong> بأن المتطوع(ة):
              <br />
              <span className="text-xl font-black text-slate-950 underline decoration-amber-500 decoration-2 inline-block my-2">
                {user.name}
              </span>
              <br />
              قد ساهم(ت) بفعالية في الأعمال الميدانية الوطنية بولاية <strong className="text-slate-900">{user.wilaya}</strong>، 
              بمجموع <span className="font-black text-emerald-800">{user.hoursVolunteered || 12} ساعة تطوعية</span> ورصيد <span className="font-black text-amber-800">{user.points} نقطة شمس</span>.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200/80 text-xs">
              <div className="text-right space-y-1">
                <div className="text-slate-500 font-bold">الرقم الوطني للمتطوع:</div>
                <div className="font-mono font-black text-slate-800">DZ-SHAMS-{user.id.toUpperCase()}</div>
              </div>
              <div className="text-left space-y-1">
                <div className="text-slate-500 font-bold">ختم المنصة الرقمي:</div>
                <div className="font-bold text-emerald-700 flex items-center justify-end gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>معتمد وموثق رسمياً</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة (PDF)</span>
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                إغلاق الشهادة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Cover Banner */}
        <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-emerald-800 via-teal-700 to-amber-600 relative overflow-hidden group">
          {activeUser.coverImage ? (
            <img 
              src={activeUser.coverImage} 
              alt="غلاف الحساب" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          )}
          
          {/* Change cover button for profile owner */}
          {isOwnProfile && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setEditProfileTab('cover'); setShowEditProfileModal(true); }}
                className="px-3 py-1.5 bg-black/60 hover:bg-black/85 backdrop-blur-md text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-300" />
                <span>تعديل الغلاف</span>
              </button>
            </div>
          )}

          {/* Decorative National Badges inside banner */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white rounded-full text-xs font-bold border border-white/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>متطوع موثق لدى وزارة الشباب والرياضة</span>
            </span>
          </div>

          <div className="absolute bottom-3 right-6 text-white/90 text-xs font-bold drop-shadow hidden sm:block">
            الجمهورية الجزائرية الديمقراطية الشعبية
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            
            {/* Avatar & User Details */}
            <div className="flex items-end gap-4">
              <div className="relative group">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-24 sm:w-32 h-24 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-100"
                />
                
                {/* Change avatar button on hover / touch if own profile */}
                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => { setEditProfileTab('avatar'); setShowEditProfileModal(true); }}
                    className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg border-2 border-white transition cursor-pointer"
                    title="تغيير الصورة الشخصية"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-md border-2 border-white">
                    #{activeUser.rank || 1}
                  </div>
                )}
              </div>

              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{activeUser.name}</h2>
                  
                  {activeUser.username && (
                    <span className="text-xs font-bold text-slate-500 font-mono" dir="ltr">
                      @{activeUser.username}
                    </span>
                  )}

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    activeUser.role === 'institution'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : activeUser.role === 'evaluator_admin'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : activeUser.role === 'general_admin'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {activeUser.role === 'individual' && 'متطوع فرد معتمد'}
                    {activeUser.role === 'institution' && 'مؤسسة / جمعية شبانية'}
                    {activeUser.role === 'evaluator_admin' && 'مقيّم إثباتات معتمد'}
                    {activeUser.role === 'general_admin' && 'مدير عام المنصة'}
                    {activeUser.role === 'institution_admin' && 'مسؤول هيكل شباني'}
                    {activeUser.role === 'media_admin' && 'مسؤول شمس ميديا'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ولاية {activeUser.wilaya}</span>
                  </span>
                  {activeUser.affiliatedInstitutionName && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{activeUser.affiliatedInstitutionName}</span>
                    </span>
                  )}
                  {activeUser.phone && isOwnProfile && (
                    <span className="text-slate-400 font-mono text-[11px]" dir="ltr">
                      📞 {activeUser.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>انضم في سبتمبر 2026</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
              {!isOwnProfile ? (
                <button
                  onClick={() => toggleSubscription(activeUser.id)}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition shadow-sm cursor-pointer ${
                    isSubscribed 
                      ? 'bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-slate-300' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>مشترك ومتابع ✓</span>
                    </>
                  ) : (
                    <>
                      <BellRing className="w-4 h-4" />
                      <span>اشتراك ومتابعة</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => { setEditProfileTab('info'); setShowEditProfileModal(true); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-sm transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-400" />
                    <span>تعديل الملف الشخصي</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Bio text if provided */}
          {activeUser.bio && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-start gap-2.5">
              <span className="text-emerald-600 text-base leading-none">❝</span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed flex-1">
                {activeUser.bio}
              </p>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => { setEditProfileTab('info'); setShowEditProfileModal(true); }}
                  className="text-slate-400 hover:text-emerald-600 p-1"
                  title="تعديل النبذة"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Followers / Following Counter & Verification Bar */}
          <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-100 text-xs flex-wrap">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-sm">{subscribersCount}</span>
                <span className="text-slate-500">مشترك ومتابع</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-sm">{subscriptionsCount}</span>
                <span className="text-slate-500">يتابعهم</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-sm">{posts.filter(p => p.authorId === user.id).length}</span>
                <span className="text-slate-500">منشور ميداني</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              معرف المتطوع: <span className="text-slate-700 font-bold">DZ-SHAMS-{user.id.toUpperCase()}</span>
            </div>
          </div>

          {/* 4 Big Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-900">نقاط شمس للموسم</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{user.points}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-emerald-900">الساعات الميدانية</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{user.hoursVolunteered || 14} س</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-blue-900">مهام موثقة ومعتمدة</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{approvedSubmissions.length || user.completedTasksCount}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Medal className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-purple-900">الترتيب الوطني</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">#{user.rank || 1}</div>
              </div>
            </div>

          </div>

          {/* Badges Earned Section */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Medal className="w-4 h-4 text-amber-500" />
                <span>الشارات والأوسمة الوطنية المكتسبة</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                {badges.filter(b => b.unlocked).length} من {badges.length} أوسمة مكتملة
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-2xl border text-center transition ${
                    b.unlocked
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
                  }`}
                >
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <div className="text-xs font-black text-slate-900 truncate">{b.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* POSTS & FEED SECTION (في الأسفل ترى المنشورات) */}
      {/* ======================================================== */}
      <div className="space-y-6">
        
        {/* Section Title & Feed Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>المنشورات والتحديثات الميدانية</span>
            </h2>
            <p className="text-xs text-slate-500">منشورات المتطوع، قصص النجاح، وتوثيق المشاركات اليومية</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFeedFilter('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                feedFilter === 'user' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              منشورات {isOwnProfile ? 'حسابي' : user.name} ({posts.filter(p => p.authorId === user.id).length})
            </button>
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                feedFilter === 'all' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كل منشورات المجتمع ({posts.length})
            </button>
          </div>
        </div>

        {/* POST PUBLISHER BOX (صندوق نشر منشور غني للمستخدمين) */}
        <RichPostPublisher 
          placeholder="اكتب هنا تفاصيل مبادرتك، عدد الأشجار المغروسة، ساعات العمل الميداني، أو تجربة ملهمة مع زملائك في دار الشباب..."
          onPublishSuccess={() => {
            showToast({
              type: 'success',
              title: 'تم النشر بنجاح!',
              message: 'تمت إضافة المنشور بنجاح إلى ملفك الشخصي واللوحة العامة.'
            });
          }}
        />

        {/* POSTS FEED LIST (قائمة المنشورات) */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                📝
              </div>
              <h3 className="font-black text-slate-800 text-base">لا توجد منشورات حتى الآن في هذه القائمة</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                كن أول من يشارك منشوره الميداني أو صوره التطوعية لتوثيق الأثر وتشجيع باقي الشباب في الجزائر!
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const hasLiked = post.reactions.like?.includes(currentUser.id);
              const hasLoved = post.reactions.love?.includes(currentUser.id);
              const hasFired = post.reactions.fire?.includes(currentUser.id);
              const hasClapped = post.reactions.clap?.includes(currentUser.id);

              const totalReactionsCount = 
                (post.reactions.like?.length || 0) +
                (post.reactions.love?.length || 0) +
                (post.reactions.fire?.length || 0) +
                (post.reactions.clap?.length || 0);

              const isCommentsOpen = !!expandedComments[post.id];
              const isPostAuthor = post.authorId === currentUser.id;

              return (
                <article 
                  key={post.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition hover:shadow-md"
                >
                  
                  {/* Post Header */}
                  <div className="p-5 sm:p-6 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      
                      <div 
                        onClick={() => {
                          const author = allUsers.find(u => u.id === post.authorId);
                          if (author && onSelectUser) onSelectUser(author);
                        }}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-slate-900 group-hover:text-emerald-700 transition">
                              {post.authorName}
                            </span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                              {post.authorRole === 'institution' ? 'مؤسسة شبانية' : 'متطوع'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{post.authorWilaya}</span>
                            </span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Edit & Delete post options if owner */}
                      {isPostAuthor && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPost(post)}
                            title="تعديل المنشور وتغيير الصورة"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            title="حذف المنشور"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                    </div>

                    {/* Activity Tag badge if associated */}
                    {post.activityTag && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold">
                          <span>🎯 نشاط مرتبط:</span>
                          <span className="font-black">{post.activityTag}</span>
                        </span>
                      </div>
                    )}

                    {/* Post Content with Rich Text formatting */}
                    <div className="text-xs sm:text-sm text-slate-800 mt-3 leading-relaxed">
                      <RichTextRenderer content={post.content} />
                    </div>
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="px-5 sm:px-6 pb-3">
                      <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-96 bg-slate-100">
                        <img
                          src={post.imageUrl}
                          alt="صورة النشاط الميداني"
                          className="w-full h-full max-h-96 object-cover hover:scale-101 transition duration-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Reactions Summary Bar */}
                  <div className="px-5 sm:px-6 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      {totalReactionsCount > 0 && (
                        <div className="flex items-center -space-x-1 pl-1">
                          <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">👍</span>
                          <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[10px]">❤️</span>
                          <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">🔥</span>
                        </div>
                      )}
                      <span>{totalReactionsCount > 0 ? `${totalReactionsCount} تفاعل` : 'كن أول من يتفاعل'}</span>
                    </div>

                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{post.comments?.length || 0} تعليقات</span>
                    </button>
                  </div>

                  {/* Reaction Buttons & Action Bar */}
                  <div className="px-4 sm:px-6 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-1 flex-wrap">
                    
                    {/* Reaction Bar */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      
                      {/* Like 👍 */}
                      <button
                        onClick={() => togglePostReaction(post.id, 'like')}
                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          hasLiked 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'text-blue-700 fill-blue-700' : ''}`} />
                        <span>إعجاب</span>
                        {post.reactions.like?.length > 0 && (
                          <span className="text-[10px] font-black">{post.reactions.like.length}</span>
                        )}
                      </button>

                      {/* Love ❤️ */}
                      <button
                        onClick={() => togglePostReaction(post.id, 'love')}
                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          hasLoved 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLoved ? 'text-rose-600 fill-rose-600' : ''}`} />
                        <span>حب</span>
                        {post.reactions.love?.length > 0 && (
                          <span className="text-[10px] font-black">{post.reactions.love.length}</span>
                        )}
                      </button>

                      {/* Fire / Volunteer Flame 🔥 */}
                      <button
                        onClick={() => togglePostReaction(post.id, 'fire')}
                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          hasFired 
                            ? 'bg-amber-100 text-amber-900' 
                            : 'hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${hasFired ? 'text-amber-600 fill-amber-600' : ''}`} />
                        <span>عطاء</span>
                        {post.reactions.fire?.length > 0 && (
                          <span className="text-[10px] font-black">{post.reactions.fire.length}</span>
                        )}
                      </button>

                      {/* Clap 👏 */}
                      <button
                        onClick={() => togglePostReaction(post.id, 'clap')}
                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          hasClapped 
                            ? 'bg-emerald-100 text-emerald-900' 
                            : 'hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="text-xs">👏</span>
                        <span>تشجيع</span>
                        {post.reactions.clap?.length > 0 && (
                          <span className="text-[10px] font-black">{post.reactions.clap.length}</span>
                        )}
                      </button>

                    </div>

                    {/* Toggle Comments Button */}
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-slate-500" />
                      <span>تعليق ({post.comments?.length || 0})</span>
                    </button>

                  </div>

                  {/* Comments Expansion Drawer */}
                  {isCommentsOpen && (
                    <div className="p-4 sm:p-6 bg-slate-50/80 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                      
                      {/* Comments List */}
                      <div className="space-y-3">
                        {post.comments?.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-2">لا توجد تعليقات بعد، كن أول من يعلق ويدعم المبادرة!</p>
                        ) : (
                          post.comments.map((comm) => (
                            <div key={comm.id} className="flex items-start gap-2.5">
                              <img
                                src={comm.authorAvatar}
                                alt={comm.authorName}
                                className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-slate-900">{comm.authorName}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(comm.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                                  {comm.content}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Comment Input Box */}
                      <div className="flex items-center gap-2 pt-2">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSendComment(post.id);
                              }
                            }}
                            placeholder="أضف تعليقك المشجع هنا..."
                            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-900 outline-none transition"
                          />
                          <button
                            onClick={() => handleSendComment(post.id)}
                            disabled={!commentInputs[post.id]?.trim()}
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </article>
              );
            })
          )}
        </div>

      </div>

      {/* Profile Edit Modal */}
      {showEditProfileModal && (
        <EditProfileModal
          initialTab={editProfileTab}
          onClose={() => setShowEditProfileModal(false)}
        />
      )}

      {/* Post Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
        />
      )}

    </div>
  );
};
