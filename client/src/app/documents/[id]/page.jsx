'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../hooks/useSocket';
import VersionHistory from '../../../components/documents/VersionHistory';
import ShareModal from '../../../components/documents/ShareModal';
import ActiveUsers from '../../../components/collaboration/ActiveUsers';
import CommentPanel from '../../../components/collaboration/CommentPanel';
import Loader from '../../../components/common/Loader';
import Link from 'next/link';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import {
  Download, Share2, Clock, Shield,
  ArrowLeft, FileText, MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentPage() {
  const { id }      = useParams();
  const { user }    = useAuth();
  const router      = useRouter();

  const [doc,         setDoc]         = useState(null);
  const [versions,    setVersions]    = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [auditLogs,   setAuditLogs]   = useState([]);
  const [comments,    setComments]    = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState('versions');
  const [shareOpen,   setShareOpen]   = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  const { onActiveUsers, onNewComment, sendComment } = useSocket(id, user);

  const loadDocument = useCallback(async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      setDoc(res.data.data);
    } catch {
      toast.error('Failed to load document');
      router.push('/documents');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const loadVersions = useCallback(async () => {
    try {
      const res = await api.get(`/documents/${id}/versions`);
      setVersions(res.data.data || []);
    } catch { console.error('versions load failed'); }
  }, [id]);

  const loadPermissions = useCallback(async () => {
    try {
      const res = await api.get(`/documents/${id}/permissions`);
      setPermissions(res.data.data || []);
    } catch { console.error('permissions load failed'); }
  }, [id]);

  const loadAuditLogs = useCallback(async () => {
    try {
      const res = await api.get(`/audit/${id}`);
      setAuditLogs(res.data.data || []);
    } catch { console.error('audit load failed'); }
  }, [id]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadDocument();
    loadVersions();
    loadPermissions();
    loadAuditLogs();
  }, [user, loadDocument, loadVersions, loadPermissions, loadAuditLogs, router]);

  useEffect(() => {
    const off1 = onActiveUsers(setActiveUsers);
    const off2 = onNewComment((comment) => {
      setComments(prev => [comment, ...prev]);
    });
    return () => { off1?.(); off2?.(); };
  }, [onActiveUsers, onNewComment]);

  const handleRestoreVersion = async (versionId) => {
    try {
      await api.post(`/documents/${id}/versions/${versionId}/restore`);
      toast.success('Version restored!');
      loadVersions();
      loadDocument();
    } catch {
      toast.error('Restore failed');
    }
  };

  const handleSendComment = (comment) => {
    setComments(prev => [comment, ...prev]);
    sendComment(comment);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading document..." />
      </div>
    );
  }

  if (!doc) return null;

  const isOwner = doc.owner_id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/documents"
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 text-base truncate">
              {doc.name}
            </h1>
            <p className="text-xs text-gray-400">
              by {doc.owner_name} &middot;{' '}
              {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ActiveUsers users={activeUsers} />

          <button
            onClick={() => setCommentOpen(!commentOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <MessageSquare size={15} />
            <span className="hidden sm:inline">Comments</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Share2 size={14} />
              Share
            </button>
          )}

          {doc.download_url && (
            <a
              href={doc.download_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </header>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">

        <div className="flex-1 min-w-0 space-y-6">

          {/* Doc Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={28} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 mb-1 truncate">
                  {doc.name}
                </h2>
                {doc.description && (
                  <p className="text-gray-500 text-sm mb-3">{doc.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {doc.file_type && (
                    <span>
                      📁 {doc.file_type.split('/')[1]?.toUpperCase()}
                    </span>
                  )}
                  {doc.file_size && (
                    <span>
                      📦 {(doc.file_size / 1024).toFixed(1)} KB
                    </span>
                  )}
                  {doc.is_encrypted && (
                    <span className="text-green-600">🔒 Encrypted</span>
                  )}
                  <span>📂 {doc.folder}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              {[
                { id: 'versions', icon: Clock,     label: 'Versions'  },
                { id: 'access',   icon: Shield,    label: 'Access'    },
                { id: 'audit',    icon: FileText,  label: 'Audit Log' },
              ].map(({ id: tid, icon: Icon, label }) => (
                <button
                  key={tid}
                  onClick={() => setTab(tid)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                    tab === tid
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">

              {/* Versions */}
              {tab === 'versions' && (
                <VersionHistory
                  versions={versions}
                  onRestore={handleRestoreVersion}
                />
              )}

              {/* Access */}
              {tab === 'access' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {doc.owner_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {doc.owner_name}
                      </p>
                      <p className="text-xs text-blue-600">Owner</p>
                    </div>
                  </div>

                  {permissions.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {p.user_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {p.user_name}
                        </p>
                        <p className="text-xs text-gray-500">{p.user_email}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {p.permission}
                      </span>
                    </div>
                  ))}

                  {permissions.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">
                      Not shared with anyone yet
                    </p>
                  )}
                </div>
              )}

              {/* Audit */}
              {tab === 'audit' && (
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{log.user_name}</span>
                          {' '}
                          <span className="text-blue-600 font-medium capitalize">
                            {log.action}
                          </span>
                          {' '}this document
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDistanceToNow(
                            new Date(log.created_at),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}

                  {auditLogs.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No audit logs yet
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Comment Panel */}
        {commentOpen && (
          <div className="w-80 shrink-0">
            <div
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              style={{ height: '600px', display: 'flex', flexDirection: 'column' }}
            >
              <CommentPanel
                comments={comments}
                onAddComment={handleSendComment}
                currentUser={user}
              />
            </div>
          </div>
        )}

      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        docId={id}
        permissions={permissions}
        onRefresh={loadPermissions}
      />

    </div>
  );
}