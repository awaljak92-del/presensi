import { MapPin, Clock, Fingerprint, AlertTriangle, ArrowRight, LogIn, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getHistory, HistoryRecord } from '../services/api';

export default function Dashboard({ onCheckIn, onHistory, userId }: { onCheckIn: () => void, onHistory: () => void, userId: string }) {
  const [time, setTime] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState<HistoryRecord[]>([]);
  const [summary, setSummary] = useState({ hadir: 0, terlambat: 0, total: 0 });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    getHistory().then(data => {
      const userHistory = data.filter(record => record.id === userId);
      setRecentActivity(userHistory.slice(0, 3));
      
      // Calculate summary for current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      let hadirCount = 0;
      let terlambatCount = 0;
      let totalCount = 0;

      userHistory.forEach(record => {
        let recordMonth = -1;
        let recordYear = -1;

        if (record.timestamp && record.timestamp.includes('T') && record.timestamp.includes('Z')) {
          const d = new Date(record.timestamp);
          d.setUTCHours(d.getUTCHours() + 7);
          recordMonth = d.getUTCMonth();
          recordYear = d.getUTCFullYear();
        } else if (record.timestamp && record.timestamp.includes('/')) {
          const parts = record.timestamp.split(' ')[0].split('/');
          if (parts.length === 3) {
            recordMonth = parseInt(parts[1], 10) - 1;
            recordYear = parseInt(parts[2], 10);
          }
        }

        let hours = 0;
        let minutes = 0;
        if (record.jam && record.jam.includes('T') && record.jam.includes('Z')) {
          const d = new Date(record.jam);
          d.setUTCHours(d.getUTCHours() + 7);
          hours = d.getUTCHours();
          minutes = d.getUTCMinutes();
        } else if (record.jam && record.jam.includes(':')) {
          const parts = record.jam.split(':').map(Number);
          hours = parts[0];
          minutes = parts[1];
        }

        if (recordMonth === currentMonth && recordYear === currentYear) {
          totalCount++;
          if (record.status === 'Hadir') {
            hadirCount++;
            if (hours > 9 || (hours === 9 && minutes > 0)) {
              terlambatCount++;
            }
          }
        }
      });

      setSummary({ hadir: hadirCount, terlambat: terlambatCount, total: totalCount });
    });
    return () => clearInterval(timer);
  }, [userId]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-7 bg-white rounded-xl p-8 flex flex-col justify-between min-h-[320px] shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Waktu Saat Ini</span>
            <h1 className="text-7xl font-extrabold tracking-tighter text-slate-900 mb-2">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-slate-500 font-medium">{time.toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
              <MapPin size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">SIAP PRESENSI</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 bg-blue-600 rounded-xl p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-500 opacity-90"></div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 animate-pulse shadow-[0_0_0_0_rgba(255,255,255,0.4)]">
              <Fingerprint size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Presensi Kehadiran</h2>
            <p className="text-white/70 text-sm mb-8 max-w-[200px]">Validasi lokasi dan foto diperlukan untuk Hadir.</p>
            <button onClick={onCheckIn} className="w-full bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-xl">
              Log Check In
            </button>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-white/50 font-bold">
              Aktivitas Terakhir: {recentActivity.length > 0 ? recentActivity[0].jam : 'Belum ada'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-slate-100 rounded-xl overflow-hidden min-h-[400px] flex flex-col">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Lokasi Aktif</h3>
            <p className="text-sm text-slate-500">Peta Lokasi Kantor</p>
          </div>
          <div className="flex-grow relative m-4 rounded-lg overflow-hidden border border-slate-200 bg-white">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src="https://www.openstreetmap.org/export/embed.html?bbox=111.63,-2.71,111.65,-2.69&amp;layer=mapnik&amp;marker=-2.6921418574096725,111.6369972832742" 
              style={{ border: 'none' }}
            ></iframe>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Ringkasan Bulan Ini</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hari Hadir</p>
                  <p className="text-3xl font-bold text-slate-900">{summary.hadir}</p>
                </div>
                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${Math.min((summary.hadir / 22) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Aktivitas</p>
                  <p className="text-3xl font-bold text-slate-900">{summary.total}</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terlambat</p>
                  <p className="text-3xl font-bold text-orange-600">{summary.terlambat}</p>
                </div>
                <AlertTriangle className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          <div onClick={onHistory} className="bg-blue-50 rounded-xl p-6 flex items-center justify-between group cursor-pointer hover:bg-blue-100 transition-colors">
            <div>
              <h4 className="font-bold text-blue-900">Riwayat Presensi</h4>
              <p className="text-xs text-blue-700/70">Lihat log kehadiran lengkap</p>
            </div>
            <ArrowRight className="text-blue-900 group-hover:translate-x-1 transition-transform" size={24} />
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h3 className="text-xl font-bold text-slate-900 mb-6 ml-1">Aktivitas Terakhir</h3>
        <div className="space-y-4">
          {recentActivity.map((record, i) => {
          let dateDisplay = record.timestamp;
          let timeDisplay = record.jam;

          if (dateDisplay && dateDisplay.includes('T') && dateDisplay.includes('Z')) {
            const d = new Date(dateDisplay);
            d.setUTCHours(d.getUTCHours() + 7);
            const day = d.getUTCDate().toString().padStart(2, '0');
            const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
            const year = d.getUTCFullYear();
            dateDisplay = `${day}/${month}/${year}`;
          } else if (dateDisplay && dateDisplay.includes(' ')) {
            dateDisplay = dateDisplay.split(' ')[0];
          }

          if (timeDisplay && timeDisplay.includes('T') && timeDisplay.includes('Z')) {
            const d = new Date(timeDisplay);
            d.setUTCHours(d.getUTCHours() + 7);
            const h = d.getUTCHours().toString().padStart(2, '0');
            const m = d.getUTCMinutes().toString().padStart(2, '0');
            timeDisplay = `${h}:${m}`;
          } else if (timeDisplay && timeDisplay.includes(':')) {
            const parts = timeDisplay.split(':');
            timeDisplay = `${parts[0]}:${parts[1]}`;
          }

          const getStatusColor = (status: string) => {
              switch(status) {
                case 'Hadir': return 'text-blue-600';
                case 'Sakit': return 'text-yellow-600';
                case 'Izin': return 'text-orange-600';
                case 'Libur': return 'text-slate-600';
                case 'Alpha': return 'text-red-600';
                default: return 'text-slate-600';
              }
            };
            
            return (
              <div key={i} className="bg-white rounded-xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center`}>
                    <LogIn className={getStatusColor(record.status)} size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Presensi {record.status}</p>
                    <p className="text-xs text-slate-500">
                      {dateDisplay} • {timeDisplay}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{record.keterangan || '-'}</p>
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${getStatusColor(record.status)}`}>
                    {record.status}
                  </p>
                </div>
              </div>
            );
          })}
          {recentActivity.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Belum ada aktivitas terbaru.</p>
          )}
        </div>
      </section>
    </div>
  );
}
