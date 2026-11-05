import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { ALGERIA_WILAYAS_GEO } from '../data/algeriaMapData';
import { WilayaMapLocation, Activity, UserAccount } from '../types';
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
    stories, 
    allUsers, 
    currentUser, 
    selectedMapWilaya, 
    setSelectedMapWilaya,
    setActiveStoryModal,
    openChatWithUser,
    setShowStreakModal
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'activities' | 'stories' | 'volunteers'>('all');
  const [mapTheme, setMapTheme] = useState<'dark' | 'voyager'>('dark');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Find Ouargla (30) & Touggourt (55) for prominent oasis focus
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

  // Filtered wilayas for search dropdown
  const filteredWilayas = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALGERIA_WILAYAS_GEO.filter(w => 
      w.nameAr.includes(q) || 
      w.name.toLowerCase().includes(q) || 
      w.code.includes(q)
    );
  }, [searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on real geographic center of Algeria [28.0339, 2.6322]
    const map = L.map(mapContainerRef.current, {
      center: [29.5, 3.5],
      zoom: window.innerWidth < 640 ? 4.8 : 5.4,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [17.5, -9.5], // Southwest Sahara bounds
        [38.5, 13.0]  // Northeast Mediterranean bounds
      ]
    });

    mapInstanceRef.current = map;

    // Initial TileLayer
    const tileUrl = mapTheme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Marker Layer Group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Fix map container size upon rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Map Theme updates
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const tileUrl = mapTheme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current.setUrl(tileUrl);
  }, [mapTheme]);

  // Render authentic Wilaya markers with emphasis on Ouargla (30) & Touggourt (55)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    ALGERIA_WILAYAS_GEO.forEach(wilaya => {
      const isSelected = activeWilaya.code === wilaya.code;
      const isOuargla = wilaya.code === '30';
      const isTouggourt = wilaya.code === '55';
      const isFeatured = isOuargla || isTouggourt;

      // Count actual activities for this wilaya
      const actCount = (activities || []).filter(a => matchWilaya(a.wilaya, wilaya.nameAr)).length || wilaya.activityCount;

      let iconHtml = '';
      let iconSize: [number, number] = [32, 32];
      let iconAnchor: [number, number] = [16, 16];

      if (isFeatured) {
        // Radiant Oasis Beacon for Ouargla & Touggourt
        iconSize = [54, 54];
        iconAnchor = [27, 27];
        const haloColor = isOuargla ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.45)';
        const borderColor = isOuargla ? '#f59e0b' : '#10b981';

        iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 54px; height: 54px; cursor: pointer;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background: ${haloColor}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 44px; height: 44px; border-radius: 9999px; background: #022c22; border: 2.5px solid ${borderColor}; box-shadow: 0 0 15px ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;">
              <span style="font-size: 14px; line-height: 1;">🌴</span>
              <span style="font-size: 9px; font-weight: 900; font-family: monospace; color: #fde047; margin-top: 1px;">${wilaya.code}</span>
            </div>
            <div style="position: absolute; bottom: -8px; background: #0f172a; color: #fff; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">
              ${wilaya.nameAr}
            </div>
          </div>
        `;
      } else {
        // Standard Wilaya Marker
        iconSize = [32, 32];
        iconAnchor = [16, 16];
        const bg = isSelected ? '#059669' : '#0f172a';
        const border = isSelected ? '#34d399' : '#334155';

        iconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; cursor: pointer;">
            <div style="width: 26px; height: 26px; border-radius: 9999px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 900; font-family: monospace; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
              ${wilaya.code}
            </div>
            ${actCount > 0 ? `
              <div style="position: absolute; top: -3px; right: -3px; width: 14px; height: 14px; border-radius: 9999px; background: #ea580c; color: white; font-size: 8px; font-weight: 900; display: flex; align-items: center; justify-content: center; border: 1px solid white;">
                ${actCount > 9 ? '9+' : actCount}
              </div>
            ` : ''}
          </div>
        `;
      }

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-algeria-marker',
        iconSize,
        iconAnchor
      });

      const marker = L.marker([wilaya.lat, wilaya.lng], { icon: customIcon });

      // Click to focus and select wilaya
      marker.on('click', () => {
        setSelectedMapWilaya(wilaya);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([wilaya.lat, wilaya.lng], 8, {
            duration: 1.2
          });
        }
      });

      marker.addTo(markersGroupRef.current!);
    });
  }, [activeWilaya.code, activities, setSelectedMapWilaya]);

  // Focus on specific wilaya
  const focusOnWilaya = (wilaya: WilayaMapLocation, zoom = 8) => {
    setSelectedMapWilaya(wilaya);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([wilaya.lat, wilaya.lng], zoom, {
        duration: 1.2
      });
    }
  };

  const resetToAlgeriaCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([29.5, 3.5], window.innerWidth < 640 ? 4.8 : 5.4, {
        duration: 1.2
      });
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4 py-2">
      
      {/* Stories Tray on Top of Map */}
      <StoriesTray />

      {/* ================= MAP CONTROLS & OASIS HIGHLIGHT BAR ================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-3.5 sm:p-5 shadow-xl border border-slate-800">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm">
                <MapPin className="w-3.5 h-3.5 fill-slate-950" />
                <span>شمس ماب 🗺️</span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                خريطة النشاطات التطوعية الحقيقية للجمهورية الجزائرية
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              خريطة جغرافية حية ودقيقة لكل ولايات الوطن (58 ولاية) مع تركيز خاص على واحات الجنوب ورقلة وتقرت 🌴
            </p>
          </div>

          {/* Map Controls */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Map Theme Toggle */}
            <button
              onClick={() => setMapTheme(prev => prev === 'dark' ? 'voyager' : 'dark')}
              className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="تغيير نمط الخريطة"
            >
              {mapTheme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>النمط النهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>النمط الليلي</span>
                </>
              )}
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5">
              <button
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                title="تكبير الخريطة"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                title="تصغير الخريطة"
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
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <span>تركيز سريع:</span>
          </span>

          {ouarglaWilaya && (
            <button
              onClick={() => focusOnWilaya(ouarglaWilaya, 9)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeWilaya.code === '30'
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-amber-400/40'
              }`}
            >
              <span>🌴 ورقلة (30)</span>
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded text-white font-mono">
                {wilayaActivities.length || ouarglaWilaya.activityCount} مشاريع
              </span>
            </button>
          )}

          {touggourtWilaya && (
            <button
              onClick={() => focusOnWilaya(touggourtWilaya, 9)}
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
            onClick={resetToAlgeriaCenter}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            كامل القطر الجزائري (58 ولاية)
          </button>

          {/* Quick Wilaya Search Input */}
          <div className="relative ml-auto">
            <div className="flex items-center bg-slate-800 rounded-xl px-2.5 py-1 border border-slate-700">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن ولاية..."
                className="bg-transparent text-xs text-white placeholder-slate-400 outline-none w-28 sm:w-36 text-right"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filtered Dropdown */}
            {filteredWilayas.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1 text-right">
                {filteredWilayas.map(w => (
                  <button
                    key={w.id}
                    onClick={() => {
                      focusOnWilaya(w, 8);
                      setSearchQuery('');
                    }}
                    className="w-full text-right p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>{w.nameAr}</span>
                    <span className="font-mono text-amber-400 text-[10px]">({w.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ================= LEAFLET GEOGRAPHIC ALGERIA MAP CONTAINER ================= */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 h-[480px] sm:h-[580px] w-full z-10">
        
        {/* Real Leaflet Map Mount Point */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected Wilaya Floating Badge (Top Right) */}
        <div className="absolute top-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div className="text-right">
            <div className="text-[10px] text-emerald-400 font-bold">الولاية المحددة:</div>
            <div className="text-sm font-black flex items-center gap-1.5">
              <span>{activeWilaya.nameAr}</span>
              <span className="text-amber-300 font-mono">({activeWilaya.code})</span>
              {(activeWilaya.code === '30' || activeWilaya.code === '55') && (
                <span className="text-xs">🌴 واحات الجنوب</span>
              )}
            </div>
          </div>
        </div>

        {/* Legend (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-20 bg-slate-950/85 backdrop-blur-md text-slate-300 px-3 py-2 rounded-xl border border-white/10 text-[10px] font-bold flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span>ورقلة وتقرت 🌴</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span>
            <span>باقي الولايات (58)</span>
          </div>
        </div>

      </div>

      {/* ================= WILAYA DETAIL DRAWER & ACTIVITIES LIST ================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        
        {/* Wilaya Header & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
              {activeWilaya.code === '30' || activeWilaya.code === '55' ? '🌴' : activeWilaya.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  ولاية {activeWilaya.nameAr}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                  {activeWilaya.region === 'جنوب' ? 'واحات الجنوب الجزائري' : `إقليم ${activeWilaya.region}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {wilayaActivities.length} مشاريع تطوعية نشطة • {wilayaVolunteers.length} متطوعين مسجلين • {wilayaStories.length} ستوريات
              </p>
            </div>
          </div>

          {/* Filter Tabs for this Wilaya */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({wilayaActivities.length + wilayaStories.length})
            </button>
            <button
              onClick={() => setActiveFilter('activities')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'activities' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>المشاريع ({wilayaActivities.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('stories')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'stories' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-rose-600" />
              <span>الستوريات ({wilayaStories.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('volunteers')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                activeFilter === 'volunteers' ? 'bg-white text-indigo-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>المتطوعين ({wilayaVolunteers.length})</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-5 space-y-5">
          
          {/* ACTIVITIES IN THIS WILAYA */}
          {(activeFilter === 'all' || activeFilter === 'activities') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>المشاريع التطوعية المفتوحة في {activeWilaya.nameAr}:</span>
                </h4>
              </div>

              {wilayaActivities.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                  لا توجد مشاريع تطوعية نشطة حالياً في ولاية {activeWilaya.nameAr}. يمكنك اقتراح مبادرة جديدة!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {wilayaActivities.map(act => (
                    <div
                      key={act.id}
                      onClick={() => onSelectActivity && onSelectActivity(act)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/40 transition cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={act.coverImage} 
                          alt={act.title} 
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 line-clamp-1">
                            {act.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                            {act.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          +{act.basePoints} نقطة
                        </span>
                        <span className="text-slate-500 flex items-center gap-1 font-medium">
                          <span>{act.enrolledCount} متطوع</span>
                          <span>←</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STORIES IN THIS WILAYA */}
          {(activeFilter === 'all' || activeFilter === 'stories') && wilayaStories.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-rose-600" />
                <span>ستوريات ولحظات التطوع من {activeWilaya.nameAr}:</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {wilayaStories.map(story => (
                  <div
                    key={story.id}
                    onClick={() => setActiveStoryModal(story)}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200"
                  >
                    <img 
                      src={story.mediaUrl || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80'} 
                      alt={story.userName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 p-2 flex flex-col justify-between text-white">
                      <div className="flex items-center gap-1">
                        <img 
                          src={story.userAvatar} 
                          alt={story.userName} 
                          className="w-5 h-5 rounded-full border border-white"
                        />
                        <span className="text-[10px] font-bold truncate">{story.userName}</span>
                      </div>
                      <p className="text-[10px] line-clamp-2 font-medium">
                        {story.caption || 'نشاط تطوعي ممتع ✨'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE VOLUNTEERS IN THIS WILAYA */}
          {(activeFilter === 'all' || activeFilter === 'volunteers') && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>متطوعو ونشطاء ولاية {activeWilaya.nameAr}:</span>
              </h4>

              {wilayaVolunteers.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs">
                  كن أول متطوع يسجل من ولاية {activeWilaya.nameAr}!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {wilayaVolunteers.map(user => (
                    <div
                      key={user.id}
                      className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div 
                        onClick={() => onSelectUser && onSelectUser(user)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                      >
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {user.points} نقطة • ستريك 🔥 {user.streakCount || 7}
                          </div>
                        </div>
                      </div>

                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            openChatWithUser(user);
                            if (onNavigateToChat) onNavigateToChat();
                          }}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer shrink-0"
                          title="بدء محادثة خاصة 💬"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
