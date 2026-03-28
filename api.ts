export interface CheckInRecord {
  id: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Libur';
  keterangan: string;
  lat: number;
  lng: number;
  foto: string; // base64 image
}

export interface HistoryRecord {
  timestamp: string;
  id: string;
  nama: string;
  status: string;
  jam: string;
  keterangan: string;
  location: string;
  imageUrl: string;
}

const GAS_URL = import.meta.env.VITE_GAS_URL;

// Mock data for when GAS_URL is not set
let mockHistory: HistoryRecord[] = [
  { 
    timestamp: '24/10/2023 08:52:00',
    id: 'EMP-001',
    nama: 'Alexander Pierce',
    status: 'Hadir',
    jam: '08:52:00',
    keterangan: 'Tepat waktu',
    location: '-2.6921418, 111.6369972',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBomAoZWi7p6a1h6835s1uaPFT4GZdzfUFiXk08qjs_K3-rPWNCNHYG7uMPSxoYRg6QYmRSNH_tWbX24e7_eigYtmg0q1ow8NtUsnhZunObdiBx6QVqDUAeTwe0tn1eJb62awzHMyjfNX7fUFmTXyEdlEs7nd9XD3Ea1ULrISBiuOmGkA__Caf7CsuyIY188np3ditYd1bwLoDlM9qtBUO015ZqH0U2dUX-s3C4zegkBPONuu6sEaSaQsxstGcrF87ZsLg2NgOMVB_s'
  }
];

export const login = async (id: string, password: string) => {
  if (!GAS_URL) {
    // Mock login
    if (password === '123456') {
      return { success: true, user: { id, nama: 'Demo User' } };
    }
    return { success: false, message: 'Password salah (Mock)' };
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', id, password }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error logging in via GAS:", error);
    throw error;
  }
};

export const submitCheckIn = async (data: CheckInRecord) => {
  if (!GAS_URL) {
    console.log('Mock check-in submitted:', data);
    return { success: true, message: "Mock: Berhasil disimpan!" };
  }
  
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Mencegah CORS preflight error di GAS
      },
      redirect: 'follow' // Penting untuk GAS karena sering melakukan redirect 302
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error submitting to GAS:", error);
    throw error;
  }
};

export const getHistory = async (): Promise<HistoryRecord[]> => {
  if (!GAS_URL) {
    return mockHistory;
  }
  
  try {
    const response = await fetch(GAS_URL, {
      method: 'GET',
      redirect: 'follow' // Penting untuk GAS
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching from GAS:", error);
    return mockHistory; // Fallback to mock on error
  }
};
