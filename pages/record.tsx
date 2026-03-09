import { useState } from 'react';
// ✅ CAMBIO CLAVE: Importamos desde 'next/router' para Next.js 12
import { useRouter } from 'next/router';

export default function RecordPage() {
  const [texto, setTexto] = useState('');
  const router = useRouter();

  const handleNext = () => {
    if (texto.length < 3) return alert("¡Escribe algo más largo, bro!");
    
    // Guardamos el texto localmente para la pantalla de envío
    localStorage.setItem('currentPostIt', texto);
    localStorage.setItem('postItType', 'text');
    
    // Nos vamos a la pantalla de programar envío
    router.push('/send');
  };

  return (
    <main style={{ 
      padding: '20px', background: '#f0f2f5', minHeight: '100vh', 
      display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' 
    }}>
      <h2 style={{ color: '#00d1ff', textAlign: 'center' }}>Escribe tu Post-it ✍️</h2>
      
      <textarea 
        placeholder="¿Qué quieres decir?" 
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        style={{ 
          flex: 1, padding: '20px', borderRadius: '20px', border: '1px solid #ddd', 
          fontSize: '18px', marginBottom: '20px', outline: 'none', resize: 'none',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}
      />
      
      <button 
        onClick={handleNext} 
        style={{ 
          padding: '15px', width: '100%', borderRadius: '50px', border: 'none', 
          background: '#00d1ff', color: '#fff', fontWeight: 'bold', fontSize: '16px', 
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,209,255,0.3)' 
        }}
      >
        Siguiente →
      </button>
      
      <button 
        onClick={() => router.push('/')}
        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#666', textDecoration: 'underline' }}
      >
        Cancelar
      </button>
    </main>
  );
}