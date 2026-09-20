import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Send, AlertCircle, Clock, CheckCircle2, 
  Plus, X, Save, UploadCloud, Edit2, Loader2, Info, Globe, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { supabase } from '../../lib/supabase'; 

// --- INTERFACES ESTRICTAS ---
type EstadoReporte = 'Sin empezar' | 'Borrador' | 'Enviado' | 'Regresado' | 'Aprobado';

interface Reporte {
  id: number;
  mes: number;
  anio: number;
  estado: EstadoReporte;
  periodo_inicio: string;
  periodo_fin: string;
  nombre_mes?: string;
}

interface Catalogo {
  id: number;
  nombre: string;
  numero?: number;
  categoria_sostenibilidad?: string;
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
  organizador_externo: string;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const audio = new Audio('/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.warn('Reproducción de audio bloqueada:', err));

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
  const [year, month, day] = fechaStr.split('T')[0].split('-');
  const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return format(fecha, "d 'de' MMMM 'del' yyyy", { locale: es });
};

export default function EmbajaReporte() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [actividades, setActividades] = useState<ActividadFormulario[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [actividadEnEdicion, setActividadEnEdicion] = useState<ActividadFormulario | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [categoriasDB, setCategoriasDB] = useState<Catalogo[]>([]);
  const [accionesDB, setAccionesDB] = useState<Catalogo[]>([]);
  const [odsDB, setOdsDB] = useState<Catalogo[]>([]); 
  const [municipiosDB, setMunicipiosDB] = useState<Catalogo[]>([]);
  const [sectoresDB, setSectoresDB] = useState<Catalogo[]>([]); 
  const [embajadoresLocal, setEmbajadoresLocal] = useState<any[]>([]);

  const [showSendDialog, setShowSendDialog] = useState(false);
  const [evidenciaToDelete, setEvidenciaToDelete] = useState<number | string | null>(null);

  const fetchDatos = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) return;
      setCurrentUserId(userId);

      const [resCat, resAcc, resOds, resMun, resSec, resRep] = await Promise.all([
        supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('ods').select('id, numero, nombre, categoria_sostenibilidad').eq('activo', true).order('numero'),
        supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
        supabase.from('sectores_poblacion').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('reportes').select('id, mes, anio, estado, periodo_inicio, periodo_fin').eq('usuario_id', userId).order('periodo_inicio', { ascending: false })
      ]);

      if (resCat.data) setCategoriasDB([...resCat.data, { id: 99, nombre: 'Total Beneficiarios' }]);
      if (resAcc.data) setAccionesDB(resAcc.data);
      if (resOds.data) setOdsDB(resOds.data);
      if (resMun.data) setMunicipiosDB(resMun.data);
      if (resSec.data) setSectoresDB(resSec.data);

