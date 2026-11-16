// ═══════════════════════════════════════════════
// Skill Xchange — Chat Page
// Integrates with backend REST APIs at /api/chat
// ═══════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { chatService } from '../services/chatService';
import { requestService } from '../services/requestService';
import { getUserById } from '../data/users';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';

export default function Chat() {
  const { currentUser } = useAuth();
  const { refreshKey, refresh } = useApp();

  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const currentUserId = currentUser?.id || currentUser?._id;

  // Load conversation list and merge with accepted connections
  const fetchConversations = useCallback(async () => {
    try {
      const [convosData, reqsData] = await Promise.all([
        chatService.getConversations(),
        requestService.getAllRequests(),
      ]);

      const convos = convosData || [];
      const seenPartnerIds = new Set(convos.map((c) => c.partner?.id || c.partner?._id));

      // Check for any accepted exchange requests where no messages have been sent yet
      const allReqs = reqsData?.requests || [];
      const acceptedReqs = allReqs.filter((r) => r.status === 'accepted');

      acceptedReqs.forEach((r) => {
        const fromId = r.fromUser?._id ? r.fromUser._id.toString() : (r.fromUser?.id || r.fromUser || r.fromUserId);
        const toId = r.toUser?._id ? r.toUser._id.toString() : (r.toUser?.id || r.toUser || r.toUserId);
        const isFromCurrent = fromId === currentUserId;
        const partner = isFromCurrent ? r.toUser : r.fromUser;
        const partnerId = isFromCurrent ? toId : fromId;

        if (partnerId && partnerId !== currentUserId && !seenPartnerIds.has(partnerId)) {
          seenPartnerIds.add(partnerId);
          convos.push({
            partner: typeof partner === 'object' && partner !== null ? partner : (getUserById(partnerId) || { id: partnerId, name: 'Connection' }),
            lastMessage: null,
            unreadCount: 0,
          });
        }
      });

      setConversations(convos);

      // Auto-select first conversation if none selected and on desktop
      if (!selectedUserId && convos.length > 0 && window.innerWidth >= 640) {
        const firstPartner = convos[0].partner;
        const firstId = firstPartner?.id || firstPartner?._id;
        setSelectedUserId(firstId);
        setSelectedUser(firstPartner);
      }
    } catch (err) {
      console.warn('Failed to fetch conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [currentUserId, selectedUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [fetchConversations, refreshKey, currentUserId]);

  // Load messages when selected user changes
  const fetchMessages = useCallback(async (partnerId, silent = false) => {
    if (!partnerId) return;
    if (!silent) setIsLoadingMessages(true);

    try {
      const data = await chatService.getMessages(partnerId);
      setMessages(data.messages || []);
      if (data.partner) {
        setSelectedUser(data.partner);
      }
    } catch (err) {
      console.warn(`Failed to fetch messages for ${partnerId}:`, err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      // REST polling: refresh conversation every 4 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedUserId, true);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSelectPartner = (partner) => {
    const pId = partner.id || partner._id;
    setSelectedUserId(pId);
    setSelectedUser(partner);
    setShowSidebar(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId || isSending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      const newMsg = await chatService.sendMessage(selectedUserId, textToSend);
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      }
      refresh();
      // Silently sync messages and conversation list
      fetchMessages(selectedUserId, true);
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
      setMessageText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-white rounded-xl border border-surface-200 h-[calc(100vh-8rem)] flex overflow-hidden animate-fade-in">
      {/* Conversations sidebar */}
      <div className={`w-full sm:w-80 border-r border-surface-200 flex flex-col shrink-0 ${
        selectedUserId && !showSidebar ? 'hidden sm:flex' : 'flex'
      }`}>
        <div className="px-4 py-4 border-b border-surface-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-surface-900">Messages</h2>
          <span className="text-xs text-surface-400">({conversations.length})</span>
        </div>

        {isLoadingConversations ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-primary-500" />
          </div>
        ) : conversations.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            {conversations.map(({ partner, lastMessage, unreadCount }) => {
              if (!partner) return null;
              const pId = partner.id || partner._id;
              const isSelected = selectedUserId === pId;

              return (
                <button
                  key={pId}
                  onClick={() => handleSelectPartner(partner)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors text-left cursor-pointer ${
                    isSelected ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  }`}
                >
                  <Avatar src={partner.avatar} name={partner.name} size="md" isOnline={partner.isOnline} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{partner.name}</p>
                    {lastMessage ? (
                      <p className="text-xs text-surface-400 truncate">
                        {lastMessage.senderId === currentUserId ? 'You: ' : ''}{lastMessage.text}
                      </p>
                    ) : (
                      <p className="text-xs text-surface-400 italic">Start a conversation</p>
                    )}
                  </div>
                  {lastMessage && (
                    <span className="text-[10px] text-surface-400 shrink-0">
                      {formatTime(lastMessage.timestamp)}
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary-500 text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <EmptyState
              icon={MessageSquare}
              title="No conversations"
              description="Accept an exchange request to start chatting"
            />
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${
        !selectedUserId || showSidebar ? 'hidden sm:flex' : 'flex'
      }`}>
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-surface-100 flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="sm:hidden p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-500 cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar src={selectedUser.avatar} name={selectedUser.name} size="sm" isOnline={selectedUser.isOnline} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-800 truncate">{selectedUser.name}</p>
                <p className="text-xs text-surface-400">
                  {selectedUser.isOnline ? 'Online' : (selectedUser.title || 'Offline')}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {isLoadingMessages ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-primary-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-surface-400">
                    No messages yet. Say hello to {selectedUser.name}! 👋
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-surface-100 text-surface-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-200' : 'text-surface-400'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="px-4 py-3 border-t border-surface-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending}
                  className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a contact from the sidebar to start chatting"
            />
          </div>
        )}
      </div>
    </div>
  );
}
