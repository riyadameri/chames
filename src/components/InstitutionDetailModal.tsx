import React from 'react';
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
  ExternalLink
} from 'lucide-react';

interface InstitutionDetailModalProps {
  institution?: User | null;
  club?: AffiliatedClub | null;
  onClose: () => void;
  onSelectActivity: (activity: Activity) => void;
}

export const InstitutionDetailModal: React.FC<InstitutionDetailModalProps> = ({
  institution,
  club,
  onClose,
  onSelectActivity
}) => {
  const { activities, clubs, individualUsers, institutionUsers, submissions } = useApp();

  const title = club ? club.name : (institution ? institution.name : '');
  const subtitle = club ? `نادي شبابي تابع لـ ${club.institutionName}` : (institution ? 'هيكل شبابي معتمد - وزارة الشباب والرياضة' : '');
  const wilaya = club ? (institution?.wilaya || 'الجزائر العاصمة') : (institution?.wilaya || 'الجزائر');
  const points = club ? club.points : (institution ? institution.points : 0);
  const avatar = club ? club.avatar : (institution?.avatar || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80');

  // Related activities: activities created by this institution or targeted to institutions, or relevant to clubs
  const relatedActivities = activities.filter(a => {
    if (club && (a.targetAudience === 'institutions' || a.targetAudience === 'all')) return true;
    if (institution && (a.institutionId === institution.id || a.targetAudience === 'institutions' || a.targetAudience === 'all')) return true;
    return false;
  });

  // Affiliated clubs for this institution
  const institutionClubs = institution ? clubs.filter(c => 
    c.institutionId === institution.id || c.institutionName.includes(institution.name)
  ) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cover header */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img
              src={avatar}
              alt={title}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
            />

            <div className="flex-1 text-center sm:text-right space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black">{title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
                  {club ? 'نادي تخصصي' : 'مؤسسة شبانية'}
                </span>
              </div>

              <p className="text-xs text-blue-200">{subtitle}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-blue-100/90 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  ولاية {wilaya}
                </span>
                {club && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    {club.membersCount} عضو متطوع
                  </span>
                )}
                {club && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    {club.phone} ({club.leaderName})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Points & Stats bar */}
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 bg-slate-50 border-b border-slate-200 text-center py-4">
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              {points.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-slate-500">رصيد النقاط التراكمي</div>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono">
              {relatedActivities.length}
            </div>
            <div className="text-[11px] font-bold text-slate-500">المشاريع المرتبطة</div>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
              {club ? `${club.membersCount}` : `${institutionClubs.length} نوادي`}
            </div>
            <div className="text-[11px] font-bold text-slate-500">
              {club ? 'عضو نشط' : 'نوادي تابعة'}
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          
          {/* Institution's Sub-Clubs if viewing an institution */}
          {institution && institutionClubs.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>النوادي التابعة لهذا الهيكل ({institutionClubs.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {institutionClubs.map(c => (
                  <div 
                    key={c.id}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{c.name}</div>
                        <div className="text-[10px] text-emerald-700">{c.specialty}</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-amber-700 shrink-0">{c.points} ن</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities list for this institution / club */}
          <div className="space-y-3">
            <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>النشاطات والمشاريع المفتوحة والمشاركة ({relatedActivities.length})</span>
            </h4>

            {relatedActivities.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                لا توجد نشاطات مسجلة حالياً لهذا الهيكل.
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
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-slate-50/70 transition flex items-center justify-between gap-3 cursor-pointer group"
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
                          <span>{act.enrolledCount} مشارك</span>
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

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
