// ═══════════════════════════════════════════════
// Skill Xchange — Sessions Page
// Integrates with backend APIs at /api/sessions
// ═══════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Plus,
  Coins,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { sessionService } from '../services/sessionService';
import { requestService } from '../services/requestService';
import { getUserById } from '../data/users';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

export default function Sessions() {
  const { currentUser, reloadUser } = useAuth();
  const { refreshKey, refresh } = useApp();

  const [tab, setTab] = useState('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [creditAmount, setCreditAmount] = useState(50);

  // Create session form
  const [newSession, setNewSession] = useState({
    partnerId: '',
    requestId: '',
    role: 'teacher',
    skill: '',
    topic: '',
    date: '',
    time: '',
    duration: 60,
  });

  const currentUserId = currentUser?.id || currentUser?._id;

  const fetchSessionData = useCallback(async () => {
    try {
      const [sessionsData, reqsData] = await Promise.all([
        sessionService.getSessions(),
        requestService.getAllRequests(),
      ]);

      setUpcoming(sessionsData.upcoming || []);
      setCompleted(sessionsData.completed || []);

      // Build connections from accepted requests
      const allReqs = reqsData?.requests || [];
      const accepted = allReqs.filter((r) => r.status === 'accepted');

      const mappedConnections = accepted.map((r) => {
        const fromId = r.fromUser?._id ? r.fromUser._id.toString() : (r.fromUser?.id || r.fromUser || r.fromUserId);
        const toId = r.toUser?._id ? r.toUser._id.toString() : (r.toUser?.id || r.toUser || r.toUserId);
        const isFromCurrent = fromId === currentUserId;
        const partner = isFromCurrent ? r.toUser : r.fromUser;
        const partnerId = isFromCurrent ? toId : fromId;

        return {
          partnerId,
          requestId: r.id,
          partnerName: typeof partner === 'object' && partner?.name ? partner.name : (getUserById(partnerId)?.name || 'Connection'),
          suggestedSkill: isFromCurrent ? r.skillWanted : r.skillOffered,
          skillOffered: r.skillOffered,
          skillWanted: r.skillWanted,
          isFromCurrent,
        };
      });

      // De-duplicate connections by partnerId
      const uniquePartners = [];
      const seen = new Set();
      mappedConnections.forEach((c) => {
        if (!seen.has(c.partnerId) && c.partnerId !== currentUserId) {
          seen.add(c.partnerId);
          uniquePartners.push(c);
        }
      });

      setConnections(uniquePartners);
    } catch (err) {
      console.warn('Failed to fetch session data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchSessionData();
    }
  }, [fetchSessionData, refreshKey, currentUserId]);

  if (!currentUser) return null;

  const sessions = tab === 'upcoming' ? upcoming : completed;

  const handlePartnerSelect = (partnerId) => {
    const conn = connections.find((c) => c.partnerId === partnerId);
    if (!conn) {
      setNewSession((prev) => ({ ...prev, partnerId }));
      return;
    }

    const teachingSkill = conn.isFromCurrent ? conn.skillOffered : conn.skillWanted;
    const learningSkill = conn.isFromCurrent ? conn.skillWanted : conn.skillOffered;
    const resolvedSkill = newSession.role === 'teacher' ? (teachingSkill || conn.suggestedSkill) : (learningSkill || conn.suggestedSkill);

    setNewSession((prev) => ({
      ...prev,
      partnerId,
      requestId: conn.requestId || '',
      skill: resolvedSkill || prev.skill,
    }));
  };

  const handleRoleChange = (role) => {
    const conn = connections.find((c) => c.partnerId === newSession.partnerId);
    let resolvedSkill = newSession.skill;
    if (conn) {
      const teachingSkill = conn.isFromCurrent ? conn.skillOffered : conn.skillWanted;
      const learningSkill = conn.isFromCurrent ? conn.skillWanted : conn.skillOffered;
      resolvedSkill = role === 'teacher' ? (teachingSkill || resolvedSkill) : (learningSkill || resolvedSkill);
    }
    setNewSession((prev) => ({
      ...prev,
      role,
      skill: resolvedSkill,
    }));
  };

  const handleCreateSession = async () => {
    if (!newSession.partnerId || !newSession.skill || !newSession.date || !newSession.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const isTeacher = newSession.role === 'teacher';
      const teacherId = isTeacher ? currentUserId : newSession.partnerId;
      const learnerId = isTeacher ? newSession.partnerId : currentUserId;

      await sessionService.createSession({
        partnerId: newSession.partnerId,
        requestId: newSession.requestId || undefined,
        teacherId,
        learnerId,
        role: newSession.role,
        skill: newSession.skill,
        topic: newSession.topic || `${newSession.skill} Session`,
        date: newSession.date,
        time: newSession.time,
        duration: Number(newSession.duration) || 60,
      });

      toast.success('Session scheduled successfully!');
      setShowCreateModal(false);
      setNewSession({ partnerId: '', requestId: '', role: 'teacher', skill: '', topic: '', date: '', time: '', duration: 60 });
      refresh();
      await fetchSessionData();
    } catch (err) {
      toast.error(err.message || 'Failed to schedule session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSession = (session) => {
    setSelectedSession(session);
    setRating(0);
    setReview('');
    setCreditAmount(50);
    setShowCompleteModal(true);
  };

  const submitCompletion = async () => {
    if (!selectedSession) return;
    setIsSubmitting(true);

    try {
      await sessionService.completeSession(selectedSession.id, {
        creditAmount: Number(creditAmount) || 50,
        rating: rating > 0 ? rating : undefined,
        review: review.trim() ? review.trim() : undefined,
      });

      toast.success('Session completed! Credits transferred.');
      setShowCompleteModal(false);
      setTab('completed');

      if (reloadUser) {
        await reloadUser();
      }
      refresh();
      await fetchSessionData();
    } catch (err) {
      toast.error(err.message || 'Failed to complete session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!confirm('Are you sure you want to cancel this scheduled session?')) return;
    setIsSubmitting(true);
    try {
      await sessionService.cancelSession(sessionId);
      toast.success('Session cancelled');
      refresh();
      await fetchSessionData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Sessions</h1>
          <p className="text-surface-500">Manage your learning sessions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} /> Schedule Session
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === 'upcoming' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === 'completed' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
          }`}
        >
          Completed ({completed.length})
        </button>
      </div>

      {/* Session List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="flex items-center gap-2 text-surface-400 text-sm">
            <Loader2 size={20} className="animate-spin text-primary-500" />
            Loading sessions...
          </div>
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4 stagger-children">
          {sessions.map((session) => {
            const teacherId = session.teacher?._id ? session.teacher._id.toString() : (session.teacher?.id || session.teacherId);
            const isTeacher = teacherId === currentUserId;
            const otherUserRaw = isTeacher ? (session.learner || session.learnerId) : (session.teacher || session.teacherId);
            const otherUser = typeof otherUserRaw === 'object' && otherUserRaw !== null
              ? otherUserRaw
              : (getUserById(otherUserRaw) || { name: 'Connection', avatar: '' });

            return (
              <div key={session.id} className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <Avatar src={otherUser?.avatar} name={otherUser?.name} size="md" isOnline={otherUser?.isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-surface-900">{session.topic || session.skill}</h3>
                      <StatusBadge status={session.status} />
                    </div>
                    <p className="text-sm text-surface-500 mt-0.5">
                      {isTeacher ? 'Teaching' : 'Learning from'} {otherUser?.name} • {session.skill}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-surface-400">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {session.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {session.time}</span>
                      <span className="flex items-center gap-1"><Video size={12} /> {session.duration} min</span>
                    </div>

                    {session.rating && (
                      <div className="mt-3 p-3 bg-surface-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <StarRating rating={session.rating} size={14} />
                          <span className="text-xs text-surface-500">({session.rating}/5)</span>
                        </div>
                        {session.review && <p className="text-sm text-surface-600 italic">"{session.review}"</p>}
                      </div>
                    )}

                    {session.creditsTransferred > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-success-600">
                        <Coins size={14} />
                        <span>{session.creditsTransferred} credits transferred</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {session.status === 'scheduled' && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-surface-100">
                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Video size={14} /> Join Session <ExternalLink size={12} />
                      </a>
                    )}
                    <button
                      onClick={() => handleCompleteSession(session)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-success-500 text-white rounded-lg text-sm font-medium hover:bg-success-600 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Mark Complete
                    </button>
                    <button
                      onClick={() => handleCancelSession(session.id)}
                      disabled={isSubmitting}
                      className="px-4 py-2 border border-surface-200 text-surface-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 ml-auto"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={tab === 'upcoming' ? 'No upcoming sessions' : 'No completed sessions'}
          description="Schedule a session with your accepted connections to start learning!"
          action={() => setShowCreateModal(true)}
          actionLabel="Schedule Session"
        />
      )}

      {/* Create Session Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Schedule a Session" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">With *</label>
            <select
              value={newSession.partnerId}
              onChange={(e) => handlePartnerSelect(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="">Select a connection</option>
              {connections.map((c) => (
                <option key={c.partnerId} value={c.partnerId}>{c.partnerName}</option>
              ))}
            </select>
            {connections.length === 0 && (
              <p className="text-xs text-surface-400 mt-1">
                No accepted connections yet. Accept an exchange request to schedule a session.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">My Role *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={`py-2 px-3 rounded-lg text-sm font-medium border text-center transition-colors cursor-pointer ${
                  newSession.role === 'teacher'
                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                    : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                🎓 Teacher (I'll teach)
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('learner')}
                className={`py-2 px-3 rounded-lg text-sm font-medium border text-center transition-colors cursor-pointer ${
                  newSession.role === 'learner'
                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                    : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                📖 Learner (I'll learn)
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Skill *</label>
            <input
              type="text"
              value={newSession.skill}
              onChange={(e) => setNewSession({ ...newSession, skill: e.target.value })}
              placeholder="e.g. React, Python"
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Topic</label>
            <input
              type="text"
              value={newSession.topic}
              onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
              placeholder="e.g. React Hooks Deep Dive"
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Date *</label>
              <input
                type="date"
                value={newSession.date}
                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Time *</label>
              <input
                type="time"
                value={newSession.time}
                onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Duration</label>
            <select
              value={newSession.duration}
              onChange={(e) => setNewSession({ ...newSession, duration: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
              className="flex-1 py-2.5 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSession}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Schedule
            </button>
          </div>
        </div>
      </Modal>

      {/* Complete Session Modal */}
      <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="Complete Session" size="md">
        {selectedSession && (
          <div className="space-y-4">
            <p className="text-sm text-surface-600">
              Complete the session on <strong className="text-surface-900">{selectedSession.skill}</strong>.
            </p>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Credits to Transfer</label>
              <div className="relative">
                <Coins size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warning-500" />
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <p className="text-xs text-surface-400 mt-1">Default is 50 credits for a completed 1-hour session.</p>
            </div>

            {(() => {
              const teacherId = selectedSession.teacher?._id ? selectedSession.teacher._id.toString() : (selectedSession.teacher?.id || selectedSession.teacherId);
              const isTeacher = teacherId === currentUserId;
              const teacherName = typeof selectedSession.teacher === 'object' && selectedSession.teacher?.name ? selectedSession.teacher.name : (isTeacher ? 'you' : 'Teacher');
              const learnerName = typeof selectedSession.learner === 'object' && selectedSession.learner?.name ? selectedSession.learner.name : (isTeacher ? 'Learner' : 'you');
              return (
                <div className="p-3 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-600 flex items-center gap-2">
                  <Coins size={14} className="text-warning-500 shrink-0" />
                  <span>
                    <strong>{creditAmount || 50} credits</strong> will be deducted from <strong>{learnerName}</strong> and added to <strong>{teacherName}</strong>.
                  </span>
                </div>
              );
            })()}

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Rate this session</label>
              <div className="flex gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <span className={`text-2xl ${rating >= star ? 'text-warning-400' : 'text-surface-200'}`}>★</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Leave a Review (optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCompleteModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitCompletion}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-success-500 text-white rounded-lg text-sm font-semibold hover:bg-success-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Complete & Settle
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
