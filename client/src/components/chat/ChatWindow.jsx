import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { formatRelative } from '../../utils/helpers';
import MeetupScheduler from './MeetupScheduler';
import toast from 'react-hot-toast';

const ChatWindow = ({ chat }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [showMeetup, setShowMeetup] = useState(false);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chat.id],
    queryFn: () => chatService.getMessages(chat.id),
    enabled: !!chat.id,
  });

  const sendMutation = useMutation({
    mutationFn: (content) => chatService.sendMessage(chat.id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setMessage('');
    },
    onError: () => toast.error('Failed to send message'),
  });

  // Supabase Realtime subscription
  useEffect(() => {
    if (!chat.id) return;

    const subscription = supabase
      .channel(`chat-${chat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chat.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', chat.id] });
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [chat.id, queryClient]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  const otherUser = user?.id === chat.buyer_id ? chat.seller : chat.buyer;

  const getMessageStyle = (msg) => {
    if (msg.message_type === 'system' || msg.message_type === 'meetup_confirmed' || msg.message_type === 'meetup_request') {
      return 'mx-auto max-w-xs text-center bg-slate-100 text-slate-600 text-sm px-4 py-2 rounded-xl';
    }
    const isMine = msg.sender_id === user?.id;
    return isMine
      ? 'ml-auto bg-primary-600 text-white'
      : 'mr-auto bg-white border border-slate-100 text-slate-800';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          {otherUser?.avatar_url ? (
            <img src={otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
              {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800">{otherUser?.full_name || 'User'}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{chat.listing?.title}</p>
          </div>
        </div>
        <button
          onClick={() => setShowMeetup(true)}
          className="btn-secondary text-sm"
        >
          📅 Schedule Meetup
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-50">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="animate-fade-in">
              <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${getMessageStyle(msg)}`}>
                {msg.content}
              </div>
              <p className={`text-xs text-slate-400 mt-1 ${msg.sender_id === user?.id ? 'text-right' : ''}`}>
                {formatRelative(msg.created_at)}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1"
          disabled={sendMutation.isPending}
        />
        <button
          type="submit"
          disabled={!message.trim() || sendMutation.isPending}
          className="btn-primary px-4"
        >
          {sendMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : '→'}
        </button>
      </form>

      {/* Meetup Scheduler Modal */}
      {showMeetup && (
        <MeetupScheduler
          chatId={chat.id}
          listingId={chat.listing_id}
          onClose={() => setShowMeetup(false)}
        />
      )}
    </div>
  );
};

export default ChatWindow;
