// ═══════════════════════════════════════════════
// Skill Xchange — Discover Page
// Integrates with backend GET /api/users/discover
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Search, Compass, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import UserCard from '../components/UserCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

export default function Discover() {
  const { currentUser } = useAuth();
  const { sendRequest, refreshKey } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedSkillWanted, setSelectedSkillWanted] = useState('');
  const [selectedSkillOffered, setSelectedSkillOffered] = useState('');
  const [users, setUsers] = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchDiscover() {
      setIsLoading(true);
      try {
        const data = await userService.getDiscoverUsers({
          search: searchQuery,
          category: selectedCategory,
        });
        if (isMounted) {
          setUsers(data.users || []);
          setTopMatches(data.matches || []);
        }
      } catch (err) {
        console.warn('Error fetching discover users:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchDiscover();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory, refreshKey]);

  if (!currentUser) return null;

  const handleSendRequest = (user) => {
    setSelectedUser(user);
    setRequestMessage(`Hi ${user.name.split(' ')[0]}! I'd love to exchange skills with you.`);

    // Pre-select matching skills if available
    const match = topMatches.find((m) => (m.user.id || m.user._id) === (user.id || user._id));
    if (match) {
      setSelectedSkillWanted(match.matchingSkills[0] || (user.skillsTeaching && user.skillsTeaching[0]) || '');
      setSelectedSkillOffered(match.reverseMatch[0] || (currentUser.skillsTeaching && currentUser.skillsTeaching[0]) || '');
    } else {
      setSelectedSkillWanted((user.skillsTeaching && user.skillsTeaching[0]) || '');
      setSelectedSkillOffered((currentUser.skillsTeaching && currentUser.skillsTeaching[0]) || '');
    }
    setShowRequestModal(true);
  };

  const submitRequest = async () => {
    if (!selectedSkillWanted || !selectedSkillOffered) {
      toast.error('Please select skills to exchange');
      return;
    }
    setIsSending(true);
    try {
      const targetUserId = selectedUser.id || selectedUser._id;
      const result = await sendRequest({
        fromUserId: currentUser.id || currentUser._id,
        toUserId: targetUserId,
        skillWanted: selectedSkillWanted,
        skillOffered: selectedSkillOffered,
        message: requestMessage,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Request sent to ${selectedUser.name}!`);
        setShowRequestModal(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setIsSending(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Skills' },
    { id: 'cat_dev', name: 'Development' },
    { id: 'cat_design', name: 'Design' },
    { id: 'cat_marketing', name: 'Marketing' },
    { id: 'cat_data', name: 'Data & AI' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-1">Discover Skills</h1>
        <p className="text-surface-500">Find people who teach what you want to learn</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, skill, or title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-surface-600 border border-surface-200 hover:border-surface-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoading && users.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="flex items-center gap-2 text-surface-400 text-sm">
            <Loader2 size={20} className="animate-spin text-primary-500" />
            Loading skills and matches...
          </div>
        </div>
      ) : (
        <>
          {/* Top Matches */}
          {topMatches.length > 0 && selectedCategory === 'all' && !searchQuery && (
            <div>
              <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Compass size={14} className="text-primary-500" /> Top Matches For You
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {topMatches.slice(0, 3).map(({ user, matchingSkills, reverseMatch }) => (
                  <UserCard
                    key={user.id || user._id}
                    user={user}
                    matchingSkills={matchingSkills || []}
                    reverseMatch={reverseMatch || []}
                    onSendRequest={handleSendRequest}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Users */}
          <div>
            <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Users'}
              <span className="ml-2 text-surface-400 normal-case">({users.length})</span>
            </h2>
            {users.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {users.map((user) => {
                  const match = topMatches.find((m) => (m.user.id || m.user._id) === (user.id || user._id));
                  return (
                    <UserCard
                      key={user.id || user._id}
                      user={user}
                      matchingSkills={match?.matchingSkills || user.matchingSkills || []}
                      reverseMatch={match?.reverseMatch || user.reverseMatch || []}
                      onSendRequest={handleSendRequest}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No users found"
                description="Try a different search term or category"
              />
            )}
          </div>
        </>
      )}

      {/* Send Request Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Send Learning Request" size="md">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
              <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-medium text-surface-800">{selectedUser.name}</p>
                <p className="text-sm text-surface-400">{selectedUser.title}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">I want to learn</label>
              <select
                value={selectedSkillWanted}
                onChange={(e) => setSelectedSkillWanted(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">Select a skill</option>
                {(selectedUser.skillsTeaching || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">I can teach</label>
              <select
                value={selectedSkillOffered}
                onChange={(e) => setSelectedSkillOffered(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">Select a skill</option>
                {(currentUser.skillsTeaching || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Message</label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRequestModal(false)}
                disabled={isSending}
                className="flex-1 py-2.5 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitRequest}
                disabled={isSending}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
