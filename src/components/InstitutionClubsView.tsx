import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AffiliatedClub, InstitutionType, Activity, User } from '../types';
import { InstitutionDetailModal } from './InstitutionDetailModal';
import { 
  Building2, 
  Users, 
  Plus, 
  Sparkles, 
  Award, 
  Phone, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  X,
  Compass,
  Search,
  ExternalLink,
  UserPlus,
  Gift,
  Send,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ChevronLeft
} from 'lucide-react';

interface InstitutionClubsViewProps {
  onOpenCreateActivity: () => void;
  onSelectActivity?: (activity: Activity) => void;
  onSelectUser?: (user: User) => void;
}

export const InstitutionClubsView: React.FC<InstitutionClubsViewProps> = ({ 
  onOpenCreateActivity,
  onSelectActivity,
  onSelectUser
}) => {
  const { 
    clubs, 
    addClub, 
    enrollClubInActivity, 
    activities, 
    currentUser, 
    institutionUsers,
    isShamsAdmin,
    isSubscribedTo,
    toggleSubscription,
    getInstitutionMembers,
    getInstitutionMembersCount,
    grantPointsToInstitution,
    distributeInstitutionPoints
  } = useApp();

  const [activeTab, setActiveTab] = useState<'radar' | 'clubs'>('radar');
  const [filterMode, setFilterMode] = useState<'all' | 'most_members' | 'most_activities' | 'oasis'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for inspecting institution or club
  const [selectedInstitutionForDetails, setSelectedInstitutionForDetails] = useState<User | null>(null);
  const [selectedClubForDetails, setSelectedClubForDetails] = useState<AffiliatedClub | null>(null);

  // Quick Action Modal states for Ministry Points Grant & Distribution
  const [targetInstForGrant, setTargetInstForGrant] = useState<User | null>(null);
  const [grantAmount, setGrantAmount] = useState<number>(1000);
  const [grantReason, setGrantReason] = useState('حصة نقاط تحفيزية لدعم المشاريع والأنشطة الشبابية الميدانية');

  const [targetInstForDistribute, setTargetInstForDistribute] = useState<User | null>(null);
  const [distributeRecipientId, setDistributeRecipientId] = useState<string>('');
  const [distributeAmount, setDistributeAmount] = useState<number>(100);
  const [distributeReason, setDistributeReason] = useState('مكافأة تميز وعطاء في النشاط التطوعي والمشاركة الميدانية');

  // Add Club Form state
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [selectedClubForEnroll, setSelectedClubForEnroll] = useState<AffiliatedClub | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  
  const [clubName, setClubName] = useState('');
  const [specialty, setSpecialty] = useState('بيئة وتشجير وطاقة خضراء');
  const [leaderName, setLeaderName] = useState('');
  const [phone, setPhone] = useState('0550 00 11 22');
  const [membersCount, setMembersCount] = useState(25);
  const [institutionName, setInstitutionName] = useState(
    currentUser.affiliatedInstitutionName || currentUser.name || ''
  );

  const isMinistryAdmin = currentUser.role === 'general_admin' || isShamsAdmin || currentUser.username === 'riyad';
  const canManageClubs = currentUser.role === 'institution_admin' || currentUser.role === 'general_admin' || currentUser.role === 'institution';

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim()) return;

    addClub({
      name: clubName.trim(),
      specialty: specialty.trim(),
      institutionId: currentUser.affiliatedInstitutionId || currentUser.id,
      institutionName: institutionName.trim() || currentUser.name,
      leaderName: leaderName.trim() || 'مسؤول النادي',
      phone: phone.trim(),
      membersCount: Number(membersCount) || 15,
      avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80',
    });

    setClubName('');
    setShowAddClubModal(false);
  };

  const handleConfirmEnrollClub = () => {
    if (!selectedClubForEnroll || !selectedActivityId) return;
    enrollClubInActivity(selectedClubForEnroll.id, selectedActivityId);
    setSelectedClubForEnroll(null);
    setSelectedActivityId('');
  };

  const getInstitutionTypeLabel = (type?: InstitutionType) => {
    switch (type) {
      case 'youth_house': return 'دار شباب';
      case 'sports_complex': return 'مركب رياضي جواري';
      case 'youth_hostel': return 'بيت شباب';
      case 'association': return 'جمعية معتمدة';
      case 'scout_org': return 'فوج كشفي';
      case 'club': return 'نادي شبابي';
      default: return 'هيكل شباني';
    }
  };

  // Processed Institutions with live metrics
  const processedInstitutions = useMemo(() => {
    return institutionUsers.map(inst => {
      const enrolledCount = getInstitutionMembersCount(inst.id);
      const organizedActivities = activities.filter(a => a.institutionId === inst.id || a.institutionName === inst.name);
      const isOasis = inst.wilaya.includes('ورقلة') || inst.wilaya.includes('تقرت') || inst.wilaya.includes('30') || inst.wilaya.includes('55');
      // Activity score: calculated by ministry based on followers, projects, and points
      const activityScore = (organizedActivities.length * 25) + (enrolledCount * 5) + Math.round((inst.points || 0) / 100);

      return {
        ...inst,
        enrolledCount,
        activitiesCount: organizedActivities.length,
        isOasis,
        activityScore,
        distributablePool: inst.distributablePointsPool ?? 1500,
        isFollowed: isSubscribedTo(inst.id)
      };
    });
  }, [institutionUsers, activities, getInstitutionMembersCount, isSubscribedTo]);

  // Filtered & Sorted Institutions for the Ministry Radar
  const filteredInstitutions = useMemo(() => {
    let result = [...processedInstitutions];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(inst => 
        inst.name.toLowerCase().includes(q) ||
        inst.wilaya.toLowerCase().includes(q) ||
        (inst.bio && inst.bio.toLowerCase().includes(q))
      );
    }

    // Category / Radar filters
    if (filterMode === 'most_members') {
      result.sort((a, b) => b.enrolledCount - a.enrolledCount);
    } else if (filterMode === 'most_activities') {
      result.sort((a, b) => b.activitiesCount - a.activitiesCount);
    } else if (filterMode === 'oasis') {
      result = result.filter(i => i.isOasis);
      result.sort((a, b) => b.activityScore - a.activityScore);
    } else {
      // Default: sort by overall activity score
      result.sort((a, b) => b.activityScore - a.activityScore);
    }

    return result;
  }, [processedInstitutions, searchQuery, filterMode]);

  // Filtered Clubs
  const filteredClubs = useMemo(() => {
    if (!searchQuery.trim()) return clubs;
    const q = searchQuery.toLowerCase().trim();
    return clubs.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.specialty.toLowerCase().includes(q) ||
      c.institutionName.toLowerCase().includes(q)
    );
  }, [clubs, searchQuery]);

  const handleGrantPointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInstForGrant) return;
    const res = grantPointsToInstitution(targetInstForGrant.id, Number(grantAmount) || 500, grantReason);
    if (res.success) {
      setTargetInstForGrant(null);
    }
  };

  const handleDistributePointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInstForDistribute || !distributeRecipientId) return;
    const res = distributeInstitutionPoints(
      targetInstForDistribute.id,
      distributeRecipientId,
      Number(distributeAmount) || 50,
      distributeReason
    );
    if (res.success) {
      setTargetInstForDistribute(null);
      setDistributeRecipientId('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-2">
      
      {/* ================= HERO BANNER: MINISTRY INSTITUTIONS OVERSIGHT ================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-900/50">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>وزارة الشباب والرياضة — منظومة متابعة الجمعيات والهياكل الفاعلة</span>
          </div>
          
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            فضاء الجمعيات والمؤسسات ونظام انخراط الأفراد 🏛️
          </h1>
          
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            يمكن لكل متطوع <strong>الانخراط والاشتراك في الجمعيات (Follow)</strong> لمتابعة نشاطاتها. تتابع الوزارة عدد الأفراد المنخرطين وعدد المشاريع المنظمة لكل جمعية لمنحها <strong>حصص نقاط شمس التحفيزية</strong> لتوزيعها مباشرة على المتطوعين المنخرطين.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {canManageClubs && (
              <button
                onClick={() => setShowAddClubModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة نادي تابع جديد</span>
              </button>
            )}

            <button
              onClick={onOpenCreateActivity}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>نشر نشاط تطوعي جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN NAVIGATION TABS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-xs">
        
        {/* Tab switchers */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-black">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'radar'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>رادار الجمعيات والمنخرطين ({filteredInstitutions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'clubs'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>النوادي التابعة للهياكل ({filteredClubs.length})</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'radar' ? "ابحث بالجمعية، الولاية، أو النشاط..." : "ابحث بالنادي، التخصص، أو المؤسسة..."}
            className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

      </div>

      {/* ================= TAB 1: MINISTRY RADAR & ASSOCIATIONS ================= */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          
          {/* Quick Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <span className="text-xs font-bold text-slate-500 shrink-0">معيار الترتيب:</span>
            
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterMode === 'all' ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              مؤشر الفاعلية الشبانية 🏆
            </button>

            <button
              onClick={() => setFilterMode('most_members')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterMode === 'most_members' ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>الأكثر انخراطاً (Followers)</span>
            </button>

            <button
              onClick={() => setFilterMode('most_activities')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterMode === 'most_activities' ? 'bg-blue-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>الأكثر تنظيماً للمشاريع</span>
            </button>

            <button
              onClick={() => setFilterMode('oasis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterMode === 'oasis' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>🌴 واحات الجنوب (ورقلة وتقرت)</span>
            </button>
          </div>

          {/* Institutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstitutions.map((inst) => {
              const enrolledVolunteers = getInstitutionMembers(inst.id);
              const canDistributeFromCard = isMinistryAdmin || currentUser.id === inst.id;

              return (
                <div
                  key={inst.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4 group text-right"
                >
                  {/* Top Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={inst.avatar}
                          alt={inst.name}
                          className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="min-w-0">
                          <h4 
                            onClick={() => setSelectedInstitutionForDetails(inst)}
                            className="font-black text-sm text-slate-900 hover:text-blue-700 transition truncate cursor-pointer"
                          >
                            {inst.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              {getInstitutionTypeLabel(inst.institutionType)}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-amber-500" />
                              <span>{inst.wilaya}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {inst.bio || 'مؤسسة شبابية معتمدة تنشط في الميدان لتأطير العمل التطوعي وخدمة المجتمع.'}
                    </p>

                    {/* Ministry Tracking Metrics */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <div className="text-xs font-black text-emerald-700 font-mono flex items-center justify-center gap-0.5">
                          <Users className="w-3 h-3" />
                          <span>{inst.enrolledCount}</span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-500 mt-0.5">المنخرطين 👥</div>
                      </div>

                      <div>
                        <div className="text-xs font-black text-blue-700 font-mono flex items-center justify-center gap-0.5">
                          <Compass className="w-3 h-3" />
                          <span>{inst.activitiesCount}</span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-500 mt-0.5">المشاريع 🧭</div>
                      </div>

                      <div>
                        <div className="text-xs font-black text-purple-700 font-mono flex items-center justify-center gap-0.5">
                          <Gift className="w-3 h-3" />
                          <span>{inst.distributablePool} ن</span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-500 mt-0.5">متاح للتوزيع 🎁</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Follow / Subscribe + Point Grant + Point Distribute */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* Follow / Subscribe Button (الانخراط في الجمعية) */}
                      <button
                        onClick={() => toggleSubscription(inst.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                          inst.isFollowed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 shadow-xs'
                        }`}
                        title="انخراط ومتابعة هذه الجمعية للتوصل بمبادراتها ونقاط التحفيز"
                      >
                        {inst.isFollowed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>أنت منخرط ✅</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>انخراط (فولو) 🔔</span>
                          </>
                        )}
                      </button>

                      {/* Details Button */}
                      <button
                        onClick={() => setSelectedInstitutionForDetails(inst)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title="عرض الملف والتفاصيل"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Admin Actions Row */}
                    {(isMinistryAdmin || canDistributeFromCard) && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {isMinistryAdmin && (
                          <button
                            onClick={() => {
                              setTargetInstForGrant(inst);
                              setGrantAmount(1000);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            title="منح نقاط من الوزارة للجمعية"
                          >
                            <Gift className="w-3 h-3 text-emerald-700" />
                            <span>منح نقاط 🏛️</span>
                          </button>
                        )}

                        {canDistributeFromCard && (
                          <button
                            onClick={() => {
                              setTargetInstForDistribute(inst);
                              if (enrolledVolunteers[0]) setDistributeRecipientId(enrolledVolunteers[0].id);
                              setDistributeAmount(100);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            title="توزيع نقاط على المتطوعين المنخرطين"
                          >
                            <Send className="w-3 h-3 text-purple-700" />
                            <span>توزيع نقاط 🤝</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ================= TAB 2: AFFILIATED CLUBS ================= */}
      {activeTab === 'clubs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-lg text-slate-900">
                  النوادي التابعة للهياكل الشبانية ({filteredClubs.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                نوادي متخصصة تنشط تحت لواء دور الشباب والمركبات الرياضية وتشارك باسمها في المبادرات
              </p>
            </div>

            {canManageClubs && (
              <button
                onClick={() => setShowAddClubModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة نادي جديد</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="rounded-3xl border border-slate-200 p-5 bg-white hover:border-emerald-500 transition shadow-xs flex flex-col justify-between gap-4 group text-right"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={club.avatar}
                    alt={club.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition"
                  />
                  <div className="min-w-0">
                    <h4 
                      onClick={() => setSelectedClubForDetails(club)}
                      className="font-black text-sm text-slate-900 group-hover:text-emerald-700 transition truncate cursor-pointer"
                    >
                      {club.name}
                    </h4>
                    <p className="text-xs text-emerald-700 font-semibold">{club.specialty}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{club.institutionName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">الأعضاء النشطين</span>
                    <strong className="font-black text-slate-800">{club.membersCount} متطوع</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">رصيد النقاط</span>
                    <strong className="font-black text-amber-700 font-mono">{club.points} ن</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedClubForDetails(club)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    عرض التفاصيل والمشاركات
                  </button>

                  {canManageClubs && (
                    <button
                      onClick={() => setSelectedClubForEnroll(club)}
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-black transition cursor-pointer"
                    >
                      تسجيل بنشاط
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK MINISTRY GRANT ================= */}
      {targetInstForGrant && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                <span>منح حصة نقاط شمس للجمعية 🏛️</span>
              </h4>
              <button 
                onClick={() => setTargetInstForGrant(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              تزويد جمعية <strong className="text-blue-900 font-black">{targetInstForGrant.name}</strong> برصيد نقاط رسمي من وزارة الشباب والرياضة لتوزيعها على المنخرطين.
            </p>

            <form onSubmit={handleGrantPointsSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  عدد النقاط الممنوحة للجمعية:
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[500, 1000, 2500, 5000].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setGrantAmount(amt)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                        grantAmount === amt
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  سبب ومبرر المنحة الوزارية:
                </label>
                <textarea
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTargetInstForGrant(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد اعتماد المنحة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK ASSOCIATION POINTS DISTRIBUTE ================= */}
      {targetInstForDistribute && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" />
                <span>توزيع نقاط على متطوع منخرط 🤝</span>
              </h4>
              <button 
                onClick={() => setTargetInstForDistribute(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
              <span>رصيد الجمعية القابل للتوزيع:</span>
              <strong className="font-mono text-sm text-purple-700">
                {targetInstForDistribute.distributablePointsPool ?? 1500} نقطة شمس
              </strong>
            </div>

            <form onSubmit={handleDistributePointsSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  اختر المتطوع المنخرط المستفيد:
                </label>
                <select
                  value={distributeRecipientId}
                  onChange={(e) => setDistributeRecipientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">-- اضغط لتحديد متطوع منخرط --</option>
                  {getInstitutionMembers(targetInstForDistribute.id).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.wilaya}) - رصيده الحالي: {m.points} ن
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  عدد النقاط المحولة للمتطوع:
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[50, 100, 200, 500].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDistributeAmount(amt)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                        distributeAmount === amt
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {amt} ن
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="10"
                  max={targetInstForDistribute.distributablePointsPool ?? 1500}
                  value={distributeAmount}
                  onChange={(e) => setDistributeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  سبب ومبرر المكافأة:
                </label>
                <input
                  type="text"
                  value={distributeReason}
                  onChange={(e) => setDistributeReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="مثال: تفاني وتميز في حملة التشجير الميدانية..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTargetInstForDistribute(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تأكيد تحويل النقاط</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CLUB ================= */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">تسجيل نادي شبابي تابع جديد</h3>
              </div>
              <button
                onClick={() => setShowAddClubModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">اسم النادي:</label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="مثال: نادي الابتكار والبيئة الخضراء"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">التخصص والنشاط:</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="مثال: تشجير ورعاية البيئة، رقمنة، إغاثة، صحة"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">مسؤول النادي:</label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="الاسم واللقب"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">عدد الأعضاء المتطوعين التقريبي:</label>
                <input
                  type="number"
                  min="5"
                  value={membersCount}
                  onChange={(e) => setMembersCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClubModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md"
                >
                  حفظ وتسجيل النادي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ENROLL CLUB IN ACTIVITY ================= */}
      {selectedClubForEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                تسجيل {selectedClubForEnroll.name} في نشاط
              </h3>
              <button
                onClick={() => setSelectedClubForEnroll(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-700">
                اختر النشاط التطوعي المراد إشراك النادي به:
              </label>

              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- اضغط لاختيار نشاط تطوعي --</option>
                {activities.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.wilaya}) - {a.basePoints} نقطة
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedClubForEnroll(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmEnrollClub}
                disabled={!selectedActivityId}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md"
              >
                تأكيد مشاركة النادي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INSTITUTION / CLUB DETAIL MODAL ================= */}
      {(selectedInstitutionForDetails || selectedClubForDetails) && (
        <InstitutionDetailModal
          institution={selectedInstitutionForDetails}
          club={selectedClubForDetails}
          onClose={() => {
            setSelectedInstitutionForDetails(null);
            setSelectedClubForDetails(null);
          }}
          onSelectActivity={(act) => {
            if (onSelectActivity) onSelectActivity(act);
          }}
          onSelectUser={(u) => {
            if (onSelectUser) onSelectUser(u);
          }}
        />
      )}

    </div>
  );
};
