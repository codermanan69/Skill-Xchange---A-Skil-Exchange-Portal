// ═══════════════════════════════════════════════
// Skill Xchange — Requests Mock Data
// ═══════════════════════════════════════════════

export const initialRequests = [
  {
    id: 'req_1',
    fromUserId: 'user_3',
    toUserId: 'user_1',
    skillOffered: 'Python',
    skillWanted: 'React',
    message: 'Hi Rahul! I\'d love to learn React from you. I can teach you Python and Django in return. I have experience with data science projects that could be interesting!',
    status: 'pending', // pending, accepted, rejected
    createdAt: '2024-09-14T10:30:00Z',
  },
  {
    id: 'req_2',
    fromUserId: 'user_4',
    toUserId: 'user_3',
    skillOffered: 'Digital Marketing',
    skillWanted: 'Python',
    message: 'Hey Neha! Your Python skills would be really helpful for building marketing automation scripts. I can teach you all about digital marketing and SEO!',
    status: 'accepted',
    createdAt: '2024-09-10T14:00:00Z',
  },
  {
    id: 'req_3',
    fromUserId: 'user_5',
    toUserId: 'user_2',
    skillOffered: 'Graphic Design',
    skillWanted: 'UI/UX Design',
    message: 'Hi Aman! I\'m a graphic designer looking to transition into UI/UX. Would love to learn from your experience with Figma and user research.',
    status: 'accepted',
    createdAt: '2024-09-08T09:15:00Z',
  },
];
