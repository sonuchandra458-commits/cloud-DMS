const variants = {
  owner:     'bg-red-100 text-red-700',
  admin:     'bg-purple-100 text-purple-700',
  editor:    'bg-blue-100 text-blue-700',
  commenter: 'bg-yellow-100 text-yellow-700',
  viewer:    'bg-gray-100 text-gray-700',
  read:      'bg-green-100 text-green-700',
  write:     'bg-blue-100 text-blue-700',
  pdf:       'bg-red-100 text-red-700',
  image:     'bg-purple-100 text-purple-700',
  word:      'bg-blue-100 text-blue-700',
  text:      'bg-gray-100 text-gray-700',
};

export default function Badge({ label, className = '' }) {
  const cls = variants[label?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls} ${className}`}>
      {label}
    </span>
  );
}