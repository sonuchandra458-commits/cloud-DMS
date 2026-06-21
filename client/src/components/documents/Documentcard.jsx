'use client';
import Link from 'next/link';
import { Eye, Trash2, Share2, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getIcon = (type) => {
  if (type?.includes('pdf'))   return { icon: FileText, color: 'text-red-500',    bg: 'bg-red-50'    };
  if (type?.includes('image')) return { icon: Image,    color: 'text-purple-500', bg: 'bg-purple-50' };
  if (type?.includes('sheet')) return { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50' };
  return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' };
};

export default function DocumentCard({ doc, onDelete, onShare, isOwner }) {
  const { icon: Icon, color, bg } = getIcon(doc.file_type);

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className={color} />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/documents/${doc.id}`}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Eye size={15} />
          </Link>
          {isOwner && (
            <>
              <button
                onClick={() => onShare?.(doc)}
                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
              >
                <Share2 size={15} />
              </button>
              <button
                onClick={() => onDelete?.(doc.id, doc.name)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      <Link href={`/documents/${doc.id}`}>
        <p className="font-medium text-gray-900 text-sm truncate hover:text-blue-600 transition-colors mb-1">
          {doc.name}
        </p>
      </Link>
      <p className="text-xs text-gray-400 mb-3">
        {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''} ·{' '}
        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
      </p>

      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {doc.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {doc.is_encrypted && (
        <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
          <span>🔒</span> Encrypted
        </div>
      )}
    </div>
  );
}