// components/FormularioEvidencia.tsx
import { useState } from 'react';
import { comprimirYSubirEvidencia } from './utils/uploadEvidencia';

interface FormularioEvidenciaProps {
  usuarioId: string;
}

export const FormularioEvidencia = ({ usuarioId }: FormularioEvidenciaProps) => {
  const [estaSubiendo, setEstaSubiendo] = useState(false);

  const manejarCambioArchivo = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = evento.target.files;
    if (!archivos || archivos.length === 0) return;

    setEstaSubiendo(true);

    // Tomamos el primer archivo seleccionado
    const archivo = archivos[0];

    // Comprimimos y subimos
    const { url_archivo, error } = await comprimirYSubirEvidencia(archivo, usuarioId);

    if (error) {
      alert(error);
    } else {
      console.log('Archivo subido exitosamente en la ruta:', url_archivo);
      // Aquí guardarías 'url_archivo' en tu tabla de PostgreSQL 'evidencias'
    }

    setEstaSubiendo(false);
  };

  return (
    <div>
      <label style={{ fontWeight: 'bold' }}>Subir Evidencia Fotográfica</label>
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/jpg" 
        onChange={manejarCambioArchivo}
        disabled={estaSubiendo}
      />
      {estaSubiendo && <p>Comprimiendo y subiendo imagen... por favor espera.</p>}
    </div>
  );
};