'use client';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

const titles = {
  '/dashboard': 'Dashboard',
  '/documents': 'Documents',
  '/search':    'Search',
  '/settings':  'Settings',
};

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const title = Object.entries(titles).find(([path]) =>
    pathname === path || pathname.startsWith(path + '/')
  )?.[1] || 'Cloud DMS';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <Link
          href="/search"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-500"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search docs...</span>
        </Link>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}