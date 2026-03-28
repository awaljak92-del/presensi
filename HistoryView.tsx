import { Calendar, ChevronDown, SlidersHorizontal, CheckSquare, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getHistory, HistoryRecord } from '../services/api';

// --- KONFIGURASI LOKASI KANTOR ---
const OFFICE_LOCATIONS = [
  { name: 'Kantor Narindo', lat: -2.6921418574096725, lng: 111.6369972832742 },
  { name: 'Kantor Branch Telkomsel', lat: -2.708127883344518, lng: 111.64897759908632 }
];
const MAX_RADIUS_METERS = 50;

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function HistoryView({ userId }: { userId: string | null }) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [currentZone, setCurrentZone] = useState<string>('Mencari lokasi...');
  const [isInZone, setIsInZone] = useState<boolean>(false);

  useEffect(() => {
    getHistory().then((data) => {
      // Filter data by userId
      const userHistory = data.filter(record => record.id === userId);
      setHistory(userHistory);
    });
  }, [userId]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCurrentZone('GPS Tidak Didukung');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        let minDistance = Infinity;
        let nearest = 'Luar Zona';
        let inZone = false;

        OFFICE_LOCATIONS.forEach(office => {
          const dist = getDistanceFromLatLonInM(userLat, userLng, office.lat, office.lng);
          if (dist < minDistance) {
            minDistance = dist;
            if (dist <= MAX_RADIUS_METERS) {
              nearest = office.name;
              inZone = true;
            } else {
              nearest = 'Luar Zona';
              inZone = false;
            }
          }
        });

        setCurrentZone(nearest);
        setIsInZone(inZone);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setCurrentZone('Lokasi Tidak Diketahui');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-8 pb-32">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 mb-2">Riwayat Presensi</h1>
          <p className="text-slate-500 text-sm font-medium">Lihat catatan kehadiran dan aktivitas Anda.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
            <Calendar className="text-blue-600" size={16} />
            <span className="text-sm font-semibold text-slate-900">Bulan Ini</span>
            <ChevronDown className="text-slate-500" size={16} />
          </div>
          <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <SlidersHorizontal className="text-slate-500" size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-600 p-6 rounded-xl text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Total Logs</p>
            <p className="text-3xl font-extrabold tracking-tight">{history.length} Records</p>
          </div>
          <CheckSquare className="absolute -right-4 -bottom-4 text-8xl opacity-10" size={120} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">On-Time Rate</p>
            <p className="text-3xl font-extrabold tracking-tight text-blue-600">98.2%</p>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-4">
            <div className="bg-blue-600 h-1 rounded-full w-[98%]"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Current Zone</p>
            <p className="text-xl font-extrabold tracking-tight text-slate-900">{currentZone}</p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className={`w-2 h-2 rounded-full ${isInZone ? 'bg-blue-600 animate-pulse' : 'bg-red-500'}`}></span>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${isInZone ? 'text-blue-600' : 'text-red-500'}`}>
              {isInZone ? 'Secure Connection' : 'Out of Zone'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-6 ml-1">Aktivitas Terakhir</h2>
        
        {history.map((record, i) => {
          let dateStr = record.timestamp;
          let day = '--';
          let month = '---';
          let formattedJam = record.jam;
          
          if (dateStr && dateStr.includes('T') && dateStr.includes('Z')) {
            const d = new Date(dateStr);
            d.setUTCHours(d.getUTCHours() + 7);
            day = d.getUTCDate().toString().padStart(2, '0');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = months[d.getUTCMonth()];
          } else if (dateStr && dateStr.includes('/')) {
            const parts = dateStr.split(' ')[0].split('/');
            if (parts.length === 3) {
              day = parts[0];
              const monthIndex = parseInt(parts[1], 10) - 1;
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              month = months[monthIndex] || '---';
            }
          }

          if (formattedJam && formattedJam.includes('T') && formattedJam.includes('Z')) {
            const d = new Date(formattedJam);
            d.setUTCHours(d.getUTCHours() + 7);
            const h = d.getUTCHours().toString().padStart(2, '0');
            const m = d.getUTCMinutes().toString().padStart(2, '0');
            formattedJam = `${h}:${m}`;
          } else if (formattedJam && formattedJam.includes(':')) {
            const parts = formattedJam.split(':');
            formattedJam = `${parts[0]}:${parts[1]}`;
          }

          const getStatusColor = (status: string) => {
            switch(status) {
              case 'Hadir': return 'bg-blue-100 text-blue-700';
              case 'Sakit': return 'bg-yellow-100 text-yellow-700';
              case 'Izin': return 'bg-orange-100 text-orange-700';
              case 'Libur': return 'bg-slate-200 text-slate-700';
              case 'Alpha': return 'bg-red-100 text-red-700';
              default: return 'bg-slate-100 text-slate-700';
            }
          };

          return (
            <div key={i} className="group bg-white hover:bg-slate-50 transition-all p-4 md:p-6 rounded-xl flex items-center gap-4 md:gap-8 border border-slate-100 hover:border-slate-200 hover:shadow-sm">
              <div className="flex-shrink-0 text-center w-12">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{month}</p>
                <p className="text-xl font-extrabold text-slate-900">{day}</p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden relative bg-slate-100">
                {record.imageUrl ? (
                  <img 
                    src={record.imageUrl} 
                    alt="Verification" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">NO IMG</div>
                )}
                {record.status === 'Hadir' && (
                  <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                  </div>
                )}
              </div>
              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 flex items-center gap-1">
                    <Clock size={12} /> Waktu
                  </p>
                  <p className="text-lg font-extrabold text-slate-900">
                    {formattedJam} <span className="text-xs font-medium text-slate-500">WIB</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Keterangan</p>
                  <p className="font-bold text-slate-900 truncate max-w-[150px]">{record.keterangan || '-'}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              </div>
              <ChevronRight className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
          );
        })}
        {history.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">Belum ada riwayat presensi.</p>
        )}
      </div>
    </div>
  );
}
