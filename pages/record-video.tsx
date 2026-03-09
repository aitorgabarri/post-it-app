import { useState } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // ✅ Usamos el motor nativo

export default function RecordVideoPage() {
  const [uploading, setUploading] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const router = useRouter();

  const handleCapturar = async (fuente: 'CAMARA' | 'GALERIA') => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        // ✅ Si eliges cámara, abre la lente directamente. Si no, la galería.
        source: fuente === 'CAMARA' ? CameraSource.Camera : CameraSource.Photos 
      });

      if (image.webPath) {
        setUploading(true);
        
        // Convertimos la ruta del móvil a un archivo real para Supabase
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const fileName = `${Date.now()}_video.jpg`; 

        const { data, error } = await supabase.storage
          .from('videos')
          .upload(fileName, blob);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(fileName);
        
        localStorage.setItem('currentPostIt', publicUrl);
        localStorage.setItem('postItType', 'video');
        setVideoURL(publicUrl);
        setUploading(false);
      }
    } catch (e) {
      console.error("Error capturando:", e);
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', background: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 style={{ color: '#00d1ff', marginBottom: '30px' }}>Graba tu Momento 🎥</h2>
      
      <div style={{ background: '#fff', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        {uploading ? (
          <div style={{ padding: '20px' }}>
            <p style={{ color: '#00d1ff', fontSize: '18px', fontWeight: 'bold' }}>Subiendo... ⏳</p>
          </div>
        ) : videoURL ? (
          <div style={{ padding: '20px' }}>
             <p style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '18px' }}>✅ ¡Guardado con éxito!</p>
             <img src={videoURL} alt="Preview" style={{ width: '100%', borderRadius: '15px', marginTop: '15px' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              onClick={() => handleCapturar('CAMARA')}
              style={{ padding: '20px', background: '#00d1ff', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}
            >
              📸 Abrir Cámara Nativa
            </button>

            <button 
              onClick={() => handleCapturar('GALERIA')}
              style={{ padding: '20px', background: '#fff', color: '#00d1ff', border: '2px solid #00d1ff', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}
            >
              📁 Elegir de Galería
            </button>
          </div>
        )}
      </div>

      {videoURL && (
        <button 
          onClick={() => router.push('/send')} 
          style={{ width: '100%', padding: '18px', background: '#00d1ff', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px' }}
        >
          Siguiente →
        </button>
      )}

      <button onClick={() => router.push('/')} style={{ marginTop: '25px', background: 'none', border: 'none', color: '#888', fontSize: '14px' }}>
        ← Volver al tablón
      </button>
    </div>
  );
}