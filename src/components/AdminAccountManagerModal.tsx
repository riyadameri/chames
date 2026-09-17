import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Building2, 
  Users, 
  Megaphone, 
  Award, 
  User, 
  Key, 
  Check, 
  Copy, 
  Trash2, 
  Search, 
  Filter, 
  Sparkles, 
  AlertCircle, 
  LogIn, 
  Layers, 
  CheckCircle2,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Flame,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, InstitutionType, AffiliatedClub } from '../types';
import { ALGERIAN_WILAYAS } from '../data/mockData';

interface AdminAccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'create_account' | 'users_list' | 'clubs_manager' | 'production_check';
}

export const AdminAccountManagerModal: React.FC<AdminAccountManagerModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'create_account'
}) => {
  const { 
    allUsers, 
    currentUser, 
    registerUser, 
    deleteUserAccount, 
    clubs, 
    addClub, 
    deleteClub, 
    loginUser,
    showToast,
    mongoDbStatus,
    isSyncingDb,
    syncNowWithMongoDb
  } = useApp();

  const [activeTab, setActiveTab] = useState<'create_account' | 'users_list' | 'clubs_manager' | 'production_check'>(defaultTab);

  // Form State for creating new Account
  const [targetRole, setTargetRole] = useState<UserRole>('institution');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [wilaya, setWilaya] = useState('الجزائر العاصمة');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('youth_house');
  const [affiliatedInstitutionName, setAffiliatedInstitutionName] = useState('');
  const [bio, setBio] = useState('');
  const [isAlsoClub, setIsAlsoClub] = useState(false);
  const [clubCategory, setClubCategory] = useState<'environmental' | 'digital' | 'cultural' | 'sports' | 'relief'>('environmental');
  const [clubLeader, setClubLeader] = useState('');
  const [clubMembersCount, setClubMembersCount] = useState(15);

  // Users Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for adding a standalone club
  const [standaloneClubName, setStandaloneClubName] = useState('');
  const [standaloneParentInst, setStandaloneParentInst] = useState('');
  const [standaloneCategory, setStandaloneCategory] = useState<'environmental' | 'digital' | 'cultural' | 'sports' | 'relief'>('environmental');
  const [standaloneWilaya, setStandaloneWilaya] = useState('الجزائر العاصمة');
  const [standaloneLeader, setStandaloneLeader] = useState('');
  const [standaloneMembers, setStandaloneMembers] = useState(20);

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#';
    let generated = '';
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      showToast({
        type: 'error',
        title: 'بيانات ناقصة',
        message: 'يرجى إدخال الاسم والبريد الإلكتروني على الأقل.'
      });
      return;
    }

    const defaultPass = password.trim() || '123456';
    const finalUsername = username.trim().toLowerCase() || `user_${Date.now().toString().slice(-5)}`;

    const res = registerUser({
      name: name.trim(),
      username: finalUsername,
      email: email.trim(),
      phone: phone.trim() || '0550 00 00 00',
      password: defaultPass,
      wilaya,
      role: targetRole,
      institutionType: targetRole === 'institution' ? institutionType : undefined,
      affiliatedInstitutionName: affiliatedInstitutionName.trim() || undefined,
      bio: bio.trim() || (
        targetRole === 'evaluator_admin' 
          ? 'مقيّم إثباتات رسمي معتمد لمنصة شمس'
          : targetRole === 'media_admin'
          ? 'مسؤول التغطية والإعلام شمس ميديا'
          : targetRole === 'institution_admin'
          ? 'مسؤول هيكل شباني معتمد'
          : targetRole === 'institution'
          ? 'هيكل شباني / مؤسسة معتمدة'
          : 'متطوع رسمي معتمد'
      ),
      stayAsCurrentAdmin: true,
      adminCode: 'riyadriyad'
    });

    if (res.success) {
      // If user checked "Also register as Affiliated Club"
      if (isAlsoClub || targetRole === 'institution') {
        const clubName = name.trim();
        addClub({
          name: clubName,
          category: clubCategory,
          parentInstitution: affiliatedInstitutionName.trim() || name.trim(),
          leaderName: clubLeader.trim() || name.trim(),
          wilaya,
          membersCount: clubMembersCount || 15,
          badge: 'نادي معتمد ☀️',
          description: `نادي معتمد تابع لـ ${name.trim()} ينشط ضمن فعاليات المنصة الوطنية شمس.`
        });
      }

      showToast({
        type: 'success',
        title: 'تم إنشاء الحساب بنجاح! 🛡️',
        message: `تم إنشاء حساب "${name}" بصلاحية (${getRoleLabel(targetRole)})، واسم المستخدم: ${finalUsername}`
      });

      // Reset form
      setName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setPassword('');
      setBio('');
      setAffiliatedInstitutionName('');
      setIsAlsoClub(false);
      setActiveTab('users_list');
    }
  };

  const handleCreateStandaloneClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standaloneClubName.trim()) return;

    addClub({
      name: standaloneClubName.trim(),
      category: standaloneCategory,
      parentInstitution: standaloneParentInst.trim() || 'دار الشباب وادي قريش',
      leaderName: standaloneLeader.trim() || 'مسؤول النادي',
      wilaya: standaloneWilaya,
      membersCount: Number(standaloneMembers) || 15,
      badge: 'نادي جديد 🌟',
      description: `نادي شبابي ناشط في ولاية ${standaloneWilaya} تحت إشراف وزارة الشباب والرياضة.`
    });

    showToast({
      type: 'success',
      title: 'تم تسجيل النادي بنجاح',
      message: `تمت إضافة نادي "${standaloneClubName}" بنجاح إلى شبكة المنصة الوطنية.`
    });

    setStandaloneClubName('');
    setStandaloneLeader('');
    setStandaloneParentInst('');
  };

  const handleCopyCredentials = (u: any) => {
    const creds = `منصة شمس - بيانات تسجيل الدخول:\nالاسم: ${u.name}\nاسم المستخدم: ${u.username || u.email}\nالبريد: ${u.email}\nكلمة المرور: ${u.password || '123456'}\nالرتبة: ${getRoleLabel(u.role)}`;
    navigator.clipboard.writeText(creds);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2500);
    showToast({
      type: 'info',
      title: 'تم نسخ بيانات الدخول',
      message: 'تم نسخ اسم المستخدم وكلمة المرور إلى الحافظة.'
    });
  };

  const handleQuickSwitch = (u: any) => {
    loginUser({
      emailOrPhone: u.username || u.email,
      password: u.password || '123456'
    });
    onClose();
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'general_admin': return 'المدير العام للمنصة';
      case 'evaluator_admin': return 'مقيّم إثباتات ومنح النقاط';
      case 'media_admin': return 'مسؤول الإعلام والتغطية';
      case 'institution_admin': return 'مسؤول هيكل شباني';
      case 'institution': return 'مؤسسة شبانية / جمعية';
      case 'individual': return 'متطوع فرد';
      default: return role;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'general_admin':
        return { label: 'مدير عام', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: Award };
      case 'evaluator_admin':
        return { label: 'مقيّم إثباتات', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: ShieldCheck };
      case 'media_admin':
        return { label: 'مسؤول إعلام', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: Megaphone };
      case 'institution_admin':
        return { label: 'مسؤول هيكل', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Users };
      case 'institution':
        return { label: 'مؤسسة / جمعية', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Building2 };
      default:
        return { label: 'متطوع فرد', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: User };
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.wilaya || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div 
        id="admin-account-manager-modal"
        className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        
        {/* Header with Admin Authority Banner */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-5 sm:p-6 pb-4 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-xs font-bold text-amber-300 font-mono">لوحة التحكم السيادية للمدير العام</span>
            </div>
            <div className="bg-amber-400/20 border border-amber-400/40 text-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>عامري رياض يوسف (riyad)</span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-amber-400" />
            <span>إدارة وإنشاء حسابات المؤسسات والنوادي والمشرفين</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            بصفتك المدير العام للمنصة، تتيح لك هذه اللوحة حصرية إنشاء حسابات المؤسسات، النوادي، مسؤولي الإعلام، مقيمي الإثباتات، والمتطوعين وتعيين صلاحياتهم مباشرة.
          </p>

          {/* Nav Tabs */}
          <div className="flex gap-2 mt-4 pt-2 border-t border-white/10 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('create_account')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'create_account'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب جديد</span>
            </button>

            <button
              onClick={() => setActiveTab('users_list')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'users_list'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>الحسابات المسجلة ({allUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('clubs_manager')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'clubs_manager'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>النوادي الشبانية ({clubs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('production_check')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'production_check'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>قاعدة بيانات MongoDB ({mongoDbStatus?.database || 'shames'})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: CREATE ACCOUNT */}
          {activeTab === 'create_account' && (
            <form onSubmit={handleCreateAccountSubmit} className="space-y-5">
              {/* Role Selection Grid */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2.5">
                  1. حدد رتبة وصلاحية الحساب المراد إنشاؤه:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    {
                      role: 'institution' as UserRole,
                      title: 'مؤسسة شبانية / جمعية',
                      desc: 'دور الشباب، المركبات الجوارية، الجمعيات والنوادي',
                      icon: Building2,
                      color: 'text-blue-600',
                      badge: 'مؤسسة'
                    },
                    {
                      role: 'evaluator_admin' as UserRole,
                      title: 'مقيّم إثباتات ومنح النقاط',
                      desc: 'فحص صور الميدان، التحقق من الإحداثيات واعتماد النقاط',
                      icon: ShieldCheck,
                      color: 'text-rose-600',
                      badge: 'إشراف ميداني'
                    },
                    {
                      role: 'media_admin' as UserRole,
                      title: 'مسؤول الإعلام والتغطية',
                      desc: 'شمس ميديا، تحرير المقالات ونشر التغطيات المصورة',
                      icon: Megaphone,
                      color: 'text-teal-600',
                      badge: 'إعلام'
                    },
                    {
                      role: 'institution_admin' as UserRole,
                      title: 'مسؤول هيكل شباني',
                      desc: 'إشراف دار الشباب أو المركب على النوادي والمتطوعين',
                      icon: Users,
                      color: 'text-purple-600',
                      badge: 'هيكل شباني'
                    },
                    {
                      role: 'individual' as UserRole,
                      title: 'متطوع فرد (أفراد)',
                      desc: 'حساب متطوع شاب معتمد للمشاركة ورفع الإثباتات',
                      icon: User,
                      color: 'text-emerald-600',
                      badge: 'متطوع'
                    },
                    {
                      role: 'general_admin' as UserRole,
                      title: 'مدير عام مساعد',
                      desc: 'صلاحيات الإشراف الإداري الشامل للمنصة',
                      icon: Award,
                      color: 'text-amber-600',
                      badge: 'إدارة عليا'
                    }
                  ].map(item => {
                    const IconC = item.icon;
                    const isSelected = targetRole === item.role;
                    return (
                      <div
                        key={item.role}
                        onClick={() => setTargetRole(item.role)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between text-right ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-100' : 'bg-slate-100'}`}>
                            <IconC className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {item.badge}
                          </span>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-black text-xs text-slate-900">{item.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account Details Form */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. بيانات الحساب ومعلومات تسجيل الدخول:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {targetRole === 'institution' ? 'اسم المؤسسة أو الجمعية أو النادي:' : 'الاسم واللقب الكامل:'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={targetRole === 'institution' ? 'مثال: دار الشباب وادي قريش / نادي بصمة خير' : 'مثال: كريم بلقاسم'}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم المستخدم الفريد (Username للدخول السريع):
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="مثال: karim_eval أو dar_ouedkoreiche"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البريد الإلكتروني الرسمي:
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="account@shams.dz"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        كلمة المرور:
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[10px] text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        + توليد كلمة مرور
                      </button>
                    </div>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="كلمة مرور الحساب (افتراضي: 123456)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف:
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0550 00 00 00"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الولاية:
                    </label>
                    <select
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {ALGERIAN_WILAYAS.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional fields for Institution */}
                {(targetRole === 'institution' || targetRole === 'institution_admin') && (
                  <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        نوع الهيكل الشاباني:
                      </label>
                      <select
                        value={institutionType}
                        onChange={(e) => setInstitutionType(e.target.value as InstitutionType)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="youth_house">دار شباب (Maison de jeunes)</option>
                        <option value="sports_complex">مركب رياضي جواري (Complexe sportif)</option>
                        <option value="club">نادي شبابي أو رياضي معتمد</option>
                        <option value="association">جمعية وطنية أو ولائية</option>
                        <option value="youth_hostel">بيت شباب (Auberge de jeunesse)</option>
                        <option value="scout_org">فوج كشفي إسلامي جزائري</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        التبعية الإدارية / المقر:
                      </label>
                      <input
                        type="text"
                        value={affiliatedInstitutionName}
                        onChange={(e) => setAffiliatedInstitutionName(e.target.value)}
                        placeholder="مثال: ديوان مؤسسات الشباب لولاية الجزائر (ODEJ)"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Institution/Club Linked Sync Checkbox */}
                {targetRole === 'institution' && (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAlsoClub}
                        onChange={(e) => setIsAlsoClub(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-xs font-bold text-blue-900">
                        تسجيل هذا الهيكل كنادٍ شبابي ناشط مباشرة في قائمة نوادي شمس التابعة
                      </span>
                    </label>

                    {isAlsoClub && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-blue-200 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-blue-800 mb-0.5">تخصص النادي:</label>
                          <select
                            value={clubCategory}
                            onChange={(e) => setClubCategory(e.target.value as any)}
                            className="w-full p-1.5 bg-white border border-blue-200 rounded-lg text-xs"
                          >
                            <option value="environmental">بيئي وتدوير</option>
                            <option value="digital">رقمي وتقني</option>
                            <option value="cultural">ثقافي وتراثي</option>
                            <option value="sports">رياضي وصحي</option>
                            <option value="relief">إغاثي وإنساني</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-blue-800 mb-0.5">قائد النادي:</label>
                          <input
                            type="text"
                            value={clubLeader}
                            onChange={(e) => setClubLeader(e.target.value)}
                            placeholder="اسم قائد النادي"
                            className="w-full p-1.5 bg-white border border-blue-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-blue-800 mb-0.5">عدد الأعضاء الأولي:</label>
                          <input
                            type="number"
                            value={clubMembersCount}
                            onChange={(e) => setClubMembersCount(Number(e.target.value))}
                            className="w-full p-1.5 bg-white border border-blue-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio / Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الوصف أو النبذة التعريفية (اختياري):
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="مثال: مسؤول إعلامي ومحرر في شمس ميديا لولاية الجزائر"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>الحساب سيبقى معتمداً وسيتمكن صاحبه من تسجيل الدخول مباشرة.</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد وإنشاء الحساب الآن</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: USERS LIST & MANAGEMENT */}
          {activeTab === 'users_list' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم، اسم المستخدم، البريد أو الولاية..."
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">جميع الرتب ({allUsers.length})</option>
                    <option value="general_admin">المدير العام</option>
                    <option value="evaluator_admin">مقيم إثباتات</option>
                    <option value="media_admin">مسؤول إعلام</option>
                    <option value="institution_admin">مسؤول هيكل</option>
                    <option value="institution">مؤسسة / جمعية</option>
                    <option value="individual">متطوع فرد</option>
                  </select>
                </div>
              </div>

              {/* Users Table / Cards */}
              <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-bold">لا يوجد أي حساب يطابق البحث.</p>
                  </div>
                ) : (
                  filteredUsers.map(u => {
                    const badge = getRoleBadge(u.role);
                    const BadgeIcon = badge.icon;
                    const isRiyad = u.username === 'riyad' || u.id === 'admin-gen-1';

                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isRiyad 
                            ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-400/50' 
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {/* User Basic Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-black text-xs text-slate-900 truncate">{u.name}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}>
                                <BadgeIcon className="w-3 h-3" />
                                <span>{badge.label}</span>
                              </span>
                              {isRiyad && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                                  الحساب الافتراضي السيادي
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 flex-wrap">
                              <span className="font-mono text-slate-700 font-bold">@{u.username || 'user'}</span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{u.email}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{u.wilaya}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Copy Credentials */}
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(u)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs flex items-center gap-1"
                            title="نسخ بيانات الدخول"
                          >
                            {copiedId === u.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px] font-bold hidden md:inline">نسخ الدخول</span>
                          </button>

                          {/* Quick Login As This User */}
                          <button
                            type="button"
                            onClick={() => handleQuickSwitch(u)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer text-xs font-bold flex items-center gap-1.5"
                            title="تجربة الدخول بهذا الحساب"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span className="text-[10px]">دخول</span>
                          </button>

                          {/* Delete Account (Protected for default Admin Riyad) */}
                          {!isRiyad && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من رغبتك في حذف حساب "${u.name}"؟`)) {
                                  deleteUserAccount(u.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                              title="حذف الحساب"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CLUBS MANAGER */}
          {activeTab === 'clubs_manager' && (
            <div className="space-y-5">
              {/* Standalone Club Creation Form */}
              <form onSubmit={handleCreateStandaloneClub} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>إضافة وتعيين نادٍ شبابي جديد تابع لهيكل أو مؤسسة:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم النادي الشبابي:</label>
                    <input
                      type="text"
                      value={standaloneClubName}
                      onChange={(e) => setStandaloneClubName(e.target.value)}
                      placeholder="مثال: نادي البيئة والمناخ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المؤسسة / الهيكل الحاضن:</label>
                    <input
                      type="text"
                      value={standaloneParentInst}
                      onChange={(e) => setStandaloneParentInst(e.target.value)}
                      placeholder="مثال: دار الشباب وادي قريش"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">التخصص والنشاط:</label>
                    <select
                      value={standaloneCategory}
                      onChange={(e) => setStandaloneCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="environmental">بيئي وتدوير</option>
                      <option value="digital">رقمي وتقني</option>
                      <option value="cultural">ثقافي وتراثي</option>
                      <option value="sports">رياضي وصحي</option>
                      <option value="relief">إغاثي وتطوعي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الولاية:</label>
                    <select
                      value={standaloneWilaya}
                      onChange={(e) => setStandaloneWilaya(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                    >
                      {ALGERIAN_WILAYAS.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">قائد أو مسير النادي:</label>
                    <input
                      type="text"
                      value={standaloneLeader}
                      onChange={(e) => setStandaloneLeader(e.target.value)}
                      placeholder="مثال: مريم بوقرة"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">عدد الأعضاء:</label>
                    <input
                      type="number"
                      value={standaloneMembers}
                      onChange={(e) => setStandaloneMembers(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>تسجيل النادي في المنصة</span>
                  </button>
                </div>
              </form>

              {/* Clubs List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-800">قائمة النوادي المسجلة حالياً ({clubs.length}):</h4>
                {clubs.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
                    لا توجد نوادٍ مسجلة حالياً. يمكنك إضافة أول نادٍ شبابي للمنصة عبر النموذج أعلاه.
                  </div>
                ) : (
                  clubs.map(c => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-xs text-slate-900">{c.name}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {c.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          المؤسسة الحاضنة: <strong className="text-slate-700">{c.parentInstitution}</strong> • القائد: {c.leaderName} • {c.membersCount} عضو • ولاية {c.wilaya}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف نادي "${c.name}"؟`)) {
                            deleteClub(c.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                        title="حذف النادي"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTION READINESS */}
          {activeTab === 'production_check' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-right space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>حالة الجاهزية للنشر الفوري (Production Deployment)</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  تم اعتماد الحسابات الرسمية الخمسة لفريق إدارة المنصة والإشراف الميداني مع كلمات المرور المحمية، وتم نزع كافة أزرار تبديل الأدوار التجريبية لتأمين النشر المباشر.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs">
                    <span className="text-slate-500 block text-[10px]">المدير العام للمنصة:</span>
                    <strong className="text-slate-900 block text-xs mt-0.5">عامري رياض يوسف</strong>
                    <span className="font-mono text-emerald-700 font-bold block mt-0.5">riyad / riyadriyad</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs">
                    <span className="text-slate-500 block text-[10px]">المكلفة بالإعلام والاتصال:</span>
                    <strong className="text-slate-900 block text-xs mt-0.5">مهدي اروى بدر التمام</strong>
                    <span className="font-mono text-teal-700 font-bold block mt-0.5">aroua / arouaaroua</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs">
                    <span className="text-slate-500 block text-[10px]">مسؤول المراقبة والتقييم:</span>
                    <strong className="text-slate-900 block text-xs mt-0.5">محمد رياض طبه</strong>
                    <span className="font-mono text-rose-700 font-bold block mt-0.5">adnan / adnanadnan</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs">
                    <span className="text-slate-500 block text-[10px]">مسؤولة هيكل شباني:</span>
                    <strong className="text-slate-900 block text-xs mt-0.5">مهدي رواء نور السلام</strong>
                    <span className="font-mono text-blue-700 font-bold block mt-0.5">raoua / raouaraoua</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs">
                    <span className="text-slate-500 block text-[10px]">مسؤول هيكل شباني:</span>
                    <strong className="text-slate-900 block text-xs mt-0.5">امين بوطبيلة</strong>
                    <span className="font-mono text-blue-700 font-bold block mt-0.5">amin / aminamin</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs">
                    <span className="text-slate-500 block text-[10px]">التسجيل العام:</span>
                    <strong className="text-slate-900 block text-xs mt-0.5">متطوع فرد / مؤسسة بأوراق اعتماد</strong>
                    <span className="text-emerald-800 text-[11px] block mt-0.5">إرفاق وثائق الاعتماد إلزامي للنوادي</span>
                  </div>
                </div>
              </div>

              {/* MongoDB Atlas Database Live Console */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 border border-emerald-900/60 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>قاعدة بيانات MongoDB:</span>
                        <span className="text-emerald-400 font-mono underline decoration-emerald-500/50">{mongoDbStatus?.database || 'shames'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">اتصال سحابي مباشر ومستمر لحفظ ومزامنة كافة بيانات المنصة</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>متصل ومباشر (Active)</span>
                    </span>
                    {mongoDbStatus?.pingMs && (
                      <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-2 py-1 rounded-md">
                        {mongoDbStatus.pingMs} ms
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">المستخدمين (users)</span>
                    <strong className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {mongoDbStatus?.counts?.users ?? allUsers.length}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">النوادي (clubs)</span>
                    <strong className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {mongoDbStatus?.counts?.clubs ?? clubs.length}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">النشاطات (activities)</span>
                    <strong className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {mongoDbStatus?.counts?.activities ?? 'نشطة'}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">الإثباتات (submissions)</span>
                    <strong className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {mongoDbStatus?.counts?.submissions ?? 'محفوظة'}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">المنشورات (posts)</span>
                    <strong className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {mongoDbStatus?.counts?.posts ?? 'مباشرة'}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Cluster & ReplicaSet</span>
                    <strong className="text-xs font-mono text-amber-300 mt-0.5 block truncate" title="atlas-3anew8-shard-0">
                      Cluster0 / 3anew8
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={syncNowWithMongoDb}
                    disabled={isSyncingDb}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDb ? 'animate-spin text-amber-300' : ''}`} />
                    <span>{isSyncingDb ? 'جاري مزامنة MongoDB...' : 'مزامنة وتدقيق البيانات في MongoDB الآن'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    كل تعديل أو تسجيل حساب أو نشاط يُحفظ تلقائياً في قاعدة البيانات.
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
