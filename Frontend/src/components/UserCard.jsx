// ═══════════════════════════════════════════════
// Skill Xchange — User Card Component
// ═══════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import { MapPin, Star, ArrowRightLeft } from 'lucide-react';
import Avatar from './Avatar';
import SkillTag from './SkillTag';

export default function UserCard({ user, matchingSkills = [], reverseMatch = [], onSendRequest, showActions = true }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/profile/${user.id}`)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={user.avatar} name={user.name} size="lg" isOnline={user.isOnline} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors truncate">
            {user.name}
          </h3>
          <p className="text-sm text-surface-500 truncate">{user.title}</p>
          {user.location && (
            <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
              <MapPin size={12} />
              {user.location}
            </p>
          )}
        </div>
        {user.rating > 0 && (
          <div className="flex items-center gap-1 text-warning-500 shrink-0">
            <Star size={14} className="fill-warning-500" />
            <span className="text-sm font-medium">{user.rating}</span>
          </div>
        )}
      </div>

      {/* Skills they teach */}
      {user.skillsTeaching?.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1.5">Teaches</p>
          <div className="flex flex-wrap gap-1">
            {user.skillsTeaching.slice(0, 4).map((skill) => (
              <SkillTag key={skill} name={skill} size="xs" />
            ))}
            {user.skillsTeaching.length > 4 && (
              <span className="text-xs text-surface-400">+{user.skillsTeaching.length - 4}</span>
            )}
          </div>
        </div>
      )}

      {/* Skills they want to learn */}
      {user.skillsLearning?.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1.5">Wants to learn</p>
          <div className="flex flex-wrap gap-1">
            {user.skillsLearning.slice(0, 3).map((skill) => (
              <SkillTag key={skill} name={skill} size="xs" />
            ))}
          </div>
        </div>
      )}

      {/* Match indicator */}
      {(matchingSkills.length > 0 || reverseMatch.length > 0) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg mb-3">
          <ArrowRightLeft size={14} className="text-primary-500" />
          <p className="text-xs text-primary-700 font-medium">
            {matchingSkills.length > 0 && `Can teach you: ${matchingSkills.join(', ')}`}
            {matchingSkills.length > 0 && reverseMatch.length > 0 && ' • '}
            {reverseMatch.length > 0 && `Wants: ${reverseMatch.join(', ')}`}
          </p>
        </div>
      )}

      {/* Action */}
      {showActions && onSendRequest && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSendRequest(user);
          }}
          className="w-full py-2 px-4 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 active:scale-[0.98] transition-all duration-200"
        >
          Send Request
        </button>
      )}
    </div>
  );
}
