'use client';
import { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CommentPanel({ comments = [], onAddComment, currentUser }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const comment = {
      id:         Date.now().toString(),
      content:    text.trim(),
      user_name:  currentUser?.name,
      created_at: new Date().toISOString(),
    };
    onAddComment?.(comment);
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <MessageSquare size={16} className="text-gray-500" />
        <h3 className="font-medium text-gray-900 text-sm">Comments ({comments.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.map(c => (
          <div key={c.id} className="flex gap-3 animate-fade-up">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {c.user_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-900">{c.user_name}</span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">No comments yet</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            className="input-field flex-1 text-sm"
            placeholder="Add a comment..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button type="submit" disabled={!text.trim()} className="btn-primary p-2">
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}