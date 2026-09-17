// ═══════════════════════════════════════════════
// Skill Xchange — Users Mock Data
// ═══════════════════════════════════════════════

export const CURRENT_USER_KEY = 'skillxchange_current_user';

export const users = [
  {
    id: 'user_1',
    name: 'Rahul Sharma',
    email: 'rahul@skillxchange.com',
    password: 'demo123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=b6e3f4',
    title: 'React Developer',
    bio: 'Passionate React developer with 3 years of experience building modern web applications. Love sharing knowledge and helping others grow in frontend development.',
    location: 'Mumbai, India',
    joinedDate: '2024-01-15',
    skillsTeaching: ['React', 'JavaScript', 'HTML/CSS', 'Next.js'],
    skillsLearning: ['UI/UX Design', 'Figma', 'Python'],
    rating: 4.8,
    totalReviews: 24,
    totalSessions: 32,
    credits: 250,
    isOnline: true,
  },
  {
    id: 'user_2',
    name: 'Aman Verma',
    email: 'aman@skillxchange.com',
    password: 'demo123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aman&backgroundColor=c0aede',
    title: 'UI/UX Designer',
    bio: 'Creative UI/UX designer specializing in user-centered design. Experienced with Figma, Adobe XD, and design systems. Looking to expand into frontend development.',
    location: 'Delhi, India',
    joinedDate: '2024-02-20',
    skillsTeaching: ['UI/UX Design', 'Figma', 'Adobe XD', 'Wireframing'],
    skillsLearning: ['React', 'JavaScript', 'Tailwind CSS'],
    rating: 4.9,
    totalReviews: 31,
    totalSessions: 28,
    credits: 180,
    isOnline: true,
  },
  {
    id: 'user_3',
    name: 'Neha Singh',
    email: 'neha@skillxchange.com',
    password: 'demo123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha&backgroundColor=ffd5dc',
    title: 'Python Developer',
    bio: 'Python developer and data science enthusiast. Experienced in Django, Flask, and machine learning with scikit-learn. Always eager to learn new technologies.',
    location: 'Bangalore, India',
    joinedDate: '2024-03-10',
    skillsTeaching: ['Python', 'Django', 'Data Science', 'Machine Learning'],
    skillsLearning: ['React', 'Node.js', 'Cloud Computing'],
    rating: 4.7,
    totalReviews: 18,
    totalSessions: 22,
    credits: 320,
    isOnline: false,
  },
  {
    id: 'user_4',
    name: 'Arjun Mehta',
    email: 'arjun@skillxchange.com',
    password: 'demo123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=d1f4d9',
    title: 'Digital Marketing Expert',
    bio: 'Digital marketing specialist with expertise in SEO, Google Ads, and social media marketing. Looking to learn programming to build marketing automation tools.',
    location: 'Pune, India',
    joinedDate: '2024-04-05',
    skillsTeaching: ['Digital Marketing', 'SEO', 'Google Ads', 'Content Writing'],
    skillsLearning: ['Python', 'JavaScript', 'Data Analytics'],
    rating: 4.6,
    totalReviews: 15,
    totalSessions: 19,
    credits: 150,
    isOnline: true,
  },
  {
    id: 'user_5',
    name: 'Priya Gupta',
    email: 'priya@skillxchange.com',
    password: 'demo123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=ffdfbf',
    title: 'Graphic Designer',
    bio: 'Creative graphic designer with a passion for branding, illustration, and visual storytelling. Skilled in Adobe Creative Suite and looking to learn web development.',
    location: 'Jaipur, India',
    joinedDate: '2024-05-12',
    skillsTeaching: ['Graphic Design', 'Photoshop', 'Illustrator', 'Branding'],
    skillsLearning: ['HTML/CSS', 'React', 'UI/UX Design'],
    rating: 4.5,
    totalReviews: 12,
    totalSessions: 16,
    credits: 200,
    isOnline: false,
  },
];

export function getUserById(id) {
  return users.find((u) => u.id === id);
}

export function getOtherUsers(currentUserId) {
  return users.filter((u) => u.id !== currentUserId);
}
