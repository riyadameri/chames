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
  ProofItem,
  InstitutionType,
  RegisterUserPayload,
  UserPost,
  PostComment,
  ReactionType,
  NotificationItem,
  AppNotificationType,
  UpdateUserProfilePayload
} from '../types';
import { 
  INITIAL_ACTIVITIES, 
  INITIAL_BLOG_POSTS, 
  INITIAL_CLUBS, 
  INITIAL_SEASON, 
  INITIAL_USERS, 
  INITIAL_SUBMISSIONS 
} from '../data/mockData';
import { INITIAL_USER_POSTS } from '../data/mockPosts';
import { INITIAL_NOTIFICATIONS } from '../data/initialNotifications';

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
  isLoggedIn: boolean;
  authModalState: { isOpen: boolean; mode: 'login' | 'register'; role?: UserRole };
  openAuthModal: (mode?: 'login' | 'register', role?: UserRole) => void;
  closeAuthModal: () => void;
  requireAuth: (actionDescription?: string) => boolean;
  registerUser: (payload: RegisterUserPayload) => { success: boolean; message: string; user?: UserAccount };
  loginUser: (payload: { emailOrPhone: string; password?: string }) => { success: boolean; message: string; user?: UserAccount };
  logoutUser: () => void;
  allUsers: UserAccount[];
  individualUsers: UserAccount[];
  institutionUsers: UserAccount[];
  activities: Activity[];
  submissions: ActivitySubmission[];
  clubs: AffiliatedClub[];
  blogPosts: BlogPost[];
  season: SeasonInfo;
  
  // User Posts & Social Feed
  posts: UserPost[];
  createPost: (payload: { content: string; imageUrl?: string; activityTag?: string }) => { success: boolean; message: string; post?: UserPost };
  editPost: (postId: string, payload: { content: string; imageUrl?: string; activityTag?: string }) => { success: boolean; message: string };
  deletePost: (postId: string) => void;
  togglePostReaction: (postId: string, reactionType: ReactionType) => void;
  addPostComment: (postId: string, content: string) => { success: boolean; message: string };
  
  // Profile Management & System Data
  updateUserProfile: (payload: UpdateUserProfilePayload) => { success: boolean; message: string; user?: UserAccount };
  resetAllData: (mode?: 'empty' | 'demo') => void;
  mongoDbStatus: {
    connected: boolean;
    database: string;
    replicaSet?: string;
    pingMs?: number;
    collections?: string[];
    counts?: Record<string, number>;
  } | null;
  isSyncingDb: boolean;
  syncNowWithMongoDb: () => Promise<void>;
  
  // Subscriptions & Follows
  toggleSubscription: (targetUserId: string) => void;
  isSubscribedTo: (targetUserId: string) => boolean;
  getUserSubscribersCount: (targetUserId: string) => number;
  getUserSubscriptionsCount: (userId: string) => number;

  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'enrolledCount' | 'completedCount'>) => void;
  applyToActivity: (activityId: string) => boolean;
  submitProof: (submissionId: string, data: { proofItems: ProofItem[]; generalNotes?: string; unitsCount?: number }) => boolean;
  evaluateSubmission: (
    submissionId: string, 
    evaluation: { approved: boolean; pointsAwarded: number; bonusPoints?: number; feedback: string }
  ) => void;
  addClub: (club: Omit<AffiliatedClub, 'id' | 'points' | 'joinedDate' | 'enrolledActivitiesCount'>) => void;
  deleteClub: (clubId: string) => void;
  enrollClubInActivity: (clubId: string, activityId: string) => void;
  deleteUserAccount: (userId: string) => { success: boolean; message: string };
  addBlogPost: (post: Omit<BlogPost, 'id' | 'publishedAt' | 'likes' | 'views'>) => void;
  toggleLikePost: (postId: string) => void;
  toggleBlogPostReaction: (postId: string, reactionType: ReactionType) => void;
  addBlogPostComment: (postId: string, content: string) => { success: boolean; message: string };
  repostToProfile: (postId: string, type: 'blog' | 'post') => { success: boolean; message: string };
  isShamsAdmin: boolean;
  
  // UI helpers
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  
  // Notification System
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  simulateDemoNotification: (type?: AppNotificationType) => void;

  // Activity specific modal / leaderboard
  selectedActivityId: string | null;
  setSelectedActivityId: (id: string | null) => void;
  getActivitySubmissions: (activityId: string) => ActivitySubmission[];
  getActivityLeaderboard: (activityId: string) => { user: UserAccount; points: number; units: number; itemsCount: number }[];
  getUserSubmissions: (userId: string) => ActivitySubmission[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'shams_users_v2',
  ACTIVITIES: 'shams_activities_v2',
  SUBMISSIONS: 'shams_submissions_v2',
  CLUBS: 'shams_clubs_v2',
  BLOGS: 'shams_blogs_v2',
  CURRENT_USER_ID: 'shams_current_user_id_v2',
  IS_LOGGED_IN: 'shams_is_logged_in_v2',
  POSTS: 'shams_user_posts_v2',
  SUBSCRIPTIONS: 'shams_subscriptions_v2',
  NOTIFICATIONS: 'shams_notifications_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults, ensuring official staff accounts always exist with their exact credentials
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    let loaded: UserAccount[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loaded = parsed;
        }
      } catch (e) {}
    }
    const merged = [...loaded];
    // Guarantee all 5 official staff accounts exist and have their exact usernames, passwords, and roles
    for (const official of INITIAL_USERS) {
      const idx = merged.findIndex(u => u.id === official.id || (official.username && u.username === official.username));
      if (idx >= 0) {
        merged[idx] = {
          ...merged[idx],
          ...official,
          password: official.password,
          username: official.username,
          role: official.role,
          name: official.name,
        };
      } else {
        merged.push(official);
      }
    }
    return merged.length > 0 ? merged : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'admin-gen-1'; // Default to General Admin Riyad
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return saved !== null ? JSON.parse(saved) : false;
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

  const [posts, setPosts] = useState<UserPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    return saved ? JSON.parse(saved) : INITIAL_USER_POSTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [subscriptions, setSubscriptions] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return saved ? JSON.parse(saved) : {};
  });

  const [season] = useState<SeasonInfo>(INITIAL_SEASON);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Direct MongoDB Database State
  const [mongoDbStatus, setMongoDbStatus] = useState<{
    connected: boolean;
    database: string;
    replicaSet?: string;
    pingMs?: number;
    collections?: string[];
    counts?: Record<string, number>;
  } | null>(null);
  const [isSyncingDb, setIsSyncingDb] = useState<boolean>(false);

  // Direct MongoDB Bootstrap on initial load
  useEffect(() => {
    let isMounted = true;
    async function initDatabase() {
      try {
        const res = await fetch('/api/db/status');
        if (res.ok) {
          const status = await res.json();
          if (isMounted) setMongoDbStatus(status);
        }

        const bootRes = await fetch('/api/db/bootstrap');
        if (bootRes.ok) {
          const bootData = await bootRes.json();
          if (bootData.success && bootData.data) {
            const { users: u, activities: a, submissions: s, posts: p, clubs: c, notifications: n, blogs: b } = bootData.data;
            if (Array.isArray(u) && u.length > 0) {
              if (isMounted) setUsers(u);
            } else {
              // Initial bootstrap into empty MongoDB shames database
              await fetch('/api/db/sync-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  users,
                  activities,
                  submissions,
                  posts,
                  clubs,
                  notifications,
                  blogs: blogPosts
                })
              });
            }
            if (Array.isArray(a) && a.length > 0 && isMounted) setActivities(a);
            if (Array.isArray(s) && s.length > 0 && isMounted) setSubmissions(s);
            if (Array.isArray(p) && p.length > 0 && isMounted) setPosts(p);
            if (Array.isArray(c) && c.length > 0 && isMounted) setClubs(c);
            if (Array.isArray(n) && n.length > 0 && isMounted) setNotifications(n);
            if (Array.isArray(b) && b.length > 0 && isMounted) setBlogPosts(b);
          }
        }
      } catch (err) {
        console.warn('MongoDB direct connection warning:', err);
      }
    }

    initDatabase();
    return () => { isMounted = false; };
  }, []);

  // Manual and automated MongoDB synchronization
  const syncNowWithMongoDb = async () => {
    try {
      setIsSyncingDb(true);
      const res = await fetch('/api/db/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users,
          activities,
          submissions,
          posts,
          clubs,
          notifications,
          blogs: blogPosts
        })
      });
      if (res.ok) {
        const statRes = await fetch('/api/db/status');
        if (statRes.ok) {
          const s = await statRes.json();
          setMongoDbStatus(s);
        }
      }
    } catch (err) {
      console.warn('Sync with MongoDB error:', err);
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Debounced background sync to MongoDB database 'shames'
  useEffect(() => {
    const timer = setTimeout(() => {
      syncNowWithMongoDb();
    }, 1500);
    return () => clearTimeout(timer);
  }, [users, activities, submissions, posts, clubs, notifications, blogPosts]);

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
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  // Derived current user
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const setCurrentUser = (user: UserAccount) => {
    setCurrentUserId(user.id);
    setIsLoggedIn(true);
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

  // Auth modal central control
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register'; role?: UserRole }>({
    isOpen: false,
    mode: 'login'
  });

  const openAuthModal = (mode: 'login' | 'register' = 'login', role?: UserRole) => {
    setAuthModalState({ isOpen: true, mode, role });
  };

  const closeAuthModal = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Enforce authentication gate for protected user actions (enrolling, posting, commenting, reacting, submitting)
  const requireAuth = (actionDescription?: string): boolean => {
    if (!isLoggedIn) {
      showToast({
        type: 'warning',
        title: 'تسجيل الدخول مطلوب 🔒',
        message: actionDescription 
          ? `يرجى تسجيل الدخول أو إنشاء حساب لتتمكن من ${actionDescription}.`
          : 'يرجى تسجيل الدخول أو إنشاء حساب لتتمكن من المتابعة.',
      });
      openAuthModal('login');
      return false;
    }
    return true;
  };

  // Notification Operations
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast({
      type: 'info',
      title: 'تم تحديث الإشعارات',
      message: 'تم تحديد جميع الإشعارات كمقروءة.',
    });
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast({
      type: 'info',
      title: 'تم مسح الإشعارات',
      message: 'تم تفريغ قائمة الإشعارات والتنبيهات بنجاح.',
    });
  };

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'الآن',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Also trigger toast for real-time immediate pop-up
    showToast({
      type: notifData.type === 'points_earned' ? 'points' : 'info',
      title: notifData.title,
      message: notifData.message,
      pointsAdded: notifData.points,
    });
  };

  const simulateDemoNotification = (chosenType?: AppNotificationType) => {
    const types: AppNotificationType[] = [
      'points_earned',
      'post_liked',
      'post_comment',
      'new_activity',
      'badge_earned',
      'submission_approved'
    ];
    const type = chosenType || types[Math.floor(Math.random() * types.length)];

    if (type === 'points_earned') {
      const pts = [50, 75, 100, 150][Math.floor(Math.random() * 4)];
      addNotification({
        type: 'points_earned',
        title: `تحصلت على +${pts} نقطة تطوعية! 🌟`,
        message: 'تم اعتماد مساهمتك الميدانية بنجاح وإضافة النقاط إلى رصيدك وترتيبك الوطني في منصة شمس.',
        points: pts,
        linkTab: 'profile',
        actor: {
          name: 'لجنة التقييم المعتمدة',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          role: 'evaluator_admin'
        }
      });
    } else if (type === 'post_liked') {
      const names = ['ياسمين عثماني', 'كريم سلطاني', 'زينب بلحاج', 'طه زياني'];
      const name = names[Math.floor(Math.random() * names.length)];
      addNotification({
        type: 'post_liked',
        title: 'نال منشورك تفاعلاً جديداً ❤️',
        message: `أعجب ${name} بمنشورك الأخير وأشاد بحماسكم وجهودكم التطوعية في الميدان.`,
        linkTab: 'profile',
        actor: {
          name,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          role: 'individual'
        }
      });
    } else if (type === 'post_comment') {
      const comments = [
        'بارك الله في جهودكم، عمل جبار ومثمر لشباب الوطن!',
        'بالتوفيق للجميع، نأمل المشاركة معكم في الحملة القادمة بحول الله!',
        'ما شاء الله، نموذج يحتذى به في المبادرة والعمل الميداني المتقن.'
      ];
      const comment = comments[Math.floor(Math.random() * comments.length)];
      addNotification({
        type: 'post_comment',
        title: 'تعليق جديد على منشورك 💬',
        message: `كتب بلال مرابطي: "${comment}"`,
        linkTab: 'profile',
        actor: {
          name: 'بلال مرابطي',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          role: 'individual'
        }
      });
    } else if (type === 'new_activity') {
      addNotification({
        type: 'new_activity',
        title: 'نشاط تطوعي جديد متاح! 🎯',
        message: 'مبادرة تطوعية جديدة متاحة للتسجيل الآن: "حملة تشجير السد الأخضر" — انضم واكسب 150 نقطة.',
        points: 150,
        linkTab: 'activities',
        actor: {
          name: 'مديرية الشباب والرياضة',
          avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=250&q=80',
          role: 'institution'
        }
      });
    } else if (type === 'badge_earned') {
      addNotification({
        type: 'badge_earned',
        title: 'وسام استحقاق جديد 🎖️',
        message: 'نلت وسام "المتطوع الذهبي" لتميزك في إنجاز المهام التطوعية ورفعك للتقارير الميدانية بدقة.',
        linkTab: 'profile',
        actor: {
          name: 'منصة شمس التطوع',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
          role: 'general_admin'
        }
      });
    } else {
      addNotification({
        type: 'submission_approved',
        title: 'تم اعتماد إثبات المشاركة رسمياً! ✅',
        message: 'اعتمد المقيّم الصور والإحداثيات الجغرافية لمهمتك التطوعية وتم احتساب النقاط التراكمية.',
        points: 80,
        linkTab: 'profile',
        actor: {
          name: 'المقيّم المعتمد',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          role: 'evaluator_admin'
        }
      });
    }
  };

  const switchUserRole = (role: UserRole) => {
    let target = users.find(u => u.role === role);
    if (!target) {
      if (role === 'general_admin') target = users.find(u => u.username === 'riyad' || u.id === 'admin-gen-1');
    }
    if (target) {
      setCurrentUserId(target.id);
      setIsLoggedIn(true);
      showToast({
        type: 'info',
        title: 'تم تبديل الحساب',
        message: `أنت تتصفح المنصة الآن بصفتك: ${target.name} (${getRoleTitle(target.role)})`,
      });
    } else {
      showToast({
        type: 'warning',
        title: 'الحساب غير موجود بعد',
        message: `لم يتم إنشاء حساب برتبة (${getRoleTitle(role)}) بعد. يمكن للمدير العام (عامري رياض يوسف) إنشاء هذا الحساب من لوحة إدارة الحسابات.`,
      });
    }
  };

  const registerUser = (payload: RegisterUserPayload): { success: boolean; message: string; user?: UserAccount } => {
    if (!payload.name?.trim() || !payload.email?.trim() || !payload.wilaya?.trim()) {
      return { success: false, message: 'يرجى ملء جميع الحقول الإلزامية (الاسم، البريد الإلكتروني، والولاية).' };
    }

    const emailClean = payload.email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === emailClean);
    if (existing) {
      return { success: false, message: 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول أو استخدام بريد آخر.' };
    }

    const isAdminRole = ['general_admin', 'evaluator_admin', 'institution_admin', 'media_admin'].includes(payload.role);
    
    // Restriction: Only General Admin (username: riyad, password: riyadriyad) can create admin accounts
    if (isAdminRole) {
      const isAuthorizedAdmin = (isLoggedIn && (currentUser.username === 'riyad' || currentUser.id === 'admin-gen-1' || currentUser.role === 'general_admin')) ||
        (payload.adminCode?.trim() === 'riyadriyad');
      
      if (!isAuthorizedAdmin) {
        return {
          success: false,
          message: 'عذراً! إنشاء حسابات المشرفين، مقيمي الإثبات، ومسؤولي الإعلام مقتصر حصرياً على المدير العام للمنصة (عامري رياض يوسف - riyad).'
        };
      }
    }

    // Accreditation verification for institutions and clubs
    if (payload.role === 'institution') {
      if (!payload.accreditationDocName?.trim()) {
        return {
          success: false,
          message: 'إلزامي: يرجى إرفاق أوراق الاعتماد والترخيص الرسمي للمؤسسة أو النادي لإتمام عملية التسجيل.'
        };
      }
    }

    const defaultAvatar = payload.role === 'institution'
      ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=250&q=80'
      : isAdminRole
      ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      username: payload.username?.trim(),
      name: payload.name.trim(),
      email: emailClean,
      phone: payload.phone?.trim() || '0550 00 00 00',
      password: payload.password || '123456',
      role: payload.role,
      institutionType: payload.institutionType,
      affiliatedInstitutionName: payload.affiliatedInstitutionName,
      registrationNumber: payload.registrationNumber?.trim(),
      accreditationDocName: payload.accreditationDocName?.trim(),
      accreditationDocSize: payload.accreditationDocSize,
      accreditationDocData: payload.accreditationDocData,
      accreditationDocType: payload.accreditationDocType || 'وثيقة اعتماد رسمية',
      accreditationStatus: payload.role === 'institution' ? 'pending' : undefined,
      wilaya: payload.wilaya,
      avatar: payload.avatar || defaultAvatar,
      bio: payload.bio || (isAdminRole ? 'مسؤول معتمد في منصة شمس - وزارة الشباب والرياضة' : 'عضو مسجل في منصة شمس التطوعية الوطنية.'),
      points: 0,
      rank: users.filter(u => u.role === payload.role).length + 1,
      completedTasksCount: 0,
      hoursVolunteered: 0,
      createdAt: new Date().toISOString(),
      badges: [
        {
          id: `b-${Date.now()}`,
          title: isAdminRole ? 'مسؤول رسمي معتمد 🛡️' : 'عضوية معتمدة ☀️',
          icon: isAdminRole ? '🛡️' : '☀️',
          earnedDate: new Date().toISOString().slice(0, 10),
          color: isAdminRole ? 'rose' : 'amber'
        }
      ],
    };

    setUsers(prev => [newUser, ...prev]);

    if (!payload.stayAsCurrentAdmin) {
      setCurrentUserId(newUser.id);
      setIsLoggedIn(true);

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      showToast({
        type: 'success',
        title: 'مرحباً بك في شمس التطوع! 🎉',
        message: `تم إنشاء حسابك بنجاح (${getRoleTitle(newUser.role)}). تم تسجيل دخولك تلقائياً.`,
      });
    } else {
      showToast({
        type: 'success',
        title: 'تم إنشاء الحساب بنجاح! ✨',
        message: `تم إنشاء حساب (${getRoleTitle(newUser.role)}: ${newUser.name}) بنجاح وهو جاهز لتسجيل الدخول الفوري.`,
      });
    }

    return { success: true, message: 'تم إنشاء الحساب بنجاح', user: newUser };
  };

  const deleteUserAccount = (userId: string): { success: boolean; message: string } => {
    if (userId === 'admin-gen-1') {
      return { success: false, message: 'لا يمكن حذف حساب المدير العام الافتراضي للمنصة (عامري رياض يوسف).' };
    }
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'المستخدم غير موجود.' };
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUserId === userId) {
      setCurrentUserId('admin-gen-1');
    }
    showToast({
      type: 'info',
      title: 'تم حذف الحساب',
      message: `تم حذف حساب ${target.name} (${getRoleTitle(target.role)}) بنجاح.`,
    });
    return { success: true, message: 'تم حذف الحساب بنجاح' };
  };

  const deleteClub = (clubId: string) => {
    setClubs(prev => prev.filter(c => c.id !== clubId));
    showToast({
      type: 'info',
      title: 'تم حذف النادي',
      message: 'تمت إزالة النادي التابع بنجاح.',
    });
  };

  const loginUser = (payload: { emailOrPhone: string; password?: string }): { success: boolean; message: string; user?: UserAccount } => {
    const query = payload.emailOrPhone.trim().toLowerCase();
    const cleanPhone = query.replace(/\s+/g, '');

    // Allow login by email, phone, or username (e.g. riyad)
    const found = users.find(u => 
      u.email.toLowerCase() === query || 
      (u.username && u.username.toLowerCase() === query) ||
      (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
    );

    if (!found) {
      return { success: false, message: 'لم يتم العثور على حساب بهذا البريد الإلكتروني أو اسم المستخدم أو رقم الهاتف.' };
    }

    if (!payload.password?.trim()) {
      return { success: false, message: 'يرجى إدخال كلمة المرور لتسجيل الدخول بأمان.' };
    }

    const enteredPass = payload.password.trim();
    const userPass = (found.password || '').trim();
    const isOfficialStaffMatch = 
      (found.username === 'riyad' && enteredPass === 'riyadriyad') ||
      (found.username === 'aroua' && enteredPass === 'arouaaroua') ||
      (found.username === 'raoua' && enteredPass === 'raouaraoua') ||
      (found.username === 'adnan' && enteredPass === 'adnanadnan') ||
      (found.username === 'amin' && enteredPass === 'aminamin');

    const isValid = enteredPass === userPass || isOfficialStaffMatch;

    if (!isValid) {
      return { success: false, message: 'كلمة المرور غير صحيحة، يرجى إعادة المحاولة.' };
    }

    setCurrentUserId(found.id);
    setIsLoggedIn(true);

    showToast({
      type: 'success',
      title: `أهلاً بك، ${found.name}`,
      message: `تم تسجيل الدخول بنجاح بصفتك (${getRoleTitle(found.role)})`,
    });

    return { success: true, message: 'تم تسجيل الدخول بنجاح', user: found };
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    showToast({
      type: 'info',
      title: 'تم تسجيل الخروج',
      message: 'تم تسجيل خروجك بنجاح، يمكنك تسجيل الدخول أو إنشاء حساب جديد في أي وقت.',
    });
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

    // Dispatch notification to users
    const instName = newActivity.institutionName || 'المؤسسة الشبانية';
    addNotification({
      type: 'new_activity',
      title: `نشاط تطوعي جديد: ${newActivity.title} 🎯`,
      message: `أطلقت ${instName} نشاطاً جديداً في ولاية ${newActivity.wilaya} بقيمة ${newActivity.basePoints} نقطة. انضم الآن!`,
      points: newActivity.basePoints,
      linkTab: 'activities',
      actionTargetId: newActivity.id,
      actor: {
        name: instName,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
    });

    showToast({
      type: 'success',
      title: 'تم نشر النشاط التطوعي بنجاح',
      message: `تم إدراج النشاط "${newActivity.title}" في المنصة وأصبح متاحاً للمشاركين.`,
    });
  };

  // Apply to an activity
  const applyToActivity = (activityId: string): boolean => {
    if (!requireAuth('المشاركة والاندراج في هذا النشاط التطوعي')) return false;

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
    if (!requireAuth('رفع إثباتات إتمام النشاط')) return false;

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

      // Add points_earned notification for participant
      addNotification({
        userId: targetSub.userId,
        type: 'points_earned',
        title: `تحصلت على +${totalPoints} نقطة تطوعية! 🌟`,
        message: `تم اعتماد تقرير مشاركتك في "${targetSub.activityTitle}" من قِبل ${currentUser.name} وإضافة ${totalPoints} نقطة إلى رصيدك!`,
        points: totalPoints,
        linkTab: 'profile',
        actor: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role,
        },
      });

      showToast({
        type: 'points',
        title: 'تم اعتماد المهمة ومنح النقاط!',
        message: `تم منح ${totalPoints} نقطة للمشارك ${targetSub.userName} بنجاح.`,
        pointsAdded: totalPoints,
      });
    } else {
      // Add notification for rejection / feedback
      addNotification({
        userId: targetSub.userId,
        type: 'submission_approved',
        title: 'ملاحظات حول تقرير مشاركتك 📋',
        message: `طلب المقيّم ${currentUser.name} تعديلات على مشاركتك في "${targetSub.activityTitle}": "${evaluation.feedback}".`,
        linkTab: 'workspace',
        actor: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role,
        },
      });

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

  // Toggle reaction on blog/poster post
  const toggleBlogPostReaction = (postId: string, reactionType: ReactionType) => {
    if (!requireAuth('التفاعل مع هذا المقال الإعلامي')) return;

    setBlogPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const currentReactions = p.reactions || { like: [], love: [], fire: [], clap: [] };
      const currentList = currentReactions[reactionType] || [];
      const hasReacted = currentList.includes(currentUser.id);

      const updatedList = hasReacted
        ? currentList.filter(id => id !== currentUser.id)
        : [...currentList, currentUser.id];

      return {
        ...p,
        reactions: {
          ...currentReactions,
          [reactionType]: updatedList
        }
      };
    }));
  };

  // Add comment to blog/poster post
  const addBlogPostComment = (postId: string, content: string) => {
    if (!requireAuth('التعليق على هذا المقال الإعلامي')) {
      return { success: false, message: 'تسجيل الدخول مطلوب للتعليق.' };
    }

    if (!content.trim()) {
      return { success: false, message: 'يرجى كتابة نص التعليق.' };
    }

    const newComment: PostComment = {
      id: `bcomm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setBlogPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...(p.comments || []), newComment]
      };
    }));

    showToast({
      type: 'success',
      title: 'تمت إضافة تعليقك ✨',
      message: 'تعليقك معروض الآن على المنشور.',
    });

    return { success: true, message: 'تمت إضافة التعليق بنجاح' };
  };

  // Repost a blog/poster or user post to personal profile
  const repostToProfile = (postId: string, type: 'blog' | 'post') => {
    if (!requireAuth('إعادة مشاركة هذا المنشور في بروفايلك')) {
      return { success: false, message: 'تسجيل الدخول مطلوب للمشاركة.' };
    }

    if (type === 'blog') {
      const blog = blogPosts.find(b => b.id === postId);
      if (!blog) return { success: false, message: 'المنشور غير موجود.' };

      // Increment sharesCount
      setBlogPosts(prev => prev.map(b => b.id === postId ? { ...b, sharesCount: (b.sharesCount || 0) + 1 } : b));

      const repostUserPost: UserPost = {
        id: `post-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        authorWilaya: currentUser.wilaya,
        content: `🔁 قمت بمشاركة هذا المنشور من شمس ميديا:\n"${blog.title}"\n\n${blog.summary}`,
        imageUrl: blog.imageUrl,
        activityTag: blog.category,
        createdAt: new Date().toISOString(),
        reactions: { like: [], love: [], fire: [], clap: [] },
        comments: []
      };

      setPosts(prev => [repostUserPost, ...prev]);

      showToast({
        type: 'success',
        title: 'تمت المشاركة في ملفك الشخصي! 🌟',
        message: `تم نشر بوستر "${blog.title}" بنجاح في صفحة بروفايلك الشخصي.`,
      });

      return { success: true, message: 'تمت المشاركة بنجاح' };
    } else {
      const srcPost = posts.find(p => p.id === postId);
      if (!srcPost) return { success: false, message: 'المنشور غير موجود.' };

      const repostUserPost: UserPost = {
        id: `post-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        authorWilaya: currentUser.wilaya,
        content: `🔁 إعادة مشاركة منشور لـ ${srcPost.authorName}:\n\n"${srcPost.content}"`,
        imageUrl: srcPost.imageUrl,
        activityTag: srcPost.activityTag,
        createdAt: new Date().toISOString(),
        reactions: { like: [], love: [], fire: [], clap: [] },
        comments: []
      };

      setPosts(prev => [repostUserPost, ...prev]);

      showToast({
        type: 'success',
        title: 'تمت إعادة النشر في ملفك الشخصي! 🌟',
        message: `تم نشر منشور ${srcPost.authorName} بنجاح في صفحة بروفايلك.`,
      });

      return { success: true, message: 'تمت إعادة النشر بنجاح' };
    }
  };

  const isShamsAdmin = currentUser.username === 'riyad' || currentUser.id === 'admin-gen-1' || currentUser.role === 'general_admin';

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

  // User Posts methods
  const createPost = (payload: { content: string; imageUrl?: string; activityTag?: string }) => {
    if (!requireAuth('نشر ومشاركة منشور جديد في المجتمع')) {
      return { success: false, message: 'تسجيل الدخول مطلوب للنشر.' };
    }

    if (!payload.content.trim()) {
      return { success: false, message: 'يرجى كتابة نص المنشور.' };
    }

    const newPost: UserPost = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      authorWilaya: currentUser.wilaya,
      content: payload.content.trim(),
      imageUrl: payload.imageUrl?.trim() || undefined,
      activityTag: payload.activityTag?.trim() || undefined,
      createdAt: new Date().toISOString(),
      reactions: {
        like: [],
        love: [],
        fire: [],
        clap: []
      },
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);

    showToast({
      type: 'success',
      title: 'تم نشر المنشور بنجاح! ✨',
      message: 'منشورك أصبح متاحاً الآن في صفحة بروفايلك ولجميع المتابعين.',
    });

    return { success: true, message: 'تم النشر بنجاح', post: newPost };
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast({
      type: 'info',
      title: 'تم حذف المنشور',
      message: 'تمت إزالة المنشور بنجاح.',
    });
  };

  const editPost = (postId: string, payload: { content: string; imageUrl?: string; activityTag?: string }) => {
    if (!payload.content.trim()) {
      return { success: false, message: 'يرجى كتابة نص المنشور.' };
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        content: payload.content.trim(),
        imageUrl: payload.imageUrl !== undefined ? (payload.imageUrl.trim() || undefined) : p.imageUrl,
        activityTag: payload.activityTag !== undefined ? (payload.activityTag.trim() || undefined) : p.activityTag,
      };
    }));

    showToast({
      type: 'success',
      title: 'تم تعديل المنشور بنجاح! ✏️',
      message: 'تم حفظ كافة التعديلات على المنشور والصورة.',
    });

    return { success: true, message: 'تم تعديل المنشور بنجاح' };
  };

  const updateUserProfile = (payload: UpdateUserProfilePayload) => {
    let updatedAccount: UserAccount | undefined;

    setUsers(prev => prev.map(u => {
      if (u.id !== currentUserId) return u;
      updatedAccount = {
        ...u,
        name: payload.name !== undefined && payload.name.trim() ? payload.name.trim() : u.name,
        username: payload.username !== undefined ? payload.username.trim().replace(/^@/, '') : u.username,
        bio: payload.bio !== undefined ? payload.bio.trim() : u.bio,
        wilaya: payload.wilaya !== undefined && payload.wilaya.trim() ? payload.wilaya.trim() : u.wilaya,
        phone: payload.phone !== undefined ? payload.phone.trim() : u.phone,
        email: payload.email !== undefined ? payload.email.trim() : u.email,
        avatar: payload.avatar !== undefined && payload.avatar.trim() ? payload.avatar.trim() : u.avatar,
        coverImage: payload.coverImage !== undefined ? payload.coverImage.trim() : u.coverImage,
      };
      return updatedAccount;
    }));

    // Sync authorName and authorAvatar across posts made by this user
    if (payload.name || payload.avatar) {
      setPosts(prev => prev.map(p => {
        if (p.authorId !== currentUserId) return p;
        return {
          ...p,
          authorName: payload.name && payload.name.trim() ? payload.name.trim() : p.authorName,
          authorAvatar: payload.avatar && payload.avatar.trim() ? payload.avatar.trim() : p.authorAvatar
        };
      }));
    }

    showToast({
      type: 'success',
      title: 'تم تحديث الملف الشخصي! 👤',
      message: 'تم حفظ تعديلاتك على البيانات الشخصية، الصورة الشخصية وصورة الغلاف.',
    });

    return {
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: updatedAccount
    };
  };

  const resetAllData = (mode: 'empty' | 'demo' = 'empty') => {
    setPosts([]);
    setSubmissions([]);
    setClubs([]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setBlogPosts(INITIAL_BLOG_POSTS);
    setActivities(INITIAL_ACTIVITIES);
    setUsers(INITIAL_USERS);
    setCurrentUserId('admin-gen-1');
    setIsLoggedIn(true);

    try {
      localStorage.clear();
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'admin-gen-1');
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(true));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(INITIAL_BLOG_POSTS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify([]));
    } catch (e) {}

    showToast({
      type: 'success',
      title: 'تم تصفير وإعادة تهيئة المنصة! 🧹',
      message: 'تمت إعادة تهيئة المنصة بنجاح بحساب المدير العام (عامري رياض يوسف - riyad) وهي جاهزة للنشر الفوري.',
    });
  };

  const togglePostReaction = (postId: string, reactionType: ReactionType) => {
    if (!requireAuth('التفاعل مع هذا المنشور')) return;

    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;

    const currentReactions = targetPost.reactions || { like: [], love: [], fire: [], clap: [] };
    const currentList = currentReactions[reactionType] || [];
    const hasReacted = currentList.includes(currentUser.id);

    if (!hasReacted) {
      // New reaction! Add notification for author
      addNotification({
        userId: targetPost.authorId,
        type: 'post_liked',
        title: 'نال منشورك تفاعلاً جديداً ❤️',
        message: `تفاعل ${currentUser.name} مع منشورك "${targetPost.content.slice(0, 45)}..."`,
        linkTab: 'profile',
        actionTargetId: targetPost.id,
        actor: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role
        }
      });
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      const pReactions = p.reactions || { like: [], love: [], fire: [], clap: [] };
      const pList = pReactions[reactionType] || [];
      const userHasReacted = pList.includes(currentUser.id);

      const updatedList = userHasReacted 
        ? pList.filter(id => id !== currentUser.id)
        : [...pList, currentUser.id];

      return {
        ...p,
        reactions: {
          ...pReactions,
          [reactionType]: updatedList
        }
      };
    }));
  };

  const addPostComment = (postId: string, content: string) => {
    if (!requireAuth('التعليق على هذا المنشور')) {
      return { success: false, message: 'تسجيل الدخول مطلوب للتعليق.' };
    }

    if (!content.trim()) {
      return { success: false, message: 'يرجى كتابة نص التعليق.' };
    }

    const targetPost = posts.find(p => p.id === postId);

    const newComment: PostComment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    if (targetPost) {
      addNotification({
        userId: targetPost.authorId,
        type: 'post_comment',
        title: 'تعليق جديد على منشورك 💬',
        message: `علّق ${currentUser.name}: "${content.trim().slice(0, 50)}..." على منشورك.`,
        linkTab: 'profile',
        actionTargetId: targetPost.id,
        actor: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role
        }
      });
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [...(p.comments || []), newComment]
      };
    }));

    showToast({
      type: 'success',
      title: 'تمت إضافة التعليق',
      message: 'شكرًا على مشاركتك الإيجابية وتشجيع المتطوعين.',
    });

    return { success: true, message: 'تم التعليق بنجاح' };
  };

  // Subscriptions logic
  const toggleSubscription = (targetUserId: string) => {
    if (!requireAuth('متابعة هذا الحساب التطوعي')) return;

    if (targetUserId === currentUser.id) return;

    const mySubs = subscriptions[currentUser.id] || [];
    const isSubbed = mySubs.includes(targetUserId);

    const targetUser = users.find(u => u.id === targetUserId);
    const targetName = targetUser ? targetUser.name : 'المستخدم';

    const updated = isSubbed 
      ? mySubs.filter(id => id !== targetUserId)
      : [...mySubs, targetUserId];

    setSubscriptions(prev => ({
      ...prev,
      [currentUser.id]: updated
    }));

    if (isSubbed) {
      showToast({
        type: 'info',
        title: 'إلغاء الاشتراك',
        message: `تم إلغاء متابعة ${targetName}.`,
      });
    } else {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      } catch (e) {}

      showToast({
        type: 'success',
        title: 'تم الاشتراك بنجاح! 🔔',
        message: `أصبحت الآن مشتركاً ومتابعاً لأنشطة ومنشورات ${targetName}.`,
      });
    }
  };

  const isSubscribedTo = (targetUserId: string) => {
    const mySubs = subscriptions[currentUser.id] || [];
    return mySubs.includes(targetUserId);
  };

  const getUserSubscribersCount = (targetUserId: string) => {
    let count = 0;
    (Object.values(subscriptions) as string[][]).forEach((list: string[]) => {
      if (Array.isArray(list) && list.includes(targetUserId)) {
        count++;
      }
    });
    const targetUser = users.find(u => u.id === targetUserId);
    const base = targetUser?.role === 'institution' ? 142 : 38;
    return count + base;
  };

  const getUserSubscriptionsCount = (userId: string) => {
    const mySubs = subscriptions[userId] || [];
    return mySubs.length + 12;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserRole,
        isLoggedIn,
        authModalState,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        registerUser,
        loginUser,
        logoutUser,
        allUsers: users,
        individualUsers,
        institutionUsers,
        activities,
        submissions,
        clubs,
        blogPosts,
        season,
        posts,
        createPost,
        editPost,
        deletePost,
        togglePostReaction,
        addPostComment,
        updateUserProfile,
        resetAllData,
        mongoDbStatus,
        isSyncingDb,
        syncNowWithMongoDb,
        toggleSubscription,
        isSubscribedTo,
        getUserSubscribersCount,
        getUserSubscriptionsCount,
        addActivity,
        applyToActivity,
        submitProof,
        evaluateSubmission,
        addClub,
        deleteClub,
        enrollClubInActivity,
        deleteUserAccount,
        addBlogPost,
        toggleLikePost,
        toggleBlogPostReaction,
        addBlogPostComment,
        repostToProfile,
        isShamsAdmin,
        toasts,
        removeToast,
        showToast,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        addNotification,
        simulateDemoNotification,
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
