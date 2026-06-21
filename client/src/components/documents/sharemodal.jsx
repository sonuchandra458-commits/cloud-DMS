'use client';
import { useState } from 'react';
import Modal from '../common/Modal';
import { Share2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const PERMISSIONS = ['read', 'write', 'admin'];

export default function ShareModal({ isOpen, onClose, docId, permissions = [], onRefresh }) {
  const [email,      setEmail]      = useState('');
  const [permission, setPermission] = useState('read');
  const [loading,    setLoading]    = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRes = await api.get(`/search?q=${email}`);
      toast.error('Please enter a valid user email');
    } catch {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    try {
      await api.delete(`/documents/${docId}/permissions/${userId}`);
      toast.success('Permission removed');
      onRefresh?.();
    } catch {
      toast.error('Failed to remove permission');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Document" size="md">
      <div className="space-y-5">
        <form onSubmit={handleShare} className="space-y-3">
          <div>
            <label className="label">User Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="colleague@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Permission</label>
            <select className="input-field" value={permission} onChange={e => setPermission(e.target.value)}>
              {PERMISSIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Share2 size={15} />
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </form>

        {permissions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">People with access</p>
            <div className="space-y-2">
              {permissions.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {p.user_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{p.user_name}</p>
                    <p className="text-xs text-gray-500">{p.user_email}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{p.permission}</span>
                  <button onClick={() => handleRemove(p.user_id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}