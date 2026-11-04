import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserAccount, DirectMessage } from '../types';
import { saveImageToFileSystem } from '../utils/fileStorage';
import { 
  Send, 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Search, 
  User as UserIcon, 
  Flame, 
  MapPin, 
  Check, 
  CheckCheck, 
  Sparkles, 
  Smile, 
  PhoneCall, 
  Play, 
  Pause, 
  Volume2, 
  X,
  Upload,
  ArrowRight,
  MessageSquare,
  Users
} from 'lucide-react';

interface DirectChatViewProps {
  onOpenProfile?: (user: UserAccount) => void;
}

const QUICK_REPLIES = [
  'وعليكم السلام ورحمة الله! ✨',
  'جاهز للمشاركة الميدانية بكل حماس 💪',
  'سأكون متواجداً في الموعد إن شاء الله 🌴',
  'بارك الله في جهودكم الميدانية 🇩🇿',
  'تم الاطلاع وسأرسل التقرير قريباً 📋',
  'بالتوفيق لكل متطوعي ولايتنا ورقلة وتقرت 🌴'
];

export const DirectChatView: React.FC<DirectChatViewProps> = ({ onOpenProfile }) => {
  const { 
    currentUser, 
    allUsers, 
    directMessages, 
    activeChatPartner, 
    openChatWithUser, 
    sendDirectMessage,
    showToast,
    isLoggedIn,
    openAuthModal
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'admins' | 'clubs'>('all');
  const [messageInput, setMessageInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeAudioPlayingId, setActiveAudioPlayingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Group messages for current user and identify conversation partners
  const conversationPartners = useMemo(() => {
    const partnerMap = new Map<string, { user: UserAccount; lastMsg?: DirectMessage; unread: number }>();

    // 1. First add users from existing messages
    directMessages.forEach(msg => {
      const isMeSender = msg.senderId === currentUser.id;
      const otherId = isMeSender ? msg.receiverId : msg.senderId;
      const otherUser = allUsers.find(u => u.id === otherId);

      if (otherUser && otherUser.id !== currentUser.id) {
        const existing = partnerMap.get(otherUser.id);
        const isUnread = !msg.read && msg.receiverId === currentUser.id;

        if (!existing || new Date(msg.createdAt) > new Date(existing.lastMsg?.createdAt || 0)) {
          partnerMap.set(otherUser.id, {
            user: otherUser,
            lastMsg: msg,
            unread: (existing?.unread || 0) + (isUnread ? 1 : 0)
          });
        }
      }
    });

    // 2. Also ensure allUsers (staff, clubs, etc.) are reachable even if no messages yet
    allUsers.forEach(u => {
      if (u.id !== currentUser.id && !partnerMap.has(u.id)) {
        partnerMap.set(u.id, {
          user: u,
          lastMsg: undefined,
          unread: 0
        });
      }
    });

    return Array.from(partnerMap.values());
  }, [directMessages, allUsers, currentUser.id]);

  // Filtered partners based on search & tab
  const filteredPartners = useMemo(() => {
    return conversationPartners.filter(({ user }) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        user.name.toLowerCase().includes(q) || 
        (user.wilaya && user.wilaya.toLowerCase().includes(q)) ||
        (user.username && user.username.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (filterTab === 'admins') {
        return user.role.includes('admin');
      }
      if (filterTab === 'clubs') {
        return user.role === 'institution' || !!user.institutionType;
      }
      return true;
    });
  }, [conversationPartners, searchQuery, filterTab]);

  // Selected current chat user (fallback to first partner if none selected)
  const currentPartner: UserAccount = activeChatPartner || (filteredPartners[0]?.user || allUsers.find(u => u.id !== currentUser.id) || currentUser);

  // Messages between current user and selected partner
  const threadMessages = useMemo(() => {
    if (!currentPartner) return [];
    return directMessages.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === currentPartner.id) ||
      (m.senderId === currentPartner.id && m.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [directMessages, currentUser.id, currentPartner?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length, attachedImage]);

  // Voice note timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }
    if (!messageInput.trim() && !attachedImage) return;

    sendDirectMessage(currentPartner.id, messageInput.trim(), attachedImage || undefined);
    setMessageInput('');
    setAttachedImage(null);
  };

  const handleSendVoiceNote = () => {
    setIsRecording(false);
    const duration = Math.max(recordingSeconds, 3);
    sendDirectMessage(
      currentPartner.id, 
      `🎤 رسالة صوتية ميدانية (${duration} ثانية)`, 
      undefined, 
      true, 
      duration
    );
    showToast({
      type: 'success',
      title: 'تم إرسال التسجيل الصوتي 🎙️',
      message: `تم إرسال رسالة صوتية إلى ${currentPartner.name}.`
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl, record } = await saveImageToFileSystem(file, 'post');
      setAttachedImage(dataUrl);
      showToast({
        type: 'success',
        title: 'تم حفظ الصورة في الملفات 📁',
        message: `تم حفظ "${record.name}" وإرفاقها بالمحادثة.`
      });
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (typeof loadEvt.target?.result === 'string') {
          setAttachedImage(loadEvt.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden text-right animate-in fade-in duration-300" dir="rtl">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-amber-300 shadow-xs">
            💬
          </div>
          <div>
            <h2 className="text-sm font-black text-white">
              نظام المحادثات المباشرة بين المتطوعين (Shams Chat)
            </h2>
            <p className="text-[11px] text-emerald-200">
              تواصل فوري وآمن بين المتطوعين، قادة النوادي والمسؤولين لترتيب المبادرات الميدانية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>ستريك التواصل مضاعف 🔥</span>
        </div>
      </div>

      {/* Main 2-Column Chat Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[640px] max-h-[780px]">
        
        {/* Right Column: Contacts / Conversations List (4 of 12 cols on desktop) */}
        <div className="md:col-span-4 lg:col-span-4 border-l border-slate-200 bg-slate-50/70 flex flex-col">
          
          {/* Search Box */}
          <div className="p-3.5 border-b border-slate-200/80 space-y-2.5 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن متطوع، نادي، أو ولاية..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                  filterTab === 'all' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                الكل ({conversationPartners.length})
              </button>
              <button
                onClick={() => setFilterTab('admins')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                  filterTab === 'admins' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                المسؤولين 🛡️
              </button>
              <button
                onClick={() => setFilterTab('clubs')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                  filterTab === 'clubs' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                النوادي والواحات 🌴
              </button>
            </div>
          </div>

          {/* Contacts List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
            {filteredPartners.length > 0 ? (
              filteredPartners.map(({ user, lastMsg, unread }) => {
                const isSelected = currentPartner.id === user.id;

                return (
                  <div
                    key={user.id}
                    onClick={() => openChatWithUser(user)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition ${
                      isSelected 
                        ? 'bg-emerald-50/90 border border-emerald-200 shadow-2xs' 
                        : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                      />
                      {/* Active Status Dot */}
                      <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${isSelected ? 'font-black text-emerald-950' : 'font-bold text-slate-900'}`}>
                          {user.name}
                        </span>
                        {user.streakCount && user.streakCount > 0 && (
                          <span className="text-[10px] font-black text-orange-600 flex items-center gap-0.5 shrink-0 bg-orange-50 px-1 rounded">
                            <Flame className="w-3 h-3 fill-orange-500" />
                            <span>{user.streakCount}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-[11px] text-slate-600 truncate max-w-[150px]">
                          {lastMsg ? lastMsg.content : (user.bio || user.wilaya || 'متطوع مسجل')}
                        </p>
                        {unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-medium truncate">
                          {user.wilaya || 'الجزائر'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-slate-600 text-xs">
                لا يوجد مستخدم يطابق البحث.
              </div>
            )}
          </div>

        </div>

        {/* Left Column: Active Chat Conversation (8 of 12 cols on desktop) */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col bg-white">
          
          {/* Chat Partner Header Bar */}
          <div className="p-3.5 px-5 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <img
                src={currentPartner.avatar}
                alt={currentPartner.name}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900">{currentPartner.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {currentPartner.role === 'general_admin' && 'المدير العام للمنصة 👑'}
                    {currentPartner.role === 'institution_admin' && 'مسؤول هيكل شباني 🏛️'}
                    {currentPartner.role === 'media_admin' && 'إعلام المنصة 📸'}
                    {currentPartner.role === 'evaluator_admin' && 'مقيّم إثباتات 🛡️'}
                    {currentPartner.role === 'institution' && 'نادي / جمعية 🌴'}
                    {currentPartner.role === 'individual' && 'متطوع ميداني 🌟'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>{currentPartner.wilaya || 'الجزائر'}</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">نشط الآن</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {onOpenProfile && (
                <button
                  onClick={() => onOpenProfile(currentPartner)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>الملف الشخصي</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick replies chips */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-600 shrink-0">ردود سريعة:</span>
            {QUICK_REPLIES.map((rep, idx) => (
              <button
                key={idx}
                onClick={() => setMessageInput(rep)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-[11px] font-medium text-slate-700 hover:text-emerald-800 whitespace-nowrap shadow-2xs transition cursor-pointer shrink-0"
              >
                {rep}
              </button>
            ))}
          </div>

          {/* Messages Thread Timeline */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
            {threadMessages.length > 0 ? (
              threadMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-start flex-row-reverse' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-lg object-cover mb-1 shrink-0"
                      />
                    )}

                    <div className={`max-w-[78%] rounded-2xl p-3 shadow-xs space-y-1.5 ${
                      isMe 
                        ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-bl-xs' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-br-xs'
                    }`}>
                      
                      {/* Attached image if any */}
                      {msg.mediaUrl && (
                        <div className="rounded-xl overflow-hidden border border-white/20 mb-1 max-h-56">
                          <img src={msg.mediaUrl} alt="صورة مرفقة" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Voice Note Player if audio note */}
                      {msg.isVoiceNote ? (
                        <div className={`flex items-center gap-2.5 p-2 rounded-xl ${
                          isMe ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                        }`}>
                          <button
                            onClick={() => setActiveAudioPlayingId(activeAudioPlayingId === msg.id ? null : msg.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
                              isMe ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {activeAudioPlayingId === msg.id ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>
                          
                          {/* Audio Wave Visualizer */}
                          <div className="flex-1 flex items-center gap-0.5 h-6">
                            {[40, 70, 30, 90, 60, 100, 45, 80, 55, 30, 75, 95, 60].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all ${
                                  isMe ? 'bg-white/80' : 'bg-emerald-600'
                                } ${activeAudioPlayingId === msg.id ? 'animate-pulse' : ''}`}
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>

                          <span className="text-[10px] font-mono shrink-0">
                            0:{String(msg.audioDuration || 15).padStart(2, '0')}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}

                      <div className={`flex items-center justify-end gap-1 text-[9px] ${
                        isMe ? 'text-emerald-200' : 'text-slate-400'
                      }`}>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-600 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl shadow-xs">
                  👋
                </div>
                <div className="text-sm font-bold text-slate-800">لا توجد رسائل سابقة مع {currentPartner.name}</div>
                <p className="text-xs max-w-sm">
                  ابدأ المحادثة الآن ونسق مع المتطوع لإنجاز الأنشطة الميدانية وتبادل الخبرات!
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached image preview prior to sending */}
          {attachedImage && (
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={attachedImage} alt="مرفق" className="w-14 h-14 rounded-xl object-cover border border-white shadow-xs" />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">صورة مرفقة جاهزة للإرسال</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">محفوظة في ملفات النظام</div>
                </div>
              </div>
              <button
                onClick={() => setAttachedImage(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Voice recording indicator */}
          {isRecording && (
            <div className="p-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3 text-rose-700 text-xs font-bold">
                <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span>جاري تسجيل رسالة صوتية... {recordingSeconds} ثانية</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendVoiceNote}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  إرسال التسجيل
                </button>
                <button
                  onClick={() => setIsRecording(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Attach photo button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition cursor-pointer"
              title="إرفاق صورة من الملفات"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Voice record button */}
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                isRecording 
                  ? 'bg-rose-100 text-rose-600' 
                  : 'hover:bg-slate-100 text-slate-500 hover:text-rose-600'
              }`}
              title="تسجيل رسالة صوتية"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`اكتب رسالة إلى ${currentPartner.name}...`}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50/60"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!messageInput.trim() && !attachedImage}
              className="p-2.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-4 h-4 ml-0.5" />
              <span className="hidden sm:inline text-xs font-black">إرسال</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
