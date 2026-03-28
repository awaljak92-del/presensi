import { LayoutDashboard, History, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function BottomNav({ currentTab, setCurrentTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-md z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <button 
        onClick={() => setCurrentTab('dashboard')} 
        className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-colors ${currentTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-blue-500'}`}
      >
        <LayoutDashboard size={24} />
        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">Dashboard</span>
      </button>
      <button 
        onClick={() => setCurrentTab('history')} 
        className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-colors ${currentTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-blue-500'}`}
      >
        <History size={24} />
        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">History</span>
      </button>
      <button 
        onClick={() => setCurrentTab('profile')} 
        className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-colors ${currentTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-blue-500'}`}
      >
        <User size={24} />
        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">Profile</span>
      </button>
    </nav>
  );
}
