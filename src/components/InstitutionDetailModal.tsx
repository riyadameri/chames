import React, { useState, useMemo } from 'react';
import { User, AffiliatedClub, Activity } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Building2, 
  MapPin, 
  Users, 
  Sparkles, 
  Phone, 
  Trophy, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  TreePine, 
  ExternalLink,
  UserPlus,
  Gift,
  Award,
  Send,
  History,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface InstitutionDetailModalProps {
  institution?: User | null;
  club?: AffiliatedClub | null;
  onClose: () => void;
  onSelectActivity: (activity: Activity) => void;
  onSelectUser?: (user: User) => void;
}

export const InstitutionDetailModal: React.FC<InstitutionDetailModalProps> = ({
  institution,
  club,
  onClose,
  onSelectActivity,
  onSelectUser
}) => {
  const { 
    activities, 
    clubs, 
    currentUser, 
    isShamsAdmin,
    isSubscribedTo, 
    toggleSubscription,
    getInstitutionMembers,
    getInstitutionMembersCount,
    grantPointsToInstitution,
    distributeInstitutionPoints,
    pointDistributionLogs,
    ministryGrantLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState<'activities' | 'members' | 'clubs' | 'history'>('activities');

  // Ministry Grant Point state
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantPointsAmount, setGrantPointsAmount] = useState<number>(1000);
  const [grantReason, setGrantReason] = useState('حصة نقاط تحفيزية لدعم المشاريع والأنشطة الشبابية الميدانية');

  // Association Point Distribution state
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [distributeAmount, setDistributeAmount] = useState<number>(100);
  const [distributeReason, setDistributeReason] = useState('مكافأة تميز وعطاء في النشاط التطوعي والمشاركة الميدانية');

  const title = club ? club.name : (institution ? institution.name : '');
  const subtitle = club 
    ? `نادي شبابي تابع لـ ${club.institutionName}` 
    : (institution ? 'هيكل شبابي معتمد - وزارة الشباب والرياضة' : '');
  const wilaya = club ? (institution?.wilaya || 'الجزائر العاصمة') : (institution?.wilaya || 'الجزائر');
  const points = club ? club.points : (institution ? institution.points : 0);
  const avatar = club ? club.avatar : (institution?.avatar || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80');

  // Institution identification
  const institutionId = institution?.id || club?.institutionId || '';
  const isSubbed = institution ? isSubscribedTo(institution.id) : false;
  const enrolledMembersCount = institution ? getInstitutionMembersCount(institution.id) : (club?.membersCount || 15);
  const enrolledMembers = useMemo(() => {
    return institution ? getInstitutionMembers(institution.id) : [];
  }, [institution, getInstitutionMembers]);

  // Points pool available for this association to distribute
  const distributablePoints = institution?.distributablePointsPool ?? 1500;
  const totalGrantedByMinistry = institution?.totalPointsGrantedByMinistry ?? 3000;
  const totalDistributedToMembers = institution?.totalPointsDistributedToMembers ?? 1500;

  // Permissions
  const isMinistryAdmin = currentUser.role === 'general_admin' || isShamsAdmin || currentUser.username === 'riyad';
  const isThisInstitution = institution && (
    currentUser.id === institution.id || 
    (currentUser.role === 'institution_admin' && currentUser.affiliatedInstitutionName === institution.name)
  );
  const canDistributePoints = isThisInstitution || isMinistryAdmin;

  // Filtered Activities
  const relatedActivities = useMemo(() => {
    return activities.filter(a => {
      if (club && (a.targetAudience === 'institutions' || a.targetAudience === 'all')) return true;
      if (institution && (a.institutionId === institution.id || a.targetAudience === 'institutions' || a.targetAudience === 'all')) return true;
      return false;
    });
  }, [activities, club, institution]);

  // Affiliated clubs
  const institutionClubs = useMemo(() => {
    return institution ? clubs.filter(c => 
      c.institutionId === institution.id || c.institutionName.includes(institution.name)
    ) : [];
  }, [clubs, institution]);

  // Related Logs for this institution
  const institutionDistributions = useMemo(() => {
    return pointDistributionLogs.filter(l => l.institutionId === institutionId);
  }, [pointDistributionLogs, institutionId]);

  const institutionGrants = useMemo(() => {
    return ministryGrantLogs.filter(l => l.institutionId === institutionId);
  }, [ministryGrantLogs, institutionId]);

  const handleExecuteGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution) return;
    const res = grantPointsToInstitution(institution.id, Number(grantPointsAmount) || 500, grantReason);
    if (res.success) {
      setShowGrantModal(false);
    }
  };

  const handleExecuteDistribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !selectedRecipientId) return;
    const res = distributeInstitutionPoints(
      institution.id,
      selectedRecipientId,
      Number(distributeAmount) || 50,
      distributeReason
    );
    if (res.success) {
      setShowDistributeModal(false);
      setSelectedRecipientId('');
    }
  };

  const openDistributeForMember = (member: User) => {
    setSelectedRecipientId(member.id);
    setShowDistributeModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Cover header */}
        <div className="relative bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-7 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img
              src={avatar}
              alt={title}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/20 shadow-xl shrink-0"
            />

            <div className="flex-1 text-center sm:text-right space-y-2 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black truncate">{title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white shrink-0">
                  {club ? 'نادي تخصصي' : 'مؤسسة شبانية معتمدة'}
                </span>
                {institution?.registrationNumber && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/10 text-blue-200 border border-white/15">
                    {institution.registrationNumber}
                  </span>
                )}
              </div>

              <p className="text-xs text-blue-200 line-clamp-2">{subtitle}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-blue-100/90 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>ولاية {wilaya}</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>{enrolledMembersCount} فرداً منخرطاً ومتابعاً</span>
                </span>
                {institution?.phone && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>{institution.phone}</span>
                  </span>
                )}
              </div>

              {/* Action Buttons: Subscribe (الانخراط) & Point Actions */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                {institution && (
                  <button
                    onClick={() => toggleSubscription(institution.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md ${
                      isSubbed
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950'
                    }`}
                  >
                    {isSubbed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>أنت منخرط في الجمعية ✅</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-slate-950" />
                        <span>انخراط ومتابعة الجمعية 🔔</span>
                      </>
                    )}
                  </button>
                )}

                {/* Ministry Admin: Grant Points to Association */}
                {isMinistryAdmin && institution && (
                  <button
                    onClick={() => setShowGrantModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="منح رصيد نقاط شمس للجمعية لتوزيعها على المنخرطين"
                  >
                    <Gift className="w-4 h-4 text-white" />
                    <span>منح حصة نقاط من الوزارة 🏛️</span>
                  </button>
                )}

                {/* Association Admin: Distribute Points to Members */}
                {canDistributePoints && institution && (
                  <button
                    onClick={() => setShowDistributeModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="توزيع نقاط التحفيز على المتطوعين المنخرطين"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>توزيع نقاط على المنخرطين 🤝</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Points & Stats Bar (4 Key Ministry Indicators) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-slate-100 bg-slate-50 border-b border-slate-200 text-center py-3.5 shrink-0">
          <div className="p-1">
            <div className="text-lg sm:text-xl font-black text-amber-600 font-mono">
              {points.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-slate-500">النقاط التراكمية</div>
          </div>

          <div className="p-1">
            <div className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
              {enrolledMembersCount}
            </div>
            <div className="text-[11px] font-bold text-slate-500">الأفراد المنخرطين 👥</div>
          </div>

          <div className="p-1">
            <div className="text-lg sm:text-xl font-black text-blue-700 font-mono">
              {relatedActivities.length}
            </div>
            <div className="text-[11px] font-bold text-slate-500">المشاريع المنظمة 🧭</div>
          </div>

          <div className="p-1 bg-amber-50/60">
            <div className="text-lg sm:text-xl font-black text-purple-700 font-mono">
              {distributablePoints.toLocaleString()} ن
            </div>
            <div className="text-[11px] font-black text-purple-900">رصيد التحفيز المتاح 🎁</div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-100 bg-white text-xs font-bold overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-2 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activities'
                ? 'border-blue-600 text-blue-800 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>المشاريع التطوعية ({relatedActivities.length})</span>
          </button>

          {institution && (
            <button
              onClick={() => setActiveTab('members')}
              className={`py-2 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'border-blue-600 text-blue-800 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>المتطوعون المنخرطون ({enrolledMembers.length})</span>
            </button>
          )}

          {institution && institutionClubs.length > 0 && (
            <button
              onClick={() => setActiveTab('clubs')}
              className={`py-2 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'clubs'
                  ? 'border-blue-600 text-blue-800 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>النوادي التابعة ({institutionClubs.length})</span>
            </button>
          )}

          {institution && (
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-800 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-purple-600" />
              <span>سجل النقاط والمنح الوزارية ({institutionDistributions.length + institutionGrants.length})</span>
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* TAB 1: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>المشاريع التطوعية المفتوحة والنشطة ({relatedActivities.length})</span>
                </h4>
              </div>

              {relatedActivities.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  لا توجد مشاريع تطوعية نشطة حالياً لهذا الهيكل.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {relatedActivities.map(act => (
                    <div
                      key={act.id}
                      onClick={() => {
                        onClose();
                        onSelectActivity(act);
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-slate-50/70 transition flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={act.coverImage}
                          alt={act.title}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="min-w-0">
                          <div className="font-black text-xs text-slate-900 group-hover:text-emerald-700 transition truncate">
                            {act.title}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-0.5 text-blue-600 font-semibold">
                              <MapPin className="w-3 h-3" />
                              {act.wilaya}
                            </span>
                            <span>•</span>
                            <span>{act.enrolledCount} متطوع مشارك</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 font-black text-xs font-mono border border-amber-200">
                          +{act.basePoints} ن
                        </span>
                        <span className="text-slate-400 group-hover:text-emerald-700 transition text-sm">
                          ←
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENROLLED MEMBERS (قائمة الأفراد المنخرطين في الجمعية) */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <strong className="block font-black text-emerald-900">نظام انخراط الأفراد في الجمعيات 👥</strong>
                  <span>تتابع وزارة الشباب والرياضة الجمعيات الأكثر جذباً وتأطيراً للشباب المتطوع لتمكينها من حصص نقاط ومكافآت رسمية.</span>
                </div>
                {canDistributePoints && (
                  <button
                    onClick={() => setShowDistributeModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>توزيع مكافأة</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {enrolledMembers.map(member => (
                  <div
                    key={member.id}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div 
                      onClick={() => {
                        if (onSelectUser) {
                          onClose();
                          onSelectUser(member);
                        }
                      }}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-black text-xs text-slate-900 truncate">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <span>{member.wilaya}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-amber-700">{member.points} ن</span>
                        </div>
                      </div>
                    </div>

                    {canDistributePoints && (
                      <button
                        onClick={() => openDistributeForMember(member)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-[11px] font-bold transition flex items-center gap-1 border border-purple-200 cursor-pointer shrink-0"
                        title="منح نقاط شمس لهذا المتطوع المنخرط"
                      >
                        <Gift className="w-3.5 h-3.5 text-purple-600" />
                        <span>مكافأة</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SUB-CLUBS */}
          {activeTab === 'clubs' && institution && institutionClubs.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>النوادي التابعة لهذا الهيكل ({institutionClubs.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {institutionClubs.map(c => (
                  <div 
                    key={c.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{c.name}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">{c.specialty}</div>
                        <div className="text-[10px] text-slate-500">{c.membersCount} عضو متطوع</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-amber-700 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">{c.points} ن</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: POINTS TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Ministry Grants Section */}
              <div className="space-y-2.5">
                <h5 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>منح وزارة الشباب والرياضة للجمعية:</span>
                </h5>

                {institutionGrants.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 text-slate-500 text-xs">
                    لم تسجل منح نقاط بعد لهذه الجمعية.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {institutionGrants.map(grant => (
                      <div key={grant.id} className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-black text-emerald-950">+{grant.pointsGranted} نقطة شمس معتمدة</div>
                          <div className="text-[11px] text-emerald-800">{grant.reason}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">بواسطة: {grant.grantedBy} • {new Date(grant.grantedAt).toLocaleDateString('ar-DZ')}</div>
                        </div>
                        <span className="font-mono text-xs font-black text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
                          منحة وزارية 🏛️
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Distributions to Members Section */}
              <div className="space-y-2.5 pt-2">
                <h5 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span>النقاط الموزعة على المتطوعين المنخرطين:</span>
                </h5>

                {institutionDistributions.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 text-slate-500 text-xs">
                    لم تقم الجمعية بتوزيع نقاط بعد على الأعضاء.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {institutionDistributions.map(dist => (
                      <div key={dist.id} className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-black text-purple-950">تم تحويل {dist.points} نقطة إلى ({dist.recipientUserName})</div>
                          <div className="text-[11px] text-purple-800">{dist.reason}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{new Date(dist.distributedAt).toLocaleDateString('ar-DZ')}</div>
                        </div>
                        <span className="font-mono text-xs font-black text-purple-700 bg-white px-2 py-1 rounded-xl border border-purple-200">
                          مكافأة 🌟
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-[11px] text-slate-500">
            {institution && (
              <span>رصيد التحفيز المتاح للتوزيع: <strong className="text-purple-700 font-mono">{distributablePoints} ن</strong></span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* ================= MODAL: MINISTRY POINT GRANT ================= */}
      {showGrantModal && institution && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                <span>منح حصة نقاط شمس للجمعية 🏛️</span>
              </h4>
              <button 
                onClick={() => setShowGrantModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              بصفتك مسؤولاً في وزارة الشباب والرياضة، يمكنك تزويد جمعية <strong className="text-blue-900">{institution.name}</strong> برصيد نقاط لتوزيعها على المتطوعين المنخرطين تحفيزاً لهم.
            </p>

            <form onSubmit={handleExecuteGrant} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  عدد النقاط الممنوحة للجمعية:
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[500, 1000, 2500, 5000].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setGrantPointsAmount(amt)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                        grantPointsAmount === amt
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
                  value={grantPointsAmount}
                  onChange={(e) => setGrantPointsAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  مبرر وسبب المنحة الوزارية:
                </label>
                <textarea
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="مثال: تشجيع نشاط غرس النخيل في الواحات وتأطير المتطوعين..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد اعتماد المنحة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASSOCIATION DISTRIBUTE POINTS ================= */}
      {showDistributeModal && institution && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" />
                <span>توزيع نقاط على متطوع منخرط 🤝</span>
              </h4>
              <button 
                onClick={() => setShowDistributeModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
              <span>رصيد الجمعية القابل للتوزيع:</span>
              <strong className="font-mono text-sm text-purple-700">{distributablePoints} نقطة شمس</strong>
            </div>

            <form onSubmit={handleExecuteDistribute} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  اختر المتطوع المنخرط المستفيد:
                </label>
                <select
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">-- اضغط لتحديد متطوع منخرط --</option>
                  {enrolledMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.wilaya}) - رصيده الحالي: {m.points} ن
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  عدد النقاط المحولة للمتطوع (الحد الأقصى {distributablePoints}):
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[50, 100, 200, 500].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      disabled={amt > distributablePoints}
                      onClick={() => setDistributeAmount(amt)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition disabled:opacity-40 ${
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
                  max={distributablePoints}
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
                  onClick={() => setShowDistributeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={distributablePoints < distributeAmount}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تأكيد تحويل النقاط</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
