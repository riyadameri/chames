import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AffiliatedClub, InstitutionType } from '../types';
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
  Search
} from 'lucide-react';

interface InstitutionClubsViewProps {
  onOpenCreateActivity: () => void;
}

export const InstitutionClubsView: React.FC<InstitutionClubsViewProps> = ({ onOpenCreateActivity }) => {
  const { 
    clubs, 
    addClub, 
    enrollClubInActivity, 
    activities, 
    currentUser, 
    institutionUsers 
  } = useApp();

  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [selectedClubForEnroll, setSelectedClubForEnroll] = useState<AffiliatedClub | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');

  // Add Club Form state
  const [clubName, setClubName] = useState('');
  const [specialty, setSpecialty] = useState('بيئة وتشجير وطاقة خضراء');
  const [leaderName, setLeaderName] = useState('');
  const [phone, setPhone] = useState('0550 00 11 22');
  const [membersCount, setMembersCount] = useState(25);
  const [institutionName, setInstitutionName] = useState(
    currentUser.affiliatedInstitutionName || 'دار الشباب وادي قريش النموذجية'
  );

  const [searchClub, setSearchClub] = useState('');

  const canManageClubs = currentUser.role === 'institution_admin' || currentUser.role === 'general_admin' || currentUser.role === 'institution';

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim()) return;

    addClub({
      name: clubName.trim(),
      specialty: specialty.trim(),
      institutionId: currentUser.affiliatedInstitutionId || 'user-inst-1',
      institutionName: institutionName.trim(),
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

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(searchClub.toLowerCase()) || 
    c.specialty.toLowerCase().includes(searchClub.toLowerCase()) ||
    c.institutionName.toLowerCase().includes(searchClub.toLowerCase())
  );

  const getInstitutionTypeLabel = (type?: InstitutionType) => {
    switch (type) {
      case 'youth_house': return 'دار شباب';
      case 'sports_complex': return 'مركب رياضي جواري';
      case 'youth_hostel': return 'بيت شباب';
      case 'association': return 'جمعية معتمدة';
      case 'scout_org': return 'فوج كشفي';
      case 'club': return 'نادي شبابي';
      default: return 'هيكل شبابي';
    }
  };

  return (
    <div className="space-y-8 text-right">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-bold mb-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>الهياكل الشبانية والنوادي التابعة — وزارة الشباب والرياضة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            إدارة المؤسسات الشبانية والنوادي التابعة
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
            تتيح المنصة لدور الشباب والمركبات الرياضية تسجيل نواديها التخصصية (بيئة، روبوتيك، رياضة، مسعفين)، وإشراكها مباشرة في المشاريع التطوعية المفتوحة.
          </p>
        </div>

        {/* Action Buttons for Institution Admin */}
        <div className="flex flex-wrap items-center gap-3">
          {canManageClubs && (
            <button
              onClick={() => setShowAddClubModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة نادي تابع جديد للمؤسسة</span>
            </button>
          )}

          <button
            onClick={onOpenCreateActivity}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition"
          >
            نشر نشاط محلي للمؤسسة
          </button>
        </div>
      </div>

      {/* Directory of Youth Institutions Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-base text-slate-900">
              المؤسسات الشبانية والجمعيات المسجلة بالمنصة
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">{institutionUsers.length} مؤسسة وهيكل</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {institutionUsers.map((inst) => (
            <div
              key={inst.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={inst.avatar}
                  alt={inst.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{inst.name}</div>
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200">
                    {getInstitutionTypeLabel(inst.institutionType)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">{inst.wilaya}</span>
                <span className="font-black text-amber-700 font-mono">
                  {inst.points.toLocaleString()} ن
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliated Clubs Directory */}
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

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchClub}
              onChange={(e) => setSearchClub(e.target.value)}
              placeholder="ابحث بالنادي، التخصص، أو المؤسسة..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              className="p-5 rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-lg transition bg-white flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Club Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={club.avatar}
                      alt={club.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-black text-sm text-slate-900 leading-snug">{club.name}</h4>
                      <p className="text-[11px] text-emerald-700 font-bold">{club.specialty}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                    {club.points} ن
                  </span>
                </div>

                {/* Institution & Leader */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">الهيكل التابع له:</span>
                    <span className="font-bold text-slate-800 text-[11px]">{club.institutionName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">مسؤول النادي:</span>
                    <span className="font-medium text-slate-800 text-[11px]">{club.leaderName} ({club.phone})</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">عدد الأعضاء:</span>
                    <span className="font-bold text-emerald-700 text-[11px]">{club.membersCount} شاب متطوع</span>
                  </div>
                </div>

              </div>

              {/* Participation Stats & Enroll Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  مشارك في: <strong className="text-slate-800">{club.enrolledActivitiesCount}</strong> نشاط
                </span>

                {canManageClubs && (
                  <button
                    onClick={() => setSelectedClubForEnroll(club)}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-200 transition"
                  >
                    + إشراك في نشاط
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* ADD CLUB MODAL */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">إضافة نادي تابع للمؤسسة الشبانية</h3>
                  <p className="text-xs text-blue-100">تسجيل وتأهيل النادي للمشاركة في النشاطات</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddClubModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم النادي *</label>
                <input
                  type="text"
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="مثال: نادي أصدقاء الطبيعة والبيئة"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تخصص واهتمام النادي</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="مثال: بيئة، روبوتيك، رياضة، مسرح، إسعافات..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المشرف / القائد</label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="الاسم واللقب..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاتف التواصل</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عدد الأعضاء الشباب</label>
                  <input
                    type="number"
                    value={membersCount}
                    onChange={(e) => setMembersCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المؤسسة التابع لها</label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowAddClubModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md"
                >
                  حفظ وتسجيل النادي
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ENROLL CLUB IN ACTIVITY MODAL */}
      {selectedClubForEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                إشراك {selectedClubForEnroll.name} في نشاط
              </h3>
              <button
                onClick={() => setSelectedClubForEnroll(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              اختر النشاط التطوعي الذي سيشارك فيه هذا النادي لتسجيل الحضور وتوثيق الأعمال:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">النشاط التطوعي</label>
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="">-- اختر نشاطاً تطوعياً --</option>
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} ({act.wilaya})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setSelectedClubForEnroll(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
              >
                إلغاء
              </button>
              <button
                disabled={!selectedActivityId}
                onClick={handleConfirmEnrollClub}
                className="px-5 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md"
              >
                تأكيد الإشراك
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
