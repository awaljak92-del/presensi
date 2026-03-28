import { Grid, Camera, AlertTriangle, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { submitCheckIn } from '../services/api';

// --- KONFIGURASI LOKASI KANTOR ---
const OFFICE_LOCATIONS = [
  { name: 'Kantor Narindo', lat: -2.6921418574096725, lng: 111.6369972832742 },
  { name: 'Kantor Branch Telkomsel', lat: -2.708127883344518, lng: 111.64897759908632 }
];
const MAX_RADIUS_METERS = 50; // Jarak maksimal presensi dalam meter

// Rumus Haversine untuk menghitung jarak antara 2 koordinat
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius bumi dalam meter
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

export default function CameraCheckIn({ onBack, userId }: { onBack: () => void, userId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State Geolokasi
  const [distance, setDistance] = useState<number | null>(null);
  const [nearestOffice, setNearestOffice] = useState<string>('Mencari lokasi...');
  const [isInZone, setIsInZone] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [status, setStatus] = useState<'Hadir' | 'Sakit' | 'Izin' | 'Libur'>('Hadir');
  const [keterangan, setKeterangan] = useState('');

  // Inisialisasi Kamera
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Akses kamera ditolak atau tidak tersedia.");
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Inisialisasi GPS / Geolokasi
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolokasi tidak didukung oleh browser Anda.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        let minDistance = Infinity;
        let nearest = 'Unknown';

        // Cari titik kantor terdekat
        OFFICE_LOCATIONS.forEach(office => {
          const dist = getDistanceFromLatLonInM(userLat, userLng, office.lat, office.lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearest = office.name;
          }
        });

        const roundedDistance = Math.round(minDistance);
        setDistance(roundedDistance);
        setNearestOffice(nearest);
        setIsInZone(roundedDistance <= MAX_RADIUS_METERS);
        setLocationError(null);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationError("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const capturePhoto = (): string => {
    if (!videoRef.current) return '';
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.7);
    }
    return '';
  };

  const handleCheckIn = async () => {
    if (status === 'Hadir' && distance === null) {
      setError("Menunggu lokasi GPS Anda...");
      return;
    }
    
    if (status !== 'Hadir' && !keterangan.trim()) {
      setError(`Keterangan wajib diisi untuk status ${status}.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const photoBase64 = capturePhoto();
      
      // Get current coordinates from geolocation if available, else 0
      let currentLat = 0;
      let currentLng = 0;
      
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          currentLat = pos.coords.latitude;
          currentLng = pos.coords.longitude;
        } catch (e) {
          console.warn("Could not get exact coordinates for submission", e);
        }
      }

      const result = await submitCheckIn({
        id: userId,
        status: status,
        keterangan: keterangan,
        lat: currentLat,
        lng: currentLng,
        foto: photoBase64
      });
      
      if (result && result.success === false) {
        setError(result.message || "Gagal menyimpan data ke server.");
        setIsSubmitting(false);
        return;
      }
      
      onBack();
    } catch (error) {
      console.error("Check-in failed", error);
      setError("Gagal melakukan check-in. Pastikan URL GAS sudah benar dan CORS diizinkan.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full gap-6 pb-32">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-blue-600 font-medium hover:underline">
          Batal
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 relative aspect-[3/4] md:aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-2xl">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
          
          <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
            <div className="flex justify-between items-start">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-white text-[10px] font-bold tracking-widest uppercase">Live Verification</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md p-2 rounded-lg">
                <Grid className="text-white" size={20} />
              </div>
            </div>
            
            <div className="self-center w-64 h-64 border-2 border-dashed border-white/30 rounded-3xl relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              <div className="absolute inset-0 bg-blue-500/10 rounded-3xl animate-pulse"></div>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl">
                <span className="text-white text-sm font-medium">Posisikan wajah Anda di dalam bingkai</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-100 p-6 rounded-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Keamanan Lokasi</span>
              <div className={`px-3 py-1 rounded-full ${isInZone ? 'bg-blue-600' : 'bg-red-600'}`}>
                <span className="text-[10px] font-bold text-white uppercase">
                  {distance === null ? 'Mencari...' : (isInZone ? 'Dalam Zona' : 'Luar Zona')}
                </span>
              </div>
            </div>
            
            {locationError ? (
              <p className="text-sm text-red-600 font-medium">{locationError}</p>
            ) : (
              <>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-extrabold tracking-tighter ${isInZone ? 'text-blue-600' : 'text-red-600'}`}>
                    {distance !== null ? distance : '--'}
                  </span>
                  <span className="text-lg font-semibold text-slate-500 mb-1">meter</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isInZone ? 'bg-blue-600' : 'bg-red-600'}`} 
                    style={{ width: distance !== null ? `${Math.min((distance / MAX_RADIUS_METERS) * 100, 100)}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Anda berjarak <span className="font-bold text-slate-900">{distance !== null ? distance : '--'} meter</span> dari <span className="font-bold text-slate-900">{nearestOffice}</span> (Batas {MAX_RADIUS_METERS}m).
                </p>
              </>
            )}
          </div>

          <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex gap-4">
            <AlertTriangle className="text-red-600 mt-0.5" size={20} />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-red-900 uppercase tracking-tight">Integritas Sistem</span>
              <p className="text-xs text-red-800 opacity-80 leading-snug">
                Penggunaan Fake GPS atau aplikasi lokasi palsu akan menyebabkan penangguhan akun.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Pilih Status Presensi</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={() => setStatus('Hadir')}
                className={`py-3 rounded-lg font-bold text-sm transition-all ${status === 'Hadir' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Hadir
              </button>
              <button 
                onClick={() => setStatus('Sakit')}
                className={`py-3 rounded-lg font-bold text-sm transition-all ${status === 'Sakit' ? 'bg-yellow-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Sakit
              </button>
              <button 
                onClick={() => setStatus('Izin')}
                className={`py-3 rounded-lg font-bold text-sm transition-all ${status === 'Izin' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Izin
              </button>
              <button 
                onClick={() => setStatus('Libur')}
                className={`py-3 rounded-lg font-bold text-sm transition-all ${status === 'Libur' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Libur
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Keterangan {status !== 'Hadir' && <span className="text-red-500">*</span>}
              </label>
              <textarea 
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder={status === 'Hadir' ? "Opsional..." : "Wajib diisi..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4">
        <button 
          onClick={handleCheckIn}
          disabled={isSubmitting || (status === 'Hadir' && (!isInZone || distance === null))}
          className={`w-full transition-all active:scale-[0.98] py-6 rounded-xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 ${status === 'Hadir' && isInZone ? 'bg-blue-600 hover:bg-blue-700' : status !== 'Hadir' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-slate-400'}`}
        >
          <Camera className="text-white" size={24} />
          <span className="text-white font-bold text-lg tracking-tight">
            {isSubmitting ? 'Memproses...' : (status === 'Hadir' ? (isInZone ? 'Ambil Foto & Check In' : 'Luar Zona (Hadir Dinonaktifkan)') : `Check In ${status}`)}
          </span>
        </button>
        <p className="text-center mt-4 text-xs text-slate-500 font-medium">
          Waktu Server: {new Date().toLocaleTimeString()} • Sesi Aman
        </p>
      </section>
    </div>
  );
}
