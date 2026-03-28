import { Bell } from 'lucide-react';

export default function TopBar({ userName }: { userName?: string | null }) {
  return (
    <header className="w-full top-0 sticky z-40 bg-slate-50 flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-blue-700 font-bold">
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">Selamat datang,</span>
          <span className="text-sm font-bold text-blue-700 tracking-tight">{userName || 'User'}</span>
        </div>
      </div>
      <button className="text-blue-700 hover:opacity-80 transition-opacity">
        <Bell size={24} />
      </button>
    </header>
  );
}
