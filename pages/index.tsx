import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/router'; 
import Link from 'next/link';
import { Camera } from '@capacitor/camera'; 

export default function HomePage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // 🚨 ESTADOS PARA EL MODO DESPERTADOR (ALARMA)
  const [llamadaEntrante, setLlamadaEntrante] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string>("Alguien");
  const [videoFull, setVideoFull] = useState<string | null>(null);

  const router = useRouter();

  // 🔔 CONFIGURACIÓN ONESIGNAL (MODO ALARMA PROFESIONAL)
  const setupOneSignal = async () => {
    try {
      await Camera.requestPermissions();

      if (typeof window !== 'undefined' && (window as any).cordova) {
        // Importación dinámica para evitar errores de compilación en web
        const OneSignal = (await import('onesignal-cordova-plugin')).default;
        
        // Inicializar con tu ID de OneSignal
        OneSignal.initialize("f8e1e63e-151d-4f01-96ad-3d00c5f25ec8");

        const userName = localStorage.getItem('userName');
        if (userName) {
          OneSignal.login(userName); 
          console.log("OneSignal vinculado a:", userName);
        }

        // ✅ ESCUCHADOR DE ALARMA (Cuando la app está abierta o en segundo plano)
        // Esto hace que salte la pantalla azul de "Descolgar" inmediatamente
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event: any) => {
          const notification = event.getNotification(); 
          const data = notification.additionalData as any;
          
          if (data && data.video_url) {
            console.log("¡Alarma detectada!", data.video_url);
            setLlamadaEntrante(data.video_url);
            setSenderName(data.sender_name || "Alguien");
          }
        });

        // ✅ ESCUCHADOR DE CLIC (Cuando el usuario toca la notificación desde fuera)
        OneSignal.Notifications.addEventListener("click", (event: any) => {
          const data = event.notification.additionalData as any;
          if (data && data.video_url) {
            setLlamadaEntrante(data.video_url);
            setSenderName(data.sender_name || "Alguien");
          }
        });

        // Pedir permiso de notificaciones (necesario en Android 13+)
        OneSignal.Notifications.requestPermission(true);
      }
    } catch (e) {
      console.log("Error en servicios nativos de OneSignal:", e);
    }
  };

  // Cargar posit desde Supabase
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

  const deletePostIt = async (id: number) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (!error) fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    router.push('/login');
  };

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem('userName');
    
    if (isMounted) {
      setupOneSignal();
      if (!savedUser) { 
        router.push('/login'); 
      } else { 
        setUser(savedUser); 
        fetchData(); 
        const interval = setInterval(fetchData, 5000); // Polling cada 5 segundos
        return () => clearInterval(interval); 
      }
    }
  }, [router, fetchData, isMounted]);

  if (!isMounted || !user) return null;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f0f2f5', minHeight: '100vh', position: 'relative' }}>
      
      {/* 🚨 INTERFAZ DE DESPERTADOR (PANTALLA AZUL DE LLAMADA ENTRANTE) */}
      {llamadaEntrante && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'linear-gradient(180deg, #00d1ff 0%, #0072ff 100%)',
          zIndex: 99999, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'space-around', color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="alarm-icon" style={{ fontSize: '100px', marginBottom: '20px' }}>🔔</div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 'bold' }}>¡POSIT NUEVO!</h1>
            <p style={{ fontSize: '1.4rem', opacity: 0.9 }}>De: <b>{senderName}</b></p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            {/* BOTÓN VERDE DE DESCOLGAR */}
            <button 
              onClick={() => {
                setVideoFull(llamadaEntrante); // Activa el reproductor de vídeo
                setLlamadaEntrante(null);      // Cierra la pantalla de alarma
              }}
              style={{
                width: '140px', height: '140px', borderRadius: '50%',
                background: '#2ecc71', border: 'none', color: 'white', 
                fontSize: '65px', boxShadow: '0 0 50px rgba(46, 204, 113, 0.7)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              📞
            </button>
            <p style={{ fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Desliza o toca para abrir</p>
          </div>

          <style jsx>{`
            .alarm-icon {
              animation: vibrate 0.3s infinite;
            }
            @keyframes vibrate {
              0% { transform: rotate(0deg); }
              25% { transform: rotate(8deg); }
              75% { transform: rotate(-8deg); }
              100% { transform: rotate(0deg); }
            }
          `}</style>
        </div>
      )}

      {/* 📺 REPRODUCTOR DE VÍDEO (PANTALLA COMPLETA TRAS DESCOLGAR) */}
      {videoFull && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: '#000', zIndex: 100000, display: 'flex', flexDirection: 'column'
        }}>
          <video src={videoFull} autoPlay playsInline controls style={{ width: '100%', height: '88%', objectFit: 'contain' }} />
          <button 
            onClick={() => setVideoFull(null)}
            style={{ 
              width: '100%', padding: '20px', background: '#ff4d4d', color: '#fff', 
              border: 'none', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' 
            }}>
            CERRAR POSIT ❌
          </button>
        </div>
      )}

      {/* --- INTERFAZ DE USUARIO NORMAL --- */}
      <header style={{ background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: 0, color: '#00d1ff' }}>POSIT ✨</h2>
          <span style={{ fontSize: '12px', color: '#666' }}>Hola, <b>{user}</b> | <span onClick={handleLogout} style={{ color: 'red', cursor: 'pointer' }}>Salir</span></span>
        </div>
        <button onClick={() => setShowOptions(!showOptions)} style={{ background: '#00d1ff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold' }}>
          {showOptions ? 'Cerrar' : '+ Nuevo'}
        </button>
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
                <button 
                  onClick={() => setVideoFull(r.video_url)}
                  style={{ width: '100%', padding: '12px', background: '#00d1ff', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
                  ▶️ Ver Vídeo Posit
                </button>
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