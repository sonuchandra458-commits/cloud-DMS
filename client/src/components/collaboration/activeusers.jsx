'use client';

export default function ActiveUsers({ users = [] }) {
  if (!users.length) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Viewing:</span>
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user, i) => (
          <div
            key={user.socketId}
            title={user.userName}
            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
            style={{
              background: ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'][i % 5],
              zIndex: users.length - i,
            }}
          >
            {user.userName?.[0]?.toUpperCase()}
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
            +{users.length - 5}
          </div>
        )}
      </div>
      <span className="flex items-center gap-1 text-xs text-green-600">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Live
      </span>
    </div>
  );
}