export interface Embajador {
  nombre: string;
}

export interface Domicilio {
  calle?: string;
  colonia?: string;
  municipio?: number;
}

export interface BeneficiarioData {
  hombres: string;
  mujeres: string;
  total: string;
}

export interface Actividad {
  sectores(sectores: any): unknown;
  sectores: any;
  id: number;
  nombre: string;
  fecha_evento: string;
  hora_inicio?: string;
  hora_fin?: string;
  lugar?: string;
  rango_edad?: string;
  descripcion?: string;
  tipo_accion_id_real?: string;
  domicilio?: Domicilio;
  beneficiarios?: Record<number, BeneficiarioData>;
  ods_seleccionados?: number[];
  evidencias?: { id: number; url: string }[];
  anulada: boolean;
  motivo_anulacion?: string;
  municipio_id?: number;
  calle?: string;
  colonia?: string;
}

export interface Reporte {
  id: number;
  mes: number;
  anio: number;
  estado: 'Todos' | 'Enviado' | 'Borrador' | 'Deshabilitado' | string;
  usuario_id: string;
  nombre_mes: string;
  embajador: Embajador;
  municipio_nombre: string;
  actividades: Actividad[];
}

export interface CategoriaDB { id: number; nombre: string; }
export interface AccionDB { id: number; nombre: string; }
export interface OdsDB { id: number; numero: number; nombre: string; categoria_sostenibilidad: string; }
export interface MunicipioDB { id: number; nombre: string; }