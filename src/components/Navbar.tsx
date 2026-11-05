import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, Activity, User as UserType, AffiliatedClub } from '../types';
import { TopSearchBar } from './TopSearchBar';
import { NotificationCenterModal } from './NotificationCenterModal';
import { AdminAccountManagerModal } from './AdminAccountManagerModal';
import { 
  Award, 
  Compass, 
  Trophy, 
  Newspaper, 
  Building2, 
  ShieldCheck, 
  Users, 
  Layers, 
  ChevronDown,
  Sparkles,
  CheckCircle,
  FileCheck,
  Megaphone,
  UserCheck,
  User,
  Plus,
  LogIn,
  UserPlus,
  LogOut,
  LayoutGrid,
  Flame,
  Bell,
  Database,
  MapPin,
  MessageCircle
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  onOpenCreateActivity?: () => void;
  onOpenProfile?: () => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenAbout?: () => void;
  onSelectActivity?: (activity: Activity) => void;
  onSelectUser?: (user: UserType) => void;
  onSelectClub?: (club: AffiliatedClub) => void;
  onSelectInstitution?: (institution: UserType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onSelectTab,
  onOpenCreateActivity,
  onOpenProfile,
  onOpenLogin,
  onOpenRegister,
  onOpenAbout,
  onSelectActivity,
  onSelectUser,
  onSelectClub,
  onSelectInstitution
}) => {
  const { 
    currentUser, 
    submissions, 
    isLoggedIn, 
    logoutUser,
    unreadNotificationsCount,
    unreadDirectMessagesCount,
    setShowStreakModal,
    openChatWithUser,
    activities,
    isShamsAdmin,
    mongoDbStatus
  } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAdminAccountManagerOpen, setIsAdminAccountManagerOpen] = useState(false);

  const handleSelectTab = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Count pending reviews for the evaluator badge
  const pendingReviewsCount = submissions.filter(s => s.status === 'submitted').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      
      {/* Top Main Row */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleSelectTab('activities')}
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group shrink-0"
          >
            {/* Logo from /assets/logo.png */}
            <div className="relative flex items-center justify-center group-hover:scale-105 transition transform">
              <img 
                src="/assets/logo.png" 
                alt="شعار منصة شمس التطوع" 
                className="h-8 sm:h-11 w-auto max-w-[85px] sm:max-w-[140px] object-contain rounded-xl"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div 
                style={{ display: 'none' }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 items-center justify-center text-white font-black text-sm sm:text-lg shadow-sm"
              >
                ☀️
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">شَمْس</span>
                <span className="hidden xs:inline px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-300">
                  منصة التطوع
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden md:block">
                وزارة الشباب والرياضة — الجمهورية الجزائرية
              </p>
            </div>
          </div>

          {/* Central Top Quick Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-xl mx-1 sm:mx-4">
            <TopSearchBar 
              onSelectActivity={(act) => {
                if (onSelectActivity) onSelectActivity(act);
              }}
              onSelectUser={(u) => {
                if (onSelectUser) onSelectUser(u);
              }}
              onSelectClub={(c) => {
                if (onSelectClub) onSelectClub(c);
              }}
              onSelectInstitution={(inst) => {
                if (onSelectInstitution) onSelectInstitution(inst);
              }}
            />
          </div>

          {/* User Controls & Profile Actions Area */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">

            {/* Platform Guide Button (دليل المنصة وشرح شمس ماب والجوائز) */}
            <button
              type="button"
              onClick={() => onOpenAbout && onOpenAbout()}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 text-amber-950 font-black text-xs transition cursor-pointer shadow-2xs shrink-0"
              title="دليل منصة شمس التطوع وشرح الميزات والجوائز 💡"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">دليل المنصة 💡</span>
            </button>

            {/* Authenticated State Actions */}
            {isLoggedIn && (
              <>
                {/* Streak Flame Badge Button */}
                <button
                  type="button"
                  onClick={() => setShowStreakModal(true)}
                  className="relative flex items-center gap-1.5 p-1.5 sm:px-2.5 py-1.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 font-black text-xs transition cursor-pointer shadow-2xs group"
                  title="الستريك التطوعي المستمر 🔥"
                >
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                  <span className="font-mono text-xs font-black">{currentUser.streakCount || 7}</span>
                  {!currentUser.dailyCheckInDone && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
                  )}
                </button>

                {/* Direct Messages Chat Button */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('chat')}
                  className="relative p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs group"
                  title="المحادثات والرسائل الخاصة 💬"
                >
                  <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700 group-hover:text-emerald-700 transition" />
                  {unreadDirectMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                      {unreadDirectMessagesCount}
                    </span>
                  )}
                </button>

                {/* Notification Bell Button */}
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs group"
                  title="مركز الإشعارات والتنبيهات"
                >
                  <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700 group-hover:text-emerald-700 transition" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* User points badge */}
                <div 
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    else handleSelectTab('workspace');
                  }}
                  className="cursor-pointer hidden xs:flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-xs hover:border-amber-400 transition"
                  title="انقر لعرض رصيدك وملفك الشخصي"
                >
                  <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[9px] text-amber-800 font-bold leading-none">نقاط شمس</div>
                    <div className="text-xs font-black text-amber-950 font-mono">{currentUser.points}</div>
                  </div>
                </div>

                {/* Sovereign General Admin Button: Manage Accounts & Clubs */}
                {(currentUser.role === 'general_admin' || currentUser.username === 'riyad' || isShamsAdmin) && (
                  <button
                    onClick={() => setIsAdminAccountManagerOpen(true)}
                    className="hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl shadow-xs transition cursor-pointer shrink-0"
                    title="لوحة إنشاء الحسابات للمؤسسات، النوادي، مقيمي الإثباتات ومسؤولي الإعلام"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                    <span>إدارة الحسابات والنوادي</span>
                  </button>
                )}

                {/* Quick Action Button for Admin */}
                {(currentUser.role === 'general_admin' || currentUser.role === 'institution_admin') && onOpenCreateActivity && (
                  <button
                    onClick={onOpenCreateActivity}
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>نشر نشاط</span>
                  </button>
                )}
              </>
            )}

            {/* Authentication Buttons (Logged Out) */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs min-h-[38px]"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                  <span>دخول</span>
                </button>
                <button
                  onClick={onOpenRegister}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black transition cursor-pointer shadow-xs min-h-[38px]"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                  <span>تسجيل</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-2 sm:pr-3 bg-slate-100 hover:bg-slate-200/80 rounded-2xl border border-slate-300 transition text-right cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover border border-white shadow-xs"
                  />
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-bold text-slate-900 leading-tight max-w-[120px] truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <span>
                        {currentUser.role === 'individual' && 'متطوع فرد'}
                        {currentUser.role === 'institution' && 'مؤسسة / نادي'}
                        {currentUser.role === 'general_admin' && 'المدير العام'}
                        {currentUser.role === 'institution_admin' && 'مسؤول هيكل'}
                        {currentUser.role === 'evaluator_admin' && 'مقيّم إثباتات'}
                        {currentUser.role === 'media_admin' && 'إعلام المنصة'}
                      </span>
                    </div>
                  </div>
                  <div className="px-1 text-slate-500">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* User Menu Modal / Dropdown */}
                {roleMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setRoleMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3 text-right">
                      
                      {/* User Identity Banner */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-2.5 flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-xs shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-slate-900 truncate">
                            {currentUser.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            @{currentUser.username || currentUser.email}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {currentUser.role === 'individual' && 'متطوع فرد'}
                              {currentUser.role === 'institution' && 'مؤسسة شبانية'}
                              {currentUser.role === 'general_admin' && 'المدير العام للمنصة'}
                              {currentUser.role === 'institution_admin' && 'مسؤول هيكل شباني'}
                              {currentUser.role === 'evaluator_admin' && 'مقيّم إثباتات معتمد'}
                              {currentUser.role === 'media_admin' && 'مسؤول الإعلام والتغطية'}
                            </span>
                            {currentUser.points !== undefined && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                {currentUser.points} نقطة
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User Actions */}
                      <div className="space-y-1.5 mb-2">
                        <button
                          onClick={() => {
                            setRoleMenuOpen(false);
                            handleSelectTab('profile');
                            if (onOpenProfile) onOpenProfile();
                          }}
                          className="w-full p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-700" />
                            <span>فتح ملفي الشخصي ومنشوراتي</span>
                          </div>
                          <span className="text-emerald-700">←</span>
                        </button>

                        {/* Platform Guide */}
                        <button
                          onClick={() => {
                            setRoleMenuOpen(false);
                            if (onOpenAbout) onOpenAbout();
                          }}
                          className="w-full p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span>دليل المنصة وشرح شمس ماب 💡</span>
                          </div>
                          <span className="text-amber-700 text-[10px] font-black">شرح</span>
                        </button>

                        {/* General Admin Console */}
                        {(currentUser.role === 'general_admin' || currentUser.username === 'riyad' || isShamsAdmin) && (
                          <button
                            onClick={() => {
                              setRoleMenuOpen(false);
                              setIsAdminAccountManagerOpen(true);
                            }}
                            className="w-full p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <UserPlus className="w-4 h-4 text-amber-600" />
                              <span>لوحة إنشاء الحسابات والنوادي</span>
                            </div>
                            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">المدير</span>
                          </button>
                        )}

                        {/* Evaluator Panel */}
                        {(currentUser.role === 'evaluator_admin' || currentUser.username === 'adnan') && (
                          <button
                            onClick={() => {
                              setRoleMenuOpen(false);
                              handleSelectTab('evaluator');
                            }}
                            className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-rose-600" />
                              <span>لوحة تقييم إثباتات المتطوعين</span>
                            </div>
                            <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-bold">مقيّم</span>
                          </button>
                        )}

                        {/* Media Panel */}
                        {(currentUser.role === 'media_admin' || currentUser.username === 'aroua') && (
                          <button
                            onClick={() => {
                              setRoleMenuOpen(false);
                              handleSelectTab('media');
                            }}
                            className="w-full p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-950 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Megaphone className="w-4 h-4 text-teal-600" />
                              <span>فضاء شمس ميديا والمقالات</span>
                            </div>
                            <span className="text-[10px] bg-teal-200 text-teal-900 px-1.5 py-0.5 rounded font-bold">إعلام</span>
                          </button>
                        )}
                      </div>

                      {/* Logout Button */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setRoleMenuOpen(false);
                            logoutUser();
                          }}
                          className="w-full p-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>تسجيل الخروج من الحساب</span>
                        </button>
                      </div>

                    </div>
                  </>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Main Responsive Tabs Bar - Always Visible on All Viewports */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 px-2 sm:px-6 lg:px-8 py-1.5">
        {!isLoggedIn ? (
          /* Guest View: Show Feed, Activities, and Snap Map */
          <div className="max-w-xl mx-auto grid grid-cols-3 gap-2 w-full py-0.5">
            {/* Tab: Feed (المنشورات) */}
            <button
              onClick={() => handleSelectTab('feed')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${activeTab === 'feed' ? 'text-amber-300' : 'text-emerald-600'}`} />
              <span>اللوحة العامة</span>
            </button>

            {/* Tab: Activities (المشاريع التطوعية) */}
            <button
              onClick={() => handleSelectTab('activities')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                activeTab === 'activities'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Compass className={`w-4 h-4 ${activeTab === 'activities' ? 'text-white' : 'text-emerald-600'}`} />
              <span>المشاريع التطوعية</span>
            </button>

            {/* Tab: Shams Map (خريطة شمس ماب) */}
            <button
              onClick={() => handleSelectTab('snapmap')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                activeTab === 'snapmap'
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
              }`}
            >
              <MapPin className={`w-4 h-4 ${activeTab === 'snapmap' ? 'text-white' : 'text-rose-500'}`} />
              <span>شمس ماب 🗺️</span>
            </button>
          </div>
        ) : (
          /* Authenticated User View: All tabs */
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
            {/* Tab 0: General Feed (اللوحة العامة إنستغرام) */}
            <button
              onClick={() => handleSelectTab('feed')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'feed'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/60'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${activeTab === 'feed' ? 'text-amber-300' : 'text-emerald-600'}`} />
              <span>اللوحة العامة (Feed)</span>
            </button>

            {/* Tab 0.5: National Shams Map (خريطة شمس ماب الوطنية) */}
            <button
              onClick={() => handleSelectTab('snapmap')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'snapmap'
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-800 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/60'
              }`}
            >
              <MapPin className={`w-4 h-4 ${activeTab === 'snapmap' ? 'text-white' : 'text-rose-500'}`} />
              <span>شمس ماب (Shams Map) 🗺️</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 animate-pulse">
                58 ولاية
              </span>
            </button>

            {/* Tab 0.8: Direct Chat (المحادثات الخاصة بين الأفراد) */}
            <button
              onClick={() => handleSelectTab('chat')}
              className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <MessageCircle className={`w-4 h-4 ${activeTab === 'chat' ? 'text-white' : 'text-emerald-600'}`} />
              <span>المحادثات الخاصة (Chat)</span>
              {unreadDirectMessagesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
                  {unreadDirectMessagesCount}
                </span>
              )}
            </button>

            {/* Tab: Create Activity as primary tab if authorized or active */}
            {(currentUser.role === 'general_admin' || currentUser.role === 'institution_admin' || activeTab === 'create-activity') && (
              <button
                onClick={() => handleSelectTab('create-activity')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === 'create-activity'
                    ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-400/40'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>نشر مشروع تطوعي</span>
              </button>
            )}

            {/* Tab 1: Activities */}
            <button
              onClick={() => handleSelectTab('activities')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'activities'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Compass className={`w-4 h-4 ${activeTab === 'activities' ? 'text-white' : 'text-emerald-600'}`} />
              <span>النشاطات والمشاريع</span>
            </button>

            {/* Tab 2: Leaderboard */}
            <button
              onClick={() => handleSelectTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Trophy className={`w-4 h-4 ${activeTab === 'leaderboard' ? 'text-slate-950' : 'text-amber-500'}`} />
              <span>المتصدرين والجوائز</span>
            </button>

            {/* Tab 3: Evaluation Queue (Always accessible) */}
            <button
              onClick={() => handleSelectTab('evaluator')}
              className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'evaluator'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>تقييم الإثباتات</span>
              {pendingReviewsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'evaluator' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white animate-pulse'
                }`}>
                  {pendingReviewsCount}
                </span>
              )}
            </button>

            {/* Tab 4: Institutions & Clubs */}
            <button
              onClick={() => handleSelectTab('institutions')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'institutions'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'institutions' ? 'text-white' : 'text-blue-600'}`} />
              <span>الهياكل والنوادي</span>
            </button>

            {/* Tab 5: Media */}
            <button
              onClick={() => handleSelectTab('media')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'media'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Newspaper className={`w-4 h-4 ${activeTab === 'media' ? 'text-white' : 'text-teal-600'}`} />
              <span>شمس ميديا</span>
            </button>

            {/* Tab 6: Profile & Posts */}
            <button
              onClick={() => {
                handleSelectTab('profile');
                if (onOpenProfile) onOpenProfile();
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-emerald-700'}`} />
              <span>البروفايل والمنشورات</span>
            </button>

            {/* Tab 7: Workspace */}
            <button
              onClick={() => handleSelectTab('workspace')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'workspace'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'workspace' ? 'text-white' : 'text-slate-600'}`} />
              <span>مساحة المهام والإثباتات</span>
            </button>
          </div>
        )}
      </div>

      {/* Real-time Notification Center Modal / Dropdown */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onNavigateTab={handleSelectTab}
        onSelectActivityById={(actId) => {
          const act = activities.find(a => a.id === actId);
          if (act && onSelectActivity) {
            onSelectActivity(act);
          } else {
            handleSelectTab('activities');
          }
        }}
      />

      {/* Sovereign Admin Accounts and Clubs Management Modal */}
      <AdminAccountManagerModal
        isOpen={isAdminAccountManagerOpen}
        onClose={() => setIsAdminAccountManagerOpen(false)}
      />

    </header>
  );
};
