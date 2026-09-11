// types/reporte.ts
export interface SnapshotReporte {
  reporte: {
    folio: string;
    periodo_inicio: string;
    periodo_fin: string;
    estado: string;
  };
  embajador: {
    nombre: string;
    apellido: string;
    correo: string;
  };
  actividades: ActividadSnapshot[];
}

export interface ActividadSnapshot {
  id: number;
  nombre: string;
  fecha_evento: string;
  lugar: string;
  municipio?: string;
  proyecto_social?: { nombre: string };
  evidencias: { url_archivo: string; id: number }[];
  ods: { numero: number; nombre: string }[];
}