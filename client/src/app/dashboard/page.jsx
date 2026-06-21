'use client';
import { useEffect, useState } from 'react';
import { useAuth }   from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api           from '../../lib/api';
import { FileText, Upload, Users, Shield, Clock, TrendingUp } from 'lucide-react';
import Link          from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router            = useRouter();
  const [docs,  setDocs]  = useState([]);
  const [stats, setStats] = useState({ total: 0, shared: 0, recent: 0 });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/documents').then(res => {
      const data = res.data.data || [];
      setDocs(data);
      setStats({ total: data.length, shared: data.filter(d => d.owner_id !== user.id).length, recent: data.slice(0, 5).length });
    }).catch(console.error);
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-lg">Cloud DMS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/documents" className="btn-ghost text-sm">Documents</Link>
          <Link href="/search"    className="btn-ghost text-sm">Search</Link>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your documents</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Documents', value: stats.total,  icon: FileText,   color: 'blue' },
            { label: 'Shared With Me',  value: stats.shared, icon: Users,      color: 'purple' },
            { label: 'Recent Activity', value: stats.recent, icon: Clock,      color: 'green' },
            { label: 'Your Role',       value: user?.role,   icon: Shield,     color: 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                color === 'blue'   ? 'bg-blue-50 text-blue-600' :
                color === 'purple' ? 'bg-purple-50 text-purple-600' :
                color === 'green'  ? 'bg-green-50 text-green-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/documents" className="card p-6 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
            <Upload size={24} className="text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Upload Document</h3>
            <p className="text-sm text-gray-500">Upload and manage your files securely</p>
          </Link>
          <Link href="/search" className="card p-6 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
            <TrendingUp size={24} className="text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Search Documents</h3>
            <p className="text-sm text-gray-500">Find documents with advanced filters</p>
          </Link>
          <Link href="/documents" className="card p-6 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
            <Shield size={24} className="text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Manage Access</h3>
            <p className="text-sm text-gray-500">Control who can view your documents</p>
          </Link>
        </div>

        {/* Recent Documents */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Documents</h2>
            <Link href="/documents" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {['Name', 'Type', 'Size', 'Owner', 'Modified'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docs.slice(0, 8).map((doc, i) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <Link href={`/documents/${doc.id}`} className="font-medium text-blue-600 hover:underline truncate max-w-xs block">
                        {doc.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}</td>
                    <td className="px-6 py-3 text-gray-500">{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}</td>
                    <td className="px-6 py-3 text-gray-500">{doc.owner_name || '—'}</td>
                    <td className="px-6 py-3 text-gray-500">{formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}</td>
                  </tr>
                ))}
                {docs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No documents yet — upload your first file!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}