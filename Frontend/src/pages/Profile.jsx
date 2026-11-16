// ═══════════════════════════════════════════════
// Skill Xchange — User Profile Page
// Integrates with backend GET /api/users/:id
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  BookOpen,
  Star,
  Award,
  Coins,
  MessageSquare,
  ArrowRightLeft,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import { getUserById } from '../data/users';
import Avatar from '../components/Avatar';
import SkillTag from '../components/SkillTag';
import StarRating from '../components/StarRating';

export default function Profile() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const { getBalance, getCompletedSessions, refreshKey } = useApp();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function fetchUserProfile() {
      setIsLoading(true);
      try {
        const profileData = await userService.getUserById(userId);
        if (isMounted) {
          setUser(profileData);
        }
      } catch (err) {
        console.warn('Could not fetch user profile:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (userId) {
      fetchUserProfile();
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-surface-400 text-sm">
          <Loader2 size={20} className="animate-spin text-primary-500" />
          Loading user profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-surface-500">User not found</p>
      </div>
    );
  }

  const isOwnProfile = (currentUser?.id || currentUser?._id) === (user.id || user._id);
  const balance = user.credits ?? getBalance(user.id || user._id);
  const completedSessions = getCompletedSessions(user.id || user._id);

  // Get reviews from completed sessions
  const reviews = completedSessions
    .filter((s) => s.rating && (s.teacherId === (user.id || user._id)))
    .map((s) => ({
      ...s,
      reviewer: getUserById(s.learnerId),
    }));

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        {/* Cover */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 sm:-mt-14 mb-4 flex items-end justify-between">
            <Avatar src={user.avatar} name={user.name} size="xl" isOnline={user.isOnline} />
            {!isOwnProfile && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/chat')}
                  className="px-4 py-2 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={14} />
                  Message
                </button>
                <button
                  onClick={() => navigate('/discover')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRightLeft size={14} />
                  Exchange
                </button>
              </div>
            )}
            {isOwnProfile && (
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Info */}
          <h1 className="text-xl font-bold text-surface-900">{user.name}</h1>
          <p className="text-surface-500">{user.title}</p>
          {user.bio && <p className="text-sm text-surface-600 mt-2 leading-relaxed">{user.bio}</p>}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-surface-400">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {user.location}
              </span>
            )}
            {user.joinedDate && (
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-surface-100">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-warning-500" />
              <span className="text-sm font-semibold text-surface-800">{user.rating || 0}</span>
              <span className="text-sm text-surface-400">({user.totalReviews || 0} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-primary-500" />
              <span className="text-sm font-semibold text-surface-800">{user.totalSessions || 0}</span>
              <span className="text-sm text-surface-400">sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-warning-500" />
              <span className="text-sm font-semibold text-surface-800">{balance}</span>
              <span className="text-sm text-surface-400">credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Teaching */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award size={14} className="text-primary-500" />
            Skills Teaching
          </h3>
          <div className="flex flex-wrap gap-2">
            {(user.skillsTeaching || []).map((skill) => (
              <SkillTag key={skill} name={skill} size="md" />
            ))}
          </div>
        </div>

        {/* Learning */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-accent-500" />
            Wants to Learn
          </h3>
          <div className="flex flex-wrap gap-2">
            {(user.skillsLearning || []).map((skill) => (
              <SkillTag key={skill} name={skill} size="md" />
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-xl border border-surface-200 p-5">
        <h3 className="text-base font-semibold text-surface-900 mb-4">Reviews</h3>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-3 pb-4 border-b border-surface-100 last:border-0 last:pb-0">
                <Avatar src={review.reviewer?.avatar} name={review.reviewer?.name} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-surface-800">{review.reviewer?.name}</span>
                    <StarRating rating={review.rating} size={12} />
                  </div>
                  <p className="text-sm text-surface-600">{review.review}</p>
                  <p className="text-xs text-surface-400 mt-1">
                    {new Date(review.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-400 text-center py-6">No reviews yet</p>
        )}
      </div>
    </div>
  );
}
