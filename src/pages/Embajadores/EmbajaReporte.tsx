import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Send, AlertCircle, Clock, CheckCircle2, 
  Plus, X, Save, UploadCloud, Edit2, Loader2, Info, Globe, Users
} from 'lucide-react';
import { toast } from 'sonner';

// Importamos el AlertDialog de shadcn
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

type EstadoReporte = 'Sin empezar' | 'Borrador' | 'Enviado' | 'Regresado';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const audio = new Audio('/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.log('Audio bloqueado por el navegador:', err));

  const options = { position: 'bottom-right' as const };

  switch (type) {
    case 'success': toast.success(message, options); break;
    case 'error': toast.error(message, options); break;
    case 'warning': toast.warning(message, options); break;
    default: toast.info(message, options);
  }
};

export default function EmbajaReporte() {
  // ESTADO DE REPORTES
  const [reportes, setReportes] = useState<any[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
  const [actividades, setActividades] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // ESTADO DE EDICIÓN
  const [actividadEnEdicion, setActividadEnEdicion] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // CATÁLOGOS DE BD
  const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
  const [accionesDB, setAccionesDB] = useState<any[]>([]);
  const [odsDB, setOdsDB] = useState<any[]>([]); 
  const [municipiosDB, setMunicipiosDB] = useState<any[]>([]);
  const [embajadoresLocal, setEmbajadoresLocal] = useState<any[]>([]);

  // MODALES
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [evidenciaToDelete, setEvidenciaToDelete] = useState<number | null>(null); // NUEVO ESTADO PARA EL MODAL DE EVIDENCIA

  // ==========================================
  // FETCH INICIAL
  // ==========================================
  const fetchDatos = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) return;
      setCurrentUserId(userId);

      const [resCat, resAcc, resOds, resMun, resRep] = await Promise.all([
        supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('ods').select('id, numero, nombre, categoria_sostenibilidad').eq('activo', true).order('numero'),
        supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
        supabase.from('reportes').select('id, mes, anio, estado, periodo_inicio, periodo_fin').eq('usuario_id', userId).order('periodo_inicio', { ascending: false })
      ]);

      if (resCat.data) setCategoriasDB([...resCat.data, { id: 99, nombre: 'Total Beneficiarios' }]);
      if (resAcc.data) setAccionesDB(resAcc.data);
      if (resOds.data) setOdsDB(resOds.data);
      if (resMun.data) setMunicipiosDB(resMun.data);

      if (resRep.data) {
        const formateados = resRep.data.map(r => ({
          ...r,
          nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`
        }));
        setReportes(formateados);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  // ==========================================
  // CARGAR ACTIVIDADES DEL REPORTE
  // ==========================================
  const seleccionarReporte = async (reporte: any) => {
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
          actividad_acciones(tipo_accion_id, cantidad),
          actividad_sostenibilidad(area_id),
          actividad_ods(ods_id, es_principal, ods(numero, nombre)),
          evidencias(id, url_archivo)
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
            actividad_beneficiarios(categoria_id, hombres, mujeres, total),
            actividad_acciones(tipo_accion_id, cantidad),
            actividad_sostenibilidad(area_id),
            actividad_ods(ods_id, es_principal, ods(numero, nombre)),
            evidencias(id, url_archivo)
          )
        `)
        .eq('usuario_id', currentUserId);

      if (errUnidas) throw errUnidas;

      const actividadesMap = new Map();

      // Procesar creadas (DESCARTANDO CANCELADAS)
      actividadesCreadas?.forEach((act: any) => {
        if (act.estado !== 'Cancelada') {
          actividadesMap.set(act.id, { ...act, es_propia: true });
        }
      });

      // Procesar unidas (DESCARTANDO CANCELADAS Y FUERA DE FECHA)
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

      // Formatear la data combinada para el formulario y FIRMAR URLs
      const arrayActividades = Array.from(actividadesMap.values())
        .sort((a, b) => new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime());

      const actividadesCompletas = await Promise.all(arrayActividades.map(async (act: any) => {
          let beneficiariosObj: any = {};
          act.actividad_beneficiarios?.forEach((b: any) => {
            beneficiariosObj[b.categoria_id] = { hombres: b.hombres?.toString(), mujeres: b.mujeres?.toString(), total: b.total?.toString() };
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

          let evidenciasConUrlTemporal = [];
          if (act.evidencias && act.evidencias.length > 0) {
            evidenciasConUrlTemporal = await Promise.all(act.evidencias.map(async (ev: any) => {
              const { data } = await supabase.storage.from('evidencias').createSignedUrl(ev.url_archivo, 3600);
              return { 
                id: ev.id, 
                url: data?.signedUrl || '', 
                path_interno: ev.url_archivo 
              };
            }));
          }

          return {
            ...act,
            tipo_actividad: tipo_actividad_nombre,
            rango_edad: act.rango_edad_beneficiarios,
            domicilio: { calle: act.calle || '', colonia: act.colonia || '', municipio: act.municipio_id || '' },
            beneficiarios: beneficiariosObj,
            ods_seleccionados: odsSeleccionados,
            evidencias: evidenciasConUrlTemporal,
            es_colaborativa: false, 
            colaborador_id: ''
          };
      }));

      setActividades(actividadesCompletas);
    } catch (error) {
      toast.error("Error al cargar las actividades del reporte.");
    }
  };

  // ==========================================
  // CARGAR EMBAJADORES SI ES COLABORATIVA
  // ==========================================
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

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleChangeSimple = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setActividadEnEdicion({ ...actividadEnEdicion, [name]: checked });
    } else {
      setActividadEnEdicion({ ...actividadEnEdicion, [name]: value });
    }
  };

  const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActividadEnEdicion((prev: any) => ({
      ...prev, 
      domicilio: { ...prev.domicilio, [name]: name === 'municipio' ? Number(value) : value },
      ...(name === 'municipio' ? { colaborador_id: '' } : {})
    }));
  };

  const toggleOds = (odsId: number) => {
    if (!esPropietario) return;
    setActividadEnEdicion((prev: any) => {
      const arr = prev.ods_seleccionados || [];
      if (arr.includes(odsId)) return { ...prev, ods_seleccionados: arr.filter((id: number) => id !== odsId) };
      if (arr.length >= 4) { 
        notifyWithSound('Solo puedes seleccionar un máximo de 4 ODS.', 'warning'); 
        return prev; 
      }
      return { ...prev, ods_seleccionados: [...arr, odsId] };
    });
  };

  const handleBeneficiarioChange = (categoriaId: number, campo: string, value: string) => {
    setActividadEnEdicion((prev: any) => {
      const prevBenef = prev.beneficiarios?.[categoriaId] || {};
      const updatedBenef = { ...prevBenef, [campo]: value };
      return { ...prev, beneficiarios: { ...prev.beneficiarios, [categoriaId]: updatedBenef } };
    });
  };

  const handleEvidenciaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    setActividadEnEdicion((prev: any) => {
      const evidenciasActuales = prev.evidencias || [];
      if (evidenciasActuales.length >= 4) {
        notifyWithSound("Máximo 4 evidencias permitidas por actividad.", "warning");
        return prev;
      }
      return { ...prev, evidencias: [...evidenciasActuales, { id: Date.now(), url, file }] };
    });
  };

  // NUEVA LÓGICA DE ELIMINAR EVIDENCIA (CON MODAL)
  const confirmEliminarEvidencia = async () => {
    if (evidenciaToDelete === null) return;
    const idEliminar = evidenciaToDelete;
    const evEliminar = actividadEnEdicion.evidencias.find((ev: any) => ev.id === idEliminar);
    
    // Si no tiene "file", significa que viene de la BD (ya estaba guardada)
    if (evEliminar && !evEliminar.file) {
      const toastId = toast.loading('Eliminando evidencia...');
      try {
        // 1. Borrar archivo físico del bucket usando el path_interno
        if (evEliminar.path_interno) {
          const { error: storageError } = await supabase.storage.from('evidencias').remove([evEliminar.path_interno]);
          if (storageError) console.error("No se pudo borrar del storage:", storageError);
        }

        // 2. Borrar de la base de datos SQL
        const { error: dbError } = await supabase.from('evidencias').delete().eq('id', idEliminar);
        if (dbError) throw dbError;
        
        toast.success('Evidencia eliminada', { id: toastId });
      } catch (error: any) {
        setEvidenciaToDelete(null); // Cerramos el modal en caso de error
        return toast.error('Error al eliminar: ' + error.message, { id: toastId });
      }
    }

    // Quitarla de la pantalla inmediatamente (haya sido de la BD o local)
    setActividadEnEdicion((prev: any) => ({
      ...prev, evidencias: prev.evidencias.filter((ev: any) => ev.id !== idEliminar)
    }));
    
    setEvidenciaToDelete(null); // Cerramos el modal
  };

  // ==========================================
  // GUARDAR EDICIÓN
  // ==========================================
  const guardarEdicionActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteSeleccionado || !actividadEnEdicion || !currentUserId) return;

    let totalBeneficiariosSum = 0;
    if (actividadEnEdicion.beneficiarios) {
      Object.entries(actividadEnEdicion.beneficiarios).forEach(([catIdStr, val]: [string, any]) => {
        if (Number(catIdStr) !== 99) {
          totalBeneficiariosSum += parseInt(val.hombres || '0', 10) + parseInt(val.mujeres || '0', 10);
        }
      });
    }

    if (totalBeneficiariosSum === 0) {
      return notifyWithSound('Debes registrar al menos una persona beneficiada en los recuadros.', 'warning');
    }

    if (actividadEnEdicion.es_colaborativa && !actividadEnEdicion.colaborador_id) {
      return notifyWithSound('Selecciona el embajador colaborador de la lista.', 'warning');
    }

    setGuardando(true);
    try {
      let actId = actividadEnEdicion.id;
      const esNueva = String(actId).startsWith('act-');

      if (actividadEnEdicion.es_propia) {
        
        const actividadData = {
          nombre: actividadEnEdicion.nombre,
          fecha_evento: actividadEnEdicion.fecha_evento,
          hora_inicio: actividadEnEdicion.hora_inicio || null,
          hora_fin: actividadEnEdicion.hora_fin || null,
          lugar: actividadEnEdicion.lugar,
          municipio_id: actividadEnEdicion.domicilio?.municipio || null,
          calle: actividadEnEdicion.domicilio?.calle,
          colonia: actividadEnEdicion.domicilio?.colonia,
          rango_edad_beneficiarios: actividadEnEdicion.rango_edad,
          descripcion: actividadEnEdicion.descripcion,
          creado_por_usuario_id: currentUserId,
          estado: 'Programada', 
          fecha_actualizacion: new Date().toISOString()
        };

        if (esNueva) {
          const { data: insertada, error: errIns } = await supabase.from('actividades').insert({ 
            ...actividadData, 
            fecha_creacion: new Date().toISOString(), 
            beneficiarios_directos: totalBeneficiariosSum, 
            beneficiarios_indirectos: 0 
          }).select('id').single();
          
          if (errIns) throw errIns;
          actId = insertada.id;

          await supabase.from('actividad_asistentes').insert([{ actividad_id: actId, usuario_id: currentUserId }]);
          
          if (actividadEnEdicion.es_colaborativa && actividadEnEdicion.colaborador_id) {
             await supabase.from('actividad_asistentes').insert([{ actividad_id: actId, usuario_id: actividadEnEdicion.colaborador_id }]);
          }

        } else {
          const { error: errAct } = await supabase.from('actividades').update({
            ...actividadData,
            beneficiarios_directos: totalBeneficiariosSum
          }).eq('id', actId);
          if (errAct) throw errAct;

          if (actividadEnEdicion.es_colaborativa && actividadEnEdicion.colaborador_id) {
            await supabase.from('actividad_asistentes').upsert(
              { actividad_id: actId, usuario_id: actividadEnEdicion.colaborador_id }, 
              { onConflict: 'actividad_id,usuario_id' }
            );
          }
        }

        // Beneficiarios
        if (actividadEnEdicion.beneficiarios) {
          for (const [catIdStr, valores] of Object.entries(actividadEnEdicion.beneficiarios)) {
            const catId = Number(catIdStr);
            if (catId === 99) continue; 
            
            const val: any = valores;
            await supabase.from('actividad_beneficiarios').upsert({
              actividad_id: actId, categoria_id: catId,
              hombres: parseInt(val.hombres || '0', 10), 
              mujeres: parseInt(val.mujeres || '0', 10), 
              total: parseInt(val.hombres || '0', 10) + parseInt(val.mujeres || '0', 10),
              actualizado_en: new Date().toISOString(), 
              creado_en: new Date().toISOString()
            }, { onConflict: 'actividad_id,categoria_id' }); 
          }
        }

        // Acción
        await supabase.from('actividad_acciones').delete().eq('actividad_id', actId);
        if (actividadEnEdicion.tipo_actividad) {
          const tipoObj = accionesDB.find(a => a.nombre === actividadEnEdicion.tipo_actividad);
          if (tipoObj) {
            await supabase.from('actividad_acciones').insert({
              actividad_id: actId, tipo_accion_id: tipoObj.id, cantidad: 1, creado_en: new Date().toISOString()
            });
          }
        }

        // Sostenibilidad & ODS
        const areasSeleccionadas = new Set<number>();
        actividadEnEdicion.ods_seleccionados?.forEach((odsId: number) => {
          const odsObj = odsDB.find(o => o.id === odsId);
          if (!odsObj || !odsObj.categoria_sostenibilidad) return;
          const cat = odsObj.categoria_sostenibilidad.toLowerCase();
          if (cat.includes('econ')) areasSeleccionadas.add(1);
          if (cat.includes('social') || cat.includes('sociedad')) areasSeleccionadas.add(2);
          if (cat.includes('ambient') || cat.includes('biosfera')) areasSeleccionadas.add(3);
          if (cat.includes('transversal') || cat.includes('alianza')) {
            areasSeleccionadas.add(1); areasSeleccionadas.add(2); areasSeleccionadas.add(3);
          }
        });

        await supabase.from('actividad_sostenibilidad').delete().eq('actividad_id', actId);
        for (const areaId of Array.from(areasSeleccionadas)) {
          await supabase.from('actividad_sostenibilidad').insert({ actividad_id: actId, area_id: areaId, creado_en: new Date().toISOString() });
        }

        await supabase.from('actividad_ods').delete().eq('actividad_id', actId);
        if (actividadEnEdicion.ods_seleccionados && actividadEnEdicion.ods_seleccionados.length > 0) {
          const odsPayload = actividadEnEdicion.ods_seleccionados.map((odsId: number, idx: number) => ({
            actividad_id: actId, ods_id: odsId, es_principal: idx === 0 
          }));
          await supabase.from('actividad_ods').insert(odsPayload);
        }
      }

      await supabase.from('reporte_act').upsert({
        reporte_id: reporteSeleccionado.id, actividad_id: actId,
        estado_validacion: 'Pendiente', fecha_agregado: new Date().toISOString()
      }, { onConflict: 'reporte_id,actividad_id' });

      // LÓGICA DE EVIDENCIAS (STORAGE PRIVADO + BD)
      if (actividadEnEdicion.evidencias && actividadEnEdicion.evidencias.length > 0) {
        for (const ev of actividadEnEdicion.evidencias) {
          
          if (ev.file) {
            const fileExt = ev.file.name.split('.').pop();
            const fileName = `${actId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${currentUserId}/${fileName}`; 

            const { error: uploadError } = await supabase.storage
              .from('evidencias') 
              .upload(filePath, ev.file);

            if (uploadError) {
              console.error("Error subiendo a Storage:", uploadError);
              throw new Error("No se pudo subir una de las imágenes al Storage.");
            }

            const { error: dbError } = await supabase.from('evidencias').insert({
              actividad_id: actId,
              url_archivo: filePath,
              usuario_id: currentUserId
            });

            if (dbError) {
              console.error("Error guardando registro en SQL evidencias:", dbError);
              throw new Error(`Error en la tabla evidencias: ${dbError.message}`);
            }
          }
        }
      }
      notifyWithSound('Actividad anexada al reporte exitosamente', 'success');
      setActividadEnEdicion(null);
      seleccionarReporte(reporteSeleccionado);
      
    } catch (error: any) {
      console.error(error);
      notifyWithSound('Error al guardar la actividad: ' + error.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const crearNuevaActividad = () => {
    const mesStr = String(reporteSeleccionado.mes).padStart(2, '0');
    setActividadEnEdicion({
      id: `act-${Date.now()}`, 
      es_propia: true, 
      nombre: '', tipo_actividad: '', 
      fecha_evento: `${reporteSeleccionado.anio}-${mesStr}-01`, 
      hora_inicio: '', hora_fin: '',
      ods_seleccionados: [], 
      lugar: '', domicilio: { municipio: '', colonia: '', calle: '' },
      beneficiarios: {}, rango_edad: '', descripcion: '', evidencias: [],
      es_colaborativa: false, colaborador_id: ''
    });
  };

  // ==========================================
  // ENVIAR REPORTE MENSUAL
  // ==========================================
  const handleEnviarReporte = async () => {
    if (!reporteSeleccionado) return;
    setIsSending(true);
    try {
      const { error } = await supabase.from('reportes').update({ estado: 'Enviado' }).eq('id', reporteSeleccionado.id);
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
      case 'Enviado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1.5"/> Enviado</span>;
      case 'Borrador': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><FileText className="w-3 h-3 mr-1.5"/> Borrador</span>;
      case 'Regresado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1.5"/> Regresado</span>;
      case 'Sin empezar': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600"><Clock className="w-3 h-3 mr-1.5"/> Sin empezar</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{estado}</span>;
    }
  };

  const esPropietario = actividadEnEdicion?.es_propia !== false;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">

      {/* ================= MODAL ENVIAR REPORTE ================= */}
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

      {/* ================= MODAL ELIMINAR EVIDENCIA ================= */}
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

      {/* ================= MODAL DE EDICIÓN / REGISTRO ================= */}
      {actividadEnEdicion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            
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
                
                {/* DATOS GENERALES */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
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

                {/* UBICACIÓN Y COLABORACIÓN */}
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
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Colonia <span className="text-red-500">*</span></label>
                      <input disabled={!esPropietario} required type="text" name="colonia" value={actividadEnEdicion.domicilio?.colonia || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Calle <span className="text-red-500">*</span></label>
                      <input disabled={!esPropietario} required type="text" name="calle" value={actividadEnEdicion.domicilio?.calle || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"/>
                    </div>
                  </div>

                  {/* BLOQUE COLABORACIÓN */}
                  {esPropietario && String(actividadEnEdicion.id || '').startsWith('act-') && (
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

                {/* BENEFICIARIOS Y CONTADORES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 flex justify-between">
                      Beneficiarios <span className="text-red-500 ml-1 text-xs normal-case tracking-normal font-normal">* Al menos un recuadro debe tener valor</span>
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
                    <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Rango de Edad Promedio <span className="text-red-500">*</span></h4>
                    <input disabled={!esPropietario} required type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} placeholder="Ej: 15 a 18 años" className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"/>
                  </div>
                </div>

                {/* DESCRIPCIÓN */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción de la Actividad <span className="text-red-500">*</span></h4>
                  <textarea disabled={!esPropietario} required name="descripcion" rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none disabled:bg-gray-100 disabled:text-gray-500" placeholder="Describe brevemente lo que hicieron..."/>
                </div>

                {/* EVIDENCIAS */}
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
                  {(actividadEnEdicion.evidencias?.length || 0) === 0 && <p className="text-xs text-red-500 font-bold mt-1">Debes subir al menos 1 fotografía de evidencia.</p>}
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setActividadEnEdicion(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button form="form-edicion" type="submit" disabled={guardando || (actividadEnEdicion.evidencias?.length || 0) === 0} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-md">
                {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar {esPropietario ? 'Actividad' : 'Evidencias'}</>}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Calendar className="text-[#00689D]"/> Mis Reportes Mensuales</h1>
          <p className="text-sm text-gray-500 mt-1">Completa y reporta las actividades de cada mes</p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* LISTA DE REPORTES (Izquierda) */}
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

        {/* DETALLE DEL REPORTE (Derecha) */}
        {reporteSeleccionado ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-black text-gray-800">Reporte del mes de {reporteSeleccionado.nombre_mes}</h2>
                <p className="text-xs text-gray-600 mt-1">Gestiona las actividades de este periodo</p>
              </div>
              <button 
                onClick={() => setShowSendDialog(true)}
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
                            {act.nombre} {!act.es_propia && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Compartida</span>}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 ml-11 space-x-2">
                          <span>{act.fecha_evento?.split('T')[0]}</span>
                          <span>•</span>
                          <span>{act.tipo_actividad || 'Actividad Genérica'}</span>
                          {act.evidencias?.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-semibold">{act.evidencias.length}/4 evidencias subidas</span>
                            </>
                          )}
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