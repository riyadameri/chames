import { Activity, ActivitySubmission, AffiliatedClub, BlogPost, SeasonInfo, UserAccount } from '../types';

export const INITIAL_SEASON: SeasonInfo = {
  id: 'season-2026-1',
  name: 'موسم شمس العطاء الوطني',
  edition: 'الطبعة الأولى',
  year: '2026',
  endDate: '2026-12-31T23:59:59',
  status: 'active',
  description: 'الموسم الوطني للتطوع والريادة المجتمعية تحت رعاية السيد وزير الشباب والرياضة لتكريم أنشط المتطوعين والمؤسسات الشبانية الأكثر مساهمة في تنمية المجتمع.',
  individualPrizes: [
    {
      place: 1,
      type: 'gold',
      title: 'وسام شمس الذهبي للمتطوع الأول',
      description: 'درع التميز الوطني + رحلة استكشافية دولية + منحة تشجيعية وتجهيزات رقمية',
      rewardValue: '500,000 دج + درع شمس الذهبي',
      badgeName: 'فارس التطوع الذهبي',
    },
    {
      place: 2,
      type: 'silver',
      title: 'وسام شمس الفضي للمتطوع المتميز',
      description: 'درع الاستحقاق الفضي + أجهزة لوحية متطورة + تكريم وزاري رسمي',
      rewardValue: '300,000 دج + درع شمس الفضي',
      badgeName: 'رائد العطاء الفضي',
    },
    {
      place: 3,
      type: 'bronze',
      title: 'وسام شمس البرونزي للمتطوع المثالي',
      description: 'درع التقدير البرونزي + حقيبة المتطوع المحترف + شهادة شرفية عليا',
      rewardValue: '150,000 دج + درع شمس البرونزي',
      badgeName: 'سفير الأثر البرونزي',
    },
  ],
  institutionPrizes: [
    {
      place: 1,
      type: 'gold',
      title: 'جائزة شمس الذهبية للهيكل الشبابي والجمعوي الأفضل',
      description: 'تمويل مشروع شبابي نموذجي بقيمة كاملة + تجديد قاعة نشاطات حديثة + لواء الشرف الوطني',
      rewardValue: '2,500,000 دج تمويل + درع المؤسسة الرائدة',
      badgeName: 'المؤسسة الشبانية الذهبية',
    },
    {
      place: 2,
      type: 'silver',
      title: 'جائزة شمس الفضية للمؤسسة الشبانية المتألقة',
      description: 'تجهيز معمل روبوتيك وابتكار + تجهيزات رياضية متكاملة + شهادة امتياز وزاري',
      rewardValue: '1,500,000 دج تمويل + درع المؤسسة الفضية',
      badgeName: 'المؤسسة الشبانية الفضية',
    },
    {
      place: 3,
      type: 'bronze',
      title: 'جائزة شمس البرونزية للمبادرة المؤسساتية',
      description: 'دعم لوجستي وقافلة نشاطات ولائية + أجهزة حاسوب وتجهيزات مكتبية',
      rewardValue: '800,000 دج دعم + درع المؤسسة البرونزية',
      badgeName: 'المؤسسة الشبانية البرونزية',
    },
  ],
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'admin-gen-1',
    name: 'عامري رياض يوسف',
    username: 'riyad',
    password: 'riyadriyad',
    role: 'general_admin',
    email: 'riyadammmeri@gmail.com',
    phone: '0550 12 34 56',
    wilaya: '16 - الجزائر العاصمة',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    bio: 'المدير العام والمشرف الوطني على منصة شمس التطوع - وزارة الشباب والرياضة.',
    points: 0,
    rank: 1,
    completedTasksCount: 0,
    hoursVolunteered: 0,
    createdAt: '2026-09-01T08:00:00.000Z',
    badges: [
      {
        id: 'b-admin',
        title: 'المدير العام للمنصة 👑',
        icon: 'Award',
        earnedDate: '2026-09-01',
        color: 'amber'
      }
    ],
  },
  {
    id: 'admin-media-1',
    name: 'مهدي اروى بدر التمام',
    username: 'aroua',
    password: 'arouaaroua',
    role: 'media_admin',
    email: 'aroua@shams.dz',
    phone: '0551 23 45 67',
    wilaya: '16 - الجزائر العاصمة',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    bio: 'المكلفة بالإعلام والاتصال والتغطية الميدانية للأنشطة الشبانية والتطوعية.',
    points: 0,
    rank: 2,
    completedTasksCount: 0,
    hoursVolunteered: 0,
    createdAt: '2026-09-01T08:00:00.000Z',
    badges: [
      {
        id: 'b-media',
        title: 'المكلفة بالإعلام والاتصال 📣',
        icon: 'Megaphone',
        earnedDate: '2026-09-01',
        color: 'teal'
      }
    ],
  },
  {
    id: 'admin-inst-1',
    name: 'مهدي رواء نور السلام',
    username: 'raoua',
    password: 'raouaraoua',
    role: 'institution_admin',
    institutionType: 'youth_house',
    affiliatedInstitutionName: 'دار الشباب المستقبل - الجزائر',
    email: 'raoua@shams.dz',
    phone: '0552 34 56 78',
    wilaya: '16 - الجزائر العاصمة',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    bio: 'مسؤولة هيكل شباني - دار الشباب المستقبل وادي قريش.',
    points: 0,
    rank: 3,
    completedTasksCount: 0,
    hoursVolunteered: 0,
    createdAt: '2026-09-01T08:00:00.000Z',
    badges: [
      {
        id: 'b-inst',
        title: 'مسؤولة هيكل شباني 🏛️',
        icon: 'Building2',
        earnedDate: '2026-09-01',
        color: 'blue'
      }
    ],
  },
  {
    id: 'admin-eval-1',
    name: 'محمد رياض طبه',
    username: 'adnan',
    password: 'adnanadnan',
    role: 'evaluator_admin',
    email: 'adnan@shams.dz',
    phone: '0553 45 67 89',
    wilaya: '16 - الجزائر العاصمة',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'مسؤول المراقبة والتقييم الميداني واعتماد الإثباتات ومنح النقاط.',
    points: 0,
    rank: 4,
    completedTasksCount: 0,
    hoursVolunteered: 0,
    createdAt: '2026-09-01T08:00:00.000Z',
    badges: [
      {
        id: 'b-eval',
        title: 'مسؤول المراقبة والتقييم 🛡️',
        icon: 'ShieldCheck',
        earnedDate: '2026-09-01',
        color: 'rose'
      }
    ],
  },
  {
    id: 'admin-inst-2',
    name: 'امين بوطبيلة',
    username: 'amin',
    password: 'aminamin',
    role: 'institution_admin',
    institutionType: 'sports_complex',
    affiliatedInstitutionName: 'المركب الرياضي الجواري - سيدي امحمد',
    email: 'amin@shams.dz',
    phone: '0554 56 78 90',
    wilaya: '16 - الجزائر العاصمة',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'مسؤول هيكل شباني - المركب الرياضي الجواري سيدي امحمد.',
    points: 0,
    rank: 5,
    completedTasksCount: 0,
    hoursVolunteered: 0,
    createdAt: '2026-09-01T08:00:00.000Z',
    badges: [
      {
        id: 'b-inst-2',
        title: 'مسؤول هيكل شباني 🏛️',
        icon: 'Building2',
        earnedDate: '2026-09-01',
        color: 'blue'
      }
    ],
  }
];

export const INITIAL_CLUBS: AffiliatedClub[] = [];

export const INITIAL_ACTIVITIES: Activity[] = [];

export const INITIAL_SUBMISSIONS: ActivitySubmission[] = [];

export const INITIAL_BLOG_POSTS: BlogPost[] = [];

export const ALGERIAN_WILAYAS = [
  '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة',
  '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
  '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو',
  '16 - الجزائر العاصمة', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
  '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة',
  '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
  '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس',
  '36 - الطارف', '37 - تندوف', '38 - تسمسيلت', '39 - الوادي', '40 - خنشلة',
  '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة',
  '46 - عين تموشنت', '47 - غرداية', '48 - غليزان', '49 - تيميمون', '50 - برج باجي مختار',
  '51 - أولاد جلال', '52 - بني عباس', '53 - عين صالح', '54 - عين قزام', '55 - توقرت',
  '56 - جانت', '57 - المغير', '58 - المنيعة'
];
