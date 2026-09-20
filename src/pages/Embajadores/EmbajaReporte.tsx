import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Calendar, FileText, Send, AlertCircle, Clock, CheckCircle2, 
  Plus, X, Save, UploadCloud, Edit2, Loader2, Info, Globe, Users, Building2, AlertTriangle,
} from 'lucide-react';
import { BlobProvider, PDFDownloadLink, Document } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { supabase } from '../../lib/supabase'; 
import ReportePDF from '../../ReportePDF';

// ==========================================
// INTERFACES ESTRICTAS
// ==========================================
type EstadoReporte = 'Sin empezar' | 'Borrador' | 'Enviado' | 'Regresado' | 'Aprobado' | 'Cerrado';

interface Reporte {
  id: number;
  mes: number;
  anio: number;
  estado: EstadoReporte;
  periodo_inicio: string;
  periodo_fin: string;
  nombre_mes?: string;
  usuario_id?: string;
  actividades?: any[]; 
}

interface Catalogo {
  id: number;
  nombre: string;
  numero?: number;
  categoria_sostenibilidad?: string;
}

interface Institucion {
  id: number;
  nombre: string;
}

interface Evidencia {
  id: number | string;
  url: string;
  file?: File;
  path_interno?: string;
}

interface ActividadFormulario {
  id?: string | number;
  es_propia: boolean;
  nombre: string;
  tipo_actividad: string;
  tipo_accion_id_real?: number;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  ods_seleccionados: number[];
  lugar: string;
  domicilio: { municipio: string | number; colonia: string; calle: string };
  beneficiarios: Record<number, { hombres: string; mujeres: string; total?: string }>;
  sectores: Record<number, { hombres: string; mujeres: string; total?: string }>;
  rango_edad: string;
  descripcion: string;
  evidencias: Evidencia[];
  es_colaborativa: boolean;
  colaborador_id: string;
  es_externa: boolean;
  institucion_id?: number | null;
  nueva_institucion?: string;
  anulada?: boolean;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MAX_EVIDENCIAS = 4;
const MAX_ODS = 4;
const ESTADOS_BLOQUEADOS: EstadoReporte[] = ['Enviado', 'Aprobado', 'Cerrado'];

const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {}
  const options = { position: 'bottom-right' as const };
  switch (type) {
    case 'success': toast.success(message, options); break;
    case 'error': toast.error(message, options); break;
    case 'warning': toast.warning(message, options); break;
    default: toast.info(message, options);
  }
};

const formatearFechaVisual = (fechaStr: string) => {
  if (!fechaStr) return '';
  try {
    const [year, month, day] = fechaStr.split('T')[0].split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return format(fecha, "d 'de' MMMM 'del' yyyy", { locale: es });
  } catch {
    return fechaStr;
  }
};

// ==========================================
// VISOR PDF ESTABLE
// ==========================================
type PDFBlobContentProps = {
  url: string | null;
  loading: boolean;
  error: Error | null;
  stableUrl: string | null;
  onNewUrl: (url: string) => void;
};

const PDFBlobContent = React.memo(({ url, loading, error, stableUrl, onNewUrl }: PDFBlobContentProps) => {
  useEffect(() => { if (url && url !== stableUrl) onNewUrl(url); }, [url, stableUrl, onNewUrl]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white p-6 text-center">
        <div>
          <AlertTriangle className="mx-auto mb-3 text-red-500" size={32} />
          <p className="font-bold text-gray-700">No se pudo generar el PDF</p>
          <p className="text-xs text-gray-500 mt-1">Revisa que todos los datos estén completos.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {stableUrl ? (
        <iframe title="Vista previa del reporte PDF" src={stableUrl} className="w-full h-full border-0 bg-white"/>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <Loader2 size={38} className="animate-spin text-[#00689D] mx-auto mb-3" />
            <p className="font-bold text-gray-700">Generando vista previa...</p>
            <p className="text-xs text-gray-400 mt-1">El PDF aparecerá automáticamente.</p>
          </div>
        </div>
      )}
      {loading && stableUrl && (
        <div className="absolute inset-x-0 top-0 z-20 pointer-events-none">
          <div className="h-1 bg-gray-200 overflow-hidden">
            <div className="h-full w-1/3 bg-[#00689D] animate-[pulse_1.2s_ease-in-out_infinite]" />
          </div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Loader2 size={13} className="animate-spin text-[#00689D]" /> Actualizando PDF...
          </div>
        </div>
      )}
    </>
  );
});

type PDFDocumentElement = React.ReactElement<React.ComponentProps<typeof Document>>;

