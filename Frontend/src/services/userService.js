// ═══════════════════════════════════════════════
// Skill Xchange — User Service
// Currently uses mock data. Replace with API calls later.
// ═══════════════════════════════════════════════

import { users, getUserById, getOtherUsers } from '../data/users';

export const userService = {
  getAllUsers() {
    return [...users];
  },

  getUserById(id) {
    return getUserById(id);
  },

  getOtherUsers(currentUserId) {
    return getOtherUsers(currentUserId);
  },

  /**
   * Search users by skill they can teach
   */
  searchByTeachingSkill(skillName, currentUserId) {
    return users.filter(
      (u) =>
        u.id !== currentUserId &&
        u.skillsTeaching.some((s) => s.toLowerCase().includes(skillName.toLowerCase()))
    );
  },

  /**
   * Find skill matches — users who teach what currentUser wants to learn
   */
  getSkillMatches(currentUserId) {
    const currentUser = getUserById(currentUserId);
    if (!currentUser) return [];

    return users
      .filter((u) => u.id !== currentUserId)
      .map((u) => {
        const matchingSkills = u.skillsTeaching.filter((skill) =>
          currentUser.skillsLearning.includes(skill)
        );
        const reverseMatch = currentUser.skillsTeaching.filter((skill) =>
          u.skillsLearning.includes(skill)
        );
        return {
          user: u,
          matchingSkills,
          reverseMatch,
          matchScore: matchingSkills.length + reverseMatch.length,
        };
      })
      .filter((m) => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * Update user profile (simulated)
   */
  updateProfile(userId, updates) {
    // In a real app, this would PUT to /api/users/:id
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      Object.assign(users[userIndex], updates);
      return { ...users[userIndex] };
    }
    return null;
  },
};
