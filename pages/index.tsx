import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/router'; 
import Link from 'next/link';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SplashScreen } from '@capacitor/splash-screen';

export default function HomePage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [videoFull, setVideoFull] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // 🛠️ CORRECCIÓN: Ruta limpia sin .html
  const handleLogout = useCallback(() => {
    localStorage.removeItem('userName');
    router.push('/login'); 
  }, [router]);

  // 🗑️ NUEVO: Función para borrar post-its de Supabase
  const deletePostIt = async (id: number) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (!error) {
      fetchData(); // Refresca la lista
    } else {
      alert("Error al borrar: " + error.message);
    }
  };

  const fetchData = useCallback(async () => {
    const userName = localStorage.getItem('userName');
    if (!userName) return;
    const now = new Date().toISOString();
    
    const { data: okData } = await supabase
      .from('reminders')
      .select('*')
      .eq('receiver_name', userName)
      .eq('status', 'accepted')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: false });
      
    if (okData) setReminders(okData);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem('userName');
    if (isMounted) {
      if (!savedUser) { 
        router.push('/login'); // 🛠️ CORRECCIÓN: Ruta limpia
      } else { 
        setUser(savedUser); 
        fetchData(); 
        const interval = setInterval(fetchData, 5000); 
        return () => clearInterval(interval); 
      }
    }
  }, [router, fetchData, isMounted]);

  if (!isMounted || !user) return null;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: 0, color: '#00d1ff' }}>POSIT ✨</h2>
          <span style={{ fontSize: '12px', color: '#666' }}>Hola, <b>{user}</b> | <span onClick={handleLogout} style={{ color: 'red', cursor: 'pointer' }}>Salir</span></span>
        </div>
        <button onClick={() => setShowOptions(!showOptions)} style={{ background: '#00d1ff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '50px' }}>{showOptions ? 'Cerrar' : '+ Nuevo'}</button>
      </header>

      <div style={{ display: 'grid', gap: '15px' }}>
        {reminders.map(r => (
          <div key={r.id} style={{ background: r.color || '#fffbe6', padding: '20px', borderRadius: '15px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <p style={{ fontSize: '10px', fontWeight: 'bold' }}>DE: {r.sender_name}</p>
               <button onClick={() => deletePostIt(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
            </div>
            {r.video_url?.startsWith('http') ? <video src={r.video_url} controls style={{ width: '100%', borderRadius: '10px' }} /> : <p>{r.video_url}</p>}
          </div>
        ))}
      </div>

      {showOptions && (
        <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', display: 'flex', gap: '15px' }}>
          {/* 🛠️ CORRECCIÓN: Rutas limpias sin .html */}
          <Link href="/record"><a style={{ flex: 1, background: '#fff', padding: '18px', borderRadius: '15px', textAlign: 'center', textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>✍️ Texto</a></Link>
          <Link href="/record-video"><a style={{ flex: 1, background: '#fff', padding: '18px', borderRadius: '15px', textAlign: 'center', textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>🎥 Video</a></Link>
        </div>
      )}
    </main>
  );
}