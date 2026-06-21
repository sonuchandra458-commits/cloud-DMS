'use client';
import Link from 'next/link';
import { FileText, Image, File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getIcon = (type) => {
  if (type?.includes('pdf'))   return { icon: FileText, color: 'text-red-500',  bg: 'bg-red-50'    };
  if (type?.includes('image')) return { icon: Image,    color: 'text-purple-500', bg: 'bg-purple-50' };
  return { icon: File, color: 'text-blue-500', bg: 'bg-blue-50' };
};

export default function SearchResults({ results = [], query = '', searching = false }) {
  if (searching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (query.length > 1 && results.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 font-medium">No documents found</p>
        <p className="text-sm text-gray-400 mt-1">Try a different search term or filter</p>
      </div>
    );
  }

  if (query.length === 0 && results.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-400 text-sm">Start typing to search your documents</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 mb-4">
        {results.length} result{results.length !== 1 ? 's' : ''} found
      </p>
      {results.map((doc, i) => {
        const { icon: Icon, color, bg } = getIcon(doc.file_type);
        return (
          <Link key={doc.id} href={`/documents/${doc.id}`}>
            <div
              className="card p-4 hover:shadow-md transition-all cursor-pointer animate-fade-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon size={20} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doc.owner_name} ·{' '}
                    {doc.file_type?.split('/')[1]?.toUpperCase()} ·{' '}
                    {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                  </p>
                </div>
                {doc.tags?.filter(Boolean).length > 0 && (
                  <div className="flex gap-1 flex-shrink-0">
                    {doc.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {doc.is_encrypted && (
                  <span className="text-xs text-green-600 flex-shrink-0">🔒</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}