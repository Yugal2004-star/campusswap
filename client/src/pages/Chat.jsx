import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/chat/ChatWindow';
import { formatRelative, getPrimaryImage } from '../utils/helpers';

const ChatList = ({ chats, activeChatId, onSelectChat, currentUserId }) => (
  <div className="w-full h-full overflow-y-auto">
    {chats.length === 0 ? (
      <div className="text-center py-12 text-slate-400">
        <div className="text-4xl mb-2">💬</div>
        <p className="text-sm">No conversations yet</p>
      </div>
    ) : (
      chats.map((chat) => {
        const otherUser = currentUserId === chat.buyer_id ? chat.seller : chat.buyer;
        const unread = currentUserId === chat.buyer_id ? chat.buyer_unread : chat.seller_unread;
        const img = getPrimaryImage(chat.listing?.listing_images);

        return (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${activeChatId === chat.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''}`}
          >
            <div className="flex items-start gap-3">
              {otherUser?.avatar_url ? (
                <img src={otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  {otherUser?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-sm text-slate-800 truncate">{otherUser?.full_name || 'User'}</p>
                  {chat.last_message_at && (
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{formatRelative(chat.last_message_at)}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mb-1">{chat.listing?.title}</p>
                {chat.last_message && (
                  <p className="text-xs text-slate-400 truncate">{chat.last_message}</p>
                )}
              </div>
              {unread > 0 && (
                <span className="bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {unread}
                </span>
              )}
            </div>
          </button>
        );
      })
    )}
  </div>
);

const Chat = () => {
  const { chatId } = useParams();
  const { user } = useAuth();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: chatService.getAll,
    refetchInterval: 10000,
  });

  const activeChat = chatId ? chats.find((c) => c.id === chatId) : null;

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Messages</h1>

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-80 border-r border-slate-100 flex-shrink-0">
            <ChatList
              chats={chats}
              activeChatId={chatId}
              onSelectChat={(chat) => window.location.href = `/chat/${chat.id}`}
              currentUserId={user?.id}
            />
          </div>

          {/* Chat Window */}
          <div className="flex-1">
            {activeChat ? (
              <ChatWindow chat={activeChat} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="text-5xl mb-3">👈</div>
                  <p className="text-sm">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
