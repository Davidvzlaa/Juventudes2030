// components/Botones/BotonDescargarReporte.tsx
import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportePDF } from '../pdf/ReportePDF';
import type { SnapshotReporte } from '../../types/reporte';
import { supabase } from '../../lib/supabase';

interface Props {
  snapshotRaw: SnapshotReporte;
}

export const BotonDescargarReporte = ({ snapshotRaw }: Props) => {
  const [snapshotHydrated, setSnapshotHydrated] = useState<SnapshotReporte | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prepararDocumento = async () => {
    setIsPreparing(true);
    setError(null);

    try {
      // 1. Extraer todas las rutas de las imágenes en un arreglo plano
      const rutasPrivadas: string[] = [];
      snapshotRaw.actividades.forEach((actividad) => {
        actividad.evidencias.forEach((evidencia) => {
          // Asumiendo que url_archivo guarda la ruta interna (ej. '2026/09/foto.jpg')
          if (evidencia.url_archivo) {
            rutasPrivadas.push(evidencia.url_archivo);
          }
        });
      });

      // Si no hay evidencias, pasamos directo al render
      if (rutasPrivadas.length === 0) {
        setSnapshotHydrated(snapshotRaw);
        setIsPreparing(false);
        return;
      }

      // 2. Pedir a Supabase TODAS las firmas en una sola llamada (Batch)
      // El '60' indica que las URLs expirarán en 60 segundos
      const { data: signedUrlsData, error: signedError } = await supabase
        .storage
        .from('evidencias') // Reemplaza con el nombre real de tu bucket
        .createSignedUrls(rutasPrivadas, 60);

      if (signedError) throw signedError;

      // Crear un diccionario (map) rápido para buscar las URLs firmadas por su ruta
      const urlMap = new Map<string, string>();
      signedUrlsData.forEach((item) => {
        if (item.path && item.signedUrl) {
          urlMap.set(item.path, item.signedUrl);
        }
      });

      // 3. Clonar profundamente el snapshot e inyectar las URLs firmadas
      const snapshotClonado: SnapshotReporte = JSON.parse(JSON.stringify(snapshotRaw));

      snapshotClonado.actividades.forEach((actividad) => {
        actividad.evidencias.forEach((evidencia) => {
          const urlFirmada = urlMap.get(evidencia.url_archivo);
          if (urlFirmada) {
            evidencia.url_archivo = urlFirmada; // Reemplazamos ruta por URL firmada
          }
        });
      });

      // 4. Actualizar estado para mostrar el botón real de descarga
      setSnapshotHydrated(snapshotClonado);
    } catch (err) {
      console.error('Error al firmar URLs:', err);
      setError('Error al obtener imágenes');
    } finally {
      setIsPreparing(false);
    }
  };

  // ESTADO 1: El usuario aún no hace clic, mostramos un botón normal
  if (!snapshotHydrated) {
    return (
      <button 
        onClick={prepararDocumento} 
        disabled={isPreparing}
        style={{ padding: '10px 20px', backgroundColor: '#0056b3', color: 'white', borderRadius: '5px' }}
      >
        {isPreparing ? 'Autenticando imágenes...' : 'Preparar Reporte PDF'}
      </button>
    );
  }

  // ESTADO 2: Snapshot hidratado, renderizamos el enlace de descarga real
  return (
    <div>
      <PDFDownloadLink
        document={<ReportePDF snapshot={snapshotHydrated} />}
        fileName={`Reporte_${snapshotHydrated.reporte.folio}.pdf`}
        style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', borderRadius: '5px' }}
      >
        {({ loading }) => (loading ? 'Construyendo documento...' : '¡Listo! Haz clic para descargar')}
      </PDFDownloadLink>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};