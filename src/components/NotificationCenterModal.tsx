import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppNotificationType, NotificationItem } from '../types';
import { 
  Bell, 
  Check, 
  Trash2, 
  X, 
  Sparkles, 
  Heart, 
  MessageSquare, 
  Compass, 
  Award, 
  FileCheck, 
  AlertCircle,
  ExternalLink,
  CheckCheck,
  Zap,
  Filter
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  onSelectActivityById?: (activityId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectActivityById
}) => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotification, 
    clearAllNotifications,
    simulateDemoNotification,
    activities
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'points' | 'social' | 'activities'>('all');
  const [showSimulateBar, setShowSimulateBar] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close (for desktop dropdown positioning)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter notifications
  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'points') {
      return item.type === 'points_earned' || item.type === 'badge_earned' || item.type === 'submission_approved';
    }
    if (activeFilter === 'social') {
      return item.type === 'post_liked' || item.type === 'post_comment';
    }
    if (activeFilter === 'activities') {
      return item.type === 'new_activity';
    }
    return true;
  });

  const handleItemClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);

    if (item.actionTargetId && item.type === 'new_activity') {
      if (onSelectActivityById) {
        onSelectActivityById(item.actionTargetId);
      } else if (onNavigateTab) {
        onNavigateTab('activities');
      }
      onClose();
      return;
    }

    if (item.linkTab && onNavigateTab) {
      onNavigateTab(item.linkTab);
      onClose();
    }
  };

  const getNotificationIcon = (type: AppNotificationType) => {
    switch (type) {
      case 'points_earned':
        return (
          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <Sparkles className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
        );
      case 'post_liked':
        return (
          <div className="w-9 h-9 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
        );
      case 'post_comment':
        return (
          <div className="w-9 h-9 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
        );
      case 'new_activity':
        return (
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <Compass className="w-5 h-5 text-emerald-600" />
          </div>
        );
      case 'badge_earned':
        return (
          <div className="w-9 h-9 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
        );
      case 'submission_approved':
        return (
          <div className="w-9 h-9 rounded-2xl bg-teal-500/15 text-teal-600 flex items-center justify-center shrink-0 border border-teal-200">
            <FileCheck className="w-5 h-5 text-teal-600" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
            <AlertCircle className="w-5 h-5 text-slate-500" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-start sm:p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200">
      <div 
        ref={modalRef}
        className="w-full sm:w-[460px] md:w-[500px] h-full sm:h-auto sm:max-h-[85vh] bg-white sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 sm:mr-auto sm:ml-4 sm:mt-16 text-right"
        dir="rtl"
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  الإشعارات والتنبيهات
                </h3>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-black shadow-2xs animate-pulse">
                    {unreadNotificationsCount} جديد
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                تحديثات فورية حول النقاط، التفاعلات، والمبادرات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSimulateBar(!showSimulateBar)}
              className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                showSimulateBar ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
              }`}
              title="تجربة محاكاة إشعار فوري"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline text-[11px]">اختبار</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* QUICK SIMULATION TESTING BAR (Allows testing all notification types easily) */}
        {showSimulateBar && (
          <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2.5 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                محاكاة إشعار فوري تجريبي:
              </span>
              <span className="text-[10px] text-amber-700">اضغط لتوليد إشعار فوري</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                onClick={() => simulateDemoNotification('points_earned')}
                className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition cursor-pointer text-center"
              >
                + نقاط جديدة
              </button>
              <button
                onClick={() => simulateDemoNotification('post_liked')}
                className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition cursor-pointer text-center"
              >
                ❤️ إعجاب بمنشور
              </button>
              <button
                onClick={() => simulateDemoNotification('post_comment')}
                className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition cursor-pointer text-center"
              >
                💬 تعليق جديد
              </button>
              <button
                onClick={() => simulateDemoNotification('new_activity')}
                className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition cursor-pointer text-center"
              >
                🎯 نشاط تطوعي
              </button>
            </div>
          </div>
        )}

        {/* FILTER PILLS & ACTION TOOLBAR */}
        <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('points')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'points'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              النقاط والتكريمات
            </button>
            <button
              onClick={() => setActiveFilter('social')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'social'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              تفاعلات وتعليقات
            </button>
            <button
              onClick={() => setActiveFilter('activities')}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'activities'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              نشاطات جديدة
            </button>
          </div>

          {/* Quick Global Actions */}
          <div className="flex items-center gap-1 shrink-0 text-slate-500">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                title="تحديد الكل كمقروء"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">قراءة الكل</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                title="مسح جميع الإشعارات"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* NOTIFICATIONS LIST CONTENT */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <h4 className="text-sm font-black text-slate-700 mb-1">
                لا توجد إشعارات في هذا التصنيف
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                ستتلقى إشعارات فورية عند حصولك على نقاط جديدة، إعجاب بمنشوراتك، أو إطلاق نشاطات تطوعية جديدة.
              </p>
              <button
                onClick={() => simulateDemoNotification()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>إرسال إشعار تجريبي الآن</span>
              </button>
            </div>
          ) : (
            filteredNotifications.map(item => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`relative group p-3 sm:p-3.5 rounded-2xl transition cursor-pointer border ${
                  !item.isRead 
                    ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/80' 
                    : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                {/* Unread indicator dot */}
                {!item.isRead && (
                  <span className="absolute top-3.5 left-3 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                )}

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  {getNotificationIcon(item.type)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-xs sm:text-sm leading-snug truncate ${!item.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2">
                      {item.message}
                    </p>

                    {/* Metadata Footer: Actor info & Points badge & Action */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80">
                      {item.actor ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={item.actor.avatar}
                            alt={item.actor.name}
                            className="w-4 h-4 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">
                            {item.actor.name}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-2">
                        {item.points && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            +{item.points} نقطة
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-emerald-700 group-hover:underline flex items-center gap-0.5">
                          <span>معاينة</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition rounded-md"
                          title="حذف هذا الإشعار"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>شمس التطوع — الإشعارات الحية</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
