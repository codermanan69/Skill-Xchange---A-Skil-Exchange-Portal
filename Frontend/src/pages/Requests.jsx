// ═══════════════════════════════════════════════
// Skill Xchange — Requests Page
// Integrates with backend GET/PATCH /api/requests
// ═══════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Send, Check, X, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { requestService } from '../services/requestService';
import { getUserById } from '../data/users';
import Avatar from '../components/Avatar';
import SkillTag from '../components/SkillTag';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function Requests() {
  const { currentUser } = useAuth();
  const { acceptRequest, rejectRequest, refreshKey } = useApp();
  const [tab, setTab] = useState('incoming');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  const fetchRequests = useCallback(async () => {
    try {
      const data = await requestService.getAllRequests();
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (err) {
      console.warn('Failed to fetch requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refreshKey]);

  if (!currentUser) return null;

  const requests = tab === 'incoming' ? incoming : outgoing;

  const handleAccept = async (requestId) => {
    setProcessingId(requestId);
    try {
      await acceptRequest(requestId);
      toast.success('Request accepted! You can now chat.');
      await fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await rejectRequest(requestId);
      toast('Request rejected', { icon: '👋' });
      await fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-1">Requests</h1>
        <p className="text-surface-500">Manage your skill exchange requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('incoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            tab === 'incoming'
              ? 'bg-white text-surface-900 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
          }`}
        >
          <Inbox size={16} />
          Incoming
          {incoming.filter((r) => r.status === 'pending').length > 0 && (
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary-500 text-white text-[10px] font-bold">
              {incoming.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
            tab === 'outgoing'
              ? 'bg-white text-surface-900 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
          }`}
        >
          <Send size={16} />
          Outgoing
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="flex items-center gap-2 text-surface-400 text-sm">
            <Loader2 size={20} className="animate-spin text-primary-500" />
            Loading exchange requests...
          </div>
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-3 stagger-children">
          {requests.map((req) => {
            // Resolve other user from populated object or fallback ID
            const target = tab === 'incoming' ? (req.fromUser || req.fromUserId) : (req.toUser || req.toUserId);
            const otherUser = typeof target === 'object' && target !== null
              ? target
              : (getUserById(target) || { name: 'Skill Xchange User', avatar: '' });

            const isProcessing = processingId === req.id;

            return (
              <div key={req.id} className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <Avatar src={otherUser?.avatar} name={otherUser?.name} size="md" isOnline={otherUser?.isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-surface-900">{otherUser?.name}</h3>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-sm text-surface-500 mt-0.5">{otherUser?.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-surface-400">
                        {tab === 'incoming' ? 'Wants to learn' : 'You want to learn'}:
                      </span>
                      <SkillTag name={req.skillWanted} size="xs" />
                      <span className="text-xs text-surface-400">↔</span>
                      <span className="text-xs text-surface-400">
                        {tab === 'incoming' ? 'Can teach' : 'You offer'}:
                      </span>
                      <SkillTag name={req.skillOffered} size="xs" />
                    </div>
                    {req.message && (
                      <p className="text-sm text-surface-600 mt-3 p-3 bg-surface-50 rounded-lg italic">
                        "{req.message}"
                      </p>
                    )}
                    <p className="text-xs text-surface-400 mt-2">
                      {new Date(req.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {tab === 'incoming' && req.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-surface-100">
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={isProcessing}
                      className="flex-1 py-2 bg-success-500 text-white rounded-lg text-sm font-medium hover:bg-success-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={isProcessing}
                      className="flex-1 py-2 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                      Reject
                    </button>
                  </div>
                )}
                {req.status === 'accepted' && (
                  <div className="mt-4 pt-4 border-t border-surface-100">
                    <button
                      onClick={() => navigate('/chat')}
                      className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare size={16} /> Open Chat
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={tab === 'incoming' ? Inbox : Send}
          title={tab === 'incoming' ? 'No incoming requests' : 'No outgoing requests'}
          description={
            tab === 'incoming'
              ? 'When someone wants to exchange skills with you, their request will appear here.'
              : 'Send requests from the Discover page to start exchanging skills.'
          }
          action={() => navigate('/discover')}
          actionLabel="Discover People"
        />
      )}
    </div>
  );
}
