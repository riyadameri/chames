import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserAccount, DirectMessage } from '../types';
import { saveImageToFileSystem } from '../utils/fileStorage';
import { 
  X, 
  Send, 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Search, 
  User, 
  Flame, 
  MapPin, 
  Check, 
  CheckCheck, 
  Sparkles,
  Paperclip,
  Smile,
  ArrowRight
} from 'lucide-react';

interface DirectChatDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: (user: UserAccount) => void;
}

const QUICK_CHIPS = [
  'السلام عليكم ورحمة الله 🌿',
  'مبارك الستريك التطوعي! 🔥',
  'أود الانضمام والمشاركة في نشاطكم القادم 🤝',
  'متى موعد الانطلاق الميداني؟ 📍',
  'تم رفع إثبات المشاركة بنجاح ✨'
];

export const DirectChatDrawerModal: React.FC<DirectChatDrawerModalProps> = ({
  isOpen,
  onClose,
  onOpenProfile
}) => {
  const { 
    currentUser, 
    allUsers, 
    directMessages, 
    activeChatPartner, 
    openChatWithUser, 
    sendDirectMessage,
    conversations,
    showToast 
  } = useApp();

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(activeChatPartner);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync selected user with context activeChatPartner
  useEffect(() => {
    if (activeChatPartner) {
      setSelectedUser(activeChatPartner);
    } else if (conversations.length > 0 && !selectedUser) {
      const firstPartner = allUsers.find(u => u.id === conversations[0].participantId);
      if (firstPartner) setSelectedUser(firstPartner);
    }
  }, [activeChatPartner, conversations, allUsers]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [directMessages, selectedUser]);

  if (!isOpen) return null;

  // Messages between current user and selected partner
  const activeThread = selectedUser ? directMessages.filter(
    m => (m.senderId === currentUser.id && m.receiverId === selectedUser.id) ||
         (m.senderId === selectedUser.id && m.receiverId === currentUser.id)
  ) : [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedUser) return;

    sendDirectMessage(selectedUser.id, inputText.trim());
    setInputText('');
  };

  const handleSendQuickChip = (chipText: string) => {
    if (!selectedUser) return;
    sendDirectMessage(selectedUser.id, chipText);
  };

  // Image attachment
  const handleAttachImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    try {
      const { dataUrl, record } = await saveImageToFileSystem(file, 'post');
      sendDirectMessage(
        selectedUser.id,
        'أرفق صورة في المحادثة 📷',
        dataUrl
      );
      showToast({
        type: 'success',
        title: 'تم إرسال الصورة في المحادثة',
        message: `تم إرفاق "${record.name}" بنجاح.`
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Voice note recording simulation
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (selectedUser && recordingSeconds > 0) {
        sendDirectMessage(
          selectedUser.id,
          'رسالة صوتية 🎙️',
          undefined,
          true,
          recordingSeconds
        );
      }
    }
  };

  // Filter conversations & contacts
  const filteredUsers = allUsers.filter(u => {
    if (u.id === currentUser.id) return false;
    if (!searchQuery) return true;
    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 text-right animate-in fade-in duration-200"
      dir="rtl"
    >
      <div 
        className="bg-white sm:rounded-3xl max-w-4xl w-full h-full sm:h-[88vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ================= LEFT / TOP: CONVERSATIONS LIST ================= */}
        <div className={`w-full md:w-80 border-b md:border-b-0 md:border-l border-slate-200 flex flex-col bg-slate-50/70 shrink-0 ${
          selectedUser ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                💬
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">المحادثات الخاصة</h3>
                <span className="text-[10px] text-slate-500 font-medium">مراسلة الأفراد والنوادي الشبانية</span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition cursor-pointer md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-200/60 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن متطوع أو مؤسسة..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-100 border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const conv = conversations.find(c => c.participantId === u.id);
              const isSelected = selectedUser?.id === u.id;

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`p-3.5 flex items-center gap-3 transition cursor-pointer hover:bg-emerald-50/60 ${
                    isSelected ? 'bg-emerald-100/70 border-r-4 border-emerald-600' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                    />
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {u.name}
                      </div>
                      {(u.streakCount || 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                          <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          <span>{u.streakCount}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 truncate flex items-center justify-between">
                      <span className="truncate">
                        {conv ? conv.lastMessage.content : u.wilaya}
                      </span>
                      {conv && conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ================= RIGHT / MAIN: ACTIVE CHAT THREAD ================= */}
        {selectedUser ? (
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            
            {/* Active Chat Header */}
            <div className="p-3.5 px-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs shrink-0">
              <div className="flex items-center gap-3">
                {/* Back button on mobile */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 md:hidden cursor-pointer"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div 
                  onClick={() => onOpenProfile && onOpenProfile(selectedUser)}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <img 
                    src={selectedUser.avatar} 
                    alt={selectedUser.name} 
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition"
                  />
                  <div>
                    <div className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{selectedUser.name}</span>
                      {(selectedUser.streakCount || 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                          <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          <span>{selectedUser.streakCount} يوم</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span className="text-emerald-700 font-bold">متصل الآن 🟢</span>
                      <span>•</span>
                      <span>{selectedUser.wilaya}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenProfile && onOpenProfile(selectedUser)}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>الملف الشخصي</span>
                </button>

                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/60 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-500 font-bold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                ردود سريعة:
              </span>
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuickChip(chip)}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-[11px] font-medium text-slate-700 whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gradient-to-b from-slate-50/50 to-white">
              {activeThread.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-3 shadow-inner">
                    👋
                  </div>
                  <h4 className="font-black text-sm text-slate-800">ابدأ المحادثة مع {selectedUser.name}</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    يمكنك التنسيق حول المشاريع التطوعية المشتركة، الاستفسار، وتبادل الخبرات.
                  </p>
                </div>
              ) : (
                activeThread.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;

                  return (
                    <div 
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {!isMe && (
                        <img 
                          src={selectedUser.avatar} 
                          alt={selectedUser.name} 
                          className="w-7 h-7 rounded-xl object-cover shrink-0 shadow-2xs"
                        />
                      )}

                      <div className={`max-w-[80%] sm:max-w-md rounded-2xl p-3 shadow-2xs text-right space-y-1.5 ${
                        isMe 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-bl-sm' 
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-br-sm'
                      }`}>
                        
                        {/* Image attachment */}
                        {msg.mediaUrl && (
                          <div className="rounded-xl overflow-hidden max-h-56 bg-slate-900 border border-white/10">
                            <img 
                              src={msg.mediaUrl} 
                              alt="مرفق صورة" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Voice note simulation player */}
                        {msg.isVoiceNote ? (
                          <div className="flex items-center gap-2 py-1">
                            <button
                              onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                                isMe ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {playingAudioId === msg.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 mr-0.5" />
                              )}
                            </button>
                            
                            {/* Waveform graphic */}
                            <div className="flex-1 flex items-center gap-0.5 h-6">
                              {[40, 70, 30, 90, 60, 45, 80, 50, 75, 30, 95, 60, 40].map((h, i) => (
                                <span 
                                  key={i} 
                                  className={`w-1 rounded-full transition-all ${
                                    isMe ? 'bg-white/70' : 'bg-emerald-600/70'
                                  } ${playingAudioId === msg.id ? 'animate-pulse' : ''}`}
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>

                            <span className="text-[10px] font-mono font-bold opacity-80">
                              0:0{msg.audioDuration || 4}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        )}

                        {/* Message metadata (time & check mark) */}
                        <div className={`flex items-center justify-end gap-1 text-[9px] ${
                          isMe ? 'text-emerald-100/90' : 'text-slate-400'
                        }`}>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <CheckCheck className="w-3 h-3 text-emerald-200" />
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleAttachImage}
                className="hidden"
              />

              {isRecording ? (
                <div className="flex items-center justify-between p-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-black">
                    <Mic className="w-4 h-4 text-rose-600" />
                    <span>جارٍ تسجيل رسالة صوتية... ({recordingSeconds} ث)</span>
                  </div>
                  <button
                    onClick={toggleRecording}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black shadow-xs cursor-pointer"
                  >
                    إرسال التسجيل
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-1.5 sm:gap-2">
                  
                  {/* Attach photo */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    title="إرفاق صورة"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Mic button */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    title="تسجيل رسالة صوتية"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Text Input */}
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`اكتب رسالة إلى ${selectedUser.name.split(' ')[0]}...`}
                    className="flex-1 py-2.5 px-4 text-xs sm:text-sm rounded-xl bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 focus:outline-none transition text-right"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 sm:px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4 rotate-180" />
                    <span className="hidden sm:inline">إرسال</span>
                  </button>

                </form>
              )}

            </div>

          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50">
            <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-3xl mb-3">
              💬
            </div>
            <h4 className="font-black text-base text-slate-800">اختر محادثة من القائمة</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              تواصل مباشرة مع المتطوعين، قادة النوادي، ومسؤولي الهياكل الشبانية عبر التراب الوطني.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
