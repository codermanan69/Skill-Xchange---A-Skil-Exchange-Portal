// ═══════════════════════════════════════════════
// Skill Xchange — Sessions Mock Data
// ═══════════════════════════════════════════════

export const initialSessions = [
  {
    id: 'ses_1',
    requestId: 'req_2',
    teacherId: 'user_3',
    learnerId: 'user_4',
    skill: 'Python',
    topic: 'Python Basics & Data Types',
    date: '2024-09-16',
    time: '15:00',
    duration: 60, // minutes
    status: 'completed', // scheduled, completed, cancelled
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    notes: 'Covered variables, data types, loops, and basic functions.',
    rating: 5,
    review: 'Neha is an excellent teacher! Very patient and explains concepts clearly.',
    completedAt: '2024-09-16T16:05:00Z',
    creditsTransferred: 50,
  },
  {
    id: 'ses_2',
    requestId: 'req_3',
    teacherId: 'user_2',
    learnerId: 'user_5',
    skill: 'UI/UX Design',
    topic: 'Introduction to User Research',
    date: '2024-09-18',
    time: '11:00',
    duration: 45,
    status: 'scheduled',
    meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
    notes: '',
    rating: null,
    review: null,
    completedAt: null,
    creditsTransferred: 0,
  },
];
