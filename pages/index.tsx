import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/router'; 
import Link from 'next/link';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SplashScreen } from '@capacitor/splash-screen';

export default function HomePage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [videoFull, setVideoFull] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Limpiamos las rutas: en Next.js no se usa .html
  const handleLogout = useCallback(() => {
    localStorage.removeItem('userName');
    router.push('/login'); 
  }, [router]);

  useEffect(() => {
    const hideSplash = async () => {
      try { await SplashScreen.hide(); } catch (e) { console.log("Splash no listo"); }
    };
    hideSplash();

    let listener: any;
    const init = async () => {
      try {
        listener = await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
          const videoUrl = action.notification.extra?.videoUrl;
          if (videoUrl) setVideoFull(videoUrl);
        });
        await LocalNotifications.requestPermissions();
      } catch (e) { console.log("Plugin no listo"); }
    };
    init();
    return () => { if (listener?.remove) listener.remove(); };
  }, []);

  const fetchData = useCallback(async () => {
    const userName = localStorage.getItem('userName');
    if (!userName) return;
    const now = new Date().toISOString();
    
    // Traemos los post-its de la tabla 'reminders'
    const { data: pendData } = await supabase.from('reminders').select('*').eq('receiver_name', userName).eq('status', 'pending');
    if (pendData) setPending(pendData);
    
    const { data: okData } = await supabase.from('reminders').select('*').eq('receiver_name', userName).eq('status', 'accepted').lte('scheduled_for', now).order('scheduled_for', { ascending: false });
    if (okData) setReminders(okData);
  }, []);

  // Función para borrar un post-it
  const deleteReminder = async (id: number) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (!error) {
      fetchData(); // Refrescamos la lista sin recargar toda la web
    } else {
      alert("Error al borrar: " + error.message);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem('userName');
    if (isMounted) {
      if (!savedUser) { 
        router.push('/login'); 
      } 
      else { 
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
      {videoFull && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#000', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={() => setVideoFull(null)} style={{ position: 'absolute', top: '30px', right: '30px', background: '#fff', border: 'none', padding: '10px 20px', borderRadius: '50px', zIndex: 10000 }}>Cerrar</button>
          <video src={videoFull} autoPlay controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      )}

      <header style={{ background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: 0, color: '#00d1ff' }}>POSIT ✨</h2>
          <span style={{ fontSize: '12px', color: '#666' }}>Hola, <b>{user}</b> | <span onClick={handleLogout} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>Salir</span></span>
        </div>
        <button onClick={() => setShowOptions(!showOptions)} style={{ background: '#00d1ff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold' }}>{showOptions ? 'Cerrar' : '+ Nuevo'}</button>
      </header>

      <div style={{ display: 'grid', gap: '15px' }}>
        {reminders.map(r => (
          <div key={r.id} style={{ background: r.color || '#fffbe6', padding: '20px', borderRadius: '15px', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ fontSize: '10px', fontWeight: 'bold', margin: 0 }}>DE: {r.sender_name}</p>
              {/* PAPELERA PARA BORRAR */}
              <button onClick={() => deleteReminder(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
            </div>
            
            {r.video_url?.startsWith('http') ? (
              <video src={r.video_url} controls style={{ width: '100%', borderRadius: '10px' }} />
            ) : (
              <p style={{ margin: 0, fontSize: '16px' }}>{r.video_url}</p>
            )}
          </div>
        ))}
        {reminders.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>No hay positis nuevos 🏝️</p>}
      </div>

      {showOptions && (
        <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', display: 'flex', gap: '15px', zIndex: 100 }}>
          <Link href="/record" legacyBehavior>
            <a style={{ flex: 1, background: '#fff', padding: '18px', borderRadius: '15px', textAlign: 'center', fontWeight: 'bold', textDecoration: 'none', color: '#333', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>✍️ Texto</a>
          </Link>
          <Link href="/record-video" legacyBehavior>
            <a style={{ flex: 1, background: '#fff', padding: '18px', borderRadius: '15px', textAlign: 'center', fontWeight: 'bold', textDecoration: 'none', color: '#333', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>🎥 Video</a>
          </Link>
        </div>
      )}
    </main>
  );
}