      if (resRep.data) {
        const formateados = resRep.data.map(r => ({
          ...r,
          nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`
        })) as Reporte[];
        setReportes(formateados);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  const seleccionarReporte = async (reporte: Reporte) => {
    setReporteSeleccionado(reporte);
    setActividades([]); 

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
          actividad_beneficiarios(categoria_id, hombres, mujeres, total),
          actividad_sectores(sector_id, hombres, mujeres, total),
          actividad_acciones(tipo_accion_id, cantidad),
          actividad_ods(ods_id, es_principal),
          actividad_asistentes(usuario_id),
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
            actividad_beneficiarios(categoria_id, hombres, mujeres, total),
            actividad_sectores(sector_id, hombres, mujeres, total),
            actividad_acciones(tipo_accion_id, cantidad),
            actividad_ods(ods_id, es_principal),
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
        misEvidencias.forEach((ev: any) => allEvidencePaths.push(ev.url_archivo));
      });

      const signedUrlsMap = new Map<string, string>();
      if (allEvidencePaths.length > 0) {
        const { data: signedData, error: signedErr } = await supabase.storage.from('evidencias').createSignedUrls(allEvidencePaths, 3600);
        if (!signedErr && signedData) {
          signedData.forEach(item => {
            if (!item.error) signedUrlsMap.set(item.path || '', item.signedUrl || '');
          });
        }
      }

      const actividadesCompletas: ActividadFormulario[] = arrayActividades.map((act: any) => {
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
          if (act.actividad_acciones && act.actividad_acciones.length > 0) {
             const accionRel = act.actividad_acciones[0];
             const accionCat = accionesDB.find(a => a.id === accionRel.tipo_accion_id);
             if (accionCat) tipo_actividad_nombre = accionCat.nombre;
          }

          const misEvidencias = act.evidencias?.filter((ev: any) => ev.usuario_id === currentUserId) || [];
          const evidenciasConUrlTemporal = misEvidencias.map((ev: any) => ({
            id: ev.id,
            url: signedUrlsMap.get(ev.url_archivo) || '',
            path_interno: ev.url_archivo
          }));

          const asistentes = act.actividad_asistentes || [];
          const esColab = asistentes.length > 0;
          const colaborador = esColab ? asistentes[0].usuario_id : '';

          return {
            ...act,
            tipo_actividad: tipo_actividad_nombre,
            rango_edad: act.rango_edad_beneficiarios,
            domicilio: { calle: act.calle || '', colonia: act.colonia || '', municipio: act.municipio_id || '' },
            beneficiarios: beneficiariosObj,
            sectores: sectoresObj,
            ods_seleccionados: odsSeleccionados,
            evidencias: evidenciasConUrlTemporal,
            es_colaborativa: esColab, 
            colaborador_id: colaborador
          };
      });

      setActividades(actividadesCompletas);
    } catch (error) {
      toast.error("Error al cargar las actividades del reporte.");
    }
  };

  useEffect(() => {
    const cargarEmbajadores = async () => {
      const municipioId = actividadEnEdicion?.domicilio?.municipio;
      if (actividadEnEdicion?.es_colaborativa && municipioId) {
        const { data } = await supabase
          .from('embajadores')
          .select('usuario_id, usuarios(nombre, apellido)')
          .eq('municipio_id', municipioId);
        
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
    if (!esPropietario) return;
    setActividadEnEdicion(prev => {
      if (!prev) return prev;
      const arr = prev.ods_seleccionados || [];
      if (arr.includes(odsId)) return { ...prev, ods_seleccionados: arr.filter(id => id !== odsId) };
      if (arr.length >= 4) { 
        notifyWithSound('Solo puedes seleccionar un máximo de 4 ODS.', 'warning'); 
        return prev; 
      }
      return { ...prev, ods_seleccionados: [...arr, odsId] };
    });
  };

  const handleBeneficiarioChange = (categoriaId: number, campo: string, value: string) => {
    setActividadEnEdicion(prev => {
      if (!prev) return prev;
      const prevBenef = prev.beneficiarios?.[categoriaId] || {};
      const updatedBenef = { ...prevBenef, [campo]: value };
      return { ...prev, beneficiarios: { ...prev.beneficiarios, [categoriaId]: updatedBenef } };
    });
  };

  const handleSectorChange = (sectorId: number, campo: 'hombres' | 'mujeres', value: string) => {
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

      const maxPermitido = totalCatSum - sumOtrosSectores;
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
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    setActividadEnEdicion(prev => {
      if (!prev) return prev;
      const evidenciasActuales = prev.evidencias || [];
      if (evidenciasActuales.length >= 4) {
        notifyWithSound("Máximo 4 evidencias permitidas por actividad.", "warning");
        return prev;
      }
      return { ...prev, evidencias: [...evidenciasActuales, { id: Date.now(), url, file }] };
    });
  };

  const confirmEliminarEvidencia = async () => {
    if (evidenciaToDelete === null || !actividadEnEdicion) return;
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

  const guardarEdicionActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteSeleccionado || !actividadEnEdicion || !currentUserId) return;

    if (actividadEnEdicion.es_colaborativa && !actividadEnEdicion.colaborador_id) {
      return notifyWithSound('Selecciona el embajador colaborador de la lista.', 'warning');
    }

    setGuardando(true);
    try {
      const esNueva = String(actividadEnEdicion.id || '').startsWith('act-');
      
      let totalBenSum = 0;
      let totalCatH = 0, totalCatM = 0;
      let totalSecH = 0, totalSecM = 0;

      const payloadBeneficiarios: any[] = [];
      const payloadSectores: any[] = [];
      const payloadOds: any[] = [];
      const areasSeleccionadas = new Set<number>();

      if (!actividadEnEdicion.es_externa) {
        Object.entries(actividadEnEdicion.beneficiarios || {}).forEach(([catIdStr, val]) => {
          if (Number(catIdStr) !== 99) {
            const h = parseInt(val.hombres || '0', 10);
            const m = parseInt(val.mujeres || '0', 10);
            totalCatH += h;
            totalCatM += m;
            if (h > 0 || m > 0) {
              totalBenSum += (h + m);
              payloadBeneficiarios.push({ categoria_id: Number(catIdStr), hombres: h, mujeres: m, total: h + m });
            }
          }
        });

        Object.entries(actividadEnEdicion.sectores || {}).forEach(([secIdStr, val]) => {
          const h = parseInt(val.hombres || '0', 10);
          const m = parseInt(val.mujeres || '0', 10);
          totalSecH += h;
          totalSecM += m;
          if (h > 0 || m > 0) {
            payloadSectores.push({ sector_id: Number(secIdStr), hombres: h, mujeres: m, total: h + m });
          }
        });

        if (totalSecH > totalCatH || totalSecM > totalCatM) {
          notifyWithSound("Error: La cantidad en Sectores supera el total de Beneficiarios.", "error");
          setGuardando(false);
          return;
        }
      }

      actividadEnEdicion.ods_seleccionados?.forEach((odsId, idx) => {
        payloadOds.push({ ods_id: odsId, es_principal: idx === 0 });
        
        const odsObj = odsDB.find(o => o.id === odsId);
        if (odsObj?.categoria_sostenibilidad) {
          const cat = odsObj.categoria_sostenibilidad.toLowerCase();
          if (cat.includes('econ')) areasSeleccionadas.add(1);
          if (cat.includes('social') || cat.includes('sociedad')) areasSeleccionadas.add(2);
          if (cat.includes('ambient') || cat.includes('biosfera')) areasSeleccionadas.add(3);
          if (cat.includes('transversal') || cat.includes('alianza')) { areasSeleccionadas.add(1); areasSeleccionadas.add(2); areasSeleccionadas.add(3); }
        }
      });

      const tipoAccionObj = accionesDB.find(a => a.nombre === actividadEnEdicion.tipo_actividad);

      const payloadTransaccion = {
        es_nueva: esNueva,
        creado_por_usuario_id: currentUserId,
        reporte_id: reporteSeleccionado.id,
        es_colaborativa: actividadEnEdicion.es_colaborativa,
        colaborador_id: actividadEnEdicion.colaborador_id || null,
        accion_id: tipoAccionObj ? tipoAccionObj.id : null,
        
        actividad: {
          id: esNueva ? null : actividadEnEdicion.id,
          nombre: actividadEnEdicion.nombre,
          fecha_evento: actividadEnEdicion.fecha_evento,
          hora_inicio: actividadEnEdicion.hora_inicio || null,
          hora_fin: actividadEnEdicion.hora_fin || null,
          lugar: actividadEnEdicion.lugar,
          municipio_id: actividadEnEdicion.domicilio?.municipio || null,
          calle: actividadEnEdicion.domicilio?.calle || null,
          colonia: actividadEnEdicion.domicilio?.colonia || null,
          rango_edad_beneficiarios: actividadEnEdicion.es_externa ? null : actividadEnEdicion.rango_edad,
          descripcion: actividadEnEdicion.descripcion,
          es_externa: actividadEnEdicion.es_externa,
          organizador_externo: actividadEnEdicion.es_externa ? actividadEnEdicion.organizador_externo : null,
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
          const fileExt = ev.file!.name.split('.').pop();
          const fileName = `${savedActId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
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
      seleccionarReporte(reporteSeleccionado); 
      
    } catch (error: any) {
      console.error(error);
      notifyWithSound('Error al guardar: ' + error.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const crearNuevaActividad = () => {
    if (!reporteSeleccionado) return;
    const mesStr = String(reporteSeleccionado.mes).padStart(2, '0');
    setActividadEnEdicion({
      id: `act-${Date.now()}`, 
      es_propia: true, 
      nombre: '', tipo_actividad: '', 
      fecha_evento: `${reporteSeleccionado.anio}-${mesStr}-01`, 
      hora_inicio: '', hora_fin: '',
      ods_seleccionados: [], 
      lugar: '', domicilio: { municipio: '', colonia: '', calle: '' },
      beneficiarios: {}, sectores: {}, rango_edad: '', descripcion: '', evidencias: [],
      es_colaborativa: false, colaborador_id: '',
      es_externa: false, organizador_externo: ''
    });
  };

  const validarReporteParaEnvio = () => {
    if (actividades.length === 0) return { listo: false, msg: 'No tienes actividades registradas en este mes.' };

    for (let act of actividades) {
      if (!act.evidencias || act.evidencias.length === 0) {
        return { listo: false, msg: `La actividad "${act.nombre}" requiere al menos 1 fotografía de evidencia.` };
      }

      if (act.es_propia) {
        // Información básica que siempre es obligatoria
        const faltaInfoBasica = !act.nombre || !act.tipo_actividad || !act.fecha_evento || !act.hora_inicio || !act.hora_fin || !act.lugar || !act.domicilio?.municipio || !act.descripcion;
        
        // Colonia y calle ya NO son obligatorios si es_externa es verdadero
        const faltaDomicilio = !act.es_externa && (!act.domicilio?.colonia || !act.domicilio?.calle);

        if (faltaInfoBasica || faltaDomicilio) {
          return { listo: false, msg: `La actividad "${act.nombre}" tiene campos obligatorios de información vacíos.` };
        }

        if (!act.ods_seleccionados || act.ods_seleccionados.length === 0) {
          return { listo: false, msg: `La actividad "${act.nombre}" debe tener al menos 1 ODS seleccionado.` };
        }

        if (act.es_externa) {
          if (!act.organizador_externo || act.organizador_externo.trim() === '') {
            return { listo: false, msg: `La actividad externa "${act.nombre}" requiere el nombre de la institución que organizó.` };
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
      const { error } = await supabase.rpc('enviar_reporte', { 
        p_reporte_id: reporteSeleccionado.id 
      });

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

  const getBadgeEstado = (estado: EstadoReporte) => {
    switch(estado) {
      case 'Aprobado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1.5"/> Aprobado</span>;
      case 'Enviado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1.5"/> Enviado</span>;
      case 'Borrador': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><FileText className="w-3 h-3 mr-1.5"/> Borrador</span>;
      case 'Regresado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><AlertCircle className="w-3 h-3 mr-1.5"/> Regresado</span>;
      case 'Sin empezar': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600"><Clock className="w-3 h-3 mr-1.5"/> Sin empezar</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{estado}</span>;
    }
  };

  const esPropietario = actividadEnEdicion?.es_propia !== false;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">

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
            <AlertDialogAction 
              onClick={handleEnviarReporte}
              disabled={isSending}
              className="bg-[#00689D] hover:bg-[#00527A] text-white font-bold"
            >
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
            <AlertDialogAction 
              onClick={confirmEliminarEvidencia}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Sí, eliminar fotografía
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {actividadEnEdicion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
              <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                <Edit2 size={20} className="text-[#00689D]"/> 
                {String(actividadEnEdicion.id || '').startsWith('act-') 
                  ? 'Registrar Actividad en Reporte' 
                  : (esPropietario ? 'Editar Actividad' : 'Detalles de Actividad Compartida')}
              </h3>
              <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
              
              {!esPropietario && (
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
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input 
                          type="checkbox" 
                          name="es_externa" 
                          checked={actividadEnEdicion.es_externa || false} 
                          onChange={handleChangeSimple} 
                          className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-600"
                        />
                        <span className="text-sm font-bold text-gray-800">
                          ¿Fue una actividad organizada por un tercero (Escuela, Institución, Empresa)?
                        </span>
                      </label>
                      {actividadEnEdicion.es_externa && (
                        <div className="mt-3 ml-6">
                          <label className="block text-xs font-bold text-gray-600 mb-1">Nombre del Organizador o Institución <span className="text-red-500">*</span></label>
                          <input 
                            required
                            type="text" 
                            name="organizador_externo" 
                            value={actividadEnEdicion.organizador_externo || ''} 
                            onChange={handleChangeSimple} 
                            placeholder="Ej. Instituto Sinaloense de la Juventud, Universidad Autónoma..."
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Nombre de la Actividad <span className="text-red-500">*</span></label>
                      <input disabled={!esPropietario} required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Acción Principal <span className="text-red-500">*</span></label>
                      <select disabled={!esPropietario} required name="tipo_actividad" value={actividadEnEdicion.tipo_actividad || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]">
                        <option value="">-- Selecciona --</option>
                        {accionesDB.map(tipo => <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Fecha <span className="text-red-500">*</span></label>
                      <input disabled={!esPropietario} required type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('T')[0] || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Inicio <span className="text-red-500">*</span></label>
                      <input disabled={!esPropietario} required type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Fin <span className="text-red-500">*</span></label>
                      <input disabled={!esPropietario} required type="time" name="hora_fin" value={actividadEnEdicion.hora_fin || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                  </div>

                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 mt-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS <span className="text-red-500">*</span> (Máximo 4 - El primero es el Principal)</label>
                    <div className="flex flex-wrap gap-2">
                      {odsDB.map(ods => {
                        const isSelected = actividadEnEdicion.ods_seleccionados?.includes(ods.id);
                        const isPrincipal = actividadEnEdicion.ods_seleccionados?.[0] === ods.id;
                        return (
                          <button 
                            key={ods.id} 
                            type="button" 
                            onClick={() => toggleOds(ods.id)} 
                            disabled={!esPropietario}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all 
                              ${isSelected ? (isPrincipal ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-blue-100 text-blue-800 border-blue-300') : 'bg-white text-gray-500 hover:border-blue-300'}
                              ${!esPropietario && 'opacity-70 cursor-not-allowed'}`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? (isPrincipal ? 'bg-white text-[#00689D]' : 'bg-blue-200 text-blue-800') : 'bg-gray-100 text-gray-500'}`}>
                              {ods.numero}
                            </span>
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
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de la Actividad <span className="text-red-500">*</span></label>
                      <input disabled={!esPropietario} required type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Municipio <span className="text-red-500">*</span></label>
                      <select 
                        disabled={!esPropietario} required
                        name="municipio" 
                        value={actividadEnEdicion.domicilio?.municipio || ''} 
                        onChange={handleDomicilioChange} 
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"
                      >
                        <option value="">-- Selecciona --</option>
                        {municipiosDB.map(mun => (
                          <option key={mun.id} value={mun.id}>{mun.nombre}</option>
                        ))}
                      </select>
                    </div>
                    {/* AQUI ESTÁN LOS INPUTS DE COLONIA Y CALLE CON SUS ASTERISCOS DINÁMICOS */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Colonia {!actividadEnEdicion.es_externa && <span className="text-red-500">*</span>}</label>
                      <input 
                        disabled={!esPropietario} 
                        required={!actividadEnEdicion.es_externa} 
                        type="text" 
                        name="colonia" 
                        value={actividadEnEdicion.domicilio?.colonia || ''} 
                        onChange={handleDomicilioChange} 
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Calle {!actividadEnEdicion.es_externa && <span className="text-red-500">*</span>}</label>
                      <input 
                        disabled={!esPropietario} 
                        required={!actividadEnEdicion.es_externa} 
                        type="text" 
                        name="calle" 
                        value={actividadEnEdicion.domicilio?.calle || ''} 
                        onChange={handleDomicilioChange} 
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"
                      />
                    </div>
                  </div>

                  {esPropietario && !actividadEnEdicion.es_externa && String(actividadEnEdicion.id || '').startsWith('act-') && (
                    <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-xl mt-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input 
                          type="checkbox" 
                          name="es_colaborativa" 
                          checked={actividadEnEdicion.es_colaborativa || false} 
                          onChange={handleChangeSimple} 
                          className="w-4 h-4 text-[#00689D] rounded border-gray-300 focus:ring-[#00689D]"
                        />
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
                          <Users size={16} className="text-orange-600" /> ¿Asististe a esta actividad organizada por otro embajador?
                        </span>
                      </label>
                      {actividadEnEdicion.es_colaborativa && (
                        <div className="mt-3 ml-6">
                          <label className="block text-xs font-bold text-gray-600 mb-1">Selecciona al organizador (Del municipio seleccionado arriba) <span className="text-red-500">*</span></label>
                          <select 
                            required
                            name="colaborador_id" 
                            value={actividadEnEdicion.colaborador_id || ''} 
                            onChange={handleChangeSimple} 
                            className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-[#00689D]"
                          >
                            <option value="">-- Buscar organizador --</option>
                            {embajadoresLocal.length === 0 ? (
                              <option value="" disabled>No hay más embajadores en este municipio</option>
                            ) : (
                              embajadoresLocal.map(emb => (
                                <option key={emb.usuario_id} value={emb.usuario_id}>
                                  {emb.usuarios?.nombre} {emb.usuarios?.apellido}
                                </option>
                              ))
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
                      <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 flex justify-between">
                        Beneficiarios
                      </h4>
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
                            <span className={`w-1/3 text-[10px] leading-tight ${esFilaTotal ? 'font-black text-[#00689D]' : 'font-bold text-gray-600'}`}>
                              {cat.nombre}
                            </span>
                            
                            <input 
                              type="number" placeholder="0" value={strTotal} disabled tabIndex={-1}
                              className={`w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold' : 'border-gray-200 bg-gray-100 text-gray-500'}`}
                            />
                            
                            <input 
                              type="number" min="0" placeholder="H" value={strH} 
                              onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} 
                              disabled={esFilaTotal || !esPropietario}
                              className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal || !esPropietario ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
                            />
                            
                            <input 
                              type="number" min="0" placeholder="M" value={strM} 
                              onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} 
                              disabled={esFilaTotal || !esPropietario}
                              className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal || !esPropietario ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 flex justify-between">
                        Sectores de Población
                      </h4>
                      {sectoresDB.map(sec => {
                        const valH = parseInt(actividadEnEdicion.sectores?.[sec.id]?.hombres || '0', 10);
                        const valM = parseInt(actividadEnEdicion.sectores?.[sec.id]?.mujeres || '0', 10);
                        
                        const strTotal = (valH + valM) > 0 ? (valH + valM).toString() : '';
                        const strH = valH > 0 ? valH.toString() : '';
                        const strM = valM > 0 ? valM.toString() : '';

                        return (
                          <div key={sec.id} className="flex gap-2 items-center p-2 rounded-lg border bg-gray-50 border-gray-100">
                            <span className="w-1/3 text-[10px] leading-tight font-bold text-gray-600">
                              {sec.nombre}
                            </span>
                            
                            <input 
                              type="number" placeholder="0" value={strTotal} disabled tabIndex={-1}
                              className="w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none bg-gray-100 border-gray-200 text-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            
                            <input 
                              type="number" min="0" placeholder="H" value={strH} 
                              onChange={(e) => handleSectorChange(sec.id, 'hombres', e.target.value)} 
                              disabled={!esPropietario}
                              className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${!esPropietario ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
                            />
                            
                            <input 
                              type="number" min="0" placeholder="M" value={strM} 
                              onChange={(e) => handleSectorChange(sec.id, 'mujeres', e.target.value)} 
                              disabled={!esPropietario}
                              className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${!esPropietario ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
                            />
                          </div>
                        );
                      })}
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 mt-6">Rango de Edad Promedio <span className="text-red-500">*</span></h4>
                        <input disabled={!esPropietario} required type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} placeholder="Ej: 15 a 18 años" className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D] mt-2"/>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción de la Actividad <span className="text-red-500">*</span></h4>
                  <textarea disabled={!esPropietario} required name="descripcion" rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none disabled:bg-gray-100 disabled:text-gray-500" placeholder="Describe brevemente lo que hicieron..."/>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">
                    {esPropietario ? 'Evidencias Fotográficas' : 'Mis Evidencias Fotográficas'} <span className="text-red-500">*</span> ({actividadEnEdicion.evidencias?.length || 0} / 4)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actividadEnEdicion.evidencias?.map((ev: any) => (
                      <div key={ev.id} className="relative aspect-video rounded-xl border overflow-hidden bg-gray-100 group">
                        <img src={ev.url} alt="Evidencia" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setEvidenciaToDelete(ev.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                          title="Eliminar evidencia"
                        >
                          <X size={18}/>
                        </button>
                      </div>
                    ))}

                    {(actividadEnEdicion.evidencias?.length || 0) < 4 && (
                      <label className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#00689D] hover:bg-[#00689D]/5 transition-colors bg-gray-50">
                        <UploadCloud className="w-6 h-6 text-gray-400 mb-1"/>
                        <span className="text-xs font-bold text-gray-500">Subir foto</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleEvidenciaUpload} />
                      </label>
                    )}
                  </div>
                  
                  {(actividadEnEdicion.evidencias?.length || 0) === 0 && (
                    <p className="text-xs text-orange-500 font-bold mt-1">
                      Recuerda subir al menos 1 fotografía antes de enviar tu reporte final.
                    </p>
                  )}
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setActividadEnEdicion(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              
              <button form="form-edicion" type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-md transition-colors">
                {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar Avance</>}
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Calendar className="text-[#00689D]"/> Mis Reportes Mensuales</h1>
          <p className="text-sm text-gray-500 mt-1">Completa y reporta las actividades de cada mes</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-black text-gray-700">Mis Reportes</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {reportes.map(reporte => (
              <div 
                key={reporte.id} 
                onClick={() => seleccionarReporte(reporte)} 
                className={`p-4 border-b cursor-pointer transition-all ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50'}`}
              >
                <p className="text-xs font-black uppercase text-gray-400">{reporte.nombre_mes}</p>
                <p className={`text-sm mt-2 ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold text-gray-700'}`}>{reporte.nombre_mes}</p>
                <div className="mt-2">{getBadgeEstado(reporte.estado)}</div>
              </div>
            ))}
          </div>
        </div>

        {reporteSeleccionado ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-black text-gray-800">Reporte del mes de {reporteSeleccionado.nombre_mes}</h2>
                <p className="text-xs text-gray-600 mt-1">Gestiona las actividades de este periodo</p>
              </div>
              
              <button 
                onClick={handleIntentarEnviar}
                disabled={reporteSeleccionado.estado === 'Enviado' || actividades.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${reporteSeleccionado.estado === 'Enviado' || actividades.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#00689D] text-white hover:bg-[#00527A] shadow-md'}`}
              >
                <Send size={16}/> Enviar Reporte
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {reporteSeleccionado.estado !== 'Enviado' && (
                <button 
                  onClick={crearNuevaActividad}
                  className="w-full mb-6 py-6 px-4 border-2 border-dashed border-[#00689D]/40 rounded-xl text-[#00689D] bg-[#00689D]/5 hover:bg-[#00689D]/10 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20}/> Agregar Nueva Actividad
                </button>
              )}

              <div className="space-y-4">
                {actividades.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30"/>
                    <p className="font-bold text-lg">No hay actividades registradas</p>
                    <p className="text-sm">Agrega actividades para este mes para poder enviar tu reporte</p>
                  </div>
                ) : (
                  actividades.map((act, idx) => (
                    <div 
                      key={act.id} 
                      onClick={() => {
                        if (reporteSeleccionado.estado !== 'Enviado') {
                          setActividadEnEdicion(act);
                        }
                      }}
                      className={`bg-white rounded-xl border shadow-sm transition-all flex items-center p-4 
                        ${reporteSeleccionado.estado !== 'Enviado' ? 'hover:shadow-md cursor-pointer hover:border-[#00689D]/50 border-gray-200' : 'opacity-80 border-gray-200'}
                        ${!act.es_propia ? 'border-l-4 border-l-blue-400' : ''}
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${!act.es_propia ? 'bg-blue-100 text-blue-700' : 'bg-[#00689D]/10 text-[#00689D]'}`}>
                            {idx + 1}
                          </div>
                          <h4 className="font-bold text-gray-900 truncate">
                            {act.nombre} 
                            {!act.es_propia && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Compartida</span>}
                            {act.es_externa && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Externa</span>}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 ml-11 flex flex-wrap items-center gap-2 mt-1">
                          <span className="capitalize">{formatearFechaVisual(act.fecha_evento)}</span>
                          <span>•</span>
                          <span>{act.tipo_actividad || 'Actividad Genérica'}</span>
                          <span>•</span>
                          <span className={`font-semibold ${(act.evidencias?.length || 0) > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                            {act.evidencias?.length || 0}/4 evidencias subidas
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20"/>
              <p className="font-bold text-lg">Selecciona un mes</p>
              <p className="text-sm">Elige un reporte para gestionar sus actividades</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}