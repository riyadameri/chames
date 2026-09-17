import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, User, AffiliatedClub } from '../types';
import { 
  Search, 
  X, 
  Compass, 
  Building2, 
  Users, 
  User as UserIcon, 
  MapPin, 
  Sparkles, 
  ArrowUpLeft, 
  Award,
  ChevronRight,
  Command,
  TreePine,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface TopSearchBarProps {
  onSelectActivity: (activity: Activity) => void;
  onSelectUser: (user: User) => void;
  onSelectClub?: (club: AffiliatedClub) => void;
  onSelectInstitution?: (institution: User) => void;
  className?: string;
}

type SearchCategoryTab = 'all' | 'activities' | 'institutions_clubs' | 'users';

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  onSelectActivity,
  onSelectUser,
  onSelectClub,
  onSelectInstitution,
  className = ''
}) => {
  const { activities, clubs, allUsers, individualUsers, institutionUsers } = useApp();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchCategoryTab>('all');
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Ctrl+K or Cmd+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in another input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setMobileModalOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 100);
        } else {
          setIsOpen(true);
          inputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setMobileModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return activities.filter(act => {
      return (
        act.title.toLowerCase().includes(q) ||
        act.shortDescription.toLowerCase().includes(q) ||
        act.wilaya.toLowerCase().includes(q) ||
        act.municipality.toLowerCase().includes(q) ||
        (act.institutionName && act.institutionName.toLowerCase().includes(q))
      );
    });
  }, [activities, query]);

  // Filtered Institutions (from institutionUsers)
  const filteredInstitutions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return institutionUsers.filter(inst => {
      return (
        inst.name.toLowerCase().includes(q) ||
        inst.wilaya.toLowerCase().includes(q) ||
        (inst.bio && inst.bio.toLowerCase().includes(q)) ||
        (inst.affiliatedInstitutionName && inst.affiliatedInstitutionName.toLowerCase().includes(q))
      );
    });
  }, [institutionUsers, query]);

  // Filtered Clubs
  const filteredClubs = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return clubs.filter(club => {
      return (
        club.name.toLowerCase().includes(q) ||
        club.specialty.toLowerCase().includes(q) ||
        club.institutionName.toLowerCase().includes(q) ||
        club.leaderName.toLowerCase().includes(q)
      );
    });
  }, [clubs, query]);

  // Filtered Users / Volunteers (individuals + admins)
  const filteredUsers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allUsers.filter(u => {
      // Exclude institution accounts as they appear in institutions
      if (u.role === 'institution') return false;
      return (
        u.name.toLowerCase().includes(q) ||
        u.wilaya.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.bio && u.bio.toLowerCase().includes(q))
      );
    });
  }, [allUsers, query]);

  const totalResultsCount = 
    filteredActivities.length + 
    filteredInstitutions.length + 
    filteredClubs.length + 
    filteredUsers.length;

  const handleSelectActivityItem = (act: Activity) => {
    setIsOpen(false);
    setMobileModalOpen(false);
    onSelectActivity(act);
  };

  const handleSelectUserItem = (u: User) => {
    setIsOpen(false);
    setMobileModalOpen(false);
    onSelectUser(u);
  };

  const handleSelectClubItem = (c: AffiliatedClub) => {
    setIsOpen(false);
    setMobileModalOpen(false);
    if (onSelectClub) {
      onSelectClub(c);
    } else {
      // fallback
      const parentInst = institutionUsers.find(inst => inst.id === c.institutionId);
      if (parentInst) onSelectUser(parentInst);
    }
  };

  const handleSelectInstitutionItem = (inst: User) => {
    setIsOpen(false);
    setMobileModalOpen(false);
    if (onSelectInstitution) {
      onSelectInstitution(inst);
    } else {
      onSelectUser(inst);
    }
  };

  const getInstitutionTypeBadge = (type?: string) => {
    switch (type) {
      case 'association': return { label: 'جمعية معتمدة', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'youth_house': return { label: 'دار شباب', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'sports_complex': return { label: 'مركب رياضي جواري', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'youth_hostel': return { label: 'بيت شباب', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'scout_org': return { label: 'فوج كشفي', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      default: return { label: 'هيكل شبابي', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
    }
  };

  const getUserRoleBadge = (role: string) => {
    switch (role) {
      case 'individual': return { label: 'متطوع فرد', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'general_admin': return { label: 'مدير المنصة', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'institution_admin': return { label: 'مسؤول هيكل', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'evaluator_admin': return { label: 'مقيّم إثباتات', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'media_admin': return { label: 'إعلام المنصة', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      default: return { label: 'عضو', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Popular search suggestions when input is empty
  const SUGGESTED_QUERIES = [
    { label: '🌲 غرس الأشجار', query: 'غرس' },
    { label: '🏢 دار الشباب', query: 'دار الشباب' },
    { label: '⚽ دوري رياضي', query: 'كرة القدم' },
    { label: '🤝 كشافة الجزائر', query: 'كشافة' },
    { label: '📍 الجزائر العاصمة', query: 'الجزائر' },
    { label: '📍 وهران الباهية', query: 'وهران' },
  ];

  return (
    <>
      {/* ================= DESKTOP & TABLET INLINE BAR ================= */}
      <div ref={containerRef} className={`relative hidden md:block ${className}`}>
        <div className="relative flex items-center">
          <div className="absolute right-3.5 pointer-events-none text-slate-400 flex items-center">
            <Search className="w-4 h-4 text-emerald-600/80" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="ابحث عن مبادرة، جمعية، نادي، أو متطوع..."
            className="w-full pr-10 pl-16 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition duration-150 shadow-2xs"
          />

          {/* Right/Left Action Icons */}
          <div className="absolute left-2.5 flex items-center gap-1.5">
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-400 font-mono shadow-2xs">
                <span>⌘K</span>
              </span>
            )}
          </div>
        </div>

        {/* RESULTS DROPDOWN (Desktop) */}
        {isOpen && (
          <div className="absolute top-full right-0 left-0 sm:left-auto sm:w-[540px] lg:w-[600px] mt-2 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden text-right animate-in fade-in duration-150">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 p-2 bg-slate-50/80 border-b border-slate-100 overflow-x-auto text-xs font-bold scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                الكل {query && `(${totalResultsCount})`}
              </button>

              <button
                onClick={() => setActiveTab('activities')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'activities'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>المبادرات</span>
                {query && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                    {filteredActivities.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('institutions_clubs')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'institutions_clubs'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>الجمعيات والنوادي</span>
                {query && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                    {filteredInstitutions.length + filteredClubs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>المتطوعين</span>
                {query && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                    {filteredUsers.length}
                  </span>
                )}
              </button>
            </div>

            {/* Dropdown Content Area */}
            <div className="max-h-[440px] overflow-y-auto p-3 space-y-4">
              
              {/* Empty query: Show suggestions */}
              {!query.trim() && (
                <div className="py-3 px-2 space-y-3">
                  <div className="text-xs font-bold text-slate-400">عمليات بحث شائعة مقترحة:</div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUERIES.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuery(item.query);
                          inputRef.current?.focus();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-medium transition cursor-pointer"
                      >
                        <Search className="w-3 h-3 text-slate-400" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>💡 يمكنك البحث بأي اسم، ولاية، أو تخصص تطوعي</span>
                    <span className="font-mono">ESC للإغلاق</span>
                  </div>
                </div>
              )}

              {/* No matches */}
              {query.trim() && totalResultsCount === 0 && (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-700">لم يتم العثور على نتائج لـ "{query}"</div>
                  <div className="text-xs text-slate-400 max-w-xs mx-auto">
                    جرب البحث بكلمات عامة مثل "تشجير"، "الجزائر"، أو اسم الجمعية
                  </div>
                </div>
              )}

              {/* SECTION: ACTIVITIES */}
              {query.trim() && (activeTab === 'all' || activeTab === 'activities') && filteredActivities.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 text-xs font-black text-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-600" />
                      <span>المبادرات والنشاطات التطوعية ({filteredActivities.length})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {filteredActivities.slice(0, activeTab === 'all' ? 4 : 10).map(act => (
                      <div
                        key={act.id}
                        onClick={() => handleSelectActivityItem(act)}
                        className="p-2.5 rounded-2xl bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={act.coverImage}
                            alt={act.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 truncate">
                              {act.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span className="flex items-center gap-0.5 text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{act.wilaya}</span>
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-700">
                                +{act.basePoints} نقطة
                              </span>
                              {act.institutionName && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-500 truncate max-w-[140px]">
                                    {act.institutionName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 text-xs text-emerald-700 font-bold opacity-0 group-hover:opacity-100 transition">
                          <span>معاينة</span>
                          <ArrowUpLeft className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: INSTITUTIONS & CLUBS */}
              {query.trim() && (activeTab === 'all' || activeTab === 'institutions_clubs') && (filteredInstitutions.length > 0 || filteredClubs.length > 0) && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between px-1 text-xs font-black text-blue-800">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>الجمعيات والنوادي المسجلة ({filteredInstitutions.length + filteredClubs.length})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {/* Registered Institutions */}
                    {filteredInstitutions.slice(0, activeTab === 'all' ? 3 : 8).map(inst => {
                      const badge = getInstitutionTypeBadge(inst.institutionType);
                      return (
                        <div
                          key={inst.id}
                          onClick={() => handleSelectInstitutionItem(inst)}
                          className="p-2.5 rounded-2xl bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={inst.avatar}
                              alt={inst.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-800 truncate">
                                {inst.name}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                                <span className={`px-2 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                                  {badge.label}
                                </span>
                                <span className="text-slate-500 flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{inst.wilaya}</span>
                                </span>
                                <span className="font-bold text-amber-700">
                                  ★ {inst.points} نقطة
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 text-xs text-blue-700 font-bold opacity-0 group-hover:opacity-100 transition">
                            <span>الملف</span>
                            <ArrowUpLeft className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    })}

                    {/* Affiliated Clubs */}
                    {filteredClubs.slice(0, activeTab === 'all' ? 3 : 8).map(club => (
                      <div
                        key={club.id}
                        onClick={() => handleSelectClubItem(club)}
                        className="p-2.5 rounded-2xl bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 transition cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={club.avatar}
                            alt={club.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-purple-800 truncate">
                              {club.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                              <span className="px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                نادي شبابي
                              </span>
                              <span className="truncate max-w-[150px]">
                                تابع لـ {club.institutionName}
                              </span>
                              <span>•</span>
                              <span className="text-slate-600 font-medium">
                                👥 {club.membersCount} عضو
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 text-xs text-purple-700 font-bold opacity-0 group-hover:opacity-100 transition">
                          <span>تفاصيل النادي</span>
                          <ArrowUpLeft className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: USERS & VOLUNTEERS */}
              {query.trim() && (activeTab === 'all' || activeTab === 'users') && filteredUsers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between px-1 text-xs font-black text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>المتطوعين والمستخدمين ({filteredUsers.length})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {filteredUsers.slice(0, activeTab === 'all' ? 4 : 10).map(u => {
                      const roleBadge = getUserRoleBadge(u.role);
                      return (
                        <div
                          key={u.id}
                          onClick={() => handleSelectUserItem(u)}
                          className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 truncate flex items-center gap-1.5">
                                <span>{u.name}</span>
                                <span className={`text-[10px] px-2 py-0.3 rounded-full font-bold border ${roleBadge.color}`}>
                                  {roleBadge.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{u.wilaya}</span>
                                </span>
                                <span>•</span>
                                <span className="font-bold text-amber-700">
                                  ★ {u.points} نقطة
                                </span>
                                <span>•</span>
                                <span className="text-slate-500">
                                  المرتبة #{u.rank}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-700 font-bold opacity-0 group-hover:opacity-100 transition">
                            <span>عرض البروفايل</span>
                            <ArrowUpLeft className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Footer hint */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>اضغط على أي نتيجة للانتقال أو المعاينة الفورية</span>
              <span className="text-emerald-700 font-bold">منصة شمس للتطوع ☀️</span>
            </div>
          </div>
        )}
      </div>

      {/* ================= MOBILE SEARCH TRIGGER BUTTON (Visible on < md) ================= */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => {
            setMobileModalOpen(true);
            setTimeout(() => mobileInputRef.current?.focus(), 150);
          }}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition cursor-pointer"
          title="بحث سريع"
        >
          <Search className="w-4 h-4 text-emerald-700" />
        </button>
      </div>

      {/* ================= MOBILE FULLSCREEN SEARCH MODAL ================= */}
      {mobileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex flex-col justify-start p-3 sm:p-4 text-right animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-xl mx-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Input Area */}
            <div className="p-3.5 border-b border-slate-200 bg-white flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3.5 top-3 w-4 h-4 text-emerald-600" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن مبادرة، جمعية، نادي، أو متطوع..."
                  className="w-full pr-10 pl-8 py-2.5 bg-slate-100 text-sm text-slate-900 placeholder:text-slate-400 rounded-2xl border border-slate-200 focus:bg-white focus:border-emerald-500 outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      mobileInputRef.current?.focus();
                    }}
                    className="absolute left-2.5 top-3 w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                إلغاء
              </button>
            </div>

            {/* Mobile Tabs */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
                  activeTab === 'all' ? 'bg-emerald-700 text-white' : 'text-slate-600 bg-white border border-slate-200'
                }`}
              >
                الكل {query && `(${totalResultsCount})`}
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
                  activeTab === 'activities' ? 'bg-emerald-700 text-white' : 'text-slate-600 bg-white border border-slate-200'
                }`}
              >
                مبادرات ({filteredActivities.length})
              </button>
              <button
                onClick={() => setActiveTab('institutions_clubs')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
                  activeTab === 'institutions_clubs' ? 'bg-emerald-700 text-white' : 'text-slate-600 bg-white border border-slate-200'
                }`}
              >
                جمعيات ونوادي ({filteredInstitutions.length + filteredClubs.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
                  activeTab === 'users' ? 'bg-emerald-700 text-white' : 'text-slate-600 bg-white border border-slate-200'
                }`}
              >
                متطوعين ({filteredUsers.length})
              </button>
            </div>

            {/* Mobile Scrollable Results Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Empty query: Show suggestions */}
              {!query.trim() && (
                <div className="py-4 space-y-3">
                  <div className="text-xs font-bold text-slate-400">عمليات بحث شائعة مقترحة:</div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUERIES.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuery(item.query);
                          mobileInputRef.current?.focus();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        <Search className="w-3 h-3 text-slate-400" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No matches */}
              {query.trim() && totalResultsCount === 0 && (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-700">لم يتم العثور على نتائج لـ "{query}"</div>
                </div>
              )}

              {/* Activities */}
              {query.trim() && (activeTab === 'all' || activeTab === 'activities') && filteredActivities.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>المبادرات والنشاطات ({filteredActivities.length})</span>
                  </div>
                  <div className="space-y-2">
                    {filteredActivities.map(act => (
                      <div
                        key={act.id}
                        onClick={() => handleSelectActivityItem(act)}
                        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 active:bg-emerald-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={act.coverImage}
                            alt={act.title}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{act.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {act.wilaya} • +{act.basePoints} نقطة
                            </div>
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-emerald-700 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Institutions & Clubs */}
              {query.trim() && (activeTab === 'all' || activeTab === 'institutions_clubs') && (filteredInstitutions.length > 0 || filteredClubs.length > 0) && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-black text-blue-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>الجمعيات والنوادي ({filteredInstitutions.length + filteredClubs.length})</span>
                  </div>
                  <div className="space-y-2">
                    {filteredInstitutions.map(inst => (
                      <div
                        key={inst.id}
                        onClick={() => handleSelectInstitutionItem(inst)}
                        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 active:bg-blue-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={inst.avatar}
                            alt={inst.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{inst.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {inst.wilaya} • {inst.points} نقطة
                            </div>
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-blue-700 shrink-0" />
                      </div>
                    ))}

                    {filteredClubs.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectClubItem(c)}
                        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 active:bg-purple-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{c.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {c.specialty} • {c.membersCount} عضو
                            </div>
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-purple-700 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {query.trim() && (activeTab === 'all' || activeTab === 'users') && filteredUsers.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>المتطوعين ({filteredUsers.length})</span>
                  </div>
                  <div className="space-y-2">
                    {filteredUsers.map(u => (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUserItem(u)}
                        className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 active:bg-slate-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{u.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {u.wilaya} • {u.points} نقطة • #{u.rank}
                            </div>
                          </div>
                        </div>
                        <ArrowUpLeft className="w-4 h-4 text-emerald-700 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
