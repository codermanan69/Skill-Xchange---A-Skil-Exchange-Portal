// ═══════════════════════════════════════════════
// Skill Xchange — Sessions Page
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Plus,
  Star,
  Coins,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getUserById } from '../data/users';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

export default function Sessions() {
  const { currentUser } = useAuth();
  const {
    getUpcomingSessions, getCompletedSessions, getConnections,
    createSession, completeSession, rateSession, transferCredits,
    refreshKey,
  } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [creditAmount, setCreditAmount] = useState(50);

  // Create session form
  const [newSession, setNewSession] = useState({
    partnerId: '', skill: '', topic: '', date: '', time: '', duration: 60,
  });

  if (!currentUser) return null;

  const upcoming = getUpcomingSessions(currentUser.id);
  const completed = getCompletedSessions(currentUser.id);
  const connections = getConnections(currentUser.id);
  const sessions = tab === 'upcoming' ? upcoming : completed;

  const handleCreateSession = () => {
    if (!newSession.partnerId || !newSession.skill || !newSession.date || !newSession.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    const partner = getUserById(newSession.partnerId);
    // Determine teacher/learner
    const isTeaching = currentUser.skillsTeaching.includes(newSession.skill);
    createSession({
      teacherId: isTeaching ? currentUser.id : newSession.partnerId,
      learnerId: isTeaching ? newSession.partnerId : currentUser.id,
      skill: newSession.skill,
      topic: newSession.topic || newSession.skill + ' Session',
      date: newSession.date,
      time: newSession.time,
      duration: newSession.duration,
    });
    toast.success('Session scheduled!');
    setShowCreateModal(false);
    setNewSession({ partnerId: '', skill: '', topic: '', date: '', time: '', duration: 60 });
  };

  const handleCompleteSession = (session) => {
    setSelectedSession(session);
    setRating(0);
    setReview('');
    setCreditAmount(50);
    setShowCompleteModal(true);
  };

  const submitCompletion = () => {
    completeSession(selectedSession.id);

    // Transfer credits from learner to teacher
    const isTeacher = selectedSession.teacherId === currentUser.id;
    if (creditAmount > 0) {
      transferCredits({
        fromUserId: isTeacher ? selectedSession.learnerId : currentUser.id,
        toUserId: isTeacher ? currentUser.id : selectedSession.teacherId,
        amount: creditAmount,
        description: `Learned ${selectedSession.skill} from ${getUserById(selectedSession.teacherId)?.name}`,
        sessionId: selectedSession.id,
      });
    }

    if (rating > 0) {
      rateSession(selectedSession.id, rating, review);
    }

    toast.success('Session completed! Credits transferred.');
    setShowCompleteModal(false);
    setTab('completed');
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
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Schedule Session
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'upcoming' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'completed' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
          }`}
        >
          Completed ({completed.length})
        </button>
      </div>

      {/* Session List */}
      {sessions.length > 0 ? (
        <div className="space-y-4 stagger-children">
          {sessions.map((session) => {
            const teacher = getUserById(session.teacherId);
            const learner = getUserById(session.learnerId);
            const isTeacher = session.teacherId === currentUser.id;
            const otherUser = isTeacher ? learner : teacher;

            return (
              <div key={session.id} className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <Avatar src={otherUser?.avatar} name={otherUser?.name} size="md" />
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
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-surface-100">
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      <Video size={14} /> Join Session <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => handleCompleteSession(session)}
                      className="px-4 py-2 bg-success-500 text-white rounded-lg text-sm font-medium hover:bg-success-600 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} /> Mark Complete
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
          description="Schedule a session with your connections to start learning!"
          action={() => setShowCreateModal(true)}
          actionLabel="Schedule Session"
        />
      )}

      {/* Create Session Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Schedule a Session" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">With</label>
            <select
              value={newSession.partnerId}
              onChange={(e) => setNewSession({ ...newSession, partnerId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="">Select a connection</option>
              {connections.map(({ otherUserId }) => {
                const u = getUserById(otherUserId);
                return <option key={otherUserId} value={otherUserId}>{u?.name}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Skill</label>
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
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Date</label>
              <input
                type="date"
                value={newSession.date}
                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Time</label>
              <input
                type="time"
                value={newSession.time}
                onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCreateModal(false)}
              className="flex-1 py-2.5 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleCreateSession}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
              Schedule
            </button>
          </div>
        </div>
      </Modal>

      {/* Complete Session Modal */}
      <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="Complete Session" size="md">
        {selectedSession && (
          <div className="space-y-5">
            <div className="p-3 bg-surface-50 rounded-lg">
              <p className="text-sm font-medium text-surface-800">{selectedSession.topic || selectedSession.skill}</p>
              <p className="text-xs text-surface-400">
                with {getUserById(selectedSession.teacherId === currentUser.id ? selectedSession.learnerId : selectedSession.teacherId)?.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Transfer Credits</label>
              <div className="flex items-center gap-3">
                <Coins size={18} className="text-warning-500" />
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                  min="0"
                  max="500"
                  className="w-24 px-3 py-2 rounded-lg border border-surface-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                <span className="text-sm text-surface-500">credits to teacher</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Rate this session</label>
              <StarRating rating={rating} interactive onChange={setRating} size={28} />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Write a review</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                placeholder="How was your experience?"
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-2.5 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors">
                Cancel
              </button>
              <button onClick={submitCompletion}
                className="flex-1 py-2.5 bg-success-500 text-white rounded-lg text-sm font-semibold hover:bg-success-600 transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Complete & Transfer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
