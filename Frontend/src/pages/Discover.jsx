// ═══════════════════════════════════════════════
// Skill Xchange — Discover Page
// ═══════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { Search, Filter, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import UserCard from '../components/UserCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { skills } from '../data/skills';

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

  if (!currentUser) return null;

  const allMatches = userService.getSkillMatches(currentUser.id);
  const otherUsers = userService.getOtherUsers(currentUser.id);

  // Filter users
  const filteredUsers = useMemo(() => {
    let list = otherUsers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q) ||
          u.skillsTeaching.some((s) => s.toLowerCase().includes(q)) ||
          u.skillsLearning.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'all') {
      const catSkills = skills.filter((s) => s.categoryId === selectedCategory).map((s) => s.name);
      list = list.filter((u) =>
        u.skillsTeaching.some((s) => catSkills.includes(s))
      );
    }
    return list;
  }, [otherUsers, searchQuery, selectedCategory]);

  const handleSendRequest = (user) => {
    setSelectedUser(user);
    setRequestMessage(`Hi ${user.name.split(' ')[0]}! I'd love to exchange skills with you.`);
    // Pre-select matching skills
    const match = allMatches.find((m) => m.user.id === user.id);
    if (match) {
      setSelectedSkillWanted(match.matchingSkills[0] || '');
      setSelectedSkillOffered(match.reverseMatch[0] || currentUser.skillsTeaching[0] || '');
    } else {
      setSelectedSkillWanted(user.skillsTeaching[0] || '');
      setSelectedSkillOffered(currentUser.skillsTeaching[0] || '');
    }
    setShowRequestModal(true);
  };

  const submitRequest = () => {
    if (!selectedSkillWanted || !selectedSkillOffered) {
      toast.error('Please select skills to exchange');
      return;
    }
    const result = sendRequest({
      fromUserId: currentUser.id,
      toUserId: selectedUser.id,
      skillWanted: selectedSkillWanted,
      skillOffered: selectedSkillOffered,
      message: requestMessage,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Request sent to ${selectedUser.name}!`);
      setShowRequestModal(false);
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
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
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

      {/* Top Matches */}
      {allMatches.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <div>
          <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Compass size={14} className="text-primary-500" /> Top Matches For You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {allMatches.slice(0, 3).map(({ user, matchingSkills, reverseMatch }) => (
              <UserCard
                key={user.id}
                user={user}
                matchingSkills={matchingSkills}
                reverseMatch={reverseMatch}
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
          <span className="ml-2 text-surface-400 normal-case">({filteredUsers.length})</span>
        </h2>
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {filteredUsers.map((user) => {
              const match = allMatches.find((m) => m.user.id === user.id);
              return (
                <UserCard
                  key={user.id}
                  user={user}
                  matchingSkills={match?.matchingSkills || []}
                  reverseMatch={match?.reverseMatch || []}
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
                {selectedUser.skillsTeaching.map((s) => (
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
                {currentUser.skillsTeaching.map((s) => (
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
              <button onClick={() => setShowRequestModal(false)}
                className="flex-1 py-2.5 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors">
                Cancel
              </button>
              <button onClick={submitRequest}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
                Send Request
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
