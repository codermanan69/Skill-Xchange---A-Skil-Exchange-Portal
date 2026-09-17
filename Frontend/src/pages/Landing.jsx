// ═══════════════════════════════════════════════
// Skill Xchange — Landing Page
// ═══════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  BookOpen,
  Coins,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Target,
} from 'lucide-react';
import Avatar from '../components/Avatar';
import { users } from '../data/users';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Teach Your Skills',
      description: 'Share your expertise with others and earn Skill Credits for every session.',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: Coins,
      title: 'Earn Credits',
      description: 'Get rewarded for teaching. Every session adds credits to your wallet.',
      color: 'from-warning-500 to-warning-600',
    },
    {
      icon: GraduationCap,
      title: 'Learn New Skills',
      description: 'Spend your credits to learn from skilled peers in the community.',
      color: 'from-success-500 to-success-600',
    },
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'Our algorithm finds perfect skill matches — people who teach what you want to learn.',
      color: 'from-accent-500 to-accent-600',
    },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'List skills you can teach and skills you want to learn.' },
    { num: '02', title: 'Discover Matches', desc: 'Browse users whose skills complement yours.' },
    { num: '03', title: 'Send a Request', desc: 'Connect with the right people and start exchanging.' },
    { num: '04', title: 'Learn & Teach', desc: 'Schedule sessions, exchange knowledge, earn credits.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <ArrowRightLeft size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900">Skill Xchange</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-200 rounded-full opacity-20 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles size={14} />
            Peer-to-Peer Skill Exchange Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 leading-tight mb-6 animate-fade-in">
            <span className="gradient-text">Teach. Earn. Learn.</span>
            <br />
            <span className="text-surface-900">Exchange Skills, Not Money.</span>
          </h1>
          <p className="text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Join a community where knowledge is currency. Teach your skills, earn credits,
            and spend them to learn something new from talented peers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-500 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
            >
              Start Exchanging Skills
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 text-base font-semibold text-surface-700 bg-white border border-surface-200 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              Try Demo Login
            </button>
          </div>

          {/* Floating avatars */}
          <div className="flex items-center justify-center gap-3 mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex -space-x-3">
              {users.slice(0, 5).map((u) => (
                <img
                  key={u.id}
                  src={u.avatar}
                  alt={u.name}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-warning-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-warning-500" />
                ))}
              </div>
              <p className="text-xs text-surface-500"><strong className="text-surface-700">500+</strong> skills exchanged</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-surface-500 max-w-xl mx-auto">
              A simple, rewarding cycle of teaching and learning.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-surface-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">Get Started in 4 Steps</h2>
          </div>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-start gap-5 group animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <div className="flex-1 pb-6 border-b border-surface-100 last:border-0">
                  <h3 className="text-lg font-semibold text-surface-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-surface-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">Loved by Learners</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { user: users[0], quote: 'Skill Xchange helped me learn UI/UX without spending a rupee. I just taught React in return!' },
              { user: users[1], quote: 'The credit system is genius. I\'ve been teaching Figma and learning JavaScript at the same time.' },
              { user: users[2], quote: 'Found amazing peers who wanted to exchange knowledge. The matching algorithm is spot on!' },
            ].map(({ user, quote }) => (
              <div key={user.id} className="bg-white rounded-2xl p-6 border border-surface-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-1 text-warning-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-warning-500" />
                  ))}
                </div>
                <p className="text-surface-600 mb-5 text-sm leading-relaxed">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{user.name}</p>
                    <p className="text-xs text-surface-400">{user.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-primary-600 to-accent-500 rounded-3xl p-10 sm:p-14 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Exchanging?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of learners and teachers. Your skills are your currency.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 text-base font-semibold text-primary-700 bg-white rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-surface-400">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <ArrowRightLeft size={13} className="text-white" />
            </div>
            <span className="font-semibold text-surface-600">Skill Xchange</span>
          </div>
          <p>© 2024 Skill Xchange. BCA Minor Project.</p>
        </div>
      </footer>
    </div>
  );
}
