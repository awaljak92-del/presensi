import { useState } from 'react';
import { Lock, User, ArrowRight, Fingerprint } from 'lucide-react';
import { login } from '../services/api';

interface LoginProps {
  onLogin: (userId: string, userName: string) => void;
}

export default function LoginView({ onLogin }: LoginProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!userId.trim() || !password.trim()) {
      setError('ID Sales dan Password wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(userId, password);
      if (result.success) {
        onLogin(result.user.id, result.user.nama);
      } else {
        setError(result.message || 'Login gagal.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghubungi server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-32 h-16 flex items-center justify-center">
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-md">
              <circle cx="70" cy="50" r="40" fill="#2d2d2d" />
              <circle cx="130" cy="50" r="40" fill="#b01b22" />
              <circle cx="100" cy="50" r="20" fill="#f8fafc" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Sistem Presensi
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Masuk dengan ID Sales Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="userId" className="block text-sm font-bold text-slate-700 mb-2">
                ID Sales
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-3 bg-slate-50 transition-colors"
                  placeholder="Contoh: EMP-001"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-3 bg-slate-50 transition-colors"
                  placeholder="Gunakan: 123456"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 font-medium">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-blue-600 hover:text-blue-500">
                  Lupa password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 font-medium">
                  Sistem Presensi v2.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
