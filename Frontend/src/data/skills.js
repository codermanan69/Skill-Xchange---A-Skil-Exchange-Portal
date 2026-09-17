// ═══════════════════════════════════════════════
// Skill Xchange — Skills Mock Data
// ═══════════════════════════════════════════════

export const skillCategories = [
  {
    id: 'cat_dev',
    name: 'Development',
    color: '#6366f1',
    bgColor: '#eef2ff',
  },
  {
    id: 'cat_design',
    name: 'Design',
    color: '#d946ef',
    bgColor: '#fdf4ff',
  },
  {
    id: 'cat_marketing',
    name: 'Marketing',
    color: '#f59e0b',
    bgColor: '#fffbeb',
  },
  {
    id: 'cat_data',
    name: 'Data & AI',
    color: '#10b981',
    bgColor: '#ecfdf5',
  },
  {
    id: 'cat_business',
    name: 'Business',
    color: '#3b82f6',
    bgColor: '#eff6ff',
  },
];

export const skills = [
  // Development
  { id: 'skill_react', name: 'React', categoryId: 'cat_dev', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'skill_js', name: 'JavaScript', categoryId: 'cat_dev', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'skill_html', name: 'HTML/CSS', categoryId: 'cat_dev', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'skill_nextjs', name: 'Next.js', categoryId: 'cat_dev', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'skill_nodejs', name: 'Node.js', categoryId: 'cat_dev', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'skill_python', name: 'Python', categoryId: 'cat_dev', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'skill_django', name: 'Django', categoryId: 'cat_dev', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'skill_tailwind', name: 'Tailwind CSS', categoryId: 'cat_dev', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'skill_cloud', name: 'Cloud Computing', categoryId: 'cat_dev', color: '#6366f1', bgColor: '#eef2ff' },

  // Design
  { id: 'skill_uiux', name: 'UI/UX Design', categoryId: 'cat_design', color: '#d946ef', bgColor: '#fdf4ff' },
  { id: 'skill_figma', name: 'Figma', categoryId: 'cat_design', color: '#d946ef', bgColor: '#fdf4ff' },
  { id: 'skill_xd', name: 'Adobe XD', categoryId: 'cat_design', color: '#d946ef', bgColor: '#fdf4ff' },
  { id: 'skill_wireframe', name: 'Wireframing', categoryId: 'cat_design', color: '#d946ef', bgColor: '#fdf4ff' },
  { id: 'skill_gdesign', name: 'Graphic Design', categoryId: 'cat_design', color: '#d946ef', bgColor: '#fdf4ff' },
  { id: 'skill_photoshop', name: 'Photoshop', categoryId: 'cat_design', color: '#d946ef', bgColor: '#fdf4ff' },
  { id: 'skill_illustrator', name: 'Illustrator', categoryId: 'cat_design', color: '#d946ef', bgColor: '#fdf4ff' },
  { id: 'skill_branding', name: 'Branding', categoryId: 'cat_design', color: '#d946ef', bgColor: '#fdf4ff' },

  // Marketing
  { id: 'skill_dmarketing', name: 'Digital Marketing', categoryId: 'cat_marketing', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'skill_seo', name: 'SEO', categoryId: 'cat_marketing', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'skill_gads', name: 'Google Ads', categoryId: 'cat_marketing', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'skill_content', name: 'Content Writing', categoryId: 'cat_marketing', color: '#f59e0b', bgColor: '#fffbeb' },

  // Data & AI
  { id: 'skill_datasci', name: 'Data Science', categoryId: 'cat_data', color: '#10b981', bgColor: '#ecfdf5' },
  { id: 'skill_ml', name: 'Machine Learning', categoryId: 'cat_data', color: '#10b981', bgColor: '#ecfdf5' },
  { id: 'skill_analytics', name: 'Data Analytics', categoryId: 'cat_data', color: '#10b981', bgColor: '#ecfdf5' },
];

export function getSkillColor(skillName) {
  const skill = skills.find((s) => s.name === skillName);
  return skill ? { color: skill.color, bgColor: skill.bgColor } : { color: '#64748b', bgColor: '#f1f5f9' };
}