const VisorPDFAislado = React.memo(({ document }: { document: PDFDocumentElement | null }) => {
    const [stableUrl, setStableUrl] = useState<string | null>(null);
    const currentUrlRef = useRef<string | null>(null);

    const handleNewUrl = useCallback((url: string) => {
      const oldUrl = currentUrlRef.current;
      if (oldUrl && oldUrl !== url) URL.revokeObjectURL(oldUrl);
      currentUrlRef.current = url;
      setStableUrl(url);
    }, []);

    useEffect(() => {
      return () => {
        if (currentUrlRef.current) {
          URL.revokeObjectURL(currentUrlRef.current);
          currentUrlRef.current = null;
        }
      };
    }, []);

    if (!document) {
      return (
        <div className="w-full h-full min-h-0 bg-white flex items-center justify-center">
          <div className="text-sm text-gray-400">Preparando documento...</div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full min-h-0 bg-[#2f2f2f] overflow-hidden">
        <BlobProvider document={document}>
          {({ url, loading, error }) => (
            <PDFBlobContent url={url} loading={loading} error={error} stableUrl={stableUrl} onNewUrl={handleNewUrl} />
          )}
        </BlobProvider>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.document === nextProps.document
);


// ==========================================
// COMPONENTE PRINCIPAL: EMBAJADOR REPORTE
// ==========================================
export default function EmbajaReporte() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [actividades, setActividades] = useState<ActividadFormulario[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [usuarioInfo, setUsuarioInfo] = useState<{nombre: string, apellido: string, municipio: string} | null>(null);
  
  const [actividadEnEdicion, setActividadEnEdicion] = useState<ActividadFormulario | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [isNuevaInstitucion, setIsNuevaInstitucion] = useState(false);

  // Catálogos
  const [categoriasDB, setCategoriasDB] = useState<Catalogo[]>([]);
  const [accionesDB, setAccionesDB] = useState<Catalogo[]>([]);
  const [odsDB, setOdsDB] = useState<Catalogo[]>([]); 
  const [municipiosDB, setMunicipiosDB] = useState<Catalogo[]>([]);
  const [sectoresDB, setSectoresDB] = useState<Catalogo[]>([]); 
  const [areasSostenibilidadDB, setAreasSostenibilidadDB] = useState<Catalogo[]>([]);
  const [institucionesDB, setInstitucionesDB] = useState<Institucion[]>([]);
  const [embajadoresLocal, setEmbajadoresLocal] = useState<any[]>([]);

  const [showSendDialog, setShowSendDialog] = useState(false);
  const [evidenciaToDelete, setEvidenciaToDelete] = useState<number | string | null>(null);

  const reporteBloqueado = reporteSeleccionado ? ESTADOS_BLOQUEADOS.includes(reporteSeleccionado.estado) : false;
  const esPropietario = actividadEnEdicion?.es_propia !== false;
  const disablesEdition = !esPropietario || reporteBloqueado;

  const fetchDatos = async () => {
    setLoadingDatos(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) return;
      setCurrentUserId(userId);

      const [resUser, resCat, resAcc, resOds, resMun, resSec, resAreas, resInst, resRep, resEmb] = await Promise.all([
        supabase.from('usuarios').select('nombre, apellido').eq('id', userId).single(),
        supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('ods').select('id, numero, nombre, categoria_sostenibilidad').eq('activo', true).order('numero'),
        supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
        supabase.from('sectores_poblacion').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('areas_sostenibilidad').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('instituciones').select('id, nombre').eq('activo', true).order('nombre'),
        supabase.from('reportes').select('id, mes, anio, estado, periodo_inicio, periodo_fin').eq('usuario_id', userId).order('periodo_inicio', { ascending: false }),
        supabase.from('embajadores').select('municipios(nombre)').eq('usuario_id', userId).maybeSingle()
      ]);

      const municipioEmbajador = (resEmb.data?.municipios as any)?.nombre || 'Desconocido';

      setUsuarioInfo({ nombre: resUser.data?.nombre || '', apellido: resUser.data?.apellido || '', municipio: municipioEmbajador });

      if (resCat.data) setCategoriasDB([...resCat.data, { id: 99, nombre: 'Total Beneficiarios' }]);
      if (resAcc.data) setAccionesDB(resAcc.data);
      if (resOds.data) setOdsDB(resOds.data);
      if (resMun.data) setMunicipiosDB(resMun.data);
      if (resSec.data) setSectoresDB(resSec.data);
      if (resAreas.data) setAreasSostenibilidadDB(resAreas.data);
      if (resInst.data) setInstitucionesDB(resInst.data);

      if (resRep.data) {
        const formateados = resRep.data.map(r => ({
          ...r,
          nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`
        })) as Reporte[];
        setReportes(formateados);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoadingDatos(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  const seleccionarReporte = async (reporte: Reporte, forceRefresh = false) => {
    if (cargandoDetalle) return;
    const esMismoReporte = reporteSeleccionado?.id === reporte.id;
    if (!forceRefresh && esMismoReporte) return; 

    setCargandoDetalle(true);
    setReporteSeleccionado(reporte);
    setActividades([]); 
    setActividadEnEdicion(null);

    try {
      if (!currentUserId) return;

      const mesStr = String(reporte.mes).padStart(2, '0');
      const fechaInicio = reporte.periodo_inicio || `${reporte.anio}-${mesStr}-01`;
      const ultimoDia = new Date(reporte.anio, reporte.mes, 0).getDate(); 
      const fechaFin = reporte.periodo_fin || `${reporte.anio}-${mesStr}-${ultimoDia}`;

      const { data: actividadesCreadas, error: errAct } = await supabase
        .from('actividades')
        .select(`
          *,
          municipios(nombre),
          instituciones(nombre),
          actividad_beneficiarios(categoria_id, hombres, mujeres, total),
          actividad_sectores(sector_id, hombres, mujeres, total),
          actividad_acciones(tipo_accion_id, cantidad, tipos_accion(nombre)),
          actividad_ods(ods_id, es_principal, ods(numero, nombre)),
          actividad_asistentes(usuario_id, usuarios(nombre, apellido)),
          evidencias(id, url_archivo, usuario_id)
        `)
        .eq('creado_por_usuario_id', currentUserId) 
        .gte('fecha_evento', fechaInicio)   
        .lte('fecha_evento', fechaFin)
        .is('fecha_eliminacion', null);

      if (errAct) throw errAct;

      const { data: actividadesUnidas, error: errUnidas } = await supabase
        .from('actividad_asistentes')
        .select(`
          actividad_id,
          actividades (
            *,
            municipios(nombre),
            instituciones(nombre),
            actividad_beneficiarios(categoria_id, hombres, mujeres, total),
            actividad_sectores(sector_id, hombres, mujeres, total),
            actividad_acciones(tipo_accion_id, cantidad, tipos_accion(nombre)),
            actividad_ods(ods_id, es_principal, ods(numero, nombre)),
            evidencias(id, url_archivo, usuario_id)
          )
        `)
        .eq('usuario_id', currentUserId);

      if (errUnidas) throw errUnidas;

      const actividadesMap = new Map();

      actividadesCreadas?.forEach((act: any) => {
        if (act.estado !== 'Cancelada') {
          actividadesMap.set(act.id, { ...act, es_propia: true });
        }
      });

      actividadesUnidas?.forEach((item: any) => {
        const act: any = Array.isArray(item.actividades) ? item.actividades[0] : item.actividades;
        if (act && act.fecha_eliminacion === null && act.estado !== 'Cancelada') {
          if (act.fecha_evento >= fechaInicio && act.fecha_evento <= fechaFin) {
            if (!actividadesMap.has(act.id)) {
              actividadesMap.set(act.id, { 
                ...act, 
                es_propia: act.creado_por_usuario_id === currentUserId 
              });
            }
          }
        }
      });

      const arrayActividades = Array.from(actividadesMap.values())
        .sort((a, b) => new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime());

      const allEvidencePaths: string[] = [];
      arrayActividades.forEach(act => {
        const misEvidencias = act.evidencias?.filter((ev: any) => ev.usuario_id === currentUserId) || [];
        misEvidencias.forEach((ev: any) => { if(ev.url_archivo) allEvidencePaths.push(ev.url_archivo); });
      });

      const signedUrlsMap = new Map<string, string>();
      if (allEvidencePaths.length > 0) {
        const { data: signedData, error: signedErr } = await supabase.storage.from('evidencias').createSignedUrls(allEvidencePaths, 3600);
        if (!signedErr && signedData) {
          signedData.forEach(item => {
            if (!item.error && item.path && item.signedUrl) signedUrlsMap.set(item.path, item.signedUrl);
          });
        }
      }

      const actividadesParaPDF = arrayActividades.map((act: any) => ({
        ...act,
        evidencias: act.evidencias?.map((ev: any) => ({
          ...ev,
          url: signedUrlsMap.get(ev.url_archivo) || ev.url || ''
        }))
      }));

      setReporteSeleccionado({ 
        ...reporte, 
        actividades: actividadesParaPDF 
      });

      const actividadesCompletas: ActividadFormulario[] = actividadesParaPDF.map((act: any) => {
          let beneficiariosObj: any = {};
          act.actividad_beneficiarios?.forEach((b: any) => {
            beneficiariosObj[b.categoria_id] = { hombres: b.hombres?.toString(), mujeres: b.mujeres?.toString(), total: b.total?.toString() };
          });
          
          let sectoresObj: any = {};
          act.actividad_sectores?.forEach((s: any) => {
            sectoresObj[s.sector_id] = { hombres: s.hombres?.toString(), mujeres: s.mujeres?.toString(), total: s.total?.toString() };
          });

          let odsSeleccionados: number[] = [];
          if (act.actividad_ods) {
            const principal = act.actividad_ods.find((o: any) => o.es_principal);
            const secundarios = act.actividad_ods.filter((o: any) => !o.es_principal);
            if (principal) odsSeleccionados.push(principal.ods_id);
            odsSeleccionados.push(...secundarios.map((o:any) => o.ods_id));
          }

          let tipo_actividad_nombre = '';
          let tipo_accion_id_real = 0;
          if (act.actividad_acciones && act.actividad_acciones.length > 0) {
             const accionRel = act.actividad_acciones[0];
             if (accionRel.tipos_accion) {
               tipo_actividad_nombre = accionRel.tipos_accion.nombre;
               tipo_accion_id_real = accionRel.tipo_accion_id;
             }
          }

          const asistentes = act.actividad_asistentes || [];
          const esColab = asistentes.length > 0;
          const colaborador = esColab ? asistentes[0].usuario_id : '';

          return {
            ...act,
            tipo_actividad: tipo_actividad_nombre,
            tipo_accion_id_real: tipo_accion_id_real,
            rango_edad: act.rango_edad_beneficiarios,
            domicilio: { calle: act.calle || '', colonia: act.colonia || '', municipio: act.municipio_id || '' },
            beneficiarios: beneficiariosObj,
            sectores: sectoresObj,
            ods_seleccionados: odsSeleccionados,
            evidencias: act.evidencias, 
            es_colaborativa: esColab, 
            colaborador_id: colaborador,
            es_externa: Boolean(act.es_externa),
            institucion_id: act.institucion_id || null
          };
      });

      setActividades(actividadesCompletas);
    } catch (error) {
      toast.error("Error al cargar las actividades del reporte.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  useEffect(() => {
    const cargarEmbajadores = async () => {
      const municipioId = actividadEnEdicion?.domicilio?.municipio;
      if (actividadEnEdicion?.es_colaborativa && municipioId) {
        const { data } = await supabase
          .from('embajadores')
          .select('usuario_id, usuarios(nombre, apellido)')
          .eq('municipio_id', municipioId)
          .eq('activo', true);
        
        if (data) {
          setEmbajadoresLocal(data.filter(e => e.usuario_id !== currentUserId));
        }
      } else {
        setEmbajadoresLocal([]);
      }
    };
    cargarEmbajadores();
  }, [actividadEnEdicion?.es_colaborativa, actividadEnEdicion?.domicilio?.municipio, currentUserId]);

  useEffect(() => {
    return () => {
      if (actividadEnEdicion?.evidencias) {
        actividadEnEdicion.evidencias.forEach((ev) => {
          if (ev.url && ev.url.startsWith('blob:')) URL.revokeObjectURL(ev.url);
        });
      }
    };
  }, [actividadEnEdicion]);

  const handleChangeSimple = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setActividadEnEdicion(prev => prev ? { ...prev, [name]: val } : null);
  };

  const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActividadEnEdicion(prev => prev ? ({
      ...prev, 
      domicilio: { ...prev.domicilio, [name]: name === 'municipio' ? Number(value) : value },
      ...(name === 'municipio' ? { colaborador_id: '' } : {})
    }) : null);
  };

  const toggleOds = (odsId: number) => {
    if (disablesEdition) return;
    setActividadEnEdicion(prev => {
      if (!prev) return prev;
      const arr = prev.ods_seleccionados || [];
      if (arr.includes(odsId)) return { ...prev, ods_seleccionados: arr.filter(id => id !== odsId) };
      if (arr.length >= MAX_ODS) { 
        notifyWithSound(`Solo puedes seleccionar un máximo de ${MAX_ODS} ODS.`, 'warning'); 
        return prev; 
      }
      return { ...prev, ods_seleccionados: [...arr, odsId] };
    });
  };

  const handleBeneficiarioChange = (categoriaId: number, campo: string, value: string) => {
    if (disablesEdition) return;
    if (value !== '' && !/^\d+$/.test(value)) return;
    setActividadEnEdicion(prev => {
      if (!prev) return prev;
      const prevBenef = prev.beneficiarios?.[categoriaId] || {};
      const updatedBenef = { ...prevBenef, [campo]: value };
      return { ...prev, beneficiarios: { ...prev.beneficiarios, [categoriaId]: updatedBenef } };
    });
  };

  const handleSectorChange = (sectorId: number, campo: 'hombres' | 'mujeres', value: string) => {
    if (disablesEdition) return;
    if (value !== '' && !/^\d+$/.test(value)) return;
    setActividadEnEdicion(prev => {
      if (!prev) return prev;
      
      let totalCatSum = 0;
      if (prev.beneficiarios) {
        Object.entries(prev.beneficiarios).forEach(([id, val]) => {
          if (Number(id) !== 99) { 
            totalCatSum += parseInt(val[campo] || '0', 10);
          }
        });
      }

      let sumOtrosSectores = 0;
      if (prev.sectores) {
        Object.entries(prev.sectores).forEach(([id, val]) => {
          if (Number(id) !== sectorId) {
            sumOtrosSectores += parseInt(val[campo] || '0', 10);
          }
        });
      }

      const maxPermitido = Math.max(0, totalCatSum - sumOtrosSectores);
      let valStr = value;
      let valNum = parseInt(value || '0', 10);
      
      if (valNum > maxPermitido) {
        notifyWithSound(`Límite alcanzado: Solo tienes ${maxPermitido} ${campo} disponibles según tu registro de categorías.`, 'warning');
        valStr = maxPermitido.toString();
      }

      const currentSec = prev.sectores?.[sectorId] || { hombres: '0', mujeres: '0', total: '0' };
      return { ...prev, sectores: { ...prev.sectores, [sectorId]: { ...currentSec, [campo]: valStr } } };
    });
  };

  const handleEvidenciaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (reporteBloqueado) return; 
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) { notifyWithSound("Solo imágenes permitidas.", "warning"); return; }
    if (file.size > 10 * 1024 * 1024) { notifyWithSound("Máximo 10MB.", "warning"); return; }

    const url = URL.createObjectURL(file);
    
    setActividadEnEdicion(prev => {
      if (!prev) return prev;
      const evidenciasActuales = prev.evidencias || [];
      if (evidenciasActuales.length >= MAX_EVIDENCIAS) {
        notifyWithSound(`Máximo ${MAX_EVIDENCIAS} evidencias permitidas.`, "warning");
        return prev;
      }
      return { ...prev, evidencias: [...evidenciasActuales, { id: Date.now(), url, file }] };
    });
    e.target.value = '';
  };

  const confirmEliminarEvidencia = async () => {
    if (evidenciaToDelete === null || !actividadEnEdicion || reporteBloqueado) return;
    const idEliminar = evidenciaToDelete;
    const evEliminar = actividadEnEdicion.evidencias.find(ev => ev.id === idEliminar);
    
    if (evEliminar && !evEliminar.file) {
      const toastId = toast.loading('Eliminando evidencia...');
      try {
        if (evEliminar.path_interno) {
          const { error: storageError } = await supabase.storage.from('evidencias').remove([evEliminar.path_interno]);
          if (storageError) console.error("No se pudo borrar del storage:", storageError);
        }

        const { error: dbError } = await supabase.from('evidencias').delete().eq('id', idEliminar);
        if (dbError) throw dbError;
        
        toast.success('Evidencia eliminada', { id: toastId });
      } catch (error: any) {
        setEvidenciaToDelete(null); 
        return toast.error('Error al eliminar: ' + error.message, { id: toastId });
      }
    }

    if (evEliminar && evEliminar.url && evEliminar.url.startsWith('blob:')) {
      URL.revokeObjectURL(evEliminar.url);
    }

    setActividadEnEdicion(prev => {
      if (!prev) return prev;
      return { ...prev, evidencias: prev.evidencias.filter(ev => ev.id !== idEliminar) };
    });
    
    setEvidenciaToDelete(null);
  };

  const guardarEvidenciasActividadCompartida = async () => {
     if (!actividadEnEdicion || !currentUserId || reporteBloqueado) return;
     const actividadId = actividadEnEdicion.id;
     if (!actividadId || String(actividadId).startsWith('act-')) throw new Error('La actividad compartida no tiene un ID válido.');

     const archivosNuevos = actividadEnEdicion.evidencias.filter((ev) => Boolean(ev.file));
     if (archivosNuevos.length === 0) return;

     for (const ev of archivosNuevos) {
       if (!ev.file) continue;
       const extension = ev.file.name.split('.').pop()?.toLowerCase() || 'jpg';
       const fileName = `${actividadId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
       const filePath = `${currentUserId}/${fileName}`;

       const { error: uploadError } = await supabase.storage.from('evidencias').upload(filePath, ev.file);
       if (uploadError) throw uploadError;

       const { error: insertError } = await supabase.from('evidencias').insert({ actividad_id: actividadId, url_archivo: filePath, usuario_id: currentUserId });
       if (insertError) {
         await supabase.storage.from('evidencias').remove([filePath]);
         throw insertError;
       }
     }
  };

  const guardarEdicionActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteSeleccionado || !actividadEnEdicion || !currentUserId || reporteBloqueado) return;

    if (!esPropietario) {
      setGuardando(true);
      try {
        await guardarEvidenciasActividadCompartida();
        notifyWithSound('Tus evidencias fueron guardadas correctamente.', 'success');
        setActividadEnEdicion(null);
        await seleccionarReporte(reporteSeleccionado, true);
      } catch (error: any) {
        notifyWithSound(`No se pudieron guardar tus evidencias: ${error.message}`, 'error');
      } finally {
        setGuardando(false);
      }
      return;
    }

    if (actividadEnEdicion.es_colaborativa && !actividadEnEdicion.colaborador_id) {
      return notifyWithSound('Selecciona el embajador colaborador de la lista.', 'warning');
    }
    if (!actividadEnEdicion.nombre.trim()) return notifyWithSound('Escribe el nombre de la actividad.', 'warning');
    if (!actividadEnEdicion.tipo_accion_id_real) return notifyWithSound('Selecciona el tipo de acción.', 'warning');
    if (!actividadEnEdicion.fecha_evento) return notifyWithSound('Selecciona la fecha de la actividad.', 'warning');
    if (!actividadEnEdicion.domicilio?.municipio) return notifyWithSound('Selecciona el municipio.', 'warning');
    
    if (!actividadEnEdicion.es_externa && (!actividadEnEdicion.domicilio.colonia || !actividadEnEdicion.domicilio.calle)) {
      return notifyWithSound('La colonia y la calle son obligatorias para actividades propias.', 'warning');
    }
    
    if (actividadEnEdicion.ods_seleccionados.length === 0) return notifyWithSound('Selecciona al menos un ODS.', 'warning');
    
    if (actividadEnEdicion.es_externa) {
      if (isNuevaInstitucion && !actividadEnEdicion.nueva_institucion?.trim()) {
        return notifyWithSound('Escribe el nombre de la nueva institución.', 'warning');
      } else if (!isNuevaInstitucion && (!actividadEnEdicion.institucion_id || actividadEnEdicion.institucion_id === 0)) {
        return notifyWithSound('Selecciona la institución del catálogo.', 'warning');
      }
    } else {
      if (!actividadEnEdicion.rango_edad.trim()) return notifyWithSound('Indica el rango de edad de los beneficiarios.', 'warning');
    }

    setGuardando(true);
    try {
      const esNueva = String(actividadEnEdicion.id || '').startsWith('act-');
      
      let finalInstId = actividadEnEdicion.institucion_id;
      if (actividadEnEdicion.es_externa && isNuevaInstitucion && actividadEnEdicion.nueva_institucion) {
        const nombreBuscado = actividadEnEdicion.nueva_institucion.trim().toLowerCase();
        const existe = institucionesDB.find(i => i.nombre.toLowerCase() === nombreBuscado);
        if (existe) {
          finalInstId = existe.id;
        } else {
          const { data: nuevaInst, error: errInst } = await supabase.from('instituciones').insert([{ nombre: actividadEnEdicion.nueva_institucion.trim(), activo: true }]).select().single();
          if (errInst) throw new Error("No se pudo registrar la nueva institución.");
          finalInstId = nuevaInst.id;
          setInstitucionesDB(prev => [...prev, nuevaInst].sort((a,b) => a.nombre.localeCompare(b.nombre)));
        }
      } else if (!actividadEnEdicion.es_externa) {
        finalInstId = null;
      }

      let totalBenSum = 0;
      const payloadBeneficiarios: any[] = [];
      const payloadSectores: any[] = [];
      const payloadOds: any[] = [];
      const areasSeleccionadas = new Set<number>();

      if (!actividadEnEdicion.es_externa) {
        Object.entries(actividadEnEdicion.beneficiarios || {}).forEach(([catIdStr, val]) => {
          if (Number(catIdStr) !== 99) {
            const h = parseInt(val.hombres || '0', 10);
            const m = parseInt(val.mujeres || '0', 10);
            if (h > 0 || m > 0) {
              totalBenSum += (h + m);
              payloadBeneficiarios.push({ categoria_id: Number(catIdStr), hombres: h, mujeres: m, total: h + m });
            }
          }
        });

        Object.entries(actividadEnEdicion.sectores || {}).forEach(([secIdStr, val]) => {
          const h = parseInt(val.hombres || '0', 10);
          const m = parseInt(val.mujeres || '0', 10);
          if (h > 0 || m > 0) {
            payloadSectores.push({ sector_id: Number(secIdStr), hombres: h, mujeres: m, total: h + m });
          }
        });
      }

      const normalizarNombre = (nombre: string) => nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const areaEconomica = areasSostenibilidadDB.find((area) => /econ/.test(normalizarNombre(area.nombre)));
      const areaSocial = areasSostenibilidadDB.find((area) => /social|sociedad/.test(normalizarNombre(area.nombre)));
      const areaAmbiental = areasSostenibilidadDB.find((area) => /ambient|biosfer/.test(normalizarNombre(area.nombre)));
      
      actividadEnEdicion.ods_seleccionados?.forEach((odsId, idx) => {
        payloadOds.push({ ods_id: odsId, es_principal: idx === 0 });
        const odsObj = odsDB.find(o => o.id === odsId);
        if (odsObj?.categoria_sostenibilidad) {
          const cat = odsObj.categoria_sostenibilidad.toLowerCase();
          if (cat.includes('econ') && areaEconomica) areasSeleccionadas.add(areaEconomica.id);
          if ((cat.includes('social') || cat.includes('sociedad')) && areaSocial) areasSeleccionadas.add(areaSocial.id);
          if ((cat.includes('ambient') || cat.includes('biosfera')) && areaAmbiental) areasSeleccionadas.add(areaAmbiental.id);
          if (cat.includes('transversal') || cat.includes('alianza')) areasSostenibilidadDB.forEach(a => areasSeleccionadas.add(a.id));
        }
      });

      const tipoAccionIdNum = Number(actividadEnEdicion.tipo_accion_id_real);

      const payloadTransaccion = {
        es_nueva: esNueva,
        creado_por_usuario_id: currentUserId,
        reporte_id: reporteSeleccionado.id,
        es_colaborativa: actividadEnEdicion.es_colaborativa,
        colaborador_id: actividadEnEdicion.colaborador_id || null,
        accion_id: tipoAccionIdNum > 0 ? tipoAccionIdNum : null,
        
        actividad: {
          id: esNueva ? null : actividadEnEdicion.id,
          nombre: actividadEnEdicion.nombre.trim(),
          fecha_evento: actividadEnEdicion.fecha_evento,
          hora_inicio: actividadEnEdicion.hora_inicio || null,
          hora_fin: actividadEnEdicion.hora_fin || null,
          lugar: actividadEnEdicion.lugar.trim(),
          municipio_id: actividadEnEdicion.domicilio?.municipio || null,
          calle: actividadEnEdicion.domicilio?.calle?.trim() || null,
          colonia: actividadEnEdicion.domicilio?.colonia?.trim() || null,
          rango_edad_beneficiarios: actividadEnEdicion.es_externa ? null : actividadEnEdicion.rango_edad?.trim(),
          descripcion: actividadEnEdicion.descripcion.trim(),
          es_externa: actividadEnEdicion.es_externa,
          organizador_externo: null, 
          institucion_id: actividadEnEdicion.es_externa ? finalInstId : null,
          beneficiarios_directos: totalBenSum
        },
        beneficiarios: payloadBeneficiarios,
        sectores: payloadSectores,
        ods: payloadOds,
        sostenibilidad: Array.from(areasSeleccionadas)
      };

      const { data: dbData, error: dbError } = await supabase.rpc('guardar_actividad_transaccional', { payload: payloadTransaccion });
      if (dbError) throw new Error(dbError.message);
      
      const savedActId = dbData.actividad_id;

      const archivosNuevos = actividadEnEdicion.evidencias.filter(ev => ev.file);
      if (archivosNuevos.length > 0) {
        const uploadPromises = archivosNuevos.map(async (ev) => {
          const fileExt = ev.file!.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `${savedActId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `${currentUserId}/${fileName}`; 

          const { error: uploadError } = await supabase.storage.from('evidencias').upload(filePath, ev.file!);
          if (uploadError) throw new Error("No se pudo subir la imagen.");

          const { error: insertErr } = await supabase.from('evidencias').insert({
            actividad_id: savedActId,
            url_archivo: filePath,
            usuario_id: currentUserId
          });
          
          if (insertErr) {
            await supabase.storage.from('evidencias').remove([filePath]);
            throw new Error("Error en la tabla evidencias al guardar registro. Se canceló la subida.");
          }
        });
        await Promise.all(uploadPromises); 
      }
      
      notifyWithSound('Progreso guardado exitosamente', 'success');
      setActividadEnEdicion(null);
      await seleccionarReporte(reporteSeleccionado, true); 
      
    } catch (error: any) {
      console.error(error);
      notifyWithSound('Error al guardar: ' + error.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const crearNuevaActividad = () => {
    if (!reporteSeleccionado || reporteBloqueado) return;
    const mesStr = String(reporteSeleccionado.mes).padStart(2, '0');
    setActividadEnEdicion({
      id: `act-${Date.now()}`, 
      es_propia: true, 
      nombre: '', 
      tipo_actividad: '', 
      fecha_evento: `${reporteSeleccionado.anio}-${mesStr}-01`, 
      hora_inicio: '', hora_fin: '',
      ods_seleccionados: [], 
      lugar: '', domicilio: { municipio: '', colonia: '', calle: '' },
      beneficiarios: {}, sectores: {}, rango_edad: '', descripcion: '', evidencias: [],
      es_colaborativa: false, colaborador_id: '',
      es_externa: false, institucion_id: 0, nueva_institucion: ''
    });
    setIsNuevaInstitucion(false);
  };

  const cerrarDrawerFormularioSeguro = () => {
    if (reporteBloqueado) {
      setActividadEnEdicion(null);
      return;
    }
    const formTieneDatos = actividadEnEdicion && (actividadEnEdicion.nombre.trim() !== '' || actividadEnEdicion.descripcion.trim() !== '' || actividadEnEdicion.ods_seleccionados.length > 0);
    if (formTieneDatos && !guardando) {
      if(window.confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?')) {
        setActividadEnEdicion(null);
      }
    } else {
      setActividadEnEdicion(null);
    }
  };

  const validarReporteParaEnvio = () => {
    if (actividades.length === 0) return { listo: false, msg: 'No tienes actividades registradas en este mes.' };
    if (reporteBloqueado) return { listo: false, msg: 'Este reporte ya no admite envíos.' };

    for (let act of actividades) {
      if (!act.evidencias || act.evidencias.length === 0) {
        return { listo: false, msg: `La actividad "${act.nombre}" requiere al menos 1 fotografía de evidencia.` };
      }

      if (act.es_propia) {
        const faltaInfoBasica = !act.nombre || !act.fecha_evento || !act.hora_inicio || !act.hora_fin || !act.lugar || !act.domicilio?.municipio || !act.descripcion;
        const faltaDomicilio = !act.es_externa && (!act.domicilio?.colonia || !act.domicilio?.calle);

        if (faltaInfoBasica || faltaDomicilio) {
          return { listo: false, msg: `La actividad "${act.nombre}" tiene campos obligatorios de información vacíos.` };
        }

        if (!act.ods_seleccionados || act.ods_seleccionados.length === 0) {
          return { listo: false, msg: `La actividad "${act.nombre}" debe tener al menos 1 ODS seleccionado.` };
        }

        if (act.es_externa) {
          if (!act.institucion_id || act.institucion_id === 0) {
            return { listo: false, msg: `La actividad externa "${act.nombre}" requiere la institución organizadora.` };
          }
        } else {
          if (!act.rango_edad || act.rango_edad.trim() === '') {
            return { listo: false, msg: `La actividad "${act.nombre}" requiere especificar el rango de edad.` };
          }
          let totalBen = 0;
          if (act.beneficiarios) {
            Object.values(act.beneficiarios).forEach((b: any) => {
              totalBen += parseInt(b.hombres || '0', 10) + parseInt(b.mujeres || '0', 10);
            });
          }
          if (totalBen === 0) {
            return { listo: false, msg: `La actividad "${act.nombre}" debe tener al menos una persona beneficiada registrada.` };
          }
        }
      }
    }
    return { listo: true, msg: 'Todo correcto' };
  };

  const handleIntentarEnviar = () => {
    const validacion = validarReporteParaEnvio();
    if (!validacion.listo) {
      notifyWithSound(validacion.msg, 'error');
      return;
    }
    setShowSendDialog(true);
  };

  const handleEnviarReporte = async () => {
    if (!reporteSeleccionado) return;
    setIsSending(true);
    try {
      const { error } = await supabase.rpc('enviar_reporte', { p_reporte_id: reporteSeleccionado.id });
      if (error) throw error;
      
      toast.success('¡Reporte enviado exitosamente!');
      setShowSendDialog(false);
      setReporteSeleccionado({ ...reporteSeleccionado, estado: 'Enviado' });
      fetchDatos(); 
    } catch (error: any) {
      toast.error('Error al enviar el reporte: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  // ==========================================
  // CONFIGURACIÓN DEL PDF
  // ==========================================
  const snapshotParaPDF = useMemo(() => {
    if (!reporteSeleccionado || !usuarioInfo) return null;
    return {
      ...reporteSeleccionado,
      embajador: { nombre: `${usuarioInfo.nombre} ${usuarioInfo.apellido}`.trim() },
      municipio_nombre: usuarioInfo.municipio,
      actividades: (reporteSeleccionado as any).actividades || []
    };
  }, [reporteSeleccionado, usuarioInfo]);

  const pdfDocument = useMemo<PDFDocumentElement | null>(() => {
    if (!snapshotParaPDF || categoriasDB.length === 0) return null;
    return (
      <ReportePDF
        snapshot={snapshotParaPDF}
        categorias={categoriasDB.filter(c => c.id !== 99)} 
        acciones={accionesDB}
        sectores={sectoresDB}
      />
    ) as PDFDocumentElement;
  }, [snapshotParaPDF, categoriasDB, accionesDB, sectoresDB]);

  const getBadgeEstado = (estado: EstadoReporte) => {
    switch(estado) {
      case 'Aprobado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1.5"/> Aprobado</span>;
      case 'Enviado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1.5"/> Enviado</span>;
      case 'Borrador': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><FileText className="w-3 h-3 mr-1.5"/> Borrador</span>;
      case 'Regresado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><AlertCircle className="w-3 h-3 mr-1.5"/> Regresado</span>;
      case 'Cerrado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700"><Clock className="w-3 h-3 mr-1.5"/> Mes Cerrado</span>;
      case 'Sin empezar': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600"><Clock className="w-3 h-3 mr-1.5"/> Sin empezar</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{estado}</span>;
    }
  };

  if (loadingDatos) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <Loader2 className="animate-spin mb-4 text-[#00689D]" size={40} />
        <p className="font-bold text-lg">Cargando tus reportes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative max-w-7xl mx-auto pb-12">

      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-black flex items-center gap-2">
              <Send className="text-[#00689D]" size={20} /> ¿Enviar reporte definitivo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Estás a punto de enviar tu reporte mensual. Una vez enviado, <strong>no podrás modificar ni agregar</strong> más actividades a este mes a menos que el comité te lo regrese para correcciones.
              ¿Revisaste que todas tus evidencias y beneficiarios estén correctos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isSending} className="bg-gray-100 border-none font-bold hover:bg-gray-200 text-gray-700">Revisar de nuevo</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnviarReporte} disabled={isSending} className="bg-[#00689D] hover:bg-[#00527A] text-white font-bold">
              {isSending ? 'Enviando...' : 'Sí, enviar reporte'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={evidenciaToDelete !== null} onOpenChange={(isOpen) => !isOpen && setEvidenciaToDelete(null)}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-black flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} /> ¿Eliminar esta evidencia?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              ¿Estás seguro de que deseas eliminar esta fotografía permanentemente? Esta acción la borrará de la base de datos y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel onClick={() => setEvidenciaToDelete(null)} className="bg-gray-100 border-none font-bold hover:bg-gray-200 text-gray-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEliminarEvidencia} className="bg-red-600 hover:bg-red-700 text-white font-bold">Sí, eliminar fotografía</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================= MODAL EDICIÓN ACTIVIDAD ================= */}
      {actividadEnEdicion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] mx-1 sm:mx-2 flex flex-col">
            <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
              <h3 className="font-black text-lg sm:text-xl text-gray-800 flex items-center gap-2">
                <Edit2 size={20} className="text-[#00689D]"/> 
                {String(actividadEnEdicion.id || '').startsWith('act-') ? 'Registrar Actividad en Reporte' : esPropietario ? (reporteBloqueado ? 'Detalles de Actividad' : 'Editar Actividad') : 'Detalles de Actividad Compartida'}
              </h3>
              <button onClick={cerrarDrawerFormularioSeguro} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300">
              {reporteBloqueado && (
                <div className="mb-6 bg-gray-100 border border-gray-300 text-gray-700 p-4 rounded-xl flex gap-3 text-sm">
                  <Clock className="w-5 h-5 shrink-0 text-gray-500" />
                  <p><strong>Modo Solo Lectura:</strong> Este reporte ya fue cerrado o enviado. No puedes modificar las actividades registradas.</p>
                </div>
              )}

              {!esPropietario && !reporteBloqueado && (
                <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
                  <Info className="w-5 h-5 shrink-0 text-[#00689D]"/>
                  <p><strong>Actividad Compartida:</strong> Este evento fue creado por otro embajador. Puedes consultar los detalles y <strong>subir tus propias evidencias fotográficas</strong> para que sumen a tu reporte, pero no puedes modificar la información general.</p>
                </div>
              )}

              <form id="form-edicion" onSubmit={guardarEdicionActividad} className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
                  
                  {esPropietario && (
                    <div className="bg-purple-50/50 p-4 border border-purple-100 rounded-xl mb-4">
                      <label className={`flex items-center gap-2 cursor-pointer mb-2 ${disablesEdition ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <input 
                          type="checkbox" name="es_externa" 
                          checked={actividadEnEdicion.es_externa || false} 
                          onChange={handleChangeSimple} disabled={disablesEdition}
                          className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-600 disabled:opacity-50"
                        />
                        <span className="text-sm font-bold text-gray-800">
                          ¿Fue una actividad organizada por un tercero (Escuela, Institución, Empresa)?
                        </span>
                      </label>
                      {actividadEnEdicion.es_externa && (
                        <div className="mt-4 ml-6 p-4 bg-white border border-purple-100 rounded-lg shadow-sm">
                          <label className="block text-xs font-bold text-gray-600 mb-2">Institución Organizadora <span className="text-red-500">*</span></label>
                          <div className="flex gap-4 mb-3">
                            <label className={`flex items-center gap-1 text-sm font-medium ${disablesEdition ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer text-gray-700'}`}>
                              <input type="radio" checked={!isNuevaInstitucion} onChange={() => setIsNuevaInstitucion(false)} disabled={disablesEdition} className="text-purple-600" />
                              Seleccionar existente
                            </label>
                            <label className={`flex items-center gap-1 text-sm font-medium ${disablesEdition ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer text-gray-700'}`}>
                              <input type="radio" checked={isNuevaInstitucion} onChange={() => setIsNuevaInstitucion(true)} disabled={disablesEdition} className="text-purple-600" />
                              Registrar nueva
                            </label>
                          </div>
                          
                          {!isNuevaInstitucion ? (
                            <select 
                              required name="institucion_id" value={actividadEnEdicion.institucion_id || ''} 
                              onChange={handleChangeSimple} disabled={disablesEdition}
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-500"
                            >
                              <option value="">-- Selecciona del catálogo --</option>
                              {institucionesDB.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                            </select>
                          ) : (
                            <input 
                              required type="text" name="nueva_institucion" value={actividadEnEdicion.nueva_institucion || ''} 
                              onChange={handleChangeSimple} disabled={disablesEdition} placeholder="Escribe el nombre de la institución..."
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Nombre de la Actividad <span className="text-red-500">*</span></label>
                      <input disabled={disablesEdition} required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Acción Principal <span className="text-red-500">*</span></label>
                      <select disabled={disablesEdition} required name="tipo_accion_id_real" value={actividadEnEdicion.tipo_accion_id_real || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]">
                        <option value="">-- Selecciona --</option>
                        {accionesDB.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Fecha <span className="text-red-500">*</span></label><input disabled={disablesEdition} required type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('T')[0] || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Inicio <span className="text-red-500">*</span></label><input disabled={disablesEdition} required type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio?.slice(0,5) || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Fin <span className="text-red-500">*</span></label><input disabled={disablesEdition} required type="time" name="hora_fin" value={actividadEnEdicion.hora_fin?.slice(0,5) || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/></div>
                  </div>

                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 mt-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS <span className="text-red-500">*</span> <span className="font-normal">(Máximo 4 - El primero es el Principal)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {odsDB.map(ods => {
                        const isSelected = actividadEnEdicion.ods_seleccionados?.includes(ods.id);
                        const isPrincipal = actividadEnEdicion.ods_seleccionados?.[0] === ods.id;
                        return (
                          <button key={ods.id} type="button" onClick={() => toggleOds(ods.id)} disabled={disablesEdition} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${isSelected ? (isPrincipal ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-blue-100 text-blue-800 border-blue-300') : 'bg-white text-gray-500 hover:border-blue-300'} ${disablesEdition && 'opacity-70 cursor-not-allowed'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? (isPrincipal ? 'bg-white text-[#00689D]' : 'bg-blue-200 text-blue-800') : 'bg-gray-100 text-gray-500'}`}>{ods.numero}</span>
                            {ods.nombre} {isPrincipal && <span className="font-normal opacity-80">(Principal)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Ubicación y Colaboración</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Lugar de la Actividad <span className="text-red-500">*</span></label><input disabled={disablesEdition} required type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Municipio <span className="text-red-500">*</span></label>
                      <select disabled={disablesEdition} required name="municipio" value={actividadEnEdicion.domicilio?.municipio || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]">
                        <option value="">-- Selecciona --</option>
                        {municipiosDB.map(mun => <option key={mun.id} value={mun.id}>{mun.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Colonia {!actividadEnEdicion.es_externa && <span className="text-red-500">*</span>}</label>
                      <input disabled={disablesEdition} required={!actividadEnEdicion.es_externa} type="text" name="colonia" value={actividadEnEdicion.domicilio?.colonia || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Calle {!actividadEnEdicion.es_externa && <span className="text-red-500">*</span>}</label>
                      <input disabled={disablesEdition} required={!actividadEnEdicion.es_externa} type="text" name="calle" value={actividadEnEdicion.domicilio?.calle || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"/>
                    </div>
                  </div>

                  {esPropietario && !actividadEnEdicion.es_externa && String(actividadEnEdicion.id || '').startsWith('act-') && (
                    <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-xl mt-4">
                      <label className={`flex items-center gap-2 cursor-pointer mb-2 ${disablesEdition ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <input type="checkbox" name="es_colaborativa" checked={actividadEnEdicion.es_colaborativa || false} onChange={handleChangeSimple} disabled={disablesEdition} className="w-4 h-4 text-[#00689D] rounded border-gray-300 focus:ring-[#00689D] disabled:opacity-50"/>
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-1"><Users size={16} className="text-orange-600" /> ¿Asististe a esta actividad organizada por otro embajador?</span>
                      </label>
                      {actividadEnEdicion.es_colaborativa && (
                        <div className="mt-3 ml-6">
                          <label className="block text-xs font-bold text-gray-600 mb-1">Selecciona al organizador (Del municipio seleccionado arriba) <span className="text-red-500">*</span></label>
                          <select disabled={disablesEdition} required name="colaborador_id" value={actividadEnEdicion.colaborador_id || ''} onChange={handleChangeSimple} className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-[#00689D] disabled:bg-gray-100 disabled:text-gray-500">
                            <option value="">-- Buscar organizador --</option>
                            {embajadoresLocal.length === 0 ? (
                              <option value="" disabled>No hay más embajadores en este municipio</option>
                            ) : (
                              embajadoresLocal.map(emb => <option key={emb.usuario_id} value={emb.usuario_id}>{emb.usuarios?.nombre} {emb.usuarios?.apellido}</option>)
                            )}
                          </select>
                          {actividadEnEdicion.domicilio?.municipio === '' && <p className="text-[10px] text-orange-600 mt-1">Primero debes seleccionar el municipio en la sección de arriba.</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!actividadEnEdicion.es_externa && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 flex justify-between">Beneficiarios</h4>
                      {categoriasDB.map(cat => {
                        const esFilaTotal = cat.id === 99;
                        let valH = 0, valM = 0;
                        if (esFilaTotal) {
                          categoriasDB.forEach(c => {
                            if (c.id !== 99) {
                              valH += parseInt(actividadEnEdicion.beneficiarios?.[c.id]?.hombres || '0', 10);
                              valM += parseInt(actividadEnEdicion.beneficiarios?.[c.id]?.mujeres || '0', 10);
                            }
                          });
                        } else {
                          valH = parseInt(actividadEnEdicion.beneficiarios?.[cat.id]?.hombres || '0', 10);
                          valM = parseInt(actividadEnEdicion.beneficiarios?.[cat.id]?.mujeres || '0', 10);
                        }
                        const strTotal = (valH + valM) > 0 ? (valH + valM).toString() : '';
                        const strH = valH > 0 ? valH.toString() : '';
                        const strM = valM > 0 ? valM.toString() : '';

                        return (
                          <div key={cat.id} className={`flex gap-2 items-center p-2 rounded-lg border ${esFilaTotal ? 'bg-[#00689D]/5 border-[#00689D]/20 mt-4' : 'bg-gray-50 border-gray-100'}`}>
                            <span className={`w-1/3 text-[10px] leading-tight ${esFilaTotal ? 'font-black text-[#00689D]' : 'font-bold text-gray-600'}`}>{cat.nombre}</span>
                            <input type="number" placeholder="0" value={strTotal} disabled tabIndex={-1} className={`w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold' : 'border-gray-200 bg-gray-100 text-gray-500'}`} />
                            <input type="number" min="0" placeholder="H" value={strH} onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} disabled={esFilaTotal || disablesEdition} className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal || disablesEdition ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`} />
                            <input type="number" min="0" placeholder="M" value={strM} onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} disabled={esFilaTotal || disablesEdition} className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal || disablesEdition ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`} />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 flex justify-between">Sectores de Población</h4>
                      {sectoresDB.map(sec => {
                        const valH = parseInt(actividadEnEdicion.sectores?.[sec.id]?.hombres || '0', 10);
                        const valM = parseInt(actividadEnEdicion.sectores?.[sec.id]?.mujeres || '0', 10);
                        const strTotal = (valH + valM) > 0 ? (valH + valM).toString() : '';
                        const strH = valH > 0 ? valH.toString() : '';
                        const strM = valM > 0 ? valM.toString() : '';

                        return (
                          <div key={sec.id} className="flex gap-2 items-center p-2 rounded-lg border bg-gray-50 border-gray-100">
                            <span className="w-1/3 text-[10px] leading-tight font-bold text-gray-600">{sec.nombre}</span>
                            <input type="number" placeholder="0" value={strTotal} disabled tabIndex={-1} className="w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none bg-gray-100 border-gray-200 text-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                            <input type="number" min="0" placeholder="H" value={strH} onChange={(e) => handleSectorChange(sec.id, 'hombres', e.target.value)} disabled={disablesEdition} className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${disablesEdition ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}/>
                            <input type="number" min="0" placeholder="M" value={strM} onChange={(e) => handleSectorChange(sec.id, 'mujeres', e.target.value)} disabled={disablesEdition} className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${disablesEdition ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}/>
                          </div>
                        );
                      })}
                      <div className="mt-6">
                        <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 mt-6">Rango de Edad Promedio <span className="text-red-500">*</span></h4>
                        <input disabled={disablesEdition} required type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} placeholder="Ej: 15 a 18 años" className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D] mt-2" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción de la Actividad <span className="text-red-500">*</span></h4>
                  <textarea disabled={disablesEdition} required name="descripcion" rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none disabled:bg-gray-100 disabled:text-gray-500" placeholder="Describe brevemente lo que hicieron..." />
                </div>

                {/* EVIDENCIAS */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">
                    {esPropietario ? 'Evidencias Fotográficas' : 'Mis Evidencias Fotográficas'} <span className="text-red-500">*</span> ({(actividadEnEdicion.evidencias?.length || 0)}/{MAX_EVIDENCIAS})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actividadEnEdicion.evidencias?.map((ev) => (
                      <div key={ev.id} className="relative aspect-video rounded-xl border overflow-hidden bg-gray-100 group">
                        {ev.url ? (
                          <img src={ev.url} alt="Evidencia" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><Loader2 className="animate-spin" /></div>
                        )}
                        {!reporteBloqueado && (
                          <button type="button" onClick={() => setEvidenciaToDelete(ev.id)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors" title="Eliminar evidencia">
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}

                    {!reporteBloqueado && (actividadEnEdicion.evidencias?.length || 0) < MAX_EVIDENCIAS && (
                      <label className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#00689D] hover:bg-[#00689D]/5 transition-colors bg-gray-50">
                        <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs font-bold text-gray-500">Subir foto</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleEvidenciaUpload} />
                      </label>
                    )}
                  </div>
                  {(actividadEnEdicion.evidencias?.length || 0) === 0 && (
                    <p className="text-xs text-orange-500 font-bold mt-1">Recuerda subir al menos 1 fotografía antes de enviar tu reporte final.</p>
                  )}
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
              <button type="button" onClick={cerrarDrawerFormularioSeguro} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
                {reporteBloqueado ? 'Cerrar ventana' : 'Cancelar'}
              </button>
              
              {!reporteBloqueado && (
                <button form="form-edicion" type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-md transition-colors">
                  {guardando ? <><Loader2 className="animate-spin" size={18} /> Guardando...</> : <><Save size={20} /> Guardar Avance</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          HEADER PRINCIPAL
      ======================================================== */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Calendar className="text-[#00689D]" /> Mis Reportes Mensuales
          </h1>
          <p className="text-sm text-gray-500 mt-1">Completa y reporta las actividades de cada mes</p>
        </div>
      </div>

      {/* ========================================================
          CONTENIDO PRINCIPAL
      ======================================================== */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 min-h-0 overflow-y-auto lg:overflow-hidden pb-10 lg:pb-0">
        
        {/* LISTA DE REPORTES */}
        <div className="w-full lg:w-1/3 xl:w-1/4 h-[450px] lg:h-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-black text-gray-700">Mis Reportes</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {reportes.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <FileText className="mx-auto mb-3 opacity-30" size={36}/>
                <p className="text-sm font-bold">No tienes reportes disponibles</p>
              </div>
            ) : (
              reportes.map((reporte) => (
                <div key={reporte.id} onClick={() => seleccionarReporte(reporte)} className={`p-4 border-b cursor-pointer transition-all ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                  <p className="text-xs font-black uppercase text-gray-400">Reporte mensual</p>
                  <p className={`text-sm mt-2 ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold text-gray-700'}`}>{reporte.nombre_mes}</p>
                  <div className="mt-2">{getBadgeEstado(reporte.estado)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DETALLE DEL REPORTE */}
        {reporteSeleccionado ? (
          <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
            <div className="p-3 lg:p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
              <div>
                <h2 className="text-lg font-black text-gray-800">Reporte del mes de {reporteSeleccionado.nombre_mes}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-600">Gestiona las actividades de este periodo</p>
                  {reporteBloqueado && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-bold uppercase">Edición bloqueada</span>}
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button onClick={handleIntentarEnviar} disabled={reporteBloqueado || actividades.length === 0} className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${reporteBloqueado || actividades.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#00689D] text-white hover:bg-[#00527A] shadow-md'}`}>
                  <Send size={16}/> {reporteBloqueado ? 'Reporte Enviado' : 'Enviar Reporte'}
                </button>
              </div>
            </div>

            {/* SPLIT VIEW (PDF A LA IZQUIERDA, LISTA A LA DERECHA) */}
            <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-y-auto lg:overflow-hidden relative bg-gray-50">
              
              {/* VISTA PDF PARA COMPUTADORAS */}
              <div className="hidden md:flex flex-1 min-w-0 h-full bg-gray-100 relative items-center justify-center border-b border-gray-200 xl:border-b-0 order-2 xl:order-1 overflow-hidden">
                {snapshotParaPDF ? (
                  <VisorPDFAislado document={pdfDocument} />
                ) : (
                  <div className="text-gray-400 text-sm">Esperando datos...</div>
                )}
              </div>

              {/* VISTA DESCARGAR PARA CELULARES */}
              <div className="md:hidden flex flex-col items-center justify-center w-full min-h-[420px] bg-gray-100 p-6 text-center order-2 xl:order-1 border-b border-gray-200">
                <FileText size={64} className="text-gray-300 mb-4" />
                <h3 className="font-bold text-gray-700 mb-2">Previsualización no disponible en móviles</h3>
                <p className="text-xs text-gray-500 mb-6">Descarga el PDF para verlo en el visor de tu dispositivo.</p>
                {pdfDocument && (
                  <PDFDownloadLink document={pdfDocument} fileName={`Reporte-${reporteSeleccionado.nombre_mes}.pdf`} className="bg-[#00689D] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#00527A] flex items-center gap-2 transition-colors">
                    {({ loading }) => loading ? <><Loader2 size={18} className="animate-spin" /> Procesando...</> : <><FileText size={18} /> Descargar Reporte PDF</>}
                  </PDFDownloadLink>
                )}
              </div>

              {/* PANEL DERECHO: LISTA DE ACTIVIDADES */}
              <div className="w-full xl:w-96 bg-gray-50 border-b xl:border-b-0 xl:border-l border-gray-200 flex flex-col shrink-0 order-1 xl:order-2 relative">
                
                {cargandoDetalle && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
                      <Loader2 size={18} className="animate-spin text-[#00689D]" />
                      <span className="text-sm font-bold text-gray-700">Cargando reporte...</span>
                    </div>
                  </div>
                )}

                <div className="p-4 border-b border-gray-200 bg-white">
                  {!reporteBloqueado ? (
                    <button onClick={crearNuevaActividad} className="w-full py-4 px-4 border-2 border-dashed border-[#00689D]/40 rounded-xl text-[#00689D] bg-[#00689D]/5 hover:bg-[#00689D]/10 font-bold transition-colors flex items-center justify-center gap-2">
                      <Plus size={18} /> Agregar Actividad
                    </button>
                  ) : (
                    <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl flex items-start gap-2 text-gray-600">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <p className="text-xs">Reporte en modo solo lectura. Las actividades ya no pueden modificarse.</p>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {actividades.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-bold text-sm">Sin actividades</p>
                      {!reporteBloqueado && <p className="text-xs mt-1">Añade tu primera actividad para este mes.</p>}
                    </div>
                  ) : (
                    actividades.map((act, idx) => (
                      <div key={act.id} onClick={() => { setIsNuevaInstitucion(false); setActividadEnEdicion(act); }} className={`bg-white rounded-xl border shadow-sm transition-all p-3 hover:shadow-md cursor-pointer hover:border-[#00689D]/50 border-gray-200 ${!act.es_propia ? 'border-l-4 border-l-blue-400' : ''}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] ${!act.es_propia ? 'bg-blue-100 text-blue-700' : 'bg-[#00689D]/10 text-[#00689D]'}`}>
                            {idx + 1}
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm truncate flex-1">{act.nombre || 'Actividad sin nombre'}</h4>
                        </div>
                        <div className="pl-8 flex flex-wrap gap-1">
                          {!act.es_propia && <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase">Compartida</span>}
                          {act.es_externa && <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold uppercase flex items-center gap-1"><Building2 size={10}/> Inst. Externa</span>}
                        </div>
                        <p className="text-[11px] text-gray-500 pl-8 mt-1.5 flex justify-between items-center">
                          <span>{formatearFechaVisual(act.fecha_evento)}</span>
                          <span className={`font-semibold ${(act.evidencias?.length || 0) > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                            {act.evidencias?.length || 0}/{MAX_EVIDENCIAS} fotos
                          </span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center flex-col text-gray-400 min-h-[400px]">
            <FileText size={48} className="mb-4 opacity-20"/>
            <p className="font-bold text-lg">Selecciona un mes</p>
            <p className="text-sm">Elige un reporte para gestionar tus actividades</p>
          </div>
        )}
      </div>
    </div>
  );
}