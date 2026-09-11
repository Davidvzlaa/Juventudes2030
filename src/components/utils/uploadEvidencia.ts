// utils/uploadEvidencia.ts
import imageCompression from 'browser-image-compression';
import { supabase } from '../../lib/supabase';

export interface ResultadoEvidencia {
  nombreOriginal: string;
  url_archivo: string | null;
  error: string | null;
}

export const comprimirYSubirEvidencia = async (
  archivo: File,
  usuarioId: string,
): Promise<ResultadoEvidencia> => {
  const [resultado] = await subirMultiplesEvidencias([archivo], usuarioId);
  return resultado;
};

export const subirMultiplesEvidencias = async (
  archivos: File[], 
  usuarioId: string
): Promise<ResultadoEvidencia[]> => {
  
  // 1. Configuración ultra-optimizada para manejar hasta 80 fotos en un PDF
  const opcionesCompresion = {
    maxSizeMB: 0.15, // 150 KB máximo
    maxWidthOrHeight: 600, // Resolución pequeña ideal para PDFs
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.7
  };

  // 2. Mapeamos cada archivo a una Promesa (sin esperar a que termine aún)
  const promesasSubida = archivos.map(async (archivoOriginal) => {
    try {
      // A. Comprimir
      const archivoComprimido = await imageCompression(archivoOriginal, opcionesCompresion);
      
      // B. Generar ruta segura
      const nombreUnico = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const rutaArchivo = `${usuarioId}/${nombreUnico}`;

      // C. Subir a Supabase
      const { data, error } = await supabase.storage
        .from('evidencias')
        .upload(rutaArchivo, archivoComprimido, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      return { 
        nombreOriginal: archivoOriginal.name, 
        url_archivo: data.path, 
        error: null 
      };

    } catch (err: any) {
      console.error(`Error al procesar ${archivoOriginal.name}:`, err);
      return { 
        nombreOriginal: archivoOriginal.name, 
        url_archivo: null, 
        error: err.message || 'Error desconocido al subir' 
      };
    }
  });

  // 3. Ejecutar TODAS las promesas en paralelo
  return await Promise.all(promesasSubida);
};