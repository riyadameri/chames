import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, InstitutionType } from '../types';
import { ALGERIAN_WILAYAS } from '../data/wilayas';
import { 
  X, 
  LogIn, 
  UserPlus, 
  User, 
  Building2, 
  ShieldCheck, 
  Award, 
  Users, 
  Megaphone, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Key, 
  CheckCircle2, 
  Sparkles,
  Info,
  UploadCloud,
  FileText,
  FileCheck,
  Trash2,
  Paperclip,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'individual'
}) => {
  const { loginUser, registerUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRole === 'institution' ? 'institution' : 'individual'
  );
  
  // Show / hide password
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regWilaya, setRegWilaya] = useState('الجزائر العاصمة');
  const [regInstitutionType, setRegInstitutionType] = useState<InstitutionType>('association');
  const [regInstitutionName, setRegInstitutionName] = useState('');
  const [regBio, setRegBio] = useState('');

  // Accreditation document state (Mandatory for institutions/clubs)
  const [regRegistrationNumber, setRegRegistrationNumber] = useState('');
  const [regAccreditationType, setRegAccreditationType] = useState('قرار وزاري / اعتماد ولائي رسمي');
  const [regAccreditationDocName, setRegAccreditationDocName] = useState('');
  const [regAccreditationDocSize, setRegAccreditationDocSize] = useState<number | undefined>(undefined);
  const [regAccreditationDocData, setRegAccreditationDocData] = useState<string | undefined>(undefined);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAccreditationFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('حجم الملف كبير جداً، يرجى اختيار وثيقة أقل من 15 ميغابايت.');
      return;
    }

    setIsUploadingDoc(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRegAccreditationDocName(file.name);
      setRegAccreditationDocSize(file.size);
      setRegAccreditationDocData(event.target?.result as string);
      setIsUploadingDoc(false);
      setErrorMsg(null);
    };
    reader.onerror = () => {
      setIsUploadingDoc(false);
      setErrorMsg('حدث خطأ أثناء قراءة ملف الوثيقة، يرجى المحاولة مرة أخرى.');
    };
    reader.readAsDataURL(file);
  };

  const removeAccreditationDoc = () => {
    setRegAccreditationDocName('');
    setRegAccreditationDocSize(undefined);
    setRegAccreditationDocData(undefined);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginEmailOrPhone.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني أو اسم المستخدم أو رقم الهاتف.');
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMsg('يرجى إدخال كلمة المرور لتسجيل الدخول.');
      return;
    }

    setLoading(true);
    const res = loginUser({
      emailOrPhone: loginEmailOrPhone.trim(),
      password: loginPassword.trim()
    });
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg('يرجى إدخال الاسم الكامل أو اسم المؤسسة / النادي.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 6) {
      setErrorMsg('يجب إدخال كلمة مرور لا تقل عن 6 أحرف لحماية حسابك.');
      return;
    }
    if (regPasswordConfirm && regPassword !== regPasswordConfirm) {
      setErrorMsg('كلمتا المرور غير متطابقتين.');
      return;
    }

    // Strict Accreditation Requirement for Institutions and Clubs
    if (selectedRole === 'institution') {
      if (!regAccreditationDocName.trim()) {
        setErrorMsg('⚠️ إلزامي: يرجى إرفاق أوراق الاعتماد والترخيص القانوني للمؤسسة أو النادي لمتابعة التسجيل.');
        return;
      }
    }

    setLoading(true);
    const res = registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword.trim(),
      wilaya: regWilaya,
      role: selectedRole === 'institution' ? 'institution' : 'individual',
      institutionType: selectedRole === 'institution' ? regInstitutionType : undefined,
      affiliatedInstitutionName: regInstitutionName.trim() || undefined,
      registrationNumber: regRegistrationNumber.trim() || undefined,
      accreditationDocName: regAccreditationDocName.trim() || undefined,
      accreditationDocSize: regAccreditationDocSize,
      accreditationDocData: regAccreditationDocData,
      accreditationDocType: regAccreditationType,
      bio: regBio.trim() || undefined
    });
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        
        {/* Header with Switcher Tabs */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 pb-4 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-bold text-amber-300">بوابة الدخول والتسجيل الوطنية</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            {mode === 'login' ? 'تسجيل الدخول إلى منصة شمس' : 'إنشاء حساب جديد في منصة شمس'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {mode === 'login' 
              ? 'أدخل بيانات حسابك للمشاركة في المبادرات ومتابعة رصيدك من النقاط' 
              : 'انضم لشبكة التطوع والعمل الشبابي لوزارة الشباب والرياضة'}
          </p>

          {/* Tab selector */}
          <div className="mt-4 grid grid-cols-2 p-1 bg-white/10 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register' 
                  ? 'bg-amber-400 text-slate-950 shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب جديد</span>
            </button>
          </div>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ===================== MODE 1: LOGIN ===================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginEmailOrPhone}
                    onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                    placeholder="مثال: riyad أو aroua أو adnan أو example@mail.dz"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-700">
                    كلمة المرور:
                  </label>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    (كلمة المرور الرسمية)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول الآمن</span>
              </button>

              {/* Security Guidance Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>نظام الحماية والتسجيل:</strong> يتوجب إدخال اسم المستخدم وكلمة المرور الخاصة بكل حساب رسمي للمتابعة وإدارة الأنشطة والتقييمات، بينما يسجل المتطوعون والمؤسسات ببياناتهم المسجلة.
                </div>
              </div>

              {/* Switch to Register link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(null); }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  ليس لديك حساب بعد؟ انقر هنا لإنشاء حساب متطوع فرد أو تسجيل مؤسسة
                </button>
              </div>
            </form>
          )}

          {/* ===================== MODE 2: REGISTER ===================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">

              {/* Public Role Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2">
                  اختر نوع الحساب المطلوب إنشاؤه:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label 
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                      selectedRole === 'individual'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reg_role"
                      checked={selectedRole === 'individual'}
                      onChange={() => setSelectedRole('individual')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>متطوع فرد (أفراد)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        للشباب والطلبة: المشاركة في الأنشطة، رفع الإثباتات، جمع النقاط والتنافس على جوائز الموسم.
                      </p>
                    </div>
                  </label>

                  <label 
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                      selectedRole === 'institution'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reg_role"
                      checked={selectedRole === 'institution'}
                      onChange={() => setSelectedRole('institution')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>مؤسسة شبانية / جمعية</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        للجمعيات، النوادي، الكشافة: تسجيل النوادي، المشاركة الجماعية، والمنافسة المؤسساتية.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Security Restriction Banner */}
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>ضوابط الصلاحيات:</strong> لا يمكن لأي كان أن يكون مديراً للمنصة أو مقيّم إثباتات أو مسؤول إعلام. يتم تعيين وإنشاء الحسابات الإدارية حصرياً عبر <strong>المدير العام للمنصة (عامري رياض يوسف - riyad)</strong>.
                  </span>
                </div>
              </div>

              {/* Registration Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {selectedRole === 'institution' ? 'اسم المؤسسة / الجمعية:' : 'الاسم واللقب الكامل:'}
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={selectedRole === 'institution' ? 'مثال: جمعية بصمة شباب وادي قريش' : 'مثال: رياض عميري'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    البريد الإلكتروني:
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@shams.dz"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الولاية:
                  </label>
                  <select
                    value={regWilaya}
                    onChange={(e) => setRegWilaya(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  >
                    {ALGERIAN_WILAYAS.map(w => (
                      <option key={w.code} value={w.name}>
                        {w.code}. ولاية {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    رقم الهاتف:
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0550 00 00 00"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Special options & Accreditation Upload for institution / club */}
              {selectedRole === 'institution' && (
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3.5">
                  <div className="flex items-center gap-2 text-blue-900 font-black text-xs pb-1 border-b border-blue-200/70">
                    <FileCheck className="w-4 h-4 text-blue-700" />
                    <span>بيانات وأوراق الاعتماد والترخيص القانوني (إلزامي للنوادي والمؤسسات)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-blue-900 mb-1">
                        نوع الهيكل / المؤسسة:
                      </label>
                      <select
                        value={regInstitutionType}
                        onChange={(e) => setRegInstitutionType(e.target.value as InstitutionType)}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="association">جمعية وطنية أو محلية</option>
                        <option value="club">نادي شبابي أو رياضي معتمد</option>
                        <option value="youth_house">دار شباب</option>
                        <option value="sports_complex">مركب رياضي جواري</option>
                        <option value="youth_hostel">بيت شباب</option>
                        <option value="scout_org">فوج كشفي / منظمة معتمدة</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-blue-900 mb-1">
                        رقم الاعتماد والترخيص الرسمي: <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={regRegistrationNumber}
                        onChange={(e) => setRegRegistrationNumber(e.target.value)}
                        placeholder="رقم الوصل أو الترخيص الصادر"
                        className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-blue-900 mb-1">
                        نوع وثيقة الاعتماد المرفقة:
                      </label>
                      <select
                        value={regAccreditationType}
                        onChange={(e) => setRegAccreditationType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="قرار وزاري / اعتماد ولائي رسمي">قرار وزاري / اعتماد ولائي رسمي</option>
                        <option value="وصل إيداع / ترخيص تأسيس">وصل إيداع / ترخيص تأسيس</option>
                        <option value="محضر تجديد مكتب تنفيذي">محضر تجديد مكتب تنفيذي</option>
                        <option value="ترخيص بلدي أو قطاعي">ترخيص بلدي أو قطاعي</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-blue-900 mb-1">
                        التبعية الإدارية / المقر:
                      </label>
                      <input
                        type="text"
                        value={regInstitutionName}
                        onChange={(e) => setRegInstitutionName(e.target.value)}
                        placeholder="مثال: مديرية الشباب والرياضة أو البلدية"
                        className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* File Upload Field for Accreditation Documents */}
                  <div>
                    <label className="block text-xs font-black text-blue-950 mb-1.5 flex items-center justify-between">
                      <span>إرفاق ملف وثيقة الاعتماد (PDF أو صورة واضحة): <span className="text-rose-600">*</span></span>
                      {regAccreditationDocName && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                          تم تجهيز الملف
                        </span>
                      )}
                    </label>

                    {!regAccreditationDocName ? (
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white rounded-2xl cursor-pointer transition group">
                        <UploadCloud className="w-7 h-7 text-blue-600 group-hover:scale-110 transition mb-1.5" />
                        <span className="text-xs font-bold text-blue-900">
                          {isUploadingDoc ? 'جاري قراءة الملف...' : 'انقر هنا لاختيار ملف وثيقة الاعتماد أو اسحبه هنا'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1">
                          يقبل ملفات PDF أو صور عالية الوضوح (JPG, PNG) بحد أقصى 15 ميغابايت
                        </span>
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg"
                          onChange={handleAccreditationFileUpload}
                          className="hidden"
                          disabled={isUploadingDoc}
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-300 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {regAccreditationDocName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {regAccreditationDocSize 
                                ? `${(regAccreditationDocSize / (1024 * 1024)).toFixed(2)} MB`
                                : 'ملف معتمد'} • {regAccreditationType}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={removeAccreditationDoc}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="حذف الملف واختيار غيره"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="text-[10px] text-blue-800/90 leading-tight mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-blue-700 shrink-0" />
                      <span>تخضع ملفات الاعتماد للتحقق والمصادقة من قبل إدارة المنصة قبل تفعيل الشارة الرسمية.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Password inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    كلمة المرور:
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="لا تقل عن 6 أحرف"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    تأكيد كلمة المرور:
                  </label>
                  <input
                    type="password"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>إنشاء الحساب والبدء فوراً</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline"
                >
                  لديك حساب بالفعل؟ انقر هنا لتسجيل الدخول
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
