import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ALGERIA_WILAYAS_GEO } from '../data/algeriaMapData';
import { WilayaMapLocation, Activity, UserStory, UserAccount } from '../types';
import { StoriesTray } from './StoriesTray';
import { 
  MapPin, 
  Compass, 
  Flame, 
  Layers, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  Eye, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sun, 
  Moon, 
  TreePine, 
  Heart, 
  Users, 
  Building2, 
  ExternalLink,
  Navigation,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface NationalSnapMapViewProps {
  onSelectActivity?: (activity: Activity) => void;
  onSelectUser?: (user: UserAccount) => void;
  onNavigateToChat?: () => void;
}

export const NationalSnapMapView: React.FC<NationalSnapMapViewProps> = ({
  onSelectActivity,
  onSelectUser,
  onNavigateToChat
}) => {
  const { 
    activities, 
    posts, 
    stories, 
    allUsers, 
    currentUser, 
    selectedMapWilaya, 
    setSelectedMapWilaya,
    setActiveStoryModal,
    openChatWithUser,
    setShowStreakModal
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'activities' | 'stories' | 'oasis' | 'clubs'>('all');
  const [mapTheme, setMapTheme] = useState<'shams_dark' | 'daylight'>('shams_dark');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Find Ouargla (30) & Touggourt (55) for quick focus
  const ouarglaWilaya = useMemo(() => {
    return ALGERIA_WILAYAS_GEO.find(w => w.code === '30' || w.nameAr.includes('ورقلة'));
  }, []);

  const touggourtWilaya = useMemo(() => {
    return ALGERIA_WILAYAS_GEO.find(w => w.code === '55' || w.nameAr.includes('تقرت'));
  }, []);

  // Safe fallback wilaya if none selected
  const defaultWilaya: WilayaMapLocation = ouarglaWilaya || ALGERIA_WILAYAS_GEO[0] || {
    id: '30',
    code: '30',
    name: 'Ouargla',
    nameAr: 'ورقلة',
    region: 'جنوب',
    xPercent: 71,
    yPercent: 44,
    lat: 31.95,
    lng: 5.33,
    activityCount: 16,
    volunteersCount: 420,
    heatLevel: 'hot',
    isFeaturedOasis: true
  };

  // Active Wilaya currently selected for detail drawer
  const activeWilaya = selectedMapWilaya || defaultWilaya;

  // Safe helper to compare wilaya names across different formats
  const matchWilaya = (itemWilaya?: string | null, targetNameAr?: string | null): boolean => {
    if (!itemWilaya || !targetNameAr) return false;
    const cleanItem = itemWilaya.replace(/^\d+\s*-\s*/, '').trim();
    const cleanTarget = targetNameAr.replace(/^\d+\s*-\s*/, '').trim();
    return (
      itemWilaya.includes(targetNameAr) ||
      cleanItem.includes(cleanTarget) ||
      cleanTarget.includes(cleanItem)
    );
  };

  // Activities filtered for the selected Wilaya
  const wilayaActivities = useMemo(() => {
    if (!activeWilaya?.nameAr) return [];
    return (activities || []).filter(a => matchWilaya(a?.wilaya, activeWilaya.nameAr));
  }, [activities, activeWilaya]);

  // Stories in the selected Wilaya
  const wilayaStories = useMemo(() => {
    if (!activeWilaya?.nameAr) return [];
    return (stories || []).filter(s => matchWilaya(s?.wilaya, activeWilaya.nameAr));
  }, [stories, activeWilaya]);

  // Active volunteers in the selected Wilaya
  const wilayaVolunteers = useMemo(() => {
    if (!activeWilaya?.nameAr) return [];
    return (allUsers || []).filter(u => matchWilaya(u?.wilaya, activeWilaya.nameAr));
  }, [allUsers, activeWilaya]);

  // Filter Wilayas based on search & filter category
  const filteredWilayas = useMemo(() => {
    let list = ALGERIA_WILAYAS_GEO || [];

    if (activeFilter === 'oasis') {
      list = list.filter(w => w.isFeaturedOasis || w.region === 'جنوب');
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(w => 
      (w?.nameAr && w.nameAr.includes(searchQuery.trim())) || 
      (w?.name && w.name.toLowerCase().includes(q)) ||
      (w?.code && w.code === searchQuery.trim())
    );
  }, [searchQuery, activeFilter]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      if (direction === 'in') return Math.min(prev + 0.25, 2.0);
      return Math.max(prev - 0.25, 0.85);
    });
  };

  const focusOnWilaya = (w?: WilayaMapLocation) => {
    if (w) {
      setSelectedMapWilaya(w);
      setZoomLevel(1.25);
    }
  };

  return (
    <div className="space-y-4 text-right animate-in fade-in duration-300" dir="rtl">
      
      {/* Top Banner: Stories Tray on Shams Map */}
      <StoriesTray className="shadow-md" />

      {/* Shams Map Header Control Card */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
        mapTheme === 'shams_dark' 
          ? 'bg-slate-950 border-slate-800 text-white shadow-xl' 
          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Title & Stats */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-md">
              🇩🇿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  خريطة شمس ماب الوطنية (Shams Map)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  58 ولاية
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white flex items-center gap-1">
                  <span>🌴 واحات ورقلة وتقرت</span>
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${mapTheme === 'shams_dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                الخريطة الجغرافية الحقيقية للتراب الوطني الجزائري — تصفح الأنشطة الميدانية والستوريات الجغرافية عبر 58 ولاية.
              </p>
            </div>
          </div>

          {/* Quick Controls: Theme Toggle & Search */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Wilaya Search Selector */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن ولاية (ورقلة، تقرت...)..."
                className={`w-full pr-9 pl-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  mapTheme === 'shams_dark'
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            {/* Dark / Daylight Theme Toggle */}
            <button
              onClick={() => setMapTheme(mapTheme === 'shams_dark' ? 'daylight' : 'shams_dark')}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mapTheme === 'shams_dark'
                  ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="تغيير مظهر الخريطة"
            >
              {mapTheme === 'shams_dark' ? (
                <>
                  <Moon className="w-4 h-4 fill-amber-300" />
                  <span className="hidden sm:inline">شمس ليلي</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">شمس نهاري</span>
                </>
              )}
            </button>

            {/* Zoom Controls */}
            <div className={`flex items-center rounded-xl border overflow-hidden ${
              mapTheme === 'shams_dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
            }`}>
              <button 
                onClick={() => handleZoom('in')} 
                className="p-2 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                title="تكبير"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleZoom('out')} 
                className="p-2 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Streak trigger button */}
            <button
              onClick={() => setShowStreakModal(true)}
              className="p-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>الستريك 🔥</span>
            </button>

          </div>

        </div>

        {/* Quick Focus Bar: Ouargla & Touggourt Prominence */}
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-800/40">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <span>تركيز واحات الجنوب:</span>
          </span>

          {ouarglaWilaya && (
            <button
              onClick={() => focusOnWilaya(ouarglaWilaya)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeWilaya.code === '30'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-amber-400/40'
              }`}
            >
              <span>🌴 ورقلة (30)</span>
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded text-white font-mono">
                {ouarglaWilaya.activityCount} مشاريع
              </span>
            </button>
          )}

          {touggourtWilaya && (
            <button
              onClick={() => focusOnWilaya(touggourtWilaya)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeWilaya.code === '55'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-amber-400/40'
              }`}
            >
              <span>🌴 تقرت (55)</span>
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded text-white font-mono">
                {touggourtWilaya.activityCount} مشاريع
              </span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveFilter('oasis');
              setZoomLevel(1.15);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeFilter === 'oasis'
                ? 'bg-emerald-600 text-white font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            واحات الجنوب ووادي ريغ (عرض مكثف)
          </button>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            إعادة ضبط الخريطة
          </button>
        </div>

      </div>

      {/* ================= INTERACTIVE AUTHENTIC ALGERIA MAP CANVAS ================= */}
      <div className={`relative rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 ${
        mapTheme === 'shams_dark'
          ? 'bg-[#09101d] border-slate-800'
          : 'bg-[#042f2e] border-slate-300'
      }`}>
        
        {/* Subtle Latitude/Longitude Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />
        
        {/* Top Floating Mini Bar: Current Selected Wilaya */}
        <div className="absolute top-4 right-4 z-20 bg-slate-950/85 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-right">
            <div className="text-[10px] text-emerald-400 font-bold">الولاية المحددة على شمس ماب:</div>
            <div className="text-xs font-black flex items-center gap-1.5">
              <span>{activeWilaya.nameAr}</span>
              <span className="text-amber-300 font-mono">({activeWilaya.code})</span>
              {(activeWilaya.code === '30' || activeWilaya.code === '55') && (
                <span className="text-xs">🌴</span>
              )}
            </div>
          </div>
        </div>

        {/* Center Canvas / Authentic Algeria SVG Map Area */}
        <div 
          className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-h-[660px] overflow-hidden flex items-center justify-center p-4 transition-transform duration-200 select-none"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          
          {/* Authentic Geographic SVG Outline of Algeria */}
          <svg 
            viewBox="0 0 1000 950" 
            className="w-full h-full max-w-4xl filter drop-shadow-[0_0_30px_rgba(16,185,129,0.25)] pointer-events-none"
          >
            <defs>
              <linearGradient id="algeriaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={mapTheme === 'shams_dark' ? '#064e3b' : '#047857'} stopOpacity="0.45" />
                <stop offset="40%" stopColor={mapTheme === 'shams_dark' ? '#0f291e' : '#065f46'} stopOpacity="0.35" />
                <stop offset="100%" stopColor={mapTheme === 'shams_dark' ? '#061611' : '#022c22'} stopOpacity="0.5" />
              </linearGradient>

              <radialGradient id="ouarglaHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="touggourtHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Authentic Territorial Path of Algeria */}
            <path 
              d="
                M 220,180 
                C 300,160 420,130 540,105 
                C 650,95 780,85 890,75 
                L 885,190 
                L 850,280 
                L 890,360 
                L 880,530 
                L 895,660 
                L 920,700 
                L 800,760 
                L 660,800 
                L 540,780 
                L 430,735 
                L 310,630 
                L 180,560 
                L 70,520 
                L 50,470 
                L 110,420 
                L 200,360 
                L 240,300 
                L 230,230 
                Z
              "
              fill="url(#algeriaGradient)"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="transition duration-500"
            />

            {/* Northern Tell & Saharan Atlas Relief Contours */}
            <path 
              d="M 230,210 Q 520,160 880,125" 
              stroke="#10b981" 
              strokeWidth="1.2" 
              strokeDasharray="4,4" 
              fill="none" 
              opacity="0.3" 
            />
            <path 
              d="M 240,270 Q 520,225 845,195" 
              stroke="#fbbf24" 
              strokeWidth="1.2" 
              strokeDasharray="5,5" 
              fill="none" 
              opacity="0.35" 
            />

            {/* Oasis Corridor Connecting Line: Biskra -> Touggourt -> Ouargla -> Hassi Messaoud */}
            <path 
              d="M 720,255 L 750,314 L 710,374 L 780,410" 
              stroke="#f59e0b" 
              strokeWidth="2.5" 
              strokeDasharray="6,4" 
              fill="none" 
              opacity="0.85" 
              className="animate-pulse"
            />

            {/* Radiant Glow Halos on Touggourt and Ouargla Region */}
            <circle cx="750" cy="314" r="75" fill="url(#touggourtHalo)" />
            <circle cx="710" cy="374" r="90" fill="url(#ouarglaHalo)" />

            {/* Sahara Dunes Waves Texture */}
            <path d="M 350,450 Q 420,430 490,450 T 630,450" stroke="#f59e0b" strokeWidth="0.8" opacity="0.25" fill="none" />
            <path d="M 400,520 Q 470,500 540,520 T 680,520" stroke="#f59e0b" strokeWidth="0.8" opacity="0.25" fill="none" />
            <path d="M 480,600 Q 550,580 620,600 T 760,600" stroke="#f59e0b" strokeWidth="0.8" opacity="0.25" fill="none" />

            {/* Region Labels */}
            <text x="540" y="70" fill="#a7f3d0" fontSize="14" fontWeight="bold" textAnchor="middle" opacity="0.6">
              البحر الأبيض المتوسط
            </text>
            <text x="730" y="420" fill="#fde68a" fontSize="13" fontWeight="black" textAnchor="middle" opacity="0.9">
              🌴 واحات الجنوب (ورقلة - تقرت)
            </text>
            <text x="500" y="680" fill="#6ee7b7" fontSize="15" fontWeight="bold" textAnchor="middle" opacity="0.4">
              الصحراء الكبرى الجزائرية
            </text>
          </svg>

          {/* Render Interactive Shams Map Pins for each Wilaya */}
          {filteredWilayas.map((w) => {
            const isSelected = activeWilaya?.id === w.id;
            const wStories = (stories || []).filter(s => matchWilaya(s?.wilaya, w?.nameAr));
            const hasStories = wStories.length > 0;
            const isOasisFocus = w.code === '30' || w.code === '55';

            return (
              <div
                key={w.id}
                onClick={() => setSelectedMapWilaya(w)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-all duration-300 group ${
                  isSelected ? 'scale-130 z-30' : isOasisFocus ? 'scale-115 hover:scale-125 z-25' : 'hover:scale-115 hover:z-20'
                }`}
                style={{ left: `${w.xPercent}%`, top: `${w.yPercent}%` }}
              >
                
                {/* Pin Container */}
                <div className="relative flex flex-col items-center">
                  
                  {/* Glowing Ring: Extra radiance for Ouargla & Touggourt */}
                  <div className={`relative rounded-2xl p-0.5 transition shadow-lg ${
                    isOasisFocus
                      ? 'bg-gradient-to-tr from-amber-400 via-emerald-400 to-yellow-500 animate-pulse ring-4 ring-amber-400/40 p-[2.5px]'
                      : hasStories 
                        ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 animate-spin-slow p-[2px]' 
                        : isSelected 
                          ? 'bg-emerald-400 ring-4 ring-emerald-400/30' 
                          : 'bg-slate-800/90 border border-slate-600'
                  }`}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-[14px] overflow-hidden flex items-center justify-center text-white relative ${
                      isOasisFocus ? 'bg-amber-950/90' : 'bg-slate-900'
                    }`}>
                      
                      {/* Avatar or Icon or Palm */}
                      {isOasisFocus ? (
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-xs sm:text-sm">🌴</span>
                          <span className="font-black text-[9px] text-amber-300 leading-none">{w.code}</span>
                        </div>
                      ) : hasStories && wStories[0]?.userAvatar ? (
                        <img 
                          src={wStories[0].userAvatar} 
                          alt={w.nameAr}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-black text-[11px] sm:text-xs text-amber-300">
                          {w.code}
                        </span>
                      )}

                      {/* Small badge count */}
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                        {w.activityCount}
                      </span>
                    </div>
                  </div>

                  {/* Pin Point Pointer */}
                  <div className={`w-2 h-2 rotate-45 -mt-1 shadow-xs ${
                    isOasisFocus ? 'bg-amber-500' : 'bg-slate-900 border-r border-b border-slate-600'
                  }`} />

                  {/* Wilaya Label Pill */}
                  <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap shadow-md transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 scale-105 ring-2 ring-white'
                      : isOasisFocus
                        ? 'bg-amber-500 text-slate-950 font-black border border-amber-300'
                        : 'bg-slate-900/90 text-slate-200 border border-white/10 group-hover:bg-emerald-600 group-hover:text-white'
                  }`}>
                    <span>{w.nameAr}</span>
                    {isOasisFocus && <span>🌴</span>}
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* ================= SHAMS MAP BOTTOM DRAWER / CARDS ================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/80 text-right space-y-4">
        
        {/* Drawer Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-xs ${
              activeWilaya.code === '30' || activeWilaya.code === '55'
                ? 'bg-gradient-to-tr from-amber-400 to-emerald-500 text-slate-950 ring-4 ring-amber-300/40'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {activeWilaya.code === '30' || activeWilaya.code === '55' ? '🌴' : activeWilaya.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  ولاية {activeWilaya.nameAr} ({activeWilaya.code}) — إقليم {activeWilaya.region}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeWilaya.code === '30' || activeWilaya.code === '55'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : activeWilaya.heatLevel === 'hot' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {activeWilaya.code === '30' ? '🌴 قطب الواحات والبترول' : activeWilaya.code === '55' ? '🌴 عاصمة وادي ريغ والتمور' : 'نشط ميدانياً'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {activeWilaya.activityCount} مشاريع تطوعية نشطة • {activeWilaya.volunteersCount}+ متطوع معتمد في الولاية
              </p>
            </div>
          </div>

          {/* Quick Actions for Selected Wilaya */}
          <div className="flex items-center gap-2">
            {wilayaStories.length > 0 && (
              <button
                onClick={() => setActiveStoryModal(wilayaStories[0])}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>مشاهدة ستوريات {activeWilaya.nameAr} ({wilayaStories.length})</span>
              </button>
            )}

            {onNavigateToChat && (
              <button
                onClick={onNavigateToChat}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>فتح المحادثات الميدانية</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Activities Cards Carousel in Selected Wilaya */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>مشاريع تطوعية جارية في ولاية {activeWilaya.nameAr}:</span>
            </h4>
            <span className="text-xs text-slate-500 font-bold">
              {wilayaActivities.length} مشروع معتمد
            </span>
          </div>

          {wilayaActivities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wilayaActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => onSelectActivity && onSelectActivity(act)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={act.coverImage} 
                      alt={act.title} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 group-hover:scale-105 transition"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {act.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {act.shortDescription}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-emerald-700 font-black">
                      +{act.basePoints} نقطة
                    </span>
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{act.enrolledCount} متطوع</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              لا توجد مشاريع مخصصة حالياً لولاية {activeWilaya.nameAr}، يمكنك إضافة مشروعك الأول عبر زر "نشر نشاط"!
            </div>
          )}
        </div>

        {/* Active Volunteers & Clubs in this Wilaya */}
        {wilayaVolunteers.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-900 mb-2.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>متطوعين ونوادي نشطة في {activeWilaya.nameAr}:</span>
            </h4>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {wilayaVolunteers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 p-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 shrink-0 transition"
                >
                  <img 
                    src={u.avatar} 
                    alt={u.name} 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold">
                      {u.points} نقطة
                    </div>
                  </div>

                  {/* Direct chat button */}
                  <button
                    onClick={() => {
                      openChatWithUser(u);
                      if (onNavigateToChat) onNavigateToChat();
                    }}
                    className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                    title={`محادثة خاصة مع ${u.name}`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
