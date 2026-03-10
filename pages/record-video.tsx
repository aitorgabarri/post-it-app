import { useState } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/router';

export default function RecordVideoPage() {
  const [uploading, setUploading] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const router = useRouter();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `${Date.now()}_video.mp4`;

    const { error } = await supabase.storage
      .from('videos')
      .upload(fileName, file);

    if (error) {
      alert("Error al subir: " + error.message);
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
          <p style={{ color: '#00d1ff', fontWeight: 'bold' }}>Subiendo video... ⏳</p>
        ) : videoURL ? (
          <div style={{ padding: '20px' }}>
             <p style={{ color: '#52c41a', fontWeight: 'bold' }}>✅ ¡Video listo!</p>
             <video src={videoURL} controls style={{ width: '100%', borderRadius: '15px', marginTop: '10px' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* BOTÓN CÁMARA */}
            <label 
              htmlFor="cameraInput"
              style={{ padding: '20px', background: '#00d1ff', color: '#fff', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}
            >
              📹 Grabar Nuevo Video
            </label>
            <input 
              type="file" 
              id="cameraInput" 
              accept="video/*" 
              capture={"camera" as any} // ✅ Esto quita el error rojo de TypeScript
              style={{ display: 'none' }} 
              onChange={handleFile} 
            />

            {/* BOTÓN GALERÍA */}
            <label 
              htmlFor="galleryInput"
              style={{ padding: '20px', background: '#fff', color: '#00d1ff', border: '2px solid #00d1ff', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}
            >
              📁 Elegir de Galería
            </label>
            <input 
              type="file" 
              id="galleryInput" 
              accept="video/*" 
              style={{ display: 'none' }} 
              onChange={handleFile} 
            />
          </div>
        )}
      </div>

      {videoURL && (
        <button 
          onClick={() => router.push('/send')} 
          style={{ width: '100%', padding: '18px', background: '#00d1ff', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold' }}
        >
          Siguiente →
        </button>
      )}
    </div>
  );
}