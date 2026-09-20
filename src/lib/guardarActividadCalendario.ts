import { supabase } from './supabase';

export interface GuardarActividadCalendarioInput {
  actividadId: number | null;
  nombre: string;
  descripcion: string;
  fechaEvento: string;
  horaInicio: string;
  horaFin: string;
  municipioId: number | null;
  lugar: string;
  calle: string;
  colonia: string;
  direccion: string;
  estado: string;
  tipoAccionId: number;
  odsIds: number[];
  // 👇 Nuevos campos añadidos
  es_externa?: boolean;
  institucion_id?: number | null;
}

export async function guardarActividadCalendario(input: GuardarActividadCalendarioInput) {
  const { data, error } = await supabase.rpc('guardar_actividad_calendario', {
    p_actividad_id: input.actividadId,
    p_nombre: input.nombre,
    p_descripcion: input.descripcion,
    p_fecha_evento: input.fechaEvento,
    p_hora_inicio: input.horaInicio || null,
    p_hora_fin: input.horaFin || null,
    p_municipio_id: input.municipioId,
    p_lugar: input.lugar,
    p_calle: input.calle,
    p_colonia: input.colonia,
    p_direccion: input.direccion,
    p_estado: input.estado,
    p_tipo_accion_id: input.tipoAccionId,
    p_ods_ids: input.odsIds,
    // 👇 Pasamos los nuevos campos a la base de datos
    p_es_externa: input.es_externa || false,
    p_institucion_id: input.institucion_id || null,
  });

  if (error) throw error;
  if (data === null || data === undefined) {
    throw new Error('Supabase no devolvio el ID de la actividad.');
  }

  return Number(data);
}