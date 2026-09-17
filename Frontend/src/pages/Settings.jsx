// ═══════════════════════════════════════════════
// Skill Xchange — Settings Page
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { User, Bell, Shield, Save, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import SkillTag from '../components/SkillTag';
import { skills } from '../data/skills';

export default function Settings() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!currentUser) return null;

  const [profile, setProfile] = useState({
    name: currentUser.name,
    title: currentUser.title,
    bio: currentUser.bio || '',
    location: currentUser.location || '',
    email: currentUser.email,
  });

  const [notifSettings, setNotifSettings] = useState({
    emailRequests: true,
    emailSessions: true,
    emailCredits: true,
    pushRequests: true,
    pushSessions: true,
    pushCredits: false,
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-1">Settings</h1>
        <p className="text-surface-500">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === t.id ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar src={currentUser.avatar} name={currentUser.name} size="xl" />
            <div>
              <p className="text-sm font-medium text-surface-800">{currentUser.name}</p>
              <p className="text-xs text-surface-400">Avatar is auto-generated from your name</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
              <input
                type="text" value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Title</label>
              <input
                type="text" value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Location</label>
              <input
                type="text" value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
              <input
                type="email" value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Skills Display */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Teaching Skills</label>
            <div className="flex flex-wrap gap-2">
              {currentUser.skillsTeaching.map((s) => (
                <SkillTag key={s} name={s} size="md" />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Learning Interests</label>
            <div className="flex flex-wrap gap-2">
              {currentUser.skillsLearning.map((s) => (
                <SkillTag key={s} name={s} size="md" />
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-surface-900">Notification Preferences</h3>

          {[
            { key: 'Requests', desc: 'When someone sends you a learning request' },
            { key: 'Sessions', desc: 'Session reminders and updates' },
            { key: 'Credits', desc: 'Credit transfers and wallet updates' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-surface-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-surface-800">{item.key}</p>
                <p className="text-xs text-surface-400">{item.desc}</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings[`email${item.key}`]}
                    onChange={(e) => setNotifSettings({ ...notifSettings, [`email${item.key}`]: e.target.checked })}
                    className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs text-surface-500">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings[`push${item.key}`]}
                    onChange={(e) => setNotifSettings({ ...notifSettings, [`push${item.key}`]: e.target.checked })}
                    className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs text-surface-500">Push</span>
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={handleSaveNotifications}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Save size={16} /> Save Preferences
          </button>
        </div>
      )}

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-surface-900">Account Settings</h3>

          <div className="p-4 bg-surface-50 rounded-lg">
            <h4 className="text-sm font-medium text-surface-800 mb-1">Account Type</h4>
            <p className="text-sm text-surface-500">Free Account — Skill Xchange</p>
          </div>

          <div className="p-4 bg-surface-50 rounded-lg">
            <h4 className="text-sm font-medium text-surface-800 mb-1">Member Since</h4>
            <p className="text-sm text-surface-500">
              {new Date(currentUser.joinedDate).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>

          <div className="p-4 border border-danger-200 rounded-lg bg-danger-50">
            <h4 className="text-sm font-medium text-danger-700 mb-1">Danger Zone</h4>
            <p className="text-xs text-danger-600 mb-3">Once deleted, your account cannot be recovered.</p>
            <button
              onClick={() => toast.error('Account deletion is disabled in demo mode')}
              className="px-4 py-2 border border-danger-300 text-danger-600 rounded-lg text-sm font-medium hover:bg-danger-100 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
