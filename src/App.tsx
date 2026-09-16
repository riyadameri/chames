import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSeasonBanner } from './components/HeroSeasonBanner';
import { ActivitiesView } from './components/ActivitiesView';
import { LeaderboardView } from './components/LeaderboardView';
import { EvaluationQueueView } from './components/EvaluationQueueView';
import { InstitutionClubsView } from './components/InstitutionClubsView';
import { MediaBlogView } from './components/MediaBlogView';
import { UserWorkspaceView } from './components/UserWorkspaceView';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { SubmitProofModal } from './components/SubmitProofModal';
import { CreateActivityModal } from './components/CreateActivityModal';
import { ToastContainer } from './components/ToastContainer';
import { Activity } from './types';
import { 
  Compass, 
  Trophy, 
  ShieldCheck, 
  Building2, 
  Newspaper, 
  Sparkles, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, submissions, season } = useApp();

  const [activeTab, setActiveTab] = useState<string>('activities');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [submissionIdForProof, setSubmissionIdForProof] = useState<string | null>(null);
  const [showCreateActivityModal, setShowCreateActivityModal] = useState<boolean>(false);

  // Submissions for current user needing proof
  const pendingProofSub = submissions.find(
    s => s.userId === currentUser.id && s.status === 'in_progress'
  );

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
      
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Season Banner (shown at top of Activities and Leaderboard tabs) */}
        {(activeTab === 'activities' || activeTab === 'leaderboard') && (
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
        {activeTab === 'activities' && (
          <ActivitiesView 
            onSelectActivity={(act) => setSelectedActivity(act)}
            onOpenSubmitProof={(subId) => setSubmissionIdForProof(subId)}
            onOpenCreateActivity={() => setShowCreateActivityModal(true)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView />
        )}

        {activeTab === 'evaluator' && (
          <EvaluationQueueView />
        )}

        {activeTab === 'institutions' && (
          <InstitutionClubsView 
            onOpenCreateActivity={() => setShowCreateActivityModal(true)}
          />
        )}

        {activeTab === 'media' && (
          <MediaBlogView />
        )}

        {activeTab === 'workspace' && (
          <UserWorkspaceView 
            onOpenSubmitProof={(subId) => setSubmissionIdForProof(subId)}
            onExploreActivities={() => setActiveTab('activities')}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-10 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow">
              ش
            </div>
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

      {/* MODALS */}
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
