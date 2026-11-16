// ═══════════════════════════════════════════════
// Skill Xchange — Register Page
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRightLeft, User, Mail, Lock, Briefcase, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { skills as initialSkills } from '../data/skills';
import { skillService } from '../services/skillService';
import SkillTag from '../components/SkillTag';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', title: '', bio: '', location: '',
    skillsTeaching: [], skillsLearning: [],
  });
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSkills, setAvailableSkills] = useState(initialSkills);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function fetchSkills() {
      try {
        const data = await skillService.getSkills();
        if (isMounted && data?.length) {
          setAvailableSkills(data);
        }
      } catch (err) {
        console.warn('Could not load skills from API:', err);
      }
    }
    fetchSkills();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (field, skillName) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(skillName)
        ? prev[field].filter((s) => s !== skillName)
        : [...prev[field], skillName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register(form);
      if (result.success) {
        toast.success('Welcome to Skill Xchange! 🎉 You received 100 welcome credits.');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillNames = availableSkills.map((s) => s.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <ArrowRightLeft size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">Skill Xchange</span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Create your account</h1>
          <p className="text-surface-500">Join the skill exchange community</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= s ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-400'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-surface-200'} transition-colors`} />}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/50 border border-surface-100 p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1 — Basic Info */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Basic Information</h3>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="John Doe" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Title</label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g. React Developer" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)}
                  className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer">
                  Continue
                </button>
              </div>
            )}

            {/* Step 2 — Skills to Teach */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold text-surface-900 mb-1">What can you teach?</h3>
                <p className="text-sm text-surface-500 mb-4">Select skills you're confident teaching others.</p>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {skillNames.map((name) => (
                    <button key={name} type="button" onClick={() => toggleSkill('skillsTeaching', name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer ${
                        form.skillsTeaching.includes(name)
                          ? 'bg-primary-50 text-primary-700 border-primary-300'
                          : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
                      }`}>
                      {name}
                    </button>
                  ))}
                </div>
                {form.skillsTeaching.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-surface-100">
                    {form.skillsTeaching.map((s) => (
                      <SkillTag key={s} name={s} size="sm" removable onRemove={() => toggleSkill('skillsTeaching', s)} />
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors cursor-pointer">
                    Back
                  </button>
                  <button type="button" onClick={() => setStep(3)}
                    className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Skills to Learn */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold text-surface-900 mb-1">What do you want to learn?</h3>
                <p className="text-sm text-surface-500 mb-4">Select skills you're interested in learning.</p>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {skillNames.map((name) => (
                    <button key={name} type="button" onClick={() => toggleSkill('skillsLearning', name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer ${
                        form.skillsLearning.includes(name)
                          ? 'bg-accent-50 text-accent-700 border-accent-300'
                          : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
                      }`}>
                      {name}
                    </button>
                  ))}
                </div>
                {form.skillsLearning.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-surface-100">
                    {form.skillsLearning.map((s) => (
                      <SkillTag key={s} name={s} size="sm" removable onRemove={() => toggleSkill('skillsLearning', s)} />
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 transition-colors disabled:opacity-50 cursor-pointer">
                    Back
                  </button>
                  <button type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-4 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
