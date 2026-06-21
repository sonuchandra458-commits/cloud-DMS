'use client';
import { useState, useEffect } from 'react';
import { useAuth }   from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api           from '../../lib/api';
import toast         from 'react-hot-toast';
import { User, Lock, Bell, Shield, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const TABS = [
  { id: 'profile',       label: 'Profile',        icon: User   },
  { id: 'password',      label: 'Change Password', icon: Lock   },
  { id: 'notifications', label: 'Notifications',   icon: Bell   },
  { id: 'roles',         label: 'Roles & Access',  icon: Shield },
];

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router            = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving,    setSaving]    = useState(false);

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [notifications, setNotifications] = useState({
    emailUploads: true, emailShares: true, emailComments: false, browserAlerts: true,
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) setProfile({ name: user.name || '', email: user.email || '' });
  }, [user, loading, router]);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await api.put(`/users/${user.id}`, { name: profile.name, email: profile.email });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSaving(true);
    try {
      await api.put(`/users/${user.id}`, { password: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error('Password change failed');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="btn-ghost p-1.5"><ArrowLeft size={18} /></Link>
        <h1 className="font-semibold text-gray-900 text-lg">Settings</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-52 flex-shrink-0">
            <div className="card p-2 space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card p-6 animate-fade-up">
                <h3 className="text-base font-semibold text-gray-900 mb-5">Profile Information</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input-field" value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input-field" value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <input className="input-field bg-gray-50 cursor-not-allowed" value={user?.role || ''} disabled />
                    <p className="text-xs text-gray-400 mt-1">Role can only be changed by Admin</p>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button onClick={handleProfileSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    <Save size={15} /> {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="card p-6 animate-fade-up">
                <h3 className="text-base font-semibold text-gray-900 mb-5">Change Password</h3>
                <div className="space-y-4">
                  {[
                    { key: 'currentPassword', label: 'Current Password', show: 'current' },
                    { key: 'newPassword',     label: 'New Password',     show: 'new'     },
                    { key: 'confirmPassword', label: 'Confirm Password', show: 'confirm' },
                  ].map(({ key, label, show }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <div className="relative">
                        <input
                          type={showPass[show] ? 'text' : 'password'}
                          className="input-field pr-10"
                          placeholder="••••••••"
                          value={passwords[key]}
                          onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass({ ...showPass, [show]: !showPass[show] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPass[show] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <button onClick={handlePasswordSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    <Save size={15} /> {saving ? 'Saving...' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="card p-6 animate-fade-up">
                <h3 className="text-base font-semibold text-gray-900 mb-5">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'emailUploads',  label: 'New Document Uploaded', desc: 'When someone uploads to shared folder' },
                    { key: 'emailShares',   label: 'Document Shared',       desc: 'When someone shares a doc with you' },
                    { key: 'emailComments', label: 'New Comments',          desc: 'When someone comments on your doc' },
                    { key: 'browserAlerts', label: 'Browser Notifications', desc: 'Real-time browser alerts' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${notifications[key] ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifications[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <button onClick={() => toast.success('Preferences saved!')} className="btn-primary flex items-center gap-2">
                    <Save size={15} /> Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <div className="card p-6 animate-fade-up">
                <h3 className="text-base font-semibold text-gray-900 mb-5">Roles & Access Control</h3>
                <div className="space-y-3">
                  {[
                    { role: 'Owner',     color: 'bg-red-50 border-red-200',    dot: 'bg-red-500',    text: 'text-red-700',    perms: ['Full control', 'Delete documents', 'Manage permissions', 'View audit logs'] },
                    { role: 'Admin',     color: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500', text: 'text-purple-700', perms: ['Manage users', 'View all docs', 'Share documents', 'View audit logs'] },
                    { role: 'Editor',    color: 'bg-blue-50 border-blue-200',   dot: 'bg-blue-500',   text: 'text-blue-700',   perms: ['Upload documents', 'Edit documents', 'Add versions', 'Add comments'] },
                    { role: 'Commenter', color: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500', text: 'text-yellow-700', perms: ['View documents', 'Add comments', 'Download files', 'No editing'] },
                    { role: 'Viewer',    color: 'bg-gray-50 border-gray-200',   dot: 'bg-gray-400',   text: 'text-gray-700',   perms: ['Read only access', 'Download files', 'Cannot edit', 'Cannot comment'] },
                  ].map(({ role, color, dot, text, perms }) => (
                    <div key={role} className={`border rounded-xl p-4 ${color}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                        <span className={`font-semibold text-sm ${text}`}>{role}</span>
                        {user?.role === role.toLowerCase() && (
                          <span className="ml-auto text-xs bg-white bg-opacity-70 px-2 py-0.5 rounded-full text-gray-600">Your role</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {perms.map((p, i) => (
                          <div key={i} className={`text-xs ${text} opacity-75 flex items-center gap-1`}>
                            <span>•</span> {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}