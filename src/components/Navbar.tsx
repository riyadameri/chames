import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Sun, 
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
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateActivity: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenCreateActivity }) => {
  const { currentUser, switchUserRole, submissions } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Count pending reviews for the evaluator badge
  const pendingReviewsCount = submissions.filter(s => s.status === 'submitted').length;

  const roleOptions: { role: UserRole; label: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'individual',
      label: 'متطوع فرد (أمين بن سالم)',
      desc: 'التقديم على النشاطات، إتمام المهام، رفع الصور والإحداثيات',
      icon: UserCheck,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      role: 'institution',
      label: 'مؤسسة / جمعية (دار الشباب وادي قريش)',
      desc: 'المشاركة الجماعية، تسجيل النوادي، وتصدر ترتيب المؤسسات',
      icon: Building2,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      role: 'general_admin',
      label: 'المدير العام للمنصة (الوزارة)',
      desc: 'إضافة نشاطات وطنية، إدارة المواسم، والتحكم الشامل',
      icon: Layers,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      role: 'institution_admin',
      label: 'مسؤول مؤسسة شبانية (إدارة دار الشباب)',
      desc: 'إضافة نشاطات محلية، إضافة نوادي تابعة وإشراكها في النشاطات',
      icon: Users,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      role: 'evaluator_admin',
      label: 'مسؤول التقييم والمتابعة ومنح النقاط',
      desc: 'مراجعة صور ومواقع المهام المنجزة، اعتمادها ومنح النقاط',
      icon: ShieldCheck,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      role: 'media_admin',
      label: 'مسؤول الإعلام والميديا (شمس ميديا)',
      desc: 'نشر مقالات وبلاغات وزارية وتغطيات الأنشطة',
      icon: Megaphone,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Official Ministry Top Ribbon */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
          <span>الجمهورية الجزائرية الديمقراطية الشعبية — وزارة الشباب والرياضة</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-emerald-100 text-xs">
          <span>البرنامج الوطني لتطوير العمل التطوعي والشبابي</span>
          <span>•</span>
          <span className="text-amber-300 font-bold">الموسم الوطني 2026</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('activities')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition transform">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400">
                <Sun className="w-7 h-7 animate-[spin_12s_linear_infinite]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                ✓
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">شَمْس</span>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-300">
                  منصة التطوع
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">وزارة الشباب والرياضة</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === 'activities'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              النشاطات والمشاريع
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === 'leaderboard'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              المتصدرين والجوائز
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === 'media'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Newspaper className="w-4 h-4 text-teal-600" />
              شمس ميديا
            </button>

            <button
              onClick={() => setActiveTab('institutions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === 'institutions'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              الهياكل والنوادي
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeTab === 'workspace'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>لوحة التحكم الخاصة بي</span>
              {currentUser.role === 'evaluator_admin' && pendingReviewsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {pendingReviewsCount}
                </span>
              )}
            </button>
          </nav>

          {/* User & Role Switcher Area */}
          <div className="flex items-center gap-3">
            
            {/* User points badge */}
            {(currentUser.role === 'individual' || currentUser.role === 'institution') && (
              <div 
                onClick={() => setActiveTab('workspace')}
                className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-xs hover:border-amber-400 transition"
                title="رصيدك التراكمي من النقاط"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-amber-800 font-bold leading-none">نقاط شمس</div>
                  <div className="text-sm font-black text-amber-950 font-mono">{currentUser.points}</div>
                </div>
              </div>
            )}

            {/* Quick Action Button for Admin */}
            {(currentUser.role === 'general_admin' || currentUser.role === 'institution_admin') && (
              <button
                onClick={onOpenCreateActivity}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>+</span>
                <span>نشر نشاط جديد</span>
              </button>
            )}

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-100 hover:bg-slate-200/80 rounded-2xl border border-slate-300 transition text-right"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-xl object-cover border border-white shadow-xs"
                />
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900 leading-tight max-w-[130px] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                    <span>
                      {currentUser.role === 'individual' && 'متطوع فرد'}
                      {currentUser.role === 'institution' && 'مؤسسة / جمعية'}
                      {currentUser.role === 'general_admin' && 'مدير المنصة (الوزارة)'}
                      {currentUser.role === 'institution_admin' && 'مسؤول مؤسسة شبانية'}
                      {currentUser.role === 'evaluator_admin' && 'مسؤول التقييم والمتابعة'}
                      {currentUser.role === 'media_admin' && 'مسؤول الإعلام والميديا'}
                    </span>
                  </div>
                </div>
                <div className="px-1 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {/* Role Switcher Menu */}
              {roleMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setRoleMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 text-right">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">تبديل الحساب والدور للتجربة</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          نظام متعدد الأدوار
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        اختر أي دور لتجربة صلاحيات المنصة (إضافة نشاطات، منح النقاط، إضافة نوادي، نشر ميديا):
                      </p>
                    </div>

                    <div className="space-y-1 max-h-[380px] overflow-y-auto p-1">
                      {roleOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isCurrent = currentUser.role === opt.role;
                        return (
                          <button
                            key={opt.role}
                            onClick={() => {
                              switchUserRole(opt.role);
                              setRoleMenuOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-xl border transition flex items-start gap-3 text-right ${
                              isCurrent
                                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                                : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${opt.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                                {isCurrent && (
                                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    نشط الآن
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden border-t border-slate-200 bg-white/95 px-2 py-2 flex items-center justify-around text-center">
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            activeTab === 'activities' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>النشاطات</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            activeTab === 'leaderboard' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span>المتصدرين</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            activeTab === 'media' ? 'text-teal-700' : 'text-slate-500'
          }`}
        >
          <Newspaper className="w-5 h-5 mb-0.5" />
          <span>ميديا</span>
        </button>

        <button
          onClick={() => setActiveTab('institutions')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            activeTab === 'institutions' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span>الهياكل</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex flex-col items-center text-[10px] font-bold relative ${
            activeTab === 'workspace' ? 'text-emerald-800 font-black' : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>لوحة التحكم</span>
          {currentUser.role === 'evaluator_admin' && pendingReviewsCount > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {pendingReviewsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
