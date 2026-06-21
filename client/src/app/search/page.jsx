'use client';
import { useState, useEffect } from 'react';
import { useAuth }   from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api           from '../../lib/api';
import { Search, Filter, FileText, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function SearchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [tags,     setTags]     = useState([]);
  const [selTags,  setSelTags]  = useState([]);
  const [fileType, setFileType] = useState('');
  const [searching,setSearching]= useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    api.get('/search/tags').then(res => setTags(res.data.data || [])).catch(console.error);
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setSearching(true);
    try {
      const res = await api.get('/search', {
        params: { q: query, tags: selTags.join(','), fileType }
      });
      setResults(res.data.data || []);
    } catch { }
    finally { setSearching(false); }
  };

  useEffect(() => {
    if (query.length > 2 || selTags.length > 0) handleSearch();
  }, [query, selTags, fileType]);

  const toggleTag = (tagName) => {
    setSelTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Search size={16} className="text-white" /></div>
          <span className="font-semibold text-gray-900 text-lg">Search</span>
        </div>
        <Link href="/dashboard" className="btn-ghost text-sm">← Dashboard</Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <form onSubmit={handleSearch} className="card p-5 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-10 text-base py-3" placeholder="Search documents by name, content..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select className="input-field w-auto" value={fileType} onChange={e => setFileType(e.target.value)}>
              <option value="">All file types</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
              <option value="image">Images</option>
              <option value="plain">Text</option>
            </select>
          </div>
          {tags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Tag size={12} /> Filter by tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button key={tag.id} type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selTags.includes(tag.name) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {searching ? (
          <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {results.length > 0 && <p className="text-sm text-gray-500">{results.length} results found</p>}
            {results.map((doc, i) => (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <div className="card p-4 hover:shadow-md transition-all animate-fade-up cursor-pointer" style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {doc.owner_name} · {doc.file_type?.split('/')[1]?.toUpperCase()} · {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {doc.tags?.length > 0 && (
                      <div className="flex gap-1 flex-shrink-0">
                        {doc.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {!searching && query.length > 2 && results.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Search size={36} className="mx-auto mb-3 opacity-30" />
                <p>No documents found for "{query}"</p>
              </div>
            )}
            {query.length === 0 && results.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Search size={36} className="mx-auto mb-3 opacity-30" />
                <p>Type to search your documents</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}