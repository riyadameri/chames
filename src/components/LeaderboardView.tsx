import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserAccount, ActivitySubmission } from '../types';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Medal, 
  Users, 
  Building2, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Eye, 
  X,
  ExternalLink,
  TreePine,
  ShieldCheck
} from 'lucide-react';

interface LeaderboardViewProps {
  onOpenProfile?: (user: UserAccount) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onOpenProfile }) => {
  const { 
    individualUsers, 
    institutionUsers, 
    season, 
    submissions, 
    activities 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'individuals' | 'institutions'>('individuals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<UserAccount | null>(null);

  const handleSelectUser = (u: UserAccount) => {
    if (onOpenProfile) {
      onOpenProfile(u);
    } else {
      setSelectedUserForProfile(u);
    }
  };

  const currentList = activeTab === 'individuals' ? individualUsers : institutionUsers;
  const currentPrizes = activeTab === 'individuals' ? season.individualPrizes : season.institutionPrizes;

  const filteredUsers = currentList.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.wilaya.toLowerCase().includes(q);
  });

  const top1 = currentList[0];
  const top2 = currentList[1];
  const top3 = currentList[2];

  // Helper to get verified submissions of a user
  const getUserApprovedSubmissions = (userId: string): ActivitySubmission[] => {
    return submissions.filter(s => s.userId === userId && s.status === 'approved');
  };

  return (
    <div className="space-y-10 text-right">
      
      {/* Header and Season Badges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>لوحة المتصدرين الوطنية المفتوحة لجميع المواطنين والهياكل</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            أبطال العطاء والتطوع — {season.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            نظام تقييم شفاف ومفتوح. يمكنك النقر على أي متطوع أو مؤسسة لمشاهدة معرض صور أعمالهم الميدانية ونقاطهم المعتمدة.
          </p>
        </div>

        {/* Category Switcher: Individuals vs Institutions */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('individuals')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition ${
              activeTab === 'individuals'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المتطوعون الأفراد ({individualUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('institutions')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition ${
              activeTab === 'institutions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>المؤسسات والنوادي ({institutionUsers.length})</span>
          </button>
        </div>
      </div>

      {/* 3 PODIUM WINNERS (الذهب، الفضة، البرونز) */}
      <div className="relative pt-6">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            المراكز الثلاثة الأولى المرشحة لجوائز وزارة الشباب والرياضة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
          
          {/* 2nd Place: Silver (الفضي) */}
          {top2 && (
            <div 
              onClick={() => handleSelectUser(top2)}
              className="bg-gradient-to-b from-slate-100 to-slate-200/90 rounded-3xl p-6 border-2 border-slate-300 shadow-lg text-center flex flex-col items-center relative order-2 md:order-1 hover:scale-102 transition duration-300 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-400 text-white font-black text-base flex items-center justify-center shadow-md absolute -top-5 border-2 border-white">
                2
              </div>

              <div className="relative mt-2 mb-3">
                <img
                  src={top2.avatar}
                  alt={top2.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-300 shadow-md group-hover:scale-105 transition"
                />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-500 text-white flex items-center justify-center text-xs shadow">
                  🥈
                </div>
              </div>

              <h4 className="font-black text-base text-slate-900 leading-tight">{top2.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{top2.wilaya}</p>

              <div className="my-3 px-4 py-1.5 rounded-full bg-white text-slate-800 font-mono font-black text-base shadow-xs border border-slate-200">
                {top2.points.toLocaleString()} نقطة
              </div>

              <div className="w-full pt-3 border-t border-slate-300/80 text-[11px] text-slate-600">
                <div className="font-bold text-slate-800">جائزة المركز الثاني (فضي):</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{currentPrizes[1]?.rewardValue}</div>
              </div>
            </div>
          )}

          {/* 1st Place: GOLD (الذهبي) */}
          {top1 && (
            <div 
              onClick={() => handleSelectUser(top1)}
              className="bg-gradient-to-b from-amber-100 via-amber-200/70 to-yellow-100 rounded-3xl p-7 border-2 border-amber-400 shadow-2xl text-center flex flex-col items-center relative order-1 md:order-2 md:-translate-y-4 hover:scale-102 transition duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-xl absolute -top-6 border-3 border-white animate-bounce">
                👑 1
              </div>

              <div className="relative mt-3 mb-3">
                <img
                  src={top1.avatar}
                  alt={top1.name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-amber-400 shadow-xl group-hover:scale-105 transition ring-4 ring-amber-400/30"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm shadow-md">
                  🥇
                </div>
              </div>

              <h4 className="font-black text-lg text-slate-950 leading-tight">{top1.name}</h4>
              <p className="text-xs text-amber-900 font-semibold mt-0.5">{top1.wilaya}</p>

              <div className="my-3 px-5 py-2 rounded-full bg-slate-950 text-amber-400 font-mono font-black text-lg shadow-md border border-amber-400/40">
                {top1.points.toLocaleString()} نقطة
              </div>

              <div className="w-full pt-3 border-t border-amber-300 text-xs text-amber-950">
                <div className="font-black text-amber-900 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>وسام شمس الذهبي الوطني:</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-800 mt-1">{currentPrizes[0]?.rewardValue}</div>
              </div>
            </div>
          )}

          {/* 3rd Place: Bronze (البرونزي) */}
          {top3 && (
            <div 
              onClick={() => handleSelectUser(top3)}
              className="bg-gradient-to-b from-orange-50 to-orange-100/90 rounded-3xl p-6 border-2 border-orange-300 shadow-lg text-center flex flex-col items-center relative order-3 hover:scale-102 transition duration-300 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-black text-base flex items-center justify-center shadow-md absolute -top-5 border-2 border-white">
                3
              </div>

              <div className="relative mt-2 mb-3">
                <img
                  src={top3.avatar}
                  alt={top3.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-orange-300 shadow-md group-hover:scale-105 transition"
                />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-800 text-white flex items-center justify-center text-xs shadow">
                  🥉
                </div>
              </div>

              <h4 className="font-black text-base text-slate-900 leading-tight">{top3.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{top3.wilaya}</p>

              <div className="my-3 px-4 py-1.5 rounded-full bg-white text-slate-800 font-mono font-black text-base shadow-xs border border-orange-200">
                {top3.points.toLocaleString()} نقطة
              </div>

              <div className="w-full pt-3 border-t border-orange-200 text-[11px] text-slate-600">
                <div className="font-bold text-slate-800">جائزة المركز الثالث (برونزي):</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{currentPrizes[2]?.rewardValue}</div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table header bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-base text-slate-900">
              قائمة الترتيب العام الكاملة ({filteredUsers.length})
            </h3>
            <p className="text-xs text-slate-500">انقر على أي اسم لمشاهدة ملف الإنجازات ومعرض الصور والمواقع</p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الولاية..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center">الترتيب</th>
                <th className="py-3 px-4">المشارك / الهيكل</th>
                <th className="py-3 px-4">الولاية</th>
                <th className="py-3 px-4 text-center">المهام المعتمدة</th>
                <th className="py-3 px-4 text-center">ساعات التطوع</th>
                <th className="py-3 px-4 text-left">مجموع النقاط</th>
                <th className="py-3 px-4 text-center">الأعمال الموثقة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="hover:bg-slate-50/80 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                      user.rank === 1
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                        : user.rank === 2
                        ? 'bg-slate-400 text-white'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.rank}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {user.role === 'institution' ? 'هيكل / مؤسسة شبابية' : 'متطوع فرد'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {user.wilaya}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {user.completedTasksCount} نشاط
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {user.hoursVolunteered} ساعة
                  </td>

                  <td className="py-3.5 px-4 text-left">
                    <span className="font-black text-amber-700 font-mono text-sm bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {user.points.toLocaleString()} ن
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معرض الأعمال</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* USER PROFILE & VERIFIED WORK GALLERY MODAL (معرض نتائج الأعمال للمستخدم المختار) */}
      {selectedUserForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserForProfile.avatar}
                  alt={selectedUserForProfile.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black">{selectedUserForProfile.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                      الترتيب #{selectedUserForProfile.rank}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedUserForProfile.wilaya} • {selectedUserForProfile.role === 'institution' ? 'مؤسسة شبانية' : 'متطوع فرد'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForProfile(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">رصيد النقاط التراكمي</span>
                  <span className="text-xl font-black text-amber-600 font-mono">
                    {selectedUserForProfile.points.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">النشاطات المعتمدة</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    {selectedUserForProfile.completedTasksCount}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">ساعات التطوع الموثقة</span>
                  <span className="text-xl font-black text-blue-600 font-mono">
                    {selectedUserForProfile.hoursVolunteered} س
                  </span>
                </div>
              </div>

              {/* Bio if exists */}
              {selectedUserForProfile.bio && (
                <div>
                  <h4 className="font-black text-xs text-slate-800 mb-1">نبذة عن النشاط</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedUserForProfile.bio}
                  </p>
                </div>
              )}

              {/* Badges */}
              {selectedUserForProfile.badges && selectedUserForProfile.badges.length > 0 && (
                <div>
                  <h4 className="font-black text-xs text-slate-800 mb-2">الأوسمة والشارات المكتسبة</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUserForProfile.badges.map(b => (
                      <span
                        key={b.id}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{b.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Works Gallery (معرض الصور والمواقع المعتمدة) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    معرض الأعمال الميدانية الموثقة بالصور والمواقع
                  </h4>
                  <span className="text-xs text-slate-500">
                    {getUserApprovedSubmissions(selectedUserForProfile.id).length} تقارير معتمدة
                  </span>
                </div>

                {getUserApprovedSubmissions(selectedUserForProfile.id).length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
                    لا توجد أعمال معتمدة منشورة بعد لهذا الحساب.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getUserApprovedSubmissions(selectedUserForProfile.id).map(sub => (
                      <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-slate-900">{sub.activityTitle}</h5>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            +{sub.pointsAwarded} نقطة معتمدة
                          </span>
                        </div>

                        {sub.generalNotes && (
                          <p className="text-xs text-slate-600 italic">
                            "{sub.generalNotes}"
                          </p>
                        )}

                        {/* Photos & Locations Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {sub.proofItems.map((proof, pidx) => (
                            <div key={pidx} className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                              <img
                                src={proof.photoUrl}
                                alt="إثبات العمل"
                                className="w-full h-32 object-cover"
                              />
                              <div className="p-2.5 text-[11px] space-y-1">
                                <div className="font-bold text-slate-800 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="truncate">{proof.locationName}</span>
                                </div>
                                {proof.description && (
                                  <div className="text-slate-600 text-[10px] line-clamp-2">
                                    {proof.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Evaluator feedback */}
                        {sub.evaluatorFeedback && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">ملاحظة مقيّم المنصة ({sub.evaluatorName || 'لجنة التقييم'}): </span>
                              <span>{sub.evaluatorFeedback}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedUserForProfile(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
