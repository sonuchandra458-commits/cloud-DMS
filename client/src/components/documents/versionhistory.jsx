'use client';
import { formatDistanceToNow } from 'date-fns';
import { RotateCcw, Clock } from 'lucide-react';

export default function VersionHistory({ versions, onRestore, currentUserId }) {
  if (!versions?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Clock size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No version history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((v, i) => (
        <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            v{v.version_number}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Version {v.version_number}
              {i === 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Current</span>}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              By {v.uploaded_by_name} · {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
            </p>
            {v.comment && <p className="text-xs text-gray-400 mt-1 italic">"{v.comment}"</p>}
            <p className="text-xs text-gray-400">{v.file_size ? `${(v.file_size / 1024).toFixed(1)} KB` : ''}</p>
          </div>
          {i !== 0 && (
            <button
              onClick={() => onRestore?.(v.id)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors flex-shrink-0"
            >
              <RotateCcw size={12} /> Restore
            </button>
          )}
        </div>
      ))}
    </div>
  );
}