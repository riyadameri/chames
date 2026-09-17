import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSeasonBanner } from './components/HeroSeasonBanner';
import { ActivitiesView } from './components/ActivitiesView';
import { LeaderboardView } from './components/LeaderboardView';
import { EvaluationQueueView } from './components/EvaluationQueueView';
import { InstitutionClubsView } from './components/InstitutionClubsView';
import { MediaBlogView } from './components/MediaBlogView';
import { GeneralFeedView } from './components/GeneralFeedView';
import { UserWorkspaceView } from './components/UserWorkspaceView';
import { ProfilePageView } from './components/ProfilePageView';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { InstitutionDetailModal } from './components/InstitutionDetailModal';
import { SubmitProofModal } from './components/SubmitProofModal';
import { CreateActivityModal } from './components/CreateActivityModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { Activity, User, UserRole, AffiliatedClub } from './types';
import { 
  Compass, 
  Trophy, 
  ShieldCheck, 
  Building2, 
  Newspaper, 
  Sparkles, 
  HeartHandshake,
  CheckCircle2,
  LayoutGrid,
  User as UserIcon
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    currentUser, 
    submissions, 
    season, 
    authModalState, 
    openAuthModal, 
    closeAuthModal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('activities');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [submissionIdForProof, setSubmissionIdForProof] = useState<string | null>(null);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState<boolean>(false);
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);
  const [selectedInstitutionForDetails, setSelectedInstitutionForDetails] = useState<User | null>(null);
  const [selectedClubForDetails, setSelectedClubForDetails] = useState<AffiliatedClub | null>(null);

  const pendingReviewsCount = submissions.filter(s => s.status === 'submitted').length;

  const navigateToProfile = (targetUser?: User) => {
    setViewingProfileUser(targetUser || currentUser);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submissions for current user needing proof
  const pendingProofSub = submissions.find(
    s => s.userId === currentUser.id && s.status === 'in_progress'
  );

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
      
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Top Navigation with Search */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onSelectTab={setActiveTab} 
        onOpenCreateActivity={() => setShowCreateActivityModal(true)}
        onOpenProfile={() => navigateToProfile(currentUser)}
        onOpenLogin={() => openAuthModal('login')}
        onOpenRegister={() => openAuthModal('register')}
        onSelectActivity={(act) => setSelectedActivity(act)}
        onSelectUser={(u) => navigateToProfile(u)}
        onSelectClub={(c) => setSelectedClubForDetails(c)}
        onSelectInstitution={(inst) => setSelectedInstitutionForDetails(inst)}
      />

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 space-y-6 sm:space-y-8">
        
        {/* Season Banner (shown at top of Activities tab) */}
        {activeTab === 'activities' && (
          <HeroSeasonBanner 
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
            onOpenActivities={() => setActiveTab('activities')}
          />
        )}

        {/* Floating Quick Action Reminder for In-Progress Task */}
        {pendingProofSub && activeTab !== 'workspace' && (
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-right animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-200">لديك مهمة جارية لم ترفع إثباتاتها بعد:</div>
                <div className="font-black text-sm">{pendingProofSub.activityTitle}</div>
              </div>
            </div>

            <button
              onClick={() => setSubmissionIdForProof(pendingProofSub.id)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black shadow transition shrink-0 cursor-pointer"
            >
              رفع الصور والموقع (انتهت المهمة)
            </button>
          </div>
        )}

        {/* MAIN TAB ROUTING */}
        {activeTab === 'feed' && (
          <GeneralFeedView 
            onSelectUser={(u) => navigateToProfile(u)}
            onSelectActivity={(actId) => {
              // find and set
              setActiveTab('activities');
            }}
            onOpenRegister={() => openAuthModal('register')}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitiesView 
            onSelectActivity={(act) => setSelectedActivity(act)}
            onOpenSubmitProof={(subId) => setSubmissionIdForProof(subId)}
            onOpenCreateActivity={() => setShowCreateActivityModal(true)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView onOpenProfile={(u) => navigateToProfile(u)} />
        )}

        {activeTab === 'evaluator' && (
          <EvaluationQueueView />
        )}

        {activeTab === 'institutions' && (
          <InstitutionClubsView 
            onOpenCreateActivity={() => setShowCreateActivityModal(true)}
            onSelectActivity={(act) => setSelectedActivity(act)}
          />
        )}

        {activeTab === 'media' && (
          <MediaBlogView />
        )}

        {activeTab === 'profile' && (
          <ProfilePageView 
            user={viewingProfileUser || currentUser}
            onBack={() => setActiveTab('activities')}
            onSelectUser={(u) => navigateToProfile(u)}
            onSelectActivity={(act) => setSelectedActivity(act)}
          />
        )}

        {activeTab === 'workspace' && (
          <UserWorkspaceView 
            onOpenSubmitProof={(subId) => setSubmissionIdForProof(subId)}
            onExploreActivities={() => setActiveTab('activities')}
            onOpenProfile={() => navigateToProfile(currentUser)}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-14 mb-16 md:mb-0 border-t border-slate-200 bg-white py-10 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <img 
              src="/assets/logo.png" 
              alt="شعار شمس التطوع" 
              className="h-8 w-auto max-w-[100px] object-contain rounded-lg"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
            <span className="font-black text-base text-slate-800">منصة شمس التطوع</span>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              الجمهورية الجزائرية الديمقراطية الشعبية
            </span>
          </div>

          <p className="max-w-xl mx-auto text-slate-500 leading-relaxed">
            المنصة الرقمية الوطنية لتنسيق ومتابعة العمل التطوعي لدى الشباب، الجمعيات، دور الشباب والمركبات الرياضية تحت إشراف وزارة الشباب والرياضة.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span>نظام النقاط المستمر</span>
            <span>•</span>
            <span>توثيق الصور والمواقع الجغرافية</span>
            <span>•</span>
            <span>جوائز المواسم السنوية (ذهب، فضة، برونز)</span>
            <span>•</span>
            <span>58 ولاية جزائرية</span>
          </div>
        </div>
      </footer>

      {/* PROFESSIONAL MOBILE BOTTOM NAVIGATION BAR */}
      <nav 
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 md:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
          {/* Feed */}
          <button
            onClick={() => {
              setActiveTab('feed');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer min-h-[48px] ${
              activeTab === 'feed'
                ? 'text-emerald-700 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'feed' ? 'bg-emerald-100 text-emerald-800 scale-110' : ''}`}>
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">اللوحة</span>
          </button>

          {/* Activities */}
          <button
            onClick={() => {
              setActiveTab('activities');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer min-h-[48px] ${
              activeTab === 'activities'
                ? 'text-emerald-700 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'activities' ? 'bg-emerald-100 text-emerald-800 scale-110' : ''}`}>
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">النشاطات</span>
          </button>

          {/* Evaluation Queue with Counter Badge */}
          <button
            onClick={() => {
              setActiveTab('evaluator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer min-h-[48px] ${
              activeTab === 'evaluator'
                ? 'text-rose-700 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`relative p-1 rounded-lg transition ${activeTab === 'evaluator' ? 'bg-rose-100 text-rose-800 scale-110' : ''}`}>
              <ShieldCheck className="w-5 h-5" />
              {pendingReviewsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {pendingReviewsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">التقييم</span>
          </button>

          {/* Institutions / Clubs */}
          <button
            onClick={() => {
              setActiveTab('institutions');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer min-h-[48px] ${
              activeTab === 'institutions'
                ? 'text-blue-700 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'institutions' ? 'bg-blue-100 text-blue-800 scale-110' : ''}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">الهياكل</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => {
              setViewingProfileUser(null);
              setActiveTab('profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer min-h-[48px] ${
              activeTab === 'profile'
                ? 'text-emerald-800 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'profile' ? 'bg-emerald-100 text-emerald-800 scale-110' : ''}`}>
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">حسابي</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      {authModalState.isOpen && (
        <AuthModal 
          isOpen={authModalState.isOpen}
          initialMode={authModalState.mode}
          initialRole={authModalState.role}
          onClose={closeAuthModal}
        />
      )}

      {selectedActivity && (
        <ActivityDetailModal 
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onOpenSubmitProof={(subId) => setSubmissionIdForProof(subId)}
        />
      )}

      {submissionIdForProof && (
        <SubmitProofModal 
          submissionId={submissionIdForProof}
          onClose={() => setSubmissionIdForProof(null)}
        />
      )}

      {showCreateActivityModal && (
        <CreateActivityModal 
          onClose={() => setShowCreateActivityModal(false)}
        />
      )}

      {selectedInstitutionForDetails && (
        <InstitutionDetailModal 
          institution={selectedInstitutionForDetails}
          onClose={() => setSelectedInstitutionForDetails(null)}
          onSelectActivity={(act) => {
            setSelectedInstitutionForDetails(null);
            setSelectedActivity(act);
          }}
        />
      )}

      {selectedClubForDetails && (
        <InstitutionDetailModal 
          club={selectedClubForDetails}
          onClose={() => setSelectedClubForDetails(null)}
          onSelectActivity={(act) => {
            setSelectedClubForDetails(null);
            setSelectedActivity(act);
          }}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
