import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/router'; 
import Link from 'next/link';
// ✅ IMPORTANTE: Hemos quitado el import de OneSignal de aquí arriba para que Vercel no explote
import { Camera } from '@capacitor/camera'; 
import { SplashScreen } from '@capacitor/splash-screen';

export default function HomePage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // 🔔 CONFIGURACIÓN ONESIGNAL (Carga Segura)
  const setupOneSignal = async () => {
    try {
      // 1. Permisos de cámara
      await Camera.requestPermissions();

      // 2. Solo ejecutamos lógica nativa si estamos en el móvil (window.cordova existe)
      if (typeof window !== 'undefined' && (window as any).cordova) {
        
        // ✅ IMPORTACIÓN DINÁMICA: Esto es lo que arregla el error de Vercel
        const OneSignal = (await import('onesignal-cordova-plugin')).default;

        // Inicializar con tu ID
        OneSignal.initialize("f8e1e63e-151d-4f01-96ad-3d00c5f25ec8");

        // Vincular con el nombre de usuario
        const userName = localStorage.getItem('userName');
        if (userName) {
          OneSignal.login(userName); 
          console.log("OneSignal vinculado a:", userName);
        }

        // Lanzar cartel de permisos
        OneSignal.Notifications.requestPermission(true).then((accepted) => {
          console.log("¿Permiso notis aceptado?: " + accepted);
        });
      }
    } catch (e) {
      console.log("Error en servicios nativos:", e);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userName');
    router.push('/login'); 
  }, [router]);

  const deletePostIt = async (id: number) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (!error) {
      fetchData(); 
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
      // ✅ Lanzamos la configuración nada más montar
      setupOneSignal();

      if (!savedUser) { 
        router.push('/login'); 
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
        {reminders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>No hay posit todavía... 😴</p>
        ) : (
          reminders.map(r => (
            <div key={r.id} style={{ background: r.color || '#fffbe6', padding: '20px', borderRadius: '15px', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                 <p style={{ fontSize: '10px', fontWeight: 'bold', margin: 0 }}>DE: {r.sender_name}</p>
                 <button onClick={() => deletePostIt(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
              </div>
              {r.video_url?.startsWith('http') ? (
                <video src={r.video_url} controls style={{ width: '100%', borderRadius: '10px' }} />
              ) : (
                <p style={{ margin: 0 }}>{r.video_url}</p>
              )}
            </div>
          ))
        )}
      </div>

      {showOptions && (
        <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', display: 'flex', gap: '15px', zIndex: 100 }}>
          <Link href="/record">
            <a style={{ flex: 1, background: '#fff', padding: '18px', borderRadius: '15px', textAlign: 'center', textDecoration: 'none', color: '#000', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>✍️ Texto</a>
          </Link>
          <Link href="/record-video">
            <a style={{ flex: 1, background: '#fff', padding: '18px', borderRadius: '15px', textAlign: 'center', textDecoration: 'none', color: '#000', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>🎥 Video</a>
          </Link>
        </div>
      )}
    </main>
  );
}