import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  User, 
  AtSign, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { ALGERIAN_WILAYAS } from '../data/mockData';
import { saveImageToFileSystem } from '../utils/fileStorage';

interface EditProfileModalProps {
  onClose: () => void;
  initialTab?: 'info' | 'avatar' | 'cover';
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=350&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=350&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=350&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=350&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=350&q=80'
];

const PRESET_COVERS = [
  {
    title: 'جبال جرجرة - تيكجدة',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'غابة باينام - الجزائر العاصمة',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'واحة غرداية والصحراء',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'ساحل عنابة - سرايدي',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'تطوع وزراعة البيئة الخضراء',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
  }
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  onClose,
  initialTab = 'info'
}) => {
  const { currentUser, updateUserProfile, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'avatar' | 'cover'>(initialTab);

  // Form states
  const [name, setName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [wilaya, setWilaya] = useState(currentUser.wilaya || 'الجزائر العاصمة');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');

  // Media states
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [coverImage, setCoverImage] = useState(currentUser.coverImage || '');

  // Custom upload refs
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // Handle local image file upload for avatar
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const { dataUrl, record } = await saveImageToFileSystem(file, 'profile');
      setAvatar(dataUrl);
      showToast({
        type: 'success',
        title: 'تم حفظ الصورة الشخصية في الملفات! 📸',
        message: `تم تخزين "${record.name}" في مكتبة ملفات النظام بنجاح.`
      });
    } catch (err) {
      console.error(err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setAvatar(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle local image file upload for cover
  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast({
        type: 'warning',
        title: 'حجم صورة الغلاف كبير',
        message: 'يرجى اختيار صورة غلاف بحجم أقل من 8 ميغابايت.'
      });
      return;
    }

    try {
      const { dataUrl, record } = await saveImageToFileSystem(file, 'profile');
      setCoverImage(dataUrl);
      showToast({
        type: 'success',
        title: 'تم حفظ صورة الغلاف في الملفات! 🖼️',
        message: `تم تخزين "${record.name}" في مكتبة ملفات النظام بنجاح.`
      });
    } catch (err) {
      console.error(err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCoverImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast({
        type: 'warning',
        title: 'الاسم مطلوب',
        message: 'يرجى إدخال اسمك أو اللقب.'
      });
      return;
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    const res = updateUserProfile({
      name: name.trim(),
      username: cleanUsername || undefined,
      bio: bio.trim(),
      wilaya,
      phone: phone.trim(),
      email: email.trim(),
      avatar: avatar.trim(),
      coverImage: coverImage.trim() || undefined
    });

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              👤
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">تعديل الملف الشخصي وصور الحساب</h2>
              <p className="text-xs text-slate-500">تخصيص البيانات الشخصية، الصورة الرمزية، وصورة الغلاف</p>
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

        {/* Tab selection */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition border-b-2 cursor-pointer ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            البيانات الشخصية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'avatar'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>صورة البروفايل</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cover')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cover'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>صورة الغلاف</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: Personal Info */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الاسم واللقب *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أمين بن سالم"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-blue-600" />
                    <span>اسم المستخدم (المعرف الفريد)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="riyad_vol"
                      className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                      dir="ltr"
                    />
                    <span className="absolute right-3 top-3 text-slate-400 font-bold text-xs">@</span>
                  </div>
                </div>

              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>نبذة تعريفية (البايو)</span>
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة قصيرة عن شغفك بالعمل التطوعي، أهدافك، أو تخصصك والمبادرات التي تود دعمها في الجزائر..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 block text-left">
                  {bio.length} / 250 حرف
                </span>
              </div>

              {/* Wilaya & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>الولاية</span>
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {ALGERIAN_WILAYAS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>رقم الهاتف</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0550 12 34 56"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>البريد الإلكتروني</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="volunteer@shams.dz"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Avatar Picture */}
          {activeTab === 'avatar' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Current preview */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <div className="relative">
                  <img
                    src={avatar}
                    alt="معاينة الصورة"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
                  />
                  <span className="absolute -bottom-1 -left-1 p-1 rounded-lg bg-emerald-600 text-white shadow-xs">
                    <Check className="w-3 h-3" />
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900">المعاينة الحالية للصورة الشخصية</h4>
                  <p className="text-[11px] text-slate-500">
                    هذه الصورة ستظهر على بطاقتك التطوعية، شهاداتك الرسمية، ومنشوراتك.
                  </p>
                </div>
              </div>

              {/* Direct file upload from device */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 block">
                  📁 رفع صورة خاصة من صور جهازك (هاتفك أو حاسوبك):
                </label>
                
                <input
                  ref={avatarFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => avatarFileRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-emerald-400 rounded-2xl bg-emerald-50/30 hover:bg-emerald-50 transition cursor-pointer flex flex-col items-center justify-center gap-1 group"
                >
                  <Upload className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition" />
                  <span className="text-xs font-black text-emerald-950">
                    انقر هنا لاختيار صورة من جهازك
                  </span>
                  <span className="text-[10px] text-slate-500">
                    يدعم JPG, PNG, WEBP (حتى 5 ميغابايت)
                  </span>
                </button>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-800 block">
                  أو اختر صورة رمزية جاهزة:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((pUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setAvatar(pUrl)}
                      className={`relative h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                        avatar === pUrl
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:scale-102'
                      }`}
                    >
                      <img src={pUrl} alt="preset" className="w-full h-full object-cover" />
                      {avatar === pUrl && (
                        <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct URL input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-black text-slate-800 block">
                  أو أدخل رابط صورة مباشر من الإنترنت:
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 text-left font-mono"
                  dir="ltr"
                />
              </div>

            </div>
          )}

          {/* TAB 3: Cover / Background */}
          {activeTab === 'cover' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Cover Preview Banner */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 block">معاينة الغلاف الجديد:</span>
                <div className="h-32 sm:h-40 w-full rounded-2xl overflow-hidden border border-slate-200 relative bg-gradient-to-r from-emerald-800 via-teal-700 to-amber-600 shadow-inner">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="معاينة الغلاف"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/80 text-xs font-bold">
                      غلاف افتراضي متدرج ثلاثي الأبعاد
                    </div>
                  )}
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-[10px] font-bold rounded-lg transition"
                    >
                      إعادة للغلاف الافتراضي
                    </button>
                  )}
                </div>
              </div>

              {/* Direct file upload from device */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 block">
                  📁 رفع صورة غلاف من جهازك (بانوراما أو طبيعة أو نشاطك الميداني):
                </label>

                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFile}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => coverFileRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-teal-400 rounded-2xl bg-teal-50/30 hover:bg-teal-50 transition cursor-pointer flex flex-col items-center justify-center gap-1 group"
                >
                  <Upload className="w-6 h-6 text-teal-600 group-hover:scale-110 transition" />
                  <span className="text-xs font-black text-teal-950">
                    انقر هنا لاختيار صورة غلاف عريضة من جهازك
                  </span>
                  <span className="text-[10px] text-slate-500">
                    يفضل صور عريضة أفقية بدقة عالية
                  </span>
                </button>
              </div>

              {/* Algerian nature / themes presets */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-800 block">
                  أو اختر غلافاً من معالم ومناظر الطبيعة والتطوع في الجزائر:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_COVERS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCoverImage(preset.url)}
                      className={`group relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                        coverImage === preset.url
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-102'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center p-1 text-center">
                        <span className="text-[10px] font-black text-white drop-shadow-sm">
                          {preset.title}
                        </span>
                      </div>
                      {coverImage === preset.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[9px]">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Cover URL */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-black text-slate-800 block">
                  أو أدخل رابط صورة غلاف مباشر:
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 text-left font-mono"
                  dir="ltr"
                />
              </div>

            </div>
          )}

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
              <span>حفظ التعديلات في الحساب</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
