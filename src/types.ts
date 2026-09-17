export type UserRole = 
  | 'individual'          // متطوع فرد
  | 'institution'         // جمعية أو نادي
  | 'general_admin'       // مدير المنصة العام (الوزارة)
  | 'institution_admin'   // مسؤول مؤسسة شبانية (دار شباب، مركب رياضي...)
  | 'evaluator_admin'     // مسؤول التقييم والمتابعة ومنح النقاط
  | 'media_admin';        // مسؤول الإعلام والميديا

export type InstitutionType = 
  | 'association'     // جمعية وطنية أو محلية
  | 'club'            // نادي شبابي أو رياضي
  | 'sports_complex'  // مركب رياضي جواري
  | 'youth_house'     // دار شباب
  | 'youth_hostel'    // بيت شباب
  | 'scout_org';      // أفواج الكشافة الإسلامية / منظمة

export type TargetAudience = 'individuals' | 'institutions' | 'all';

export type ActivityCategory = 
  | 'environment'   // بيئة وتشجير
  | 'sports'        // رياضة وصحة
  | 'social'        // عمل خيري وتضامن
  | 'cultural'      // ثقافة وتراث
  | 'digital'       // مهارات ورقميات
  | 'disaster';     // استجابة وطوارئ

export interface ProofItem {
  id: string;
  photoUrl: string;
  locationName: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: ActivityCategory;
  targetAudience: TargetAudience;
  basePoints: number;
  requiresPhotos: boolean;
  requiresLocation: boolean;
  allowMultipleProof: boolean; // تحدي متكرر مثل غرس الأشجار
  unitName?: string;          // مثلا: شجرة، سلة غذائية، كتاب، متر مربع
  pointsPerUnit?: number;     // نقاط إضافية لكل وحدة منجزة
  creatorRole: 'general_admin' | 'institution_admin';
  institutionId?: string;
  institutionName?: string;
  institutionType?: InstitutionType;
  wilaya: string;
  municipality: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  coverImage: string;
  targetParticipants?: number;
  enrolledCount: number;
  completedCount: number;
  featured?: boolean;
  locationsList?: { name: string; coordinates?: string }[];
}

export type SubmissionStatus = 'applied' | 'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface ActivitySubmission {
  id: string;
  activityId: string;
  activityTitle: string;
  activityCategory: ActivityCategory;
  userId: string;
  userName: string;
  userRole: 'individual' | 'institution';
  userAvatar?: string;
  institutionType?: InstitutionType;
  clubAffiliation?: string; // تابع لدار شباب أو مركب
  wilaya: string;
  status: SubmissionStatus;
  appliedAt: string;
  submittedAt?: string;
  evaluatedAt?: string;
  evaluatorId?: string;
  evaluatorName?: string;
  proofItems: ProofItem[];
  generalNotes?: string;
  unitsCount?: number;
  pointsAwarded?: number;
  bonusPoints?: number;
  evaluatorFeedback?: string;
}

export interface AffiliatedClub {
  id: string;
  name: string;
  specialty: string;
  institutionId: string;
  institutionName: string;
  leaderName: string;
  phone: string;
  membersCount: number;
  points: number;
  avatar: string;
  joinedDate: string;
  enrolledActivitiesCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'تغطية ميدانية' | 'بلاغ وزاري' | 'قصة نجاح' | 'توجيهات وإرشادات';
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  authorId?: string;
  publishedAt: string;
  imageUrl: string;
  likes: number;
  likedByMe?: boolean;
  views: number;
  tags: string[];
  reactions?: Record<ReactionType, string[]>;
  comments?: PostComment[];
  sharesCount?: number;
  isPoster?: boolean;
}

export interface SeasonPrize {
  place: 1 | 2 | 3;
  type: 'gold' | 'silver' | 'bronze';
  title: string;
  description: string;
  rewardValue: string;
  badgeName: string;
}

export interface SeasonInfo {
  id: string;
  name: string;
  edition: string;
  year: string;
  endDate: string;
  status: 'active' | 'concluded';
  description: string;
  individualPrizes: SeasonPrize[];
  institutionPrizes: SeasonPrize[];
}

export interface UserAccount {
  id: string;
  username?: string;
  name: string;
  role: UserRole;
  institutionType?: InstitutionType;
  email: string;
  password?: string;
  phone: string;
  wilaya: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  points: number;
  rank: number;
  completedTasksCount: number;
  hoursVolunteered: number;
  affiliatedInstitutionId?: string;
  affiliatedInstitutionName?: string;
  accreditationDocName?: string;
  accreditationDocSize?: string;
  accreditationDocData?: string;
  accreditationDocType?: string;
  registrationNumber?: string;
  accreditationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  badges: {
    id: string;
    title: string;
    icon: string;
    earnedDate: string;
    color: string;
  }[];
}

// Aliases for convenience
export type User = UserAccount;
export type Submission = ActivitySubmission;

export interface RegisterUserPayload {
  username?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  wilaya: string;
  role: UserRole;
  institutionType?: InstitutionType;
  affiliatedInstitutionName?: string;
  accreditationDocName?: string;
  accreditationDocSize?: string;
  accreditationDocData?: string;
  accreditationDocType?: string;
  registrationNumber?: string;
  bio?: string;
  avatar?: string;
  adminCode?: string;
  stayAsCurrentAdmin?: boolean;
}

export interface UpdateUserProfilePayload {
  name?: string;
  username?: string;
  bio?: string;
  wilaya?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  coverImage?: string;
}

export type ReactionType = 'like' | 'love' | 'fire' | 'clap';

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface UserPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorWilaya: string;
  content: string;
  imageUrl?: string;
  activityTag?: string;
  createdAt: string;
  reactions: Record<ReactionType, string[]>; // list of user IDs who reacted
  comments: PostComment[];
}

export type AppNotificationType = 
  | 'points_earned'        // تحصل على نقاط تطوعية
  | 'post_liked'           // نال منشوره إعجاباً أو تفاعلاً
  | 'post_comment'         // تعليق جديد على المنشور
  | 'new_activity'         // نشاط تطوعي جديد متاح
  | 'submission_approved'  // تم اعتماد إثبات المشاركة
  | 'badge_earned'         // الحصول على شارة أو وسام
  | 'announcement';        // تنبيه وزاري أو بلاغ هام

export interface NotificationItem {
  id: string;
  userId?: string;          // If target is specific user, or undefined for all/current user
  type: AppNotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  points?: number;
  actor?: {
    name: string;
    avatar: string;
    role?: UserRole;
  };
  linkTab?: string;         // 'activities' | 'feed' | 'profile' | 'leaderboard' | 'workspace' | 'media'
  actionTargetId?: string;  // activityId or postId
}

