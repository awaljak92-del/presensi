import { Edit2, ShieldCheck, BellRing, MapPin, LogOut } from 'lucide-react';

interface ProfileViewProps {
  onLogout: () => void;
  userId: string;
  userName?: string | null;
}

export default function ProfileView({ onLogout, userId, userName }: ProfileViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <div className="md:col-span-8 bg-white rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-sm">
          <div className="relative">
            <div className="w-32 h-32 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-5xl font-bold">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-lg shadow-lg">
              <Edit2 size={16} />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 mb-1 block">Identitas Akun</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{userName || 'User'}</h2>
              <p className="text-slate-500 font-medium">SALES</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="bg-slate-100 px-4 py-2 rounded-lg">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">ID SALES</span>
                <span className="text-sm font-mono font-bold text-slate-900">{userId}</span>
              </div>
              <div className="bg-slate-100 px-4 py-2 rounded-lg border-l-4 border-blue-600">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-slate-500">Status Keamanan</span>
                <span className="text-sm font-bold text-blue-600">Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-blue-600 rounded-xl p-6 text-white flex flex-col justify-between shadow-lg">
          <div>
            <ShieldCheck size={32} className="mb-4" />
            <h3 className="text-xl font-bold mb-1">Precision Rank</h3>
            <p className="text-blue-100 text-sm opacity-90">98.4% On-time accuracy this month.</p>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div className="text-4xl font-black tracking-tighter">Gold</div>
            <div className="h-2 w-24 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-4/5"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">System Configuration</h3>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-100 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-lg text-blue-600">
                <BellRing size={20} />
              </div>
              <h4 className="font-bold text-slate-900">Notification Protocols</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-slate-900">Arrival Confirmations</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-slate-900">Out-of-Zone Alerts</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-slate-900">Weekly Analytics Digest</span>
                <div className="w-10 h-5 bg-slate-300 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-lg text-blue-600">
                <MapPin size={20} />
              </div>
              <h4 className="font-bold text-slate-900">Operational Base</h4>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900">Titik 1</div>
                    <div className="text-xs text-slate-500">-2.6921418, 111.6369972</div>
                  </div>
                  <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded font-bold">PRIMARY</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900">Titik 2</div>
                    <div className="text-xs text-slate-500">-2.7081278, 111.6489775</div>
                  </div>
                  <span className="bg-slate-50 text-slate-600 text-[10px] px-2 py-1 rounded font-bold">SECONDARY</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-200">
                <span>Precision Perimeter</span>
                <span className="text-blue-600">50m Radius</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <button 
            onClick={onLogout}
            className="w-full md:w-auto px-8 py-4 bg-red-50 text-red-700 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-all active:scale-95"
          >
            <LogOut size={20} />
            Keluar (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}
