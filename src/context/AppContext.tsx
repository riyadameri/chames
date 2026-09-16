import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Activity, 
  ActivitySubmission, 
  AffiliatedClub, 
  BlogPost, 
  SeasonInfo, 
  UserAccount, 
  UserRole,
  ProofItem 
} from '../types';
import { 
  INITIAL_ACTIVITIES, 
  INITIAL_BLOG_POSTS, 
  INITIAL_CLUBS, 
  INITIAL_SEASON, 
  INITIAL_USERS, 
  INITIAL_SUBMISSIONS 
} from '../data/mockData';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'points';
  title: string;
  message: string;
  pointsAdded?: number;
}

interface AppContextType {
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  switchUserRole: (role: UserRole) => void;
  allUsers: UserAccount[];
  individualUsers: UserAccount[];
  institutionUsers: UserAccount[];
  activities: Activity[];
  submissions: ActivitySubmission[];
  clubs: AffiliatedClub[];
  blogPosts: BlogPost[];
  season: SeasonInfo;
  
  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'enrolledCount' | 'completedCount'>) => void;
  applyToActivity: (activityId: string) => boolean;
  submitProof: (submissionId: string, data: { proofItems: ProofItem[]; generalNotes?: string; unitsCount?: number }) => boolean;
  evaluateSubmission: (
    submissionId: string, 
    evaluation: { approved: boolean; pointsAwarded: number; bonusPoints?: number; feedback: string }
  ) => void;
  addClub: (club: Omit<AffiliatedClub, 'id' | 'points' | 'joinedDate' | 'enrolledActivitiesCount'>) => void;
  enrollClubInActivity: (clubId: string, activityId: string) => void;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'publishedAt' | 'likes' | 'views'>) => void;
  toggleLikePost: (postId: string) => void;
  
  // UI helpers
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  
  // Activity specific modal / leaderboard
  selectedActivityId: string | null;
  setSelectedActivityId: (id: string | null) => void;
  getActivitySubmissions: (activityId: string) => ActivitySubmission[];
  getActivityLeaderboard: (activityId: string) => { user: UserAccount; points: number; units: number; itemsCount: number }[];
  getUserSubmissions: (userId: string) => ActivitySubmission[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'shams_users_v1',
  ACTIVITIES: 'shams_activities_v1',
  SUBMISSIONS: 'shams_submissions_v1',
  CLUBS: 'shams_clubs_v1',
  BLOGS: 'shams_blogs_v1',
  CURRENT_USER_ID: 'shams_current_user_id_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'user-ind-1'; // default to Amine Ben Salem (Individual volunteer)
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [submissions, setSubmissions] = useState<ActivitySubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [clubs, setClubs] = useState<AffiliatedClub[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLUBS);
    return saved ? JSON.parse(saved) : INITIAL_CLUBS;
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BLOGS);
    return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS;
  });

  const [season] = useState<SeasonInfo>(INITIAL_SEASON);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogPosts));
  }, [blogPosts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  // Derived current user
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const setCurrentUser = (user: UserAccount) => {
    setCurrentUserId(user.id);
  };

  const showToast = (toast: Omit<ToastNotification, 'id'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: Math.random().toString(36).substring(2, 9),
    };
    setToasts(prev => [newToast, ...prev]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchUserRole = (role: UserRole) => {
    let target = users.find(u => u.role === role);
    if (!target) {
      if (role === 'individual') target = users.find(u => u.id === 'user-ind-1');
      else if (role === 'institution') target = users.find(u => u.id === 'user-inst-1');
      else if (role === 'general_admin') target = users.find(u => u.id === 'admin-gen-1');
      else if (role === 'institution_admin') target = users.find(u => u.id === 'admin-inst-1');
      else if (role === 'evaluator_admin') target = users.find(u => u.id === 'admin-eval-1');
      else if (role === 'media_admin') target = users.find(u => u.id === 'admin-media-1');
    }
    if (target) {
      setCurrentUserId(target.id);
      showToast({
        type: 'info',
        title: 'تم تبديل الحساب التجريبي',
        message: `أنت تتصفح المنصة الآن بصفتك: ${target.name} (${getRoleTitle(target.role)})`,
      });
    }
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'individual': return 'متطوع فرد';
      case 'institution': return 'مؤسسة / جمعية / نادي';
      case 'general_admin': return 'المدير العام للمنصة (الوزارة)';
      case 'institution_admin': return 'مسؤول مؤسسة شبانية';
      case 'evaluator_admin': return 'مسؤول التقييم والمتابعة ومنح النقاط';
      case 'media_admin': return 'مسؤول الإعلام والميديا';
      default: return 'مستخدم';
    }
  };

  // Re-rank users based on points whenever points change
  const recalculateRanks = (usersList: UserAccount[]): UserAccount[] => {
    // Individuals
    const individuals = usersList
      .filter(u => u.role === 'individual')
      .sort((a, b) => b.points - a.points)
      .map((u, index) => ({ ...u, rank: index + 1 }));

    // Institutions
    const institutions = usersList
      .filter(u => u.role === 'institution')
      .sort((a, b) => b.points - a.points)
      .map((u, index) => ({ ...u, rank: index + 1 }));

    // Other roles unchanged
    const others = usersList.filter(u => u.role !== 'individual' && u.role !== 'institution');

    return [...individuals, ...institutions, ...others];
  };

  // Leaderboards separated
  const individualUsers = users.filter(u => u.role === 'individual').sort((a, b) => a.rank - b.rank);
  const institutionUsers = users.filter(u => u.role === 'institution').sort((a, b) => a.rank - b.rank);

  // Add new activity
  const addActivity = (activityData: Omit<Activity, 'id' | 'enrolledCount' | 'completedCount'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
      enrolledCount: 0,
      completedCount: 0,
    };
    setActivities(prev => [newActivity, ...prev]);
    showToast({
      type: 'success',
      title: 'تم نشر النشاط التطوعي بنجاح',
      message: `تم إدراج النشاط "${newActivity.title}" في المنصة وأصبح متاحاً للمشاركين.`,
    });
  };

  // Apply to an activity
  const applyToActivity = (activityId: string): boolean => {
    const targetActivity = activities.find(a => a.id === activityId);
    if (!targetActivity) return false;

    // Check if already applied
    const existing = submissions.find(s => s.activityId === activityId && s.userId === currentUser.id);
    if (existing) {
      showToast({
        type: 'warning',
        title: 'أنت مسجل بالفعل',
        message: 'لقد انضممت مسبقاً لهذا النشاط. يمكنك الآن تنفيذ المهام ورفع الإثباتات.',
      });
      return false;
    }

    const newSubmission: ActivitySubmission = {
      id: `sub-${Date.now()}`,
      activityId,
      activityTitle: targetActivity.title,
      activityCategory: targetActivity.category,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role === 'institution' ? 'institution' : 'individual',
      userAvatar: currentUser.avatar,
      institutionType: currentUser.institutionType,
      wilaya: currentUser.wilaya,
      status: 'in_progress',
      appliedAt: new Date().toISOString(),
      proofItems: [],
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // Increment enrolled count
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, enrolledCount: a.enrolledCount + 1 } : a));

    showToast({
      type: 'success',
      title: 'تم الانضمام بنجاح (Apply)',
      message: `تم تسجيلك في "${targetActivity.title}". عند انتهائك من العمل اضغط على "انتهت المهمة" لرفع الصور والمواقع وكسب النقاط!`,
    });
    return true;
  };

  // Submit proofs and mark mission completed
  const submitProof = (submissionId: string, data: { proofItems: ProofItem[]; generalNotes?: string; unitsCount?: number }): boolean => {
    const targetSub = submissions.find(s => s.id === submissionId);
    if (!targetSub) return false;

    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          proofItems: data.proofItems,
          generalNotes: data.generalNotes,
          unitsCount: data.unitsCount || data.proofItems.length || 1,
        };
      }
      return s;
    }));

    showToast({
      type: 'info',
      title: 'تم إرسال تقرير إتمام المهمة',
      message: `تم رفع ${data.proofItems.length} إثبات بالصور والمواقع. سيقوم مقيّم المنصة بمراجعة أعمالك واعتماد النقاط قريباً!`,
    });
    return true;
  };

  // Evaluate submission (Approve or Reject with Points)
  const evaluateSubmission = (
    submissionId: string,
    evaluation: { approved: boolean; pointsAwarded: number; bonusPoints?: number; feedback: string }
  ) => {
    const targetSub = submissions.find(s => s.id === submissionId);
    if (!targetSub) return;

    const totalPoints = evaluation.approved ? (evaluation.pointsAwarded + (evaluation.bonusPoints || 0)) : 0;

    // Update submission
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status: evaluation.approved ? 'approved' : 'rejected',
          evaluatedAt: new Date().toISOString(),
          evaluatorId: currentUser.id,
          evaluatorName: currentUser.name,
          pointsAwarded: evaluation.pointsAwarded,
          bonusPoints: evaluation.bonusPoints || 0,
          evaluatorFeedback: evaluation.feedback,
        };
      }
      return s;
    }));

    if (evaluation.approved) {
      // Update activity completed count
      setActivities(prev => prev.map(a => a.id === targetSub.activityId ? { ...a, completedCount: a.completedCount + 1 } : a));

      // Credit points to user & increase completed tasks count
      setUsers(prev => {
        const updated = prev.map(u => {
          if (u.id === targetSub.userId) {
            return {
              ...u,
              points: u.points + totalPoints,
              completedTasksCount: u.completedTasksCount + 1,
              hoursVolunteered: u.hoursVolunteered + 5, // auto estimate hours
            };
          }
          return u;
        });
        return recalculateRanks(updated);
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
        });
      } catch (e) {
        // ignore
      }

      showToast({
        type: 'points',
        title: 'تم اعتماد المهمة ومنح النقاط!',
        message: `تم منح ${totalPoints} نقطة للمشارك ${targetSub.userName} بنجاح.`,
        pointsAdded: totalPoints,
      });
    } else {
      showToast({
        type: 'warning',
        title: 'تم رفض التقرير أو طلب تعديل',
        message: `تم إرسال الملاحظات للمشارك: "${evaluation.feedback}".`,
      });
    }
  };

  // Add affiliated club
  const addClub = (clubData: Omit<AffiliatedClub, 'id' | 'points' | 'joinedDate' | 'enrolledActivitiesCount'>) => {
    const newClub: AffiliatedClub = {
      ...clubData,
      id: `club-${Date.now()}`,
      points: 100, // starter points
      joinedDate: new Date().toISOString().split('T')[0],
      enrolledActivitiesCount: 0,
    };
    setClubs(prev => [newClub, ...prev]);
    showToast({
      type: 'success',
      title: 'تم تسجيل النادي التابع بنجاح',
      message: `تمت إضافة "${newClub.name}" وربطه بالمؤسسة الشبانية.`,
    });
  };

  // Enroll club in activity
  const enrollClubInActivity = (clubId: string, activityId: string) => {
    const club = clubs.find(c => c.id === clubId);
    const act = activities.find(a => a.id === activityId);
    if (!club || !act) return;

    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, enrolledActivitiesCount: c.enrolledActivitiesCount + 1 } : c));
    showToast({
      type: 'success',
      title: 'تم إشراك النادي في النشاط',
      message: `تم تسجيل "${club.name}" رسمياً في نشاط "${act.title}".`,
    });
  };

  // Add blog post
  const addBlogPost = (postData: Omit<BlogPost, 'id' | 'publishedAt' | 'likes' | 'views'>) => {
    const newPost: BlogPost = {
      ...postData,
      id: `post-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      likes: 12,
      views: 45,
      likedByMe: false,
    };
    setBlogPosts(prev => [newPost, ...prev]);
    showToast({
      type: 'success',
      title: 'تم نشر المقال في شمس ميديا',
      message: `المقال "${newPost.title}" أصبح منشوراً ومتاحاً للجمهور.`,
    });
  };

  // Toggle like post
  const toggleLikePost = (postId: string) => {
    setBlogPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const currentlyLiked = !!p.likedByMe;
        return {
          ...p,
          likes: currentlyLiked ? p.likes - 1 : p.likes + 1,
          likedByMe: !currentlyLiked,
        };
      }
      return p;
    }));
  };

  // Submissions for a specific activity
  const getActivitySubmissions = (activityId: string) => {
    return submissions.filter(s => s.activityId === activityId);
  };

  // Activity-specific leaderboard
  const getActivityLeaderboard = (activityId: string) => {
    const approvedSubs = submissions.filter(s => s.activityId === activityId && s.status === 'approved');
    const userMap: { [userId: string]: { user: UserAccount; points: number; units: number; itemsCount: number } } = {};

    approvedSubs.forEach(sub => {
      const u = users.find(usr => usr.id === sub.userId) || {
        id: sub.userId,
        name: sub.userName,
        role: sub.userRole,
        avatar: sub.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        wilaya: sub.wilaya,
        points: sub.pointsAwarded || 0,
        rank: 1,
        completedTasksCount: 1,
        hoursVolunteered: 5,
        email: '',
        phone: '',
        badges: [],
      };

      const pts = (sub.pointsAwarded || 0) + (sub.bonusPoints || 0);
      const units = sub.unitsCount || sub.proofItems.length || 1;
      const count = sub.proofItems.length;

      if (!userMap[sub.userId]) {
        userMap[sub.userId] = { user: u, points: pts, units, itemsCount: count };
      } else {
        userMap[sub.userId].points += pts;
        userMap[sub.userId].units += units;
        userMap[sub.userId].itemsCount += count;
      }
    });

    return Object.values(userMap).sort((a, b) => b.points - a.points);
  };

  // Submissions of a user
  const getUserSubmissions = (userId: string) => {
    return submissions.filter(s => s.userId === userId);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserRole,
        allUsers: users,
        individualUsers,
        institutionUsers,
        activities,
        submissions,
        clubs,
        blogPosts,
        season,
        addActivity,
        applyToActivity,
        submitProof,
        evaluateSubmission,
        addClub,
        enrollClubInActivity,
        addBlogPost,
        toggleLikePost,
        toasts,
        removeToast,
        showToast,
        selectedActivityId,
        setSelectedActivityId,
        getActivitySubmissions,
        getActivityLeaderboard,
        getUserSubmissions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
