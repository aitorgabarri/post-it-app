import { useState } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/router';

export default function RecordVideoPage() {
  const [uploading, setUploading] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, file);

    if (error) {
      alert("Error al subir video: " + error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(fileName);
    
    localStorage.setItem('currentPostIt', publicUrl);
    localStorage.setItem('postItType', 'video');
    setVideoURL(publicUrl);
    setUploading(false);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', background: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 style={{ color: '#00d1ff', marginBottom: '30px' }}>Graba tu Video 🎥</h2>
      
      <div style={{ background: '#fff', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        {uploading ? (
          <div style={{ padding: '20px' }}>
            <p style={{ color: '#00d1ff', fontSize: '18px', fontWeight: 'bold' }}>Subiendo video... ⏳</p>
            <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ width: '50%', height: '100%', background: '#00d1ff' }}></div>
            </div>
          </div>
        ) : videoURL ? (
          <div style={{ padding: '20px' }}>
             <p style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '18px' }}>✅ ¡Video guardado!</p>
             <video src={videoURL} controls style={{ width: '100%', borderRadius: '15px', marginTop: '15px' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* BOTÓN CÁMARA */}
            <button 
              onClick={() => document.getElementById('cameraInput')?.click()}
              style={{ padding: '20px', background: '#00d1ff', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              📸 Abrir Cámara
            </button>

            {/* BOTÓN GALERÍA */}
            <button 
              onClick={() => document.getElementById('galleryInput')?.click()}
              style={{ padding: '20px', background: '#fff', color: '#00d1ff', border: '2px solid #00d1ff', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              📁 Elegir de Galería
            </button>

            {/* Inputs ocultos */}
            <input 
              type="file" id="cameraInput" accept="video/*" capture="environment" 
              style={{ display: 'none' }} onChange={handleFileChange} 
            />
            <input 
              type="file" id="galleryInput" accept="video/*" 
              style={{ display: 'none' }} onChange={handleFileChange} 
            />
          </div>
        )}
      </div>

      {videoURL && (
        <button 
          onClick={() => router.push('/send')} 
          style={{ width: '100%', padding: '18px', background: '#00d1ff', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 5px 15px rgba(0,209,255,0.3)' }}
        >
          Siguiente →
        </button>
      )}

      <button 
        onClick={() => router.push('/')}
        style={{ marginTop: '25px', background: 'none', border: 'none', color: '#888', textDecoration: 'none', fontSize: '14px' }}
      >
        ← Volver al tablón
      </button>
    </div>
  );
}