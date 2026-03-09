import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/router';
import { LocalNotifications } from '@capacitor/local-notifications';

export default function SendPage() {
  const [receptor, setReceptor] = useState('');
  const [fecha, setFecha] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState('');
  const router = useRouter();

  useEffect(() => {
    const msg = localStorage.getItem('currentPostIt');
    const type = localStorage.getItem('postItType');
    if (!msg) { 
      router.push('/'); 
      return; 
    }
    setMensaje(msg);
    setTipo(type || 'text');
  }, [router]);

  const handleEnviar = async () => {
    const receptorLimpio = receptor.trim();
    if (!receptorLimpio || !fecha) return alert("Faltan datos, bro");

    const fechaSeleccionada = new Date(fecha);
    const horaFormateada = fechaSeleccionada.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // 2. Insertamos en Supabase
    const { error } = await supabase.from('reminders').insert([{
      sender_name: localStorage.getItem('userName'),
      receiver_name: receptorLimpio,
      video_url: mensaje, 
      scheduled_for: fechaSeleccionada.toISOString(),
      // ✅ IMPORTANTE: Estado 'accepted' para que aparezca en el tablón
      status: 'accepted', 
      color: tipo === 'video' ? '#e7f3ff' : '#fffbe6'
    }]);

    if (!error) {
      try {
        // 3. Programamos la notificación local
        await LocalNotifications.schedule({
          notifications: [{
            title: "⏰ ¡HORA DEL POSIT!",
            body: `Tienes un ${tipo === 'video' ? 'video' : 'posit'} de ${localStorage.getItem('userName')} a las ${horaFormateada}`,
            id: Math.floor(Date.now() / 1000),
            schedule: { at: fechaSeleccionada },
            actionTypeId: 'OPEN_APP'
          }]
        });
      } catch (e) { 
        console.log("Error en notificación:", e); 
      }
      
      localStorage.removeItem('currentPostIt');
      alert(`¡Enviado! El posit para ${receptorLimpio} aparecerá a las ${horaFormateada} 🚀`);
      router.push('/');
    } else {
      alert("Error al conectar con Supabase, bro");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f0f2f5', minHeight: '100vh' }}>
      <h2 style={{ color: '#00d1ff', textAlign: 'center' }}>Programar Envío 🚀</h2>
      
      <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 'bold', color: '#666' }}>¿Para quién es?</p>
        <input 
          type="text" 
          placeholder="Nombre del receptor (ej: Aitor)" 
          value={receptor}
          onChange={e => setReceptor(e.target.value)} 
          style={{ width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
        />
        
        <p style={{ fontWeight: 'bold', color: '#666' }}>¿A qué hora debe llegar?</p>
        <input 
          type="datetime-local" 
          value={fecha}
          onChange={e => setFecha(e.target.value)} 
          style={{ width: '100%', padding: '15px', marginBottom: '30px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
        />
        
        <button 
          onClick={handleEnviar} 
          style={{ width: '100%', padding: '18px', background: '#00d1ff', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,209,255,0.3)' }}
        >
          Enviar Post-it 📌
        </button>

        <button 
          onClick={() => router.push('/')}
          style={{ width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
}