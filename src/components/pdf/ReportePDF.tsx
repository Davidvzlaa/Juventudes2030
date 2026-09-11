// components/pdf/ReportePDF.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { SnapshotReporte } from '../../types/reporte';

// Estilos específicos para el PDF (No usan CSS web estándar)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#333' },
  header: { borderBottom: '2 solid #0056b3', paddingBottom: 10, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0056b3' },
  subtitle: { fontSize: 12, marginTop: 5, color: '#666' },
  actividadCard: { marginBottom: 20, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 5 },
  actividadTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { fontWeight: 'bold', width: 80 },
  value: { flex: 1 },
  evidenciasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  evidenciaImage: { width: 150, height: 100, objectFit: 'cover', borderRadius: 4 },
  odsBadge: { backgroundColor: '#e2e8f0', padding: '2 6', borderRadius: 10, fontSize: 9, marginRight: 5 },
  evidenciasGrid: {
    flexDirection: 'row', 
    gap: 5, 
    marginTop: 10 
  },
  evidenciaThumbnail: { 
    width: 120, // Imágenes pequeñas
    height: 80, 
    objectFit: 'cover',
    borderRadius: 2 
  }
});

interface Props {
  snapshot: SnapshotReporte;
}

export const ReportePDF = ({ snapshot }: Props) => {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* Encabezado del Reporte */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte de Actividades</Text>
          <Text style={styles.subtitle}>Folio: {snapshot.reporte.folio} | Estado: {snapshot.reporte.estado}</Text>
          <Text style={styles.subtitle}>
            Periodo: {snapshot.reporte.periodo_inicio} al {snapshot.reporte.periodo_fin}
          </Text>
          <Text style={styles.subtitle}>
            Embajador: {snapshot.embajador.nombre} {snapshot.embajador.apellido}
          </Text>
        </View>

        {/* Lista de Actividades */}
        {snapshot.actividades.map((actividad) => (
          <View key={actividad.id} style={styles.actividadCard} wrap={false}>
            <Text style={styles.actividadTitle}>{actividad.nombre}</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>{new Date(actividad.fecha_evento).toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Lugar:</Text>
              <Text style={styles.value}>{actividad.lugar} {actividad.municipio ? `- ${actividad.municipio}` : ''}</Text>
            </View>

            {/* ODS Relacionados */}
            {actividad.ods.length > 0 && (
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                {actividad.ods.map(ods => (
                  <Text key={ods.numero} style={styles.odsBadge}>ODS {ods.numero}</Text>
                ))}
              </View>
            )}

            {/* Galería de Evidencias */}
            {actividad.evidencias.length > 0 && (
              <View style={styles.evidenciasContainer}>
                {actividad.evidencias.map((evidencia) => (
                   // La URL debe ser pública o tener un token firmado de Supabase Storage
                  <Image 
                    key={evidencia.id} 
                    src={evidencia.url_archivo} 
                    style={styles.evidenciaImage} 
                  />
                ))}
              </View>
            )}
          </View>
        ))}

      </Page>
    </Document>
  );
};