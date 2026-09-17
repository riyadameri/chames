import { NotificationItem } from '../types';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-welcome',
    type: 'badge_earned',
    title: 'مرحباً بك في منصة شمس التطوع 🇩🇿',
    message: 'تم إطلاق المنصة الوطنية بنجاح. بصفتك المدير العام، يمكنك إدارة الحسابات، المؤسسات الشبانية، والنوادي التطوعية.',
    timestamp: 'الآن',
    isRead: false,
    linkTab: 'dashboard',
    actor: {
      name: 'منصة شمس الوطنية',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      role: 'general_admin',
    },
  },
];
