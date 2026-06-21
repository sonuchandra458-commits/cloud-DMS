'use client';
import { Tag, Plus } from 'lucide-react';

export default function TagFilter({ tags = [], selectedTags = [], onToggle, onCreateTag }) {
  if (!tags.length) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Tag size={13} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Filter by tags
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.name)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedTags.includes(tag.name)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={
              selectedTags.includes(tag.name)
                ? {}
                : { borderLeft: `3px solid ${tag.color || '#3b82f6'}` }
            }
          >
            {tag.name}
          </button>
        ))}
        {onCreateTag && (
          <button
            onClick={onCreateTag}
            className="px-3 py-1 rounded-full text-xs font-medium bg-dashed border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-1"
          >
            <Plus size={11} /> New tag
          </button>
        )}
      </div>
    </div>
  );
}