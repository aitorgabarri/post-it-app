import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SplashScreen } from '@capacitor/splash-screen';

export default function LoginPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
      } catch (e) {
        console.log("Splash no listo en web");
      }
    };
    hideSplash();
  }, []);

  const handleLogin = () => {
    if (name.length < 2) return alert("¡Escribe tu nombre, bro!");
    localStorage.setItem('userName', name);
    // ✅ Ruta fija para entrar a la Home en Capacitor
    router.push('/index.html'); 
  };

  return (
    <main style={{ 
      padding: '20px', 
      background: 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      fontFamily: 'sans-serif' 
    }}>
      <div style={{ 
        background: '#fff', 
        padding: '40px', 
        borderRadius: '24px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
        textAlign: 'center', 
        maxWidth: '350px', 
        width: '100%' 
      }}>
        <h1 style={{ fontSize: '28px', color: '#00d1ff', marginBottom: '10px' }}>Post-it ✨</h1>
        <p style={{ color: '#65676b', marginBottom: '30px' }}>Conecta con los tuyos de forma divertida.</p>
        
        <input 
          type="text" 
          placeholder="¿Cómo te llamas?" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ 
            padding: '15px', 
            borderRadius: '12px', 
            border: '1px solid #ddd', 
            width: '100%', 
            textAlign: 'center', 
            fontSize: '18px', 
            marginBottom: '20px',
            outline: 'none'
          }}
        />
        
        <button 
          onClick={handleLogin} 
          style={{ 
            padding: '15px', 
            width: '100%', 
            borderRadius: '50px', 
            border: 'none', 
            background: '#00d1ff', 
            color: '#fff', 
            fontWeight: 'bold', 
            fontSize: '16px', 
            cursor: 'pointer', 
            boxShadow: '0 4px 12px rgba(0,209,255,0.3)' 
          }}
        >
          Empezar 🚀
        </button>
      </div>
    </main>
  );
}