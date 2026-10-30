import React, { useEffect, useState } from 'react';
import { MessageSquare, X, Volume2, VolumeX, ArrowRight, Sparkles } from 'lucide-react';
import { audioNotifier, ToastNotification } from '../utils/audioNotification';

interface ChatNotificationToastProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
  onOpenChat: (chatId: string) => void;
}

export default function ChatNotificationToast({
  notifications,
  onDismiss,
  onOpenChat,
}: ChatNotificationToastProps) {
  const [soundEnabled, setSoundEnabled] = useState(audioNotifier.isEnabled());

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioNotifier.setEnabled(next);
    if (next) {
      audioNotifier.playReceivedSound();
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      id="chat-live-toast-container"
    >
      {notifications.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          onClick={() => {
            onOpenChat(toast.chatId);
            onDismiss(toast.id);
          }}
          className="pointer-events-auto bg-white/95 backdrop-blur-md border border-orange-200/90 rounded-2xl shadow-2xl p-4 flex items-start gap-3 transition-all duration-300 hover:scale-[1.02] hover:border-orange-400 cursor-pointer animate-slide-up group text-left"
        >
          {/* Avatar / Icon */}
          <div className="relative shrink-0">
            <img
              src={toast.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={toast.senderName}
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-100 shadow-xs"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          {/* Message Body */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-xs text-gray-900 truncate">
                  {toast.senderName}
                </span>
                {toast.senderRole && (
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono shrink-0 ${
                    toast.senderRole.toLowerCase() === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : toast.senderRole.toLowerCase() === 'tutor' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {toast.senderRole}
                  </span>
                )}
              </div>

              <span className="text-[9px] text-gray-400 font-mono shrink-0">
                {toast.timestamp}
              </span>
            </div>

            <p className="text-[11.5px] text-gray-650 line-clamp-2 leading-relaxed font-sans font-medium">
              {toast.content}
            </p>

            <div className="pt-1 flex items-center justify-between text-[10px]">
              <span className="text-orange-600 font-bold group-hover:underline flex items-center gap-1">
                <span>Reply in Chat</span>
                <ArrowRight className="w-3 h-3 text-orange-500" />
              </span>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={toggleSound}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors"
                  title={soundEnabled ? 'Chime sound is ON (click to mute)' : 'Chime sound is MUTED (click to enable)'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3 h-3 text-orange-600" />
                  ) : (
                    <VolumeX className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(toast.id);
            }}
            className="text-gray-400 hover:text-gray-700 p-1 -mr-1 -mt-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
