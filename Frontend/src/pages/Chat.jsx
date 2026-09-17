// ═══════════════════════════════════════════════
// Skill Xchange — Chat Page
// ═══════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getUserById } from '../data/users';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';

export default function Chat() {
  const { currentUser } = useAuth();
  const { getConnections, getConversation, sendMessage, refreshKey } = useApp();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  if (!currentUser) return null;

  const connections = getConnections(currentUser.id);
  const selectedUser = selectedUserId ? getUserById(selectedUserId) : null;
  const messages = selectedUserId ? getConversation(currentUser.id, selectedUserId) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;
    sendMessage(currentUser.id, selectedUserId, messageText.trim());
    setMessageText('');
  };

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl border border-surface-200 h-[calc(100vh-8rem)] flex overflow-hidden animate-fade-in">
      {/* Conversations sidebar */}
      <div className={`w-full sm:w-80 border-r border-surface-200 flex flex-col shrink-0 ${
        selectedUserId && !showSidebar ? 'hidden sm:flex' : 'flex'
      }`}>
        <div className="px-4 py-4 border-b border-surface-100">
          <h2 className="text-lg font-semibold text-surface-900">Messages</h2>
        </div>
        {connections.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            {connections.map(({ otherUserId }) => {
              const user = getUserById(otherUserId);
              if (!user) return null;
              const convo = getConversation(currentUser.id, otherUserId);
              const lastMsg = convo[convo.length - 1];
              return (
                <button
                  key={otherUserId}
                  onClick={() => { setSelectedUserId(otherUserId); setShowSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors text-left ${
                    selectedUserId === otherUserId ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  }`}
                >
                  <Avatar src={user.avatar} name={user.name} size="md" isOnline={user.isOnline} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{user.name}</p>
                    {lastMsg ? (
                      <p className="text-xs text-surface-400 truncate">
                        {lastMsg.senderId === currentUser.id ? 'You: ' : ''}{lastMsg.text}
                      </p>
                    ) : (
                      <p className="text-xs text-surface-400">Start a conversation</p>
                    )}
                  </div>
                  {lastMsg && (
                    <span className="text-[10px] text-surface-400 shrink-0">
                      {formatTime(lastMsg.timestamp)}
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
              description="Accept a request to start chatting"
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
                className="sm:hidden p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-500"
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar src={selectedUser.avatar} name={selectedUser.name} size="sm" isOnline={selectedUser.isOnline} />
              <div>
                <p className="text-sm font-semibold text-surface-800">{selectedUser.name}</p>
                <p className="text-xs text-surface-400">
                  {selectedUser.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-surface-400">
                    No messages yet. Say hello! 👋
                  </p>
                </div>
              )}
              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isOwn
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-surface-100 text-surface-800 rounded-bl-md'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-200' : 'text-surface-400'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
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
                  className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
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
