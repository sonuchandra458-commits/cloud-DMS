'use client';
import { useState, useEffect, useCallback } from 'react';
import { useDropzone }  from 'react-dropzone';
import { useAuth }      from '../../context/AuthContext';
import { useRouter }    from 'next/navigation';
import api              from '../../lib/api';
import toast            from 'react-hot-toast';
import { Upload, FileText, Trash2, Eye, Share2, Search, Filter } from 'lucide-react';
import Link             from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentsPage() {
  const { user, loading } = useAuth();
  const router            = useRouter();
  const [docs,     setDocs]     = useState([]);
  const [fetching, setFetching] = useState(true);
  const [uploading,setUploading]= useState(false);
  const [search,   setSearch]   = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const fetchDocs = useCallback(async () => {
    setFetching(true);
    try {
      const res = await api.get('/documents', { params: { search } });
      setDocs(res.data.data || []);
    } catch { toast.error('Failed to load documents'); }
    finally { setFetching(false); }
  }, [search]);

  useEffect(() => { if (user) fetchDocs(); }, [user, fetchDocs]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    setProgress(0);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
        });
        toast.success(`${file.name} uploaded!`);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    setProgress(0);
    fetchDocs();
  }, [fetchDocs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/plain': ['.txt'],
    },
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document deleted');
      fetchDocs();
    } catch { toast.error('Failed to delete'); }
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf'))   return '📕';
    if (type?.includes('word'))  return '📘';
    if (type?.includes('sheet')) return '📗';
    if (type?.includes('image')) return '🖼️';
    return '📄';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><FileText size={16} className="text-white" /></div>
          <span className="font-semibold text-gray-900 text-lg">Documents</span>
        </div>
        <Link href="/dashboard" className="btn-ghost text-sm">← Dashboard</Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Upload Zone */}
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
          <input {...getInputProps()} />
          <Upload size={36} className={`mx-auto mb-3 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          {uploading ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">Uploading... {progress}%</p>
              <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <p className="font-medium text-gray-700">{isDragActive ? 'Drop files here!' : 'Drag & drop files here'}</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse — PDF, Word, Images, Text up to 100MB</p>
            </>
          )}
        </div>

        {/* Search */}
        <div className="card p-4 flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Documents Grid */}
        {fetching ? (
          <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc, i) => (
              <div key={doc.id} className="card p-5 hover:shadow-md transition-all animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{getFileIcon(doc.file_type)}</span>
                  <div className="flex gap-1">
                    <Link href={`/documents/${doc.id}`} className="btn-ghost p-1.5 text-blue-600 hover:bg-blue-50"><Eye size={14} /></Link>
                    {doc.owner_id === user?.id && (
                      <button onClick={() => handleDelete(doc.id, doc.name)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
                <p className="font-medium text-gray-900 text-sm truncate mb-1">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''} · {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</p>
                {doc.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {docs.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p>No documents yet — drag & drop to upload!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}