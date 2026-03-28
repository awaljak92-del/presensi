import { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Dashboard from './views/Dashboard';
import HistoryView from './views/HistoryView';
import ProfileView from './views/ProfileView';
import CameraCheckIn from './views/CameraCheckIn';
import LoginView from './views/LoginView';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Cek apakah user sudah login sebelumnya
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserName = localStorage.getItem('userName');
    if (savedUserId) {
      setUserId(savedUserId);
      setUserName(savedUserName || 'User');
    }
  }, []);

  const handleLogin = (id: string, name: string) => {
    setUserId(id);
    setUserName(name);
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setCurrentTab('dashboard');
  };

  if (!userId) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
      {currentTab !== 'camera' && <TopBar userName={userName} />}
      
      {currentTab === 'dashboard' && <Dashboard onCheckIn={() => setCurrentTab('camera')} onHistory={() => setCurrentTab('history')} userId={userId} />}
      {currentTab === 'history' && <HistoryView userId={userId} />}
      {currentTab === 'profile' && <ProfileView onLogout={handleLogout} userId={userId} userName={userName} />}
      {currentTab === 'camera' && <CameraCheckIn onBack={() => setCurrentTab('dashboard')} userId={userId} />}
      
      {currentTab !== 'camera' && <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />}
    </div>
  );
}
