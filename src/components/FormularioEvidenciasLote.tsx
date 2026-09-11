// components/FormularioEvidenciasLote.tsx
import { useState } from 'react';
import { subirMultiplesEvidencias, type ResultadoEvidencia } from './utils/uploadEvidencia';

interface FormularioEvidenciasLoteProps {
  usuarioId: string;
  actividadId: number;
}

export const FormularioEvidenciasLote = ({ usuarioId }: FormularioEvidenciasLoteProps) => {
  const [estaSubiendo, setEstaSubiendo] = useState(false);
  const [resultados, setResultados] = useState<ResultadoEvidencia[]>([]);

  const manejarCambioArchivos = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    // Array.from convierte el FileList a un arreglo normal de JS
    const archivos = Array.from(evento.target.files || []);
    
    if (archivos.length === 0) return;

    // Validación de seguridad (máximo 4)
    if (archivos.length > 4) {
      alert('Solamente puedes subir un máximo de 4 evidencias por actividad.');
      evento.target.value = ''; // Limpiar el input
      return;
    }

    setEstaSubiendo(true);
    setResultados([]); // Limpiar resultados anteriores

    // Subir todas en paralelo
    const respuestas = await subirMultiplesEvidencias(archivos, usuarioId);
    
    setResultados(respuestas);
    setEstaSubiendo(false);
    evento.target.value = ''; // Resetear el input tras subir
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
        Evidencias Fotográficas (Máx. 4)
      </label>
      
      <input 
        type="file" 
        multiple // Permite seleccionar varios archivos
        accept="image/png, image/jpeg, image/jpg" 
        onChange={manejarCambioArchivos}
        disabled={estaSubiendo}
      />
      
      {estaSubiendo && (
        <p style={{ color: '#0056b3' }}>
          ⏳ Comprimiendo y subiendo imágenes...
        </p>
      )}

      {/* Mostrar estado de cada archivo subido */}
      {resultados.length > 0 && (
        <ul style={{ marginTop: '10px' }}>
          {resultados.map((res, index) => (
            <li key={index} style={{ color: res.error ? 'red' : 'green' }}>
              {res.nombreOriginal}: {res.error ? `❌ Falló (${res.error})` : '✅ Subida'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};