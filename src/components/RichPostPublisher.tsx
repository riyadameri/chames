import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bold, 
  Italic, 
  Heading3, 
  List, 
  Quote, 
  Smile, 
  Hash, 
  Image as ImageIcon, 
  Upload, 
  Send, 
  Eye, 
  Edit3, 
  RotateCcw, 
  Sparkles, 
  X, 
  Check, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { RichTextRenderer } from './RichTextRenderer';

interface RichPostPublisherProps {
  onPublishSuccess?: () => void;
  defaultActivityTag?: string;
  placeholder?: string;
  className?: string;
}

const MAX_POST_CHARS = 600;

// Curated community hashtags
const COMMUNITY_HASHTAGS = [
  '#شمس_الجزائر',
  '#تحدي_المليون_شجرة',
  '#شباب_متطوع',
  '#دار_الشباب',
  '#نظافة_أحيائنا',
  '#بصمة_خير',
  '#الجزائر_الخضراء',
  '#قوافل_الإغاثة',
  '#صناع_الأمل',
  '#رمضان_الخير',
  '#تطوع_مدرسي',
  '#صحة_وبيئة'
];

// Quick access top emojis
const QUICK_EMOJIS = [
  '🇩🇿', '☀️', '🌲', '🤝', '💚', '👏', '✨', '🏆', '📢', '💡', '🌟', '🌿', '🔥', '🎯', '🚀', '❤️'
];

// Full categorized emojis
const EMOJI_CATEGORIES = {
  volunteering: {
    title: '🌲 بيئة وتطوع',
    emojis: ['🌲', '🌿', '🌱', '🌳', '🌴', '🍀', '🧤', '🧹', '🧺', '🤝', '🏕️', '🎒', '🏗️', '🚜', '♻️', '🌊', '☀️', '💧', '🌍', '⛺']
  },
  motivation: {
    title: '✨ تحفيز وتشجيع',
    emojis: ['💚', '❤️', '👏', '🔥', '✨', '🌟', '🏆', '🥇', '🥈', '🥉', '🎯', '🚀', '💡', '⚡', '🙌', '💪', '🎉', '🎊', '💫', '👑']
  },
  algeria: {
    title: '🇩🇿 الجزائر والمجتمع',
    emojis: ['🇩🇿', '🕌', '🕊️', '🚩', '🎖️', '👥', '🏛️', '🎓', '📖', '📣', '🎈', '🧭', '⭐', '🌙', '🤝', '🤍']
  }
};

// Preset sample photos
const PRESET_VOLUNTEERING_PHOTOS = [
  { label: '🌲 غرس أشجار', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80' },
  { label: '🎨 طلاء جداريات', url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80' },
  { label: '🤝 فريق شبابي', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
  { label: '🌊 تنظيف شواطئ', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80' }
];

export const RichPostPublisher: React.FC<RichPostPublisherProps> = ({
  onPublishSuccess,
  defaultActivityTag = '',
  placeholder = 'اكتب هنا تفاصيل مبادرتك، عدد الأشجار المغروسة، ساعات العمل الميداني، أو تجربة ملهمة مع زملائك في دار الشباب...',
  className = ''
}) => {
  const { currentUser, createPost, showToast } = useApp();

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [activityTag, setActivityTag] = useState(defaultActivityTag);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [isPublishing, setIsPublishing] = useState(false);

  // Drawers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('volunteering');
  const [showHashtagDrawer, setShowHashtagDrawer] = useState(false);
  const [showMediaDrawer, setShowMediaDrawer] = useState(false);
  const [mediaTab, setMediaTab] = useState<'upload' | 'url' | 'presets'>('upload');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Character Counter Calculations
  const charCount = content.length;
  const charsRemaining = MAX_POST_CHARS - charCount;
  const isOverLimit = charsRemaining < 0;
  const progressPercent = Math.min(100, Math.max(0, (charCount / MAX_POST_CHARS) * 100));

  // Word count & reading time
  const wordsCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTimeSec = Math.max(1, Math.ceil((wordsCount / 180) * 60));

  // Progress ring calculations
  const ringRadius = 11;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  // Status color based on remaining chars
  let ringColor = 'stroke-emerald-500 text-emerald-600';
  let counterBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (charsRemaining <= 60 && charsRemaining >= 0) {
    ringColor = 'stroke-amber-500 text-amber-600';
    counterBg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (isOverLimit) {
    ringColor = 'stroke-rose-600 text-rose-600';
    counterBg = 'bg-rose-50 text-rose-700 border-rose-200 font-black';
  }

  // Helper to insert formatting at selection
  const insertFormatting = (prefix: string, suffix: string = '', defaultSnippet: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}${defaultSnippet}${suffix}`;
    
    const nextContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(nextContent);

    setTimeout(() => {
      textarea.focus();
      const nextPos = selected 
        ? start + replacement.length 
        : start + prefix.length + defaultSnippet.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  // Helper to insert emoji at cursor
  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + emoji);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextContent = content.substring(0, start) + emoji + content.substring(end);
    setContent(nextContent);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + emoji.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  // Helper to insert hashtag
  const insertHashtag = (tag: string) => {
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    
    // Set as primary activityTag if none is selected
    if (!activityTag) {
      setActivityTag(formattedTag);
    }

    // Also append/insert into content if not present
    if (!content.includes(formattedTag)) {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const prefix = start > 0 && !content[start - 1].match(/\s/) ? ' ' : '';
        const toAdd = `${prefix}${formattedTag} `;
        const nextContent = content.substring(0, start) + toAdd + content.substring(end);
        setContent(nextContent);

        setTimeout(() => {
          textarea.focus();
          const nextPos = start + toAdd.length;
          textarea.setSelectionRange(nextPos, nextPos);
        }, 10);
      } else {
        setContent(prev => (prev ? `${prev} ${formattedTag}` : formattedTag));
      }
    }

    showToast({
      type: 'info',
      title: 'تم إدراج الوسم',
      message: `تم ربط المنشور بوسم المجتمع ${formattedTag}`
    });
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'ملف غير صالح',
        message: 'يرجى اختيار ملف صورة صالح (PNG, JPG, WebP).'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) {
        setImageUrl(result);
        setShowMediaDrawer(false);
        showToast({
          type: 'success',
          title: 'تم تحميل الصورة',
          message: 'تم إرفاق الصورة بنجاح للمنشور'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Post Creation
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      showToast({
        type: 'error',
        title: 'المنشور فارغ',
        message: 'يرجى كتابة نص المنشور للمشاركة.'
      });
      return;
    }

    if (isOverLimit) {
      showToast({
        type: 'error',
        title: 'تجاوزت الحد المسموح',
        message: `يرجى تقصير النص بـ ${Math.abs(charsRemaining)} حرف للنشر.`
      });
      return;
    }

    setIsPublishing(true);
    const res = createPost({
      content: content.trim(),
      imageUrl: imageUrl || undefined,
      activityTag: activityTag || undefined
    });

    setIsPublishing(false);
    if (res.success) {
      setContent('');
      setImageUrl('');
      setActivityTag('');
      setShowEmojiPicker(false);
      setShowHashtagDrawer(false);
      setShowMediaDrawer(false);
      setMode('edit');
      if (onPublishSuccess) onPublishSuccess();
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 text-right ${className}`}>
      
      {/* Publisher Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-xs"
            />
            <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-[8px] text-white">
              ✓
            </span>
          </div>

          <div>
            <div className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <span>{currentUser.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                منشور مجتمعي
              </span>
            </div>
            <div className="text-xs text-slate-500">
              شارك إنجازك أو فكرتك التطوعية ليراها الجميع فوراً
            </div>
          </div>
        </div>

        {/* View mode toggle: Edit vs Preview */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'edit'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>محرر</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'preview'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة فورية</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCreatePost} className="space-y-3">

        {/* Rich Text Editor Container */}
        <div className="border border-slate-200 rounded-2xl bg-slate-50/60 overflow-hidden focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
          
          {/* ================= RICH TEXT TOOLBAR ================= */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2 bg-slate-100/90 border-b border-slate-200/80 text-slate-700">
            
            {/* Formatting Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**', 'نص عريض')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-emerald-700 hover:shadow-2xs transition cursor-pointer"
                title="نص عريض (Bold)"
              >
                <Bold className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('*', '*', 'نص مائل')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-emerald-700 hover:shadow-2xs transition cursor-pointer"
                title="نص مائل (Italic)"
              >
                <Italic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('\n### ', '\n', 'عنوان المبادرة')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-emerald-700 hover:shadow-2xs transition cursor-pointer"
                title="عنوان فرعي (Heading)"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('\n• ', '', 'نقطة إنجاز')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-emerald-700 hover:shadow-2xs transition cursor-pointer"
                title="قائمة نقطية (Bullet List)"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('\n> ', '\n', 'رسالة ملهمة للمتطوعين')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-emerald-700 hover:shadow-2xs transition cursor-pointer"
                title="اقتباس أو تمييز (Quote)"
              >
                <Quote className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => insertFormatting('`', '`', 'إحصائية أو رقم')}
                className="px-1.5 py-1 text-[11px] font-mono font-bold rounded-lg hover:bg-white hover:text-emerald-700 hover:shadow-2xs transition cursor-pointer"
                title="تمييز أو شارة رقمية"
              >
                [تأطير]
              </button>
            </div>

            {/* Quick Drawers Toggles (Emojis & Hashtags) */}
            <div className="flex items-center gap-1">
              {/* Emoji Drawer Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowHashtagDrawer(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  showEmojiPicker
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'hover:bg-white text-slate-700 hover:text-amber-700'
                }`}
                title="إدراج إيموجي"
              >
                <Smile className="w-4 h-4 text-amber-600" />
                <span>إيموجي</span>
              </button>

              {/* Hashtag Drawer Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowHashtagDrawer(!showHashtagDrawer);
                  setShowEmojiPicker(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  showHashtagDrawer
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'hover:bg-white text-slate-700 hover:text-emerald-700'
                }`}
                title="وسوم المجتمع"
              >
                <Hash className="w-4 h-4 text-emerald-600" />
                <span>وسوم المجتمع</span>
              </button>

              {/* Clear content if present */}
              {content && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل تريد مسح النص وإعادة البدء؟')) {
                      setContent('');
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="مسح النص"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* ================= QUICK EMOJIS ACCESS STRIP ================= */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200/50 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">إيموجي سريع:</span>
            {QUICK_EMOJIS.map((emo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertEmoji(emo)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:scale-120 hover:shadow-2xs text-base transition cursor-pointer shrink-0"
                title={`إدراج ${emo}`}
              >
                {emo}
              </button>
            ))}
          </div>

          {/* ================= POPUP DRAWER: EMOJIS ================= */}
          {showEmojiPicker && (
            <div className="p-3 bg-amber-50/70 border-b border-amber-200/80 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map(catKey => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setActiveEmojiCategory(catKey)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeEmojiCategory === catKey
                          ? 'bg-amber-400 text-slate-950 shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-amber-100'
                      }`}
                    >
                      {EMOJI_CATEGORIES[catKey].title}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕ إغلاق
                </button>
              </div>

              {/* Emoji grid for active category */}
              <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
                {EMOJI_CATEGORIES[activeEmojiCategory].emojis.map((emoji, eIdx) => (
                  <button
                    key={eIdx}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white hover:bg-amber-200 border border-amber-200 text-lg hover:scale-115 transition cursor-pointer shadow-2xs"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= POPUP DRAWER: COMMUNITY HASHTAGS ================= */}
          {showHashtagDrawer && (
            <div className="p-3 bg-emerald-50/70 border-b border-emerald-200/80 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-emerald-600" />
                  <span>انقر على أي وسم لإدراجه وربط المنشور بحملته:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowHashtagDrawer(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕ إغلاق
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMUNITY_HASHTAGS.map((tag, hIdx) => {
                  const isAttached = activityTag === tag || content.includes(tag);
                  return (
                    <button
                      key={hIdx}
                      type="button"
                      onClick={() => insertHashtag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                        isAttached
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <span>{tag}</span>
                      {isAttached && <Check className="w-3 h-3 text-amber-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= EDIT MODE (TEXTAREA) OR PREVIEW MODE ================= */}
          {mode === 'edit' ? (
            <textarea
              ref={textareaRef}
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 bg-transparent text-xs sm:text-sm text-slate-900 outline-none resize-none leading-relaxed font-sans placeholder-slate-400"
            />
          ) : (
            <div className="p-4 min-h-[110px] bg-white text-right">
              {content ? (
                <RichTextRenderer 
                  content={content} 
                  onHashtagClick={(tag) => insertHashtag(tag)}
                />
              ) : (
                <p className="text-xs text-slate-400 italic">
                  معاينة المنشور ستظهر هنا فور البدء بالكتابة والتنسيق...
                </p>
              )}
            </div>
          )}

        </div>

        {/* ================= ATTACHED IMAGE PREVIEW ================= */}
        {imageUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-60 bg-slate-100 group">
            <img
              src={imageUrl}
              alt="صورة المنشور"
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="px-2.5 py-1 bg-black/75 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>إزالة</span>
              </button>
            </div>
            {activityTag && (
              <span className="absolute bottom-2 right-2 px-3 py-1 rounded-xl text-xs font-black bg-black/70 text-amber-300 backdrop-blur-md">
                {activityTag}
              </span>
            )}
          </div>
        )}

        {/* ================= MEDIA DRAWER (UPLOAD / PRESETS / URL) ================= */}
        {showMediaDrawer && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMediaTab('upload')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    mediaTab === 'upload'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع من جهازي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('presets')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    mediaTab === 'presets'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  صور مقترحة
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('url')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    mediaTab === 'url'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  رابط مباشر
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowMediaDrawer(false)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕ إغلاق
              </button>
            </div>

            {/* Presets Tab */}
            {mediaTab === 'presets' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_VOLUNTEERING_PHOTOS.map((preset, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => {
                      setImageUrl(preset.url);
                      setShowMediaDrawer(false);
                    }}
                    className="group relative h-20 rounded-xl overflow-hidden cursor-pointer border border-slate-200 hover:border-emerald-500 transition shadow-2xs"
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center p-1 text-center">
                      <span className="text-[11px] font-black text-white drop-shadow-sm">
                        {preset.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Tab */}
            {mediaTab === 'upload' && (
              <div>
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-emerald-400/60 rounded-2xl bg-emerald-50/30 hover:bg-emerald-50/60 transition cursor-pointer">
                  <Upload className="w-7 h-7 text-emerald-600 mb-1" />
                  <span className="text-xs font-black text-emerald-950">انقر لاختيار صورة من جهازك</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP بحجم مناسب</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* URL Tab */}
            {mediaTab === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">أدخل رابط صورة مباشر من الإنترنت</p>
              </div>
            )}
          </div>
        )}

        {/* ================= FOOTER CONTROLS & DYNAMIC CHARACTER COUNTER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* Left: Media & Tag Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMediaDrawer(!showMediaDrawer)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                showMediaDrawer || imageUrl
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>{imageUrl ? 'تغيير الصورة' : 'إرفاق صورة'}</span>
            </button>

            {/* Direct Device Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition cursor-pointer"
              title="رفع صورة مباشرة من صور جهازك"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>رفع من صوري</span>
            </button>

            {/* Primary Activity Tag badge / input */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={activityTag}
                onChange={(e) => setActivityTag(e.target.value)}
                placeholder="الوسم الأساسي (#شمس_الجزائر)"
                className="bg-transparent text-xs text-slate-800 outline-none w-32 sm:w-44 font-bold"
              />
            </div>
          </div>

          {/* Right: Dynamic Character Counter & Submit Button */}
          <div className="flex items-center gap-3">
            
            {/* DYNAMIC CHARACTER COUNTER WITH CIRCULAR PROGRESS */}
            <div className="flex items-center gap-2">
              {/* Words info */}
              <div className="text-[10px] text-slate-500 font-bold hidden sm:flex flex-col text-left">
                <span>{wordsCount} كلمة</span>
                <span className="text-slate-400">~{readingTimeSec} ثانية قراءة</span>
              </div>

              {/* Progress Ring & Numbers */}
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono font-black transition ${counterBg}`}
                title={isOverLimit ? `تجاوزت الحد بـ ${Math.abs(charsRemaining)} حرف` : `متبقي ${charsRemaining} حرف`}
              >
                {/* SVG Progress Ring */}
                <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 28 28">
                  {/* Background Circle */}
                  <circle
                    cx="14"
                    cy="14"
                    r={ringRadius}
                    className="stroke-slate-200 fill-none"
                    strokeWidth="3"
                  />
                  {/* Dynamic Progress Circle */}
                  <circle
                    cx="14"
                    cy="14"
                    r={ringRadius}
                    className={`fill-none transition-all duration-300 ${ringColor}`}
                    strokeWidth="3"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Remaining characters count */}
                <span>
                  {charsRemaining}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPublishing || !content.trim() || isOverLimit}
              className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'جاري النشر...' : 'نشر المنشور'}</span>
            </button>

          </div>

        </div>

        {/* Warning banner if over limit */}
        {isOverLimit && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              لقد تجاوزت الحد الأقصى للمنشور بمقدار <strong>{Math.abs(charsRemaining)}</strong> حرفاً. يرجى اختصار النص للمتابعة.
            </span>
          </div>
        )}

      </form>

    </div>
  );
};
