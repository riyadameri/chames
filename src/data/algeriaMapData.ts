import { WilayaMapLocation, UserStory, DirectMessage } from '../types';

// Complete & Authentic Geographic coordinates for all 58 Wilayas of Algeria
// Normalized on national territorial coordinate grid:
// xPercent (0 = West border Tindouf/Ghazaouet to 100 = East border El Kala/Djanet)
// yPercent (0 = North Mediterranean Coast to 100 = South border Tin Zaouatine/In Guezzam)
export const ALGERIA_WILAYAS_GEO: WilayaMapLocation[] = [
  // Special Focus: Ouargla (30) & Touggourt (55)
  { id: '30', code: '30', name: 'Ouargla', nameAr: 'ورقلة', region: 'جنوب', xPercent: 71, yPercent: 44, lat: 31.95, lng: 5.33, activityCount: 16, volunteersCount: 420, heatLevel: 'hot', isFeaturedOasis: true },
  { id: '55', code: '55', name: 'Touggourt', nameAr: 'تقرت', region: 'جنوب', xPercent: 75, yPercent: 37, lat: 33.10, lng: 6.06, activityCount: 14, volunteersCount: 350, heatLevel: 'hot', isFeaturedOasis: true },

  // Capital & Center
  { id: '16', code: '16', name: 'Algiers', nameAr: 'الجزائر العاصمة', region: 'وسط', xPercent: 54, yPercent: 12, lat: 36.7538, lng: 3.0588, activityCount: 22, volunteersCount: 520, heatLevel: 'hot' },
  { id: '09', code: '09', name: 'Blida', nameAr: 'البليدة', region: 'وسط', xPercent: 52, yPercent: 15, lat: 36.47, lng: 2.83, activityCount: 9, volunteersCount: 190, heatLevel: 'medium' },
  { id: '35', code: '35', name: 'Boumerdès', nameAr: 'بومرداس', region: 'وسط', xPercent: 57, yPercent: 12, lat: 36.76, lng: 3.47, activityCount: 8, volunteersCount: 160, heatLevel: 'medium' },
  { id: '42', code: '42', name: 'Tipaza', nameAr: 'تيبازة', region: 'وسط', xPercent: 49, yPercent: 13, lat: 36.59, lng: 2.44, activityCount: 9, volunteersCount: 180, heatLevel: 'high' },
  { id: '15', code: '15', name: 'Tizi Ouzou', nameAr: 'تيزي وزو', region: 'وسط', xPercent: 60, yPercent: 13, lat: 36.71, lng: 4.04, activityCount: 11, volunteersCount: 240, heatLevel: 'high' },
  { id: '10', code: '10', name: 'Bouira', nameAr: 'البويرة', region: 'وسط', xPercent: 58, yPercent: 16, lat: 36.38, lng: 3.90, activityCount: 7, volunteersCount: 140, heatLevel: 'medium' },
  { id: '26', code: '26', name: 'Médéa', nameAr: 'المدية', region: 'وسط', xPercent: 51, yPercent: 17, lat: 36.26, lng: 2.75, activityCount: 7, volunteersCount: 130, heatLevel: 'medium' },
  { id: '44', code: '44', name: 'Aïn Defla', nameAr: 'عين الدفلى', region: 'وسط', xPercent: 46, yPercent: 16, lat: 36.26, lng: 1.97, activityCount: 6, volunteersCount: 115, heatLevel: 'low' },
  { id: '02', code: '02', name: 'Chlef', nameAr: 'الشلف', region: 'وسط', xPercent: 43, yPercent: 15, lat: 36.16, lng: 1.33, activityCount: 8, volunteersCount: 150, heatLevel: 'medium' },

  // Western Algeria
  { id: '31', code: '31', name: 'Oran', nameAr: 'وهران', region: 'غرب', xPercent: 32, yPercent: 18, lat: 35.6987, lng: -0.6349, activityCount: 18, volunteersCount: 390, heatLevel: 'hot' },
  { id: '27', code: '27', name: 'Mostaganem', nameAr: 'مستغانم', region: 'غرب', xPercent: 37, yPercent: 16, lat: 35.93, lng: 0.09, activityCount: 8, volunteersCount: 165, heatLevel: 'medium' },
  { id: '13', code: '13', name: 'Tlemcen', nameAr: 'تلمسان', region: 'غرب', xPercent: 22, yPercent: 24, lat: 34.88, lng: -1.31, activityCount: 9, volunteersCount: 195, heatLevel: 'high' },
  { id: '22', code: '22', name: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', region: 'غرب', xPercent: 28, yPercent: 22, lat: 35.19, lng: -0.63, activityCount: 7, volunteersCount: 140, heatLevel: 'medium' },
  { id: '46', code: '46', name: 'Aïn Témouchent', nameAr: 'عين تموشنت', region: 'غرب', xPercent: 26, yPercent: 20, lat: 35.30, lng: -1.14, activityCount: 6, volunteersCount: 120, heatLevel: 'medium' },
  { id: '29', code: '29', name: 'Mascara', nameAr: 'معسكر', region: 'غرب', xPercent: 33, yPercent: 21, lat: 35.39, lng: 0.14, activityCount: 7, volunteersCount: 135, heatLevel: 'medium' },
  { id: '48', code: '48', name: 'Relizane', nameAr: 'غليزان', region: 'غرب', xPercent: 39, yPercent: 19, lat: 35.74, lng: 0.55, activityCount: 6, volunteersCount: 110, heatLevel: 'low' },

  // Eastern Algeria
  { id: '25', code: '25', name: 'Constantine', nameAr: 'قسنطينة', region: 'شرق', xPercent: 78, yPercent: 15, lat: 36.365, lng: 6.6147, activityCount: 14, volunteersCount: 310, heatLevel: 'hot' },
  { id: '23', code: '23', name: 'Annaba', nameAr: 'عنابة', region: 'شرق', xPercent: 88, yPercent: 10, lat: 36.9, lng: 7.7667, activityCount: 12, volunteersCount: 260, heatLevel: 'high' },
  { id: '06', code: '06', name: 'Béjaïa', nameAr: 'بجاية', region: 'شرق', xPercent: 67, yPercent: 12, lat: 36.75, lng: 5.08, activityCount: 11, volunteersCount: 230, heatLevel: 'high' },
  { id: '18', code: '18', name: 'Jijel', nameAr: 'جيجل', region: 'شرق', xPercent: 73, yPercent: 11, lat: 36.82, lng: 5.76, activityCount: 8, volunteersCount: 170, heatLevel: 'medium' },
  { id: '21', code: '21', name: 'Skikda', nameAr: 'سكيكدة', region: 'شرق', xPercent: 82, yPercent: 11, lat: 36.87, lng: 6.90, activityCount: 9, volunteersCount: 185, heatLevel: 'medium' },
  { id: '36', code: '36', name: 'El Tarf', nameAr: 'الطارف', region: 'شرق', xPercent: 91, yPercent: 11, lat: 36.76, lng: 8.31, activityCount: 6, volunteersCount: 115, heatLevel: 'medium' },
  { id: '24', code: '24', name: 'Guelma', nameAr: 'قالمة', region: 'شرق', xPercent: 84, yPercent: 15, lat: 36.46, lng: 7.43, activityCount: 7, volunteersCount: 130, heatLevel: 'medium' },
  { id: '41', code: '41', name: 'Souk Ahras', nameAr: 'سوق أهراس', region: 'شرق', xPercent: 88, yPercent: 16, lat: 36.28, lng: 7.95, activityCount: 6, volunteersCount: 120, heatLevel: 'low' },
  { id: '43', code: '43', name: 'Mila', nameAr: 'ميلة', region: 'شرق', xPercent: 75, yPercent: 14, lat: 36.45, lng: 6.26, activityCount: 6, volunteersCount: 125, heatLevel: 'low' },
  { id: '12', code: '12', name: 'Tébessa', nameAr: 'تبسة', region: 'شرق', xPercent: 88, yPercent: 22, lat: 35.40, lng: 8.12, activityCount: 7, volunteersCount: 140, heatLevel: 'medium' },

  // Highlands (الهضاب العليا)
  { id: '19', code: '19', name: 'Sétif', nameAr: 'سطيف', region: 'هضاب', xPercent: 70, yPercent: 18, lat: 36.19, lng: 5.41, activityCount: 13, volunteersCount: 280, heatLevel: 'high' },
  { id: '34', code: '34', name: 'Bordj Bou Arréridj', nameAr: 'برج بوعريريج', region: 'هضاب', xPercent: 66, yPercent: 17, lat: 36.07, lng: 4.76, activityCount: 7, volunteersCount: 135, heatLevel: 'medium' },
  { id: '05', code: '05', name: 'Batna', nameAr: 'باتنة', region: 'هضاب', xPercent: 77, yPercent: 23, lat: 35.55, lng: 6.17, activityCount: 10, volunteersCount: 210, heatLevel: 'high' },
  { id: '04', code: '04', name: 'Oum El Bouaghi', nameAr: 'أم البواقي', region: 'هضاب', xPercent: 82, yPercent: 18, lat: 35.87, lng: 7.11, activityCount: 6, volunteersCount: 110, heatLevel: 'low' },
  { id: '40', code: '40', name: 'Khenchela', nameAr: 'خنشلة', region: 'هضاب', xPercent: 82, yPercent: 24, lat: 35.43, lng: 7.14, activityCount: 6, volunteersCount: 115, heatLevel: 'low' },
  { id: '28', code: '28', name: 'M\'Sila', nameAr: 'المسيلة', region: 'هضاب', xPercent: 64, yPercent: 22, lat: 35.70, lng: 4.54, activityCount: 8, volunteersCount: 155, heatLevel: 'medium' },
  { id: '17', code: '17', name: 'Djelfa', nameAr: 'الجلفة', region: 'هضاب', xPercent: 54, yPercent: 28, lat: 34.67, lng: 3.25, activityCount: 9, volunteersCount: 180, heatLevel: 'medium' },
  { id: '14', code: '14', name: 'Tiaret', nameAr: 'تيارت', region: 'هضاب', xPercent: 39, yPercent: 23, lat: 35.37, lng: 1.32, activityCount: 7, volunteersCount: 130, heatLevel: 'medium' },
  { id: '38', code: '38', name: 'Tissemsilt', nameAr: 'تيسمسيلت', region: 'هضاب', xPercent: 43, yPercent: 20, lat: 35.60, lng: 1.81, activityCount: 5, volunteersCount: 95, heatLevel: 'low' },
  { id: '20', code: '20', name: 'Saïda', nameAr: 'سعيدة', region: 'هضاب', xPercent: 31, yPercent: 26, lat: 34.83, lng: 0.15, activityCount: 6, volunteersCount: 115, heatLevel: 'low' },
  { id: '45', code: '45', name: 'Naâma', nameAr: 'النعامة', region: 'هضاب', xPercent: 24, yPercent: 32, lat: 33.26, lng: -0.31, activityCount: 5, volunteersCount: 90, heatLevel: 'low' },
  { id: '32', code: '32', name: 'El Bayadh', nameAr: 'البيض', region: 'هضاب', xPercent: 36, yPercent: 33, lat: 33.68, lng: 1.01, activityCount: 6, volunteersCount: 105, heatLevel: 'low' },
  { id: '03', code: '03', name: 'Laghouat', nameAr: 'الأغواط', region: 'هضاب', xPercent: 49, yPercent: 31, lat: 33.80, lng: 2.86, activityCount: 8, volunteersCount: 160, heatLevel: 'medium' },

  // South & Oases (الجنوب والواحات)
  { id: '07', code: '07', name: 'Biskra', nameAr: 'بسكرة', region: 'جنوب', xPercent: 72, yPercent: 30, lat: 34.85, lng: 5.73, activityCount: 10, volunteersCount: 220, heatLevel: 'high' },
  { id: '51', code: '51', name: 'Ouled Djellal', nameAr: 'أولاد جلال', region: 'جنوب', xPercent: 66, yPercent: 31, lat: 34.43, lng: 5.06, activityCount: 5, volunteersCount: 95, heatLevel: 'low' },
  { id: '57', code: '57', name: 'El M\'Ghair', nameAr: 'المغير', region: 'جنوب', xPercent: 75, yPercent: 33, lat: 33.95, lng: 5.92, activityCount: 5, volunteersCount: 90, heatLevel: 'low' },
  { id: '39', code: '39', name: 'El Oued', nameAr: 'الوادي', region: 'جنوب', xPercent: 82, yPercent: 35, lat: 33.37, lng: 6.86, activityCount: 9, volunteersCount: 185, heatLevel: 'medium' },
  { id: '47', code: '47', name: 'Ghardaïa', nameAr: 'غرداية', region: 'جنوب', xPercent: 57, yPercent: 39, lat: 32.49, lng: 3.67, activityCount: 9, volunteersCount: 175, heatLevel: 'medium' },
  { id: '58', code: '58', name: 'El Menia', nameAr: 'المنيعة', region: 'جنوب', xPercent: 54, yPercent: 47, lat: 30.58, lng: 2.88, activityCount: 5, volunteersCount: 100, heatLevel: 'low' },
  { id: '08', code: '08', name: 'Béchar', nameAr: 'بشار', region: 'جنوب', xPercent: 20, yPercent: 42, lat: 31.62, lng: -2.22, activityCount: 7, volunteersCount: 140, heatLevel: 'medium' },
  { id: '52', code: '52', name: 'Béni Abbès', nameAr: 'بني عباس', region: 'جنوب', xPercent: 22, yPercent: 49, lat: 30.13, lng: -2.16, activityCount: 5, volunteersCount: 85, heatLevel: 'low' },
  { id: '49', code: '49', name: 'Timimoun', nameAr: 'تيميمون', region: 'جنوب', xPercent: 41, yPercent: 50, lat: 29.26, lng: 0.24, activityCount: 6, volunteersCount: 110, heatLevel: 'medium' },
  { id: '01', code: '01', name: 'Adrar', nameAr: 'أدرار', region: 'جنوب', xPercent: 37, yPercent: 58, lat: 27.87, lng: -0.29, activityCount: 7, volunteersCount: 130, heatLevel: 'medium' },
  { id: '53', code: '53', name: 'In Salah', nameAr: 'عين صالح', region: 'جنوب', xPercent: 52, yPercent: 61, lat: 27.20, lng: 2.47, activityCount: 5, volunteersCount: 90, heatLevel: 'low' },
  { id: '37', code: '37', name: 'Tindouf', nameAr: 'تندوف', region: 'جنوب', xPercent: 10, yPercent: 56, lat: 27.67, lng: -8.14, activityCount: 5, volunteersCount: 95, heatLevel: 'low' },
  { id: '33', code: '33', name: 'Illizi', nameAr: 'إليزي', region: 'جنوب', xPercent: 87, yPercent: 62, lat: 26.50, lng: 8.48, activityCount: 6, volunteersCount: 105, heatLevel: 'low' },
  { id: '56', code: '56', name: 'Djanet', nameAr: 'جانت', region: 'جنوب', xPercent: 88, yPercent: 78, lat: 24.55, lng: 9.48, activityCount: 6, volunteersCount: 110, heatLevel: 'medium' },
  { id: '11', code: '11', name: 'Tamanrasset', nameAr: 'تمنراست', region: 'جنوب', xPercent: 67, yPercent: 82, lat: 22.78, lng: 5.52, activityCount: 8, volunteersCount: 155, heatLevel: 'medium' },
  { id: '50', code: '50', name: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار', region: 'جنوب', xPercent: 43, yPercent: 86, lat: 21.33, lng: 0.95, activityCount: 4, volunteersCount: 75, heatLevel: 'low' },
  { id: '54', code: '54', name: 'In Guezzam', nameAr: 'عين قزام', region: 'جنوب', xPercent: 66, yPercent: 94, lat: 19.57, lng: 5.77, activityCount: 4, volunteersCount: 70, heatLevel: 'low' }
];

// Seed Stories (ستوريهات شبابية تطوعية عبر مختلف الولايات، مع التركيز على ورقلة وتقرت)
export const INITIAL_STORIES: UserStory[] = [
  {
    id: 'story-ouargla-1',
    userId: 'vol-ouargla-1',
    userName: 'نادي واحات النخيل - ورقلة',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    userRole: 'institution',
    userStreak: 25,
    wilaya: '30 - ورقلة',
    mediaUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=900&q=80',
    caption: '🌴 غرس 300 فسيلة نخيل أصيل وتنظيف سواقي الري القديمة بواحة ورقلة العتيقة! عزم شباب الجنوب لا ينكسر 🇩🇿',
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
    viewsCount: 520,
    viewedBy: [],
    likesCount: 142,
    likedBy: [],
    activityTag: '#واحات_ورقلة_الخضراء'
  },
  {
    id: 'story-touggourt-1',
    userId: 'vol-touggourt-1',
    userName: 'شباب وادي ريغ - تقرت',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    userRole: 'individual',
    userStreak: 19,
    wilaya: '55 - تقرت',
    mediaUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',
    caption: 'ورشة الابتكار الرقمي والذكاء الاصطناعي لفائدة براعم وأشبال مدينة تقرت وتماسين 💻🌴 شمس التقنية في الواحات!',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 21 * 3600 * 1000).toISOString(),
    viewsCount: 430,
    viewedBy: [],
    likesCount: 98,
    likedBy: [],
    activityTag: '#تقرت_المبتكرة'
  },
  {
    id: 'story-1',
    userId: 'admin-gen-1',
    userName: 'عامري رياض يوسف',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    userRole: 'general_admin',
    userStreak: 18,
    wilaya: '16 - الجزائر العاصمة',
    mediaUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',
    caption: 'انطلاق الحملة الوطنية الكبرى لغرس مليون شجرة في غابة باينام اليوم! 🌲🇩🇿',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    viewsCount: 412,
    viewedBy: [],
    likesCount: 89,
    likedBy: [],
    activityTag: '#حملة_المليون_شجرة'
  },
  {
    id: 'story-2',
    userId: 'club-oran-eco',
    userName: 'نادي أصدقاء البيئة - وهران',
    userAvatar: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=250&q=80',
    userRole: 'institution',
    userStreak: 12,
    wilaya: '31 - وهران',
    mediaUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80',
    caption: 'تنظيف وتزيين واجهة البحر بوهران بمشاركة 60 متطوعاً ومتطوعة 🌊🧹',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    viewsCount: 285,
    viewedBy: [],
    likesCount: 64,
    likedBy: [],
    activityTag: '#بحر_نظيف_وهران'
  },
  {
    id: 'story-3',
    userId: 'admin-inst-1',
    userName: 'مهدي رواء نور السلام',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    userRole: 'institution_admin',
    userStreak: 9,
    wilaya: '16 - الجزائر العاصمة',
    backgroundColor: 'from-amber-600 via-rose-600 to-indigo-800',
    textColor: '#ffffff',
    caption: 'تحدي اليوم بدار الشباب: إعداد 150 حقيبة مدرسية للأطفال في القرى المعزولة 🎒✨ شاركونا بالتبرع والفرز!',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    viewsCount: 310,
    viewedBy: [],
    likesCount: 75,
    likedBy: [],
    activityTag: '#حقيبة_الخير'
  },
  {
    id: 'story-4',
    userId: 'vol-constantine',
    userName: 'كريم بلحسن',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    userRole: 'individual',
    userStreak: 21,
    wilaya: '25 - قسنطينة',
    mediaUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80',
    caption: 'حملة التبرع بالدم بجامعة قسنطينة 🩸 كل قطرة دم تنقذ حياة، لا تترددوا بالقدوم!',
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 16 * 3600 * 1000).toISOString(),
    viewsCount: 198,
    viewedBy: [],
    likesCount: 52,
    likedBy: [],
    activityTag: '#تبرع_بالدم_قسنطينة'
  },
  {
    id: 'story-5',
    userId: 'vol-south-oasis',
    userName: 'نادي شباب الطاسيلي - جانت',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
    userRole: 'institution',
    userStreak: 15,
    wilaya: '56 - جانت',
    mediaUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=900&q=80',
    caption: 'حملة استكشافية وتوعية سياحية للحفاظ على نقوش ورسومات كهوف طاسيلي ناجر 🏜️🏺',
    createdAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 13 * 3600 * 1000).toISOString(),
    viewsCount: 420,
    viewedBy: [],
    likesCount: 110,
    likedBy: [],
    activityTag: '#حماية_تراث_الصحراء'
  }
];

// Initial Direct Messages & Conversations
export const INITIAL_MESSAGES: DirectMessage[] = [
  {
    id: 'msg-ouargla',
    senderId: 'vol-ouargla-1',
    senderName: 'نادي واحات ورقلة',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    receiverId: 'admin-gen-1',
    receiverName: 'عامري رياض يوسف',
    content: 'السلام عليكم أخي رياض، نسقنا مع متطوعي ورقلة وتقرت لتنظيم قافلة الغرس الكبرى لواحات الجنوب 🌴 هل تم اعتماد نقاط الستريك للمشاركين؟',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    read: true
  },
  {
    id: 'msg-ouargla-reply',
    senderId: 'admin-gen-1',
    senderName: 'عامري رياض يوسف',
    senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    receiverId: 'vol-ouargla-1',
    receiverName: 'نادي واحات ورقلة',
    content: 'وعليكم السلام ورحمة الله! أهلاً بأبطال ورقلة الأوفياء، تم اعتماد المبادرة ومنح 250 نقطة لكل متطوع بالإضافة لمضاعف الستريك 🔥 بوركت جهودكم!',
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    read: true
  },
  {
    id: 'msg-1',
    senderId: 'admin-gen-1',
    senderName: 'عامري رياض يوسف',
    senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    receiverId: 'admin-inst-1',
    receiverName: 'مهدي رواء نور السلام',
    content: 'السلام عليكم أختي رواء، تم اعتماد خطة النشاط التطوعي لدار الشباب وتفعيل نقاط إضافية للمتطوعين.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    read: true
  },
  {
    id: 'msg-2',
    senderId: 'admin-inst-1',
    senderName: 'مهدي رواء نور السلام',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    receiverId: 'admin-gen-1',
    receiverName: 'عامري رياض يوسف',
    content: 'وعليكم السلام ورحمة الله أخي رياض! ممتاز جداً، بدأنا تسجيل الأفواج اليوم وستكون التغطية جاهزة في شمس ميديا.',
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    read: true
  },
  {
    id: 'msg-3',
    senderId: 'admin-media-1',
    senderName: 'مهدي اروى بدر التمام',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    receiverId: 'admin-gen-1',
    receiverName: 'عامري رياض يوسف',
    content: 'أهلاً سيدي المدير، أعددنا مقالاً وتغطية حصرية حول تحديات الستريك التطوعي وخريطة شمس ماب الجديدة 🔥',
    createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    read: false
  }
];
