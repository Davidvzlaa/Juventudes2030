// import React, { useState, useEffect, useMemo } from 'react';
// import { 
//   Inbox, FileText, Edit2, X, Save, Settings2, Plus, Calendar, Loader2, Filter, MapPin, Globe, AlertTriangle, RefreshCw, Lock, CheckCircle2, CornerUpLeft
// } from 'lucide-react';
// import { BlobProvider, PDFDownloadLink, Document } from '@react-pdf/renderer';
// import { toast } from 'sonner';

// // Ajusta estas rutas según la estructura de tu proyecto
// import { supabase } from '../../lib/supabase'; 
// import ReportePDF from '../../ReportePDF';
// import { useSessionStorage } from '../../hooks/useSessionStorage';
// import type { Reporte, Actividad, CategoriaDB, AccionDB, OdsDB, MunicipioDB } from '../../types/types';

// const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// const notificationSound = typeof window !== 'undefined' ? new Audio('/notification.mp3') : null;
// if (notificationSound) notificationSound.volume = 0.5;

// const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
//   if (notificationSound) {
//     notificationSound.currentTime = 0;
//     notificationSound.play().catch(err => console.log('Audio bloqueado:', err));
//   }
//   const options = { position: 'bottom-right' as const };
//   switch (type) {
//     case 'success': toast.success(message, options); break;
//     case 'error': toast.error(message, options); break;
//     case 'warning': toast.warning(message, options); break;
//     default: toast.info(message, options);
//   }
// };

// // ==========================================
// // VISOR PDF ESTABLE
// // ==========================================
// type PDFBlobContentProps = {
//   url: string | null;
//   loading: boolean;
//   error: Error | null;
//   stableUrl: string | null;
//   onNewUrl: (url: string) => void;
// };

// const PDFBlobContent = React.memo(({ url, loading, error, stableUrl, onNewUrl }: PDFBlobContentProps) => {
//   useEffect(() => {
//     if (url && url !== stableUrl) onNewUrl(url);
//   }, [url, stableUrl, onNewUrl]);

//   if (error) {
//     return (
//       <div className="absolute inset-0 flex items-center justify-center bg-white p-6 text-center">
//         <div>
//           <AlertTriangle className="mx-auto mb-3 text-red-500" size={32} />
//           <p className="font-bold text-gray-700">No se pudo generar el PDF</p>
//           <p className="text-xs text-gray-500 mt-1">Intenta refrescar el expediente.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {stableUrl ? (
//         <iframe title="Vista previa del reporte PDF" src={stableUrl} className="w-full h-full border-0 bg-white"/>
//       ) : (
//         <div className="absolute inset-0 flex items-center justify-center bg-white">
//           <div className="text-center">
//             <Loader2 size={38} className="animate-spin text-[#00689D] mx-auto mb-3" />
//             <p className="font-bold text-gray-700">Generando vista previa...</p>
//             <p className="text-xs text-gray-400 mt-1">El PDF aparecerá automáticamente.</p>
//           </div>
//         </div>
//       )}
//       {loading && stableUrl && (
//         <div className="absolute inset-x-0 top-0 z-20 pointer-events-none">
//           <div className="h-1 bg-gray-200 overflow-hidden">
//             <div className="h-full w-1/3 bg-[#00689D] animate-[pulse_1.2s_ease-in-out_infinite]" />
//           </div>
//           <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-600">
//             <Loader2 size={13} className="animate-spin text-[#00689D]" /> Actualizando PDF...
//           </div>
//         </div>
//       )}
//     </>
//   );
// });

// type PDFDocumentElement = React.ReactElement<React.ComponentProps<typeof Document>>;

// const VisorPDFAislado = React.memo(({ document }: { document: PDFDocumentElement | null }) => {
//     const [stableUrl, setStableUrl] = useState<string | null>(null);
//     const currentUrlRef = React.useRef<string | null>(null);

//     const handleNewUrl = React.useCallback((url: string) => {
//       const oldUrl = currentUrlRef.current;
//       if (oldUrl && oldUrl !== url) URL.revokeObjectURL(oldUrl);
//       currentUrlRef.current = url;
//       setStableUrl(url);
//     }, []);

//     useEffect(() => {
//       return () => {
//         if (currentUrlRef.current) {
//           URL.revokeObjectURL(currentUrlRef.current);
//           currentUrlRef.current = null;
//         }
//       };
//     }, []);

//     if (!document) {
//       return (
//         <div className="w-full h-full min-h-0 bg-white flex items-center justify-center">
//           <div className="text-sm text-gray-400">Preparando documento...</div>
//         </div>
//       );
//     }

//     return (
//       <div className="relative w-full h-full min-h-0 bg-[#2f2f2f] overflow-hidden">
//         <BlobProvider document={document}>
//           {({ url, loading, error }) => (
//             <PDFBlobContent url={url} loading={loading} error={error} stableUrl={stableUrl} onNewUrl={handleNewUrl} />
//           )}
//         </BlobProvider>
//       </div>
//     );
//   },
//   (prevProps, nextProps) => prevProps.document === nextProps.document
// );

// export default function AdminReportes() {
//   const [reportes, setReportes] = useState<Reporte[]>([]);
//   const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  
//   const [reporteGuardadoId, setReporteGuardadoId] = useSessionStorage<number | null>('admin_reporte_id', null);
//   const [filtroEstado, setFiltroEstado] = useSessionStorage<'Todos' | 'Enviado' | 'Borrador' | 'Aprobado'>('admin_filtro_estado', 'Enviado'); 
//   const [filtroMes, setFiltroMes] = useSessionStorage<string>('admin_filtro_mes', 'Todos'); 
//   const [filtroMunicipio, setFiltroMunicipio] = useSessionStorage<string>('admin_filtro_mun', 'Todos');
//   const [ocultarAnuladasPDF, setOcultarAnuladasPDF] = useSessionStorage<boolean>('admin_ocultar_anuladas', false);

//   const [cargandoDetalle, setCargandoDetalle] = useState(false);
//   const [cargandoDatos, setCargandoDatos] = useState(true);
//   const [errorCarga, setErrorCarga] = useState<string | null>(null);

//   // Edición de actividad
//   const [actividadEnEdicion, setActividadEnEdicion] = useState<any | null>(null);
//   const [guardando, setGuardando] = useState(false);
  
//   const [modalAnular, setModalAnular] = useState<{ visible: boolean; actividadId: number | null; comentario: string }>({ visible: false, actividadId: null, comentario: '' });
//   const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);

//   // Validación GLOBAL del Reporte
//   const [modalRevision, setModalRevision] = useState<{ visible: boolean; tipo: 'Aprobar' | 'Regresar'; comentario: string }>({ visible: false, tipo: 'Aprobar', comentario: '' });
//   const [procesandoRevision, setProcesandoRevision] = useState(false);

//   // Catálogos
//   const [categoriasDB, setCategoriasDB] = useState<CategoriaDB[]>([]);
//   const [accionesDB, setAccionesDB] = useState<AccionDB[]>([]);
//   const [odsDB, setOdsDB] = useState<OdsDB[]>([]); 
//   const [municipiosList, setMunicipiosList] = useState<MunicipioDB[]>([]);
//   const [sectoresDB, setSectoresDB] = useState<any[]>([]); 
//   const [areasSostenibilidadDB, setAreasSostenibilidadDB] = useState<{ id: number; nombre: string }[]>([]);
//   const [mesesDisponibles, setMesesDisponibles] = useState<{mes: number, anio: number, nombre: string}[]>([]);

//   const [showHabilitarModal, setShowHabilitarModal] = useState(false);
//   const [nuevoMes, setNuevoMes] = useState(new Date().getMonth() + 1);
//   const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear());
//   const [procesandoMes, setProcesandoMes] = useState(false);
//   const [showDeshabilitarModal, setShowDeshabilitarModal] = useState(false);
//   const [mesDeshabilitar, setMesDeshabilitar] = useState<string>('');
//   const [procesandoDeshabilitar, setProcesandoDeshabilitar] = useState(false);
//   const [accionCierre, setAccionCierre] = useState<'deshabilitar' | 'eliminar'>('deshabilitar');

//   useEffect(() => {
//     if (showHabilitarModal || showDeshabilitarModal || modalAnular.visible || actividadEnEdicion || modalRevision.visible) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'auto';
//     }
//     return () => { document.body.style.overflow = 'auto'; };
//   }, [showHabilitarModal, showDeshabilitarModal, modalAnular.visible, actividadEnEdicion, modalRevision.visible]);

//   const fetchData = async () => {
//     setCargandoDatos(true);
//     setErrorCarga(null);
//     try {
//       const [catRes, accRes, odsRes, munRes, secRes, areasRes, embRes, repRes] = await Promise.all([
//         supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id'),
//         supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id'),
//         supabase.from('ods').select('id, numero, nombre, categoria_sostenibilidad').eq('activo', true).order('numero'),
//         supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
//         supabase.from('sectores_poblacion').select('id, nombre').eq('activo', true).order('id'),
//         supabase.from('areas_sostenibilidad').select('id, nombre').eq('activo', true).order('id'),
//         supabase.from('embajadores').select('usuario_id, municipios(nombre)'),
//         supabase.from('reportes')
//           .select(`id, mes, anio, estado, usuario_id, usuarios!reportes_usuario_id_fkey(nombre, apellido)`)
//           .order('anio', { ascending: false }).order('mes', { ascending: false })
//       ]);

//       const errores = [catRes.error, accRes.error, odsRes.error, munRes.error, secRes.error, areasRes.error, embRes.error, repRes.error].filter(Boolean);
//       if (errores.length > 0) throw errores[0];

//       if (catRes.data) setCategoriasDB(catRes.data);
//       if (accRes.data) setAccionesDB(accRes.data);
//       if (odsRes.data) setOdsDB(odsRes.data);
//       if (munRes.data) setMunicipiosList(munRes.data);
//       if (secRes.data) setSectoresDB(secRes.data);
//       if (areasRes.data) setAreasSostenibilidadDB(areasRes.data);

//       const embMap = new Map();
//       // @ts-ignore
//       embRes.data?.forEach(e => embMap.set(e.usuario_id, e.municipios?.nombre || 'Sin municipio'));

//       if (repRes.data) {
//         const formateados: Reporte[] = repRes.data.map((r: any) => ({
//           ...r,
//           nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`,
//           embajador: { nombre: `${r.usuarios?.nombre || ''} ${r.usuarios?.apellido || ''}`.trim() || 'Sin Nombre' },
//           municipio_nombre: embMap.get(r.usuario_id) || 'Desconocido',
//           actividades: []
//         }));
//         setReportes(formateados);

//         const unicos = new Map();
//         repRes.data.forEach((r: any) => {
//           const key = `${r.mes}-${r.anio}`;
//           if (!unicos.has(key)) {
//             unicos.set(key, { mes: r.mes, anio: r.anio, nombre: `${MESES[(r.mes || 1) - 1]} ${r.anio}` });
//           }
//         });
//         setMesesDisponibles(Array.from(unicos.values()));
//       }
//     } catch (error: any) {
//       console.error("Error cargando datos:", error);
//       setErrorCarga(error?.message || 'No fue posible cargar los reportes.');
//     } finally {
//       setCargandoDatos(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   useEffect(() => {
//     if (reportes.length > 0 && reporteGuardadoId && !reporteSeleccionado) {
//       const reporteRecuperado = reportes.find(r => r.id === reporteGuardadoId);
//       if (reporteRecuperado) seleccionarReporte(reporteRecuperado, true);
//     }
//   }, [reportes, reporteGuardadoId]);

//   const seleccionarReporte = async (reporte: Reporte, forceRefresh = false) => {
//     if (cargandoDetalle) return;

//     const esMismoReporte = reporteSeleccionado?.id === reporte.id;

//     if (!forceRefresh && esMismoReporte) {
//       setReporteSeleccionado(null); 
//       setReporteGuardadoId(null); 
//       return; 
//     }

//     setReporteGuardadoId(reporte.id); 
//     if (!esMismoReporte) { setCargandoDetalle(true); setReporteSeleccionado(null); }
    
//     const strMes = String(reporte.mes).padStart(2, '0');
//     const ultimoDia = new Date(reporte.anio, reporte.mes, 0).getDate();

//     try {
//       const { data, error } = await supabase.rpc('obtener_reporte_completo', {
//         p_reporte_id: reporte.id,
//         p_usuario_id: reporte.usuario_id,
//         p_fecha_inicio: `${reporte.anio}-${strMes}-01`,
//         p_fecha_fin: `${reporte.anio}-${strMes}-${ultimoDia}`
//       });

//       if (error) throw error;
      
//       if (data) {
//         let actividadesCompletas = data.actividades || [];

//         // Generación de URLs firmadas
//         const pathsToSign: string[] = [];
//         actividadesCompletas.forEach((act: any) => {
//           if (act.evidencias) {
//             act.evidencias.forEach((ev: any) => {
//               if (ev.url_archivo) pathsToSign.push(ev.url_archivo);
//             });
//           }
//         });

//         const signedUrlsMap = new Map<string, string>();
//         if (pathsToSign.length > 0) {
//           const { data: signedData, error: signedErr } = await supabase.storage
//             .from('evidencias')
//             .createSignedUrls(pathsToSign, 3600); 

//           if (signedErr) throw signedErr;
//           if (!signedData) throw new Error('No se pudieron generar las URLs de las evidencias.');

//           const evidenciasFallidas = signedData.filter((item) => item.error || !item.signedUrl);
//           if (evidenciasFallidas.length > 0) {
//             throw new Error(`No se pudieron abrir ${evidenciasFallidas.length} evidencia(s).`);
//           }

//           signedData.forEach(item => {
//             if (item.path && item.signedUrl) signedUrlsMap.set(item.path, item.signedUrl);
//           });
//         }

//         actividadesCompletas = actividadesCompletas.map((act: any) => ({
//           ...act,
//           evidencias: act.evidencias?.map((ev: any) => ({
//             ...ev,
//             url: signedUrlsMap.get(ev.url_archivo) || ev.url || ''
//           }))
//         }));

//         setReporteSeleccionado({ 
//           ...reporte, 
//           actividades: actividadesCompletas 
//         });
//       }

//     } catch (err: any) {
//       notifyWithSound("Error cargando detalles: " + err.message, "error");
//     } finally {
//       if (!esMismoReporte) setCargandoDetalle(false); 
//     }
//   };

//   const procesarRevisionReporte = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reporteSeleccionado) return;
    
//     if (modalRevision.tipo === 'Regresar' && !modalRevision.comentario.trim()) {
//       return notifyWithSound("Debes incluir un comentario indicando por qué regresas el reporte.", "warning");
//     }
    
//     setProcesandoRevision(true);
//     try {
//       const rpcName = modalRevision.tipo === 'Aprobar' ? 'aprobar_reporte' : 'rechazar_reporte';
      
//       const { error } = await supabase.rpc(rpcName, {
//         p_reporte_id: reporteSeleccionado.id,
//         p_comentarios: modalRevision.comentario || null
//       });
      
//       if (error) throw error;
      
//       notifyWithSound(`Reporte ${modalRevision.tipo === 'Aprobar' ? 'aprobado' : 'regresado'} correctamente`, 'success');
//       setModalRevision({ visible: false, tipo: 'Aprobar', comentario: '' });
//       fetchData(); 
//       setReporteSeleccionado(prev => prev ? { ...prev, estado: modalRevision.tipo === 'Aprobar' ? 'Aprobado' : 'Regresado' } : null);
//     } catch(err: any) {
//        notifyWithSound("Error al actualizar: " + err.message, "error");
//     } finally {
//        setProcesandoRevision(false);
//     }
//   };

//   const handleHabilitarMes = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setProcesandoMes(true);
//     try {
//       const { data: existing } = await supabase.from('reportes').select('id').eq('mes', nuevoMes).eq('anio', nuevoAnio).limit(1);
//       if (existing && existing.length > 0) return notifyWithSound("Este mes ya fue habilitado previamente.", "warning");
      
//       const { data: embajadores } = await supabase.from('embajadores').select('usuario_id').eq('activo', true);
//       if (embajadores && embajadores.length > 0) {
//         const strMes = String(nuevoMes).padStart(2, '0');
//         const ultimoDia = new Date(nuevoAnio, nuevoMes, 0).getDate();
//         const inserts = embajadores.map((emb: any) => ({
//           usuario_id: emb.usuario_id, mes: nuevoMes, anio: nuevoAnio,
//           periodo_inicio: `${nuevoAnio}-${strMes}-01`, periodo_fin: `${nuevoAnio}-${strMes}-${ultimoDia}`,
//           estado: 'Borrador'
//         }));
//         const { error } = await supabase.from('reportes').insert(inserts);
//         if (error) throw error;
        
//         notifyWithSound("Mes habilitado exitosamente.", "success");
//         setShowHabilitarModal(false);
//         fetchData();
//       } else {
//         notifyWithSound("No hay embajadores activos en el sistema.", "warning");
//       }
//     } catch (error: any) { notifyWithSound("Ocurrió un error: " + error.message, "error"); } 
//     finally { setProcesandoMes(false); }
//   };

//   const handleDeshabilitarMes = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!mesDeshabilitar) return notifyWithSound("Selecciona un mes de la lista", "warning");
    
//     setProcesandoDeshabilitar(true);
//     try {
//       const [mesSeleccionado, anioSeleccionado] = mesDeshabilitar.split('-').map(Number);
      
//       if (accionCierre === 'deshabilitar') {
//         const { error } = await supabase.from('reportes')
//           .update({ estado: 'Deshabilitado' })
//           .eq('mes', mesSeleccionado)
//           .eq('anio', anioSeleccionado)
//           .in('estado', ['Borrador', 'Regresado']); 
        
//         if (error) throw error;
//         notifyWithSound("Mes deshabilitado con éxito.", "success");

//       } else {
//         const { error } = await supabase.from('reportes')
//           .delete()
//           .eq('mes', mesSeleccionado)
//           .eq('anio', anioSeleccionado);
          
//         if (error) throw error;
//         notifyWithSound("Mes eliminado por completo.", "success");
        
//         if (reporteSeleccionado && reporteSeleccionado.mes === mesSeleccionado && reporteSeleccionado.anio === anioSeleccionado) {
//           setReporteSeleccionado(null);
//         }
//       }

//       setShowDeshabilitarModal(false);
//       setAccionCierre('deshabilitar'); 
//       setMesDeshabilitar('');
//       fetchData(); 

//     } catch (error: any) { 
//       notifyWithSound(`Error al ${accionCierre} el mes: ` + error.message, "error"); 
//     } 
//     finally { setProcesandoDeshabilitar(false); }
//   };

//   const toggleAnularActividad = (actividadId: number, anuladaActual: boolean) => {
//     if (!anuladaActual) setModalAnular({ visible: true, actividadId, comentario: '' });
//     else procesarCambioEstado(actividadId, 'Aprobada', null);
//   };

//   const procesarCambioEstado = async (actividadId: number, nuevoEstadoVal: string, comentario: string | null) => {
//     if (!reporteSeleccionado) return;
//     if (nuevoEstadoVal === 'Rechazada' && !comentario?.trim()) return notifyWithSound("Debes ingresar un motivo de anulación.", "warning");

//     setProcesandoAnulacion(true);
//     try {
//       const { data: authData } = await supabase.auth.getUser();
//       const payload = {
//         reporte_id: reporteSeleccionado.id, actividad_id: actividadId, estado_validacion: nuevoEstadoVal,
//         comentarios_admin: comentario, validado_por_usuario_id: authData.user?.id, fecha_validacion: new Date().toISOString()
//       };
//       const { data: existente, error: consultaError } = await supabase
//         .from('reporte_act')
//         .select('id')
//         .eq('reporte_id', reporteSeleccionado.id)
//         .eq('actividad_id', actividadId)
//         .maybeSingle();

//       if (consultaError) throw consultaError;

//       const { error } = existente
//         ? await supabase.from('reporte_act').update(payload).eq('id', existente.id)
//         : await supabase.from('reporte_act').insert(payload);

//       if (error) throw error;

//       setReporteSeleccionado({
//         ...reporteSeleccionado,
//         actividades: reporteSeleccionado.actividades.map(act => 
//           act.id === actividadId ? { ...act, anulada: nuevoEstadoVal === 'Rechazada', motivo_anulacion: comentario || '' } : act
//         )
//       });
//       notifyWithSound(nuevoEstadoVal === 'Rechazada' ? "Actividad anulada." : "Actividad restaurada.", "success");
//       setModalAnular({ visible: false, actividadId: null, comentario: '' });
//     } catch (error) { notifyWithSound("Error al actualizar el estado de la actividad.", "error"); } 
//     finally { setProcesandoAnulacion(false); }
//   };

//   const abrirModalEdicion = (act: any) => {
//     const secObj: any = {};
//     if (act.actividad_sectores) {
//        act.actividad_sectores.forEach((s: any) => {
//           secObj[s.sector_id] = { hombres: s.hombres, mujeres: s.mujeres, total: s.total };
//        });
//     }
//     setActividadEnEdicion({ ...act, sectores: secObj });
//   };

//   // Modificado para soportar checkboxes
//   const handleChangeSimple = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     if(!actividadEnEdicion) return;
//     const { name, value, type } = e.target;
//     const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
//     setActividadEnEdicion({ ...actividadEnEdicion, [name]: val });
//   };

//   const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     if(!actividadEnEdicion) return;
//     const { name, value } = e.target;
//     setActividadEnEdicion((prev: any) => prev ? ({ ...prev, domicilio: { ...prev.domicilio, [name]: name === 'municipio' ? Number(value) : value } }) : null);
//   };

//   const toggleOds = (odsId: number) => {
//     setActividadEnEdicion((prev: any) => {
//       if(!prev) return prev;
//       const arr = prev.ods_seleccionados || [];
//       if (arr.includes(odsId)) return { ...prev, ods_seleccionados: arr.filter((id: number) => id !== odsId) };
//       if (arr.length >= 4) { notifyWithSound("Máximo 4 ODS permitidos.", "warning"); return prev; }
//       return { ...prev, ods_seleccionados: [...arr, odsId] };
//     });
//   };

//   const handleBeneficiarioChange = (categoriaId: number, campo: 'hombres' | 'mujeres', value: string) => {
//     setActividadEnEdicion((prev: any) => {
//         if(!prev) return prev;
//         const currentCat = prev.beneficiarios?.[categoriaId] || { hombres: '0', mujeres: '0', total: '0' };
//         return {
//           ...prev, 
//           beneficiarios: { ...prev.beneficiarios, [categoriaId]: { ...currentCat, [campo]: value } }
//         };
//     });
//   };

//   const handleSectorChange = (sectorId: number, campo: 'hombres' | 'mujeres', value: string) => {
//     setActividadEnEdicion((prev: any) => {
//       if (!prev) return prev;
      
//       let totalCatSum = 0;
//       if (prev.beneficiarios) {
//         Object.entries(prev.beneficiarios).forEach(([id, val]: [string, any]) => {
//           if (Number(id) !== 99) { 
//             totalCatSum += parseInt(val[campo] || '0', 10);
//           }
//         });
//       }

//       let sumOtrosSectores = 0;
//       if (prev.sectores) {
//         Object.entries(prev.sectores).forEach(([id, val]: [string, any]) => {
//           if (Number(id) !== sectorId) {
//             sumOtrosSectores += parseInt(val[campo] || '0', 10);
//           }
//         });
//       }

//       const maxPermitido = totalCatSum - sumOtrosSectores;
//       let valStr = value;
//       let valNum = parseInt(value || '0', 10);
      
//       if (valNum > maxPermitido) {
//         notifyWithSound(`Límite alcanzado: Solo tienes ${maxPermitido} ${campo} disponibles según tu registro de edades.`, 'warning');
//         valStr = maxPermitido.toString();
//       }

//       const currentSec = prev.sectores?.[sectorId] || { hombres: '0', mujeres: '0', total: '0' };
      
//       return { ...prev, sectores: { ...prev.sectores, [sectorId]: { ...currentSec, [campo]: valStr } } };
//     });
//   };

//   const guardarEdicionActividad = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reporteSeleccionado || !actividadEnEdicion) return;

//     let totalCatH = 0, totalCatM = 0;
//     let totalSecH = 0, totalSecM = 0;

//     // Solo validamos beneficiarios si NO es una actividad externa
//     if (!actividadEnEdicion.es_externa) {
//       if (actividadEnEdicion.beneficiarios) {
//         Object.entries(actividadEnEdicion.beneficiarios).forEach(([id, val]: [any, any]) => {
//           if (Number(id) !== 99) {
//             totalCatH += parseInt(val.hombres || '0', 10);
//             totalCatM += parseInt(val.mujeres || '0', 10);
//           }
//         });
//       }
      
//       if (actividadEnEdicion.sectores) {
//         Object.values(actividadEnEdicion.sectores).forEach((val: any) => {
//           totalSecH += parseInt(val.hombres || '0', 10);
//           totalSecM += parseInt(val.mujeres || '0', 10);
//         });
//       }

//       if (totalSecH > totalCatH || totalSecM > totalCatM) {
//         notifyWithSound("Error: La cantidad en Sectores supera el total de Beneficiarios.", "error");
//         return;
//       }
//     }

//     setGuardando(true);
//     try {
//       const actId = actividadEnEdicion.id;
//       const tipoAccionIdInt = parseInt(actividadEnEdicion.tipo_accion_id_real || '0', 10);
//       const tipoObj = accionesDB.find(a => a.id === tipoAccionIdInt);

//       const { error: errAct } = await supabase.from('actividades').update({
//         nombre: actividadEnEdicion.nombre, 
//         tipo_actividad: tipoObj?.nombre || null, 
//         fecha_evento: actividadEnEdicion.fecha_evento,
//         hora_inicio: actividadEnEdicion.hora_inicio || null, 
//         hora_fin: actividadEnEdicion.hora_fin || null,
//         lugar: actividadEnEdicion.lugar, 
//         municipio_id: actividadEnEdicion.domicilio?.municipio || null,
//         calle: actividadEnEdicion.domicilio?.calle || null, 
//         colonia: actividadEnEdicion.domicilio?.colonia || null,
//         rango_edad_beneficiarios: actividadEnEdicion.es_externa ? null : actividadEnEdicion.rango_edad, 
//         descripcion: actividadEnEdicion.descripcion,
//         es_externa: actividadEnEdicion.es_externa || false,
//         organizador_externo: actividadEnEdicion.es_externa ? actividadEnEdicion.organizador_externo : null,
//         fecha_actualizacion: new Date().toISOString()
//       }).eq('id', actId);
      
//       if (errAct) throw errAct;

//       // Actualizar Relaciones
//       const { error: benefDeleteError } = await supabase.from('actividad_beneficiarios').delete().eq('actividad_id', actId);
//       if (benefDeleteError) throw benefDeleteError;
//       if (!actividadEnEdicion.es_externa && actividadEnEdicion.beneficiarios) {
//         const benefPayload = Object.entries(actividadEnEdicion.beneficiarios)
//           .filter(([id]) => Number(id) !== 99)
//           .map(([id, val]: [string, any]) => ({
//             actividad_id: actId, categoria_id: Number(id),
//             hombres: parseInt(val.hombres || '0', 10), mujeres: parseInt(val.mujeres || '0', 10),
//             total: parseInt(val.hombres || '0', 10) + parseInt(val.mujeres || '0', 10),
//             actualizado_en: new Date().toISOString()
//           })).filter(b => b.total > 0);
//         if (benefPayload.length > 0) {
//           const { error: benefInsertError } = await supabase.from('actividad_beneficiarios').insert(benefPayload);
//           if (benefInsertError) throw benefInsertError;
//         }
//       }

//       const { error: sectorDeleteError } = await supabase.from('actividad_sectores').delete().eq('actividad_id', actId);
//       if (sectorDeleteError) throw sectorDeleteError;
//       if (!actividadEnEdicion.es_externa && actividadEnEdicion.sectores) {
//         const secPayload = Object.entries(actividadEnEdicion.sectores)
//           .map(([id, val]: [string, any]) => ({
//             actividad_id: actId, sector_id: Number(id),
//             hombres: parseInt(val.hombres || '0', 10),
//             mujeres: parseInt(val.mujeres || '0', 10),
//             total: parseInt(val.hombres || '0', 10) + parseInt(val.mujeres || '0', 10)
//           })).filter(s => s.total > 0);
//         if (secPayload.length > 0) {
//           const { error: sectorInsertError } = await supabase.from('actividad_sectores').insert(secPayload);
//           if (sectorInsertError) throw sectorInsertError;
//         }
//       }

//       const { error: accionDeleteError } = await supabase.from('actividad_acciones').delete().eq('actividad_id', actId);
//       if (accionDeleteError) throw accionDeleteError;
//       if (!isNaN(tipoAccionIdInt) && tipoAccionIdInt > 0) {
//         const { error: accionInsertError } = await supabase.from('actividad_acciones').insert({ actividad_id: actId, tipo_accion_id: tipoAccionIdInt, cantidad: 1, creado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() });
//         if (accionInsertError) throw accionInsertError;
//       }

//       const areasSeleccionadas = new Set<number>();
//       const normalizarArea = (nombre: string) => nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
//       const areaEconomica = areasSostenibilidadDB.find((area) => /econ/.test(normalizarArea(area.nombre)));
//       const areaSocial = areasSostenibilidadDB.find((area) => /social|sociedad/.test(normalizarArea(area.nombre)));
//       const areaAmbiental = areasSostenibilidadDB.find((area) => /ambient|biosfer/.test(normalizarArea(area.nombre)));
//       actividadEnEdicion.ods_seleccionados?.forEach((odsId: number) => {
//         const cat = odsDB.find(o => o.id === odsId)?.categoria_sostenibilidad?.toLowerCase() || '';
//         if (cat.includes('econ') && areaEconomica) areasSeleccionadas.add(areaEconomica.id);
//         if ((cat.includes('social') || cat.includes('sociedad')) && areaSocial) areasSeleccionadas.add(areaSocial.id);
//         if ((cat.includes('ambient') || cat.includes('biosfera')) && areaAmbiental) areasSeleccionadas.add(areaAmbiental.id);
//         if (cat.includes('transversal') || cat.includes('alianza')) areasSostenibilidadDB.forEach((area) => areasSeleccionadas.add(area.id));
//       });

//       const { error: sostenibilidadDeleteError } = await supabase.from('actividad_sostenibilidad').delete().eq('actividad_id', actId);
//       if (sostenibilidadDeleteError) throw sostenibilidadDeleteError;
//       if (areasSeleccionadas.size > 0) {
//         const { error: sostenibilidadInsertError } = await supabase.from('actividad_sostenibilidad').insert(Array.from(areasSeleccionadas).map(areaId => ({ actividad_id: actId, area_id: areaId, creado_en: new Date().toISOString() })));
//         if (sostenibilidadInsertError) throw sostenibilidadInsertError;
//       }

//       const { error: odsDeleteError } = await supabase.from('actividad_ods').delete().eq('actividad_id', actId);
//       if (odsDeleteError) throw odsDeleteError;
//       if (actividadEnEdicion.ods_seleccionados && actividadEnEdicion.ods_seleccionados.length > 0) {
//         const { error: odsInsertError } = await supabase.from('actividad_ods').insert(actividadEnEdicion.ods_seleccionados.map((odsId: number, idx: number) => ({ actividad_id: actId, ods_id: odsId, es_principal: idx === 0 })));
//         if (odsInsertError) throw odsInsertError;
//       }

//       notifyWithSound('Actividad modificada exitosamente', 'success');
//       setActividadEnEdicion(null);
//       await seleccionarReporte(reporteSeleccionado, true);
      
//     } catch (error: any) { 
//       notifyWithSound('Error al guardar: ' + error.message, 'error'); 
//     } 
//     finally { setGuardando(false); }
//   };

//   const snapshotParaPDF = useMemo(() => {
//     if (!reporteSeleccionado) return null;
//     return {
//       ...reporteSeleccionado,
//       actividades: ocultarAnuladasPDF
//         ? (reporteSeleccionado.actividades || []).filter((a) => !a.anulada)
//         : (reporteSeleccionado.actividades || []),
//     };
//   }, [reporteSeleccionado, ocultarAnuladasPDF]);

//   const pdfDocument = useMemo<PDFDocumentElement | null>(() => {
//     if (!snapshotParaPDF || categoriasDB.length === 0) return null;
//     return (
//       <ReportePDF
//         snapshot={snapshotParaPDF}
//         categorias={categoriasDB.filter(c => c.id !== 99)} 
//         acciones={accionesDB}
//         sectores={sectoresDB}
//       />
//     ) as PDFDocumentElement;
//   }, [snapshotParaPDF, categoriasDB, accionesDB, sectoresDB]);

//   const reportesFiltrados = reportes.filter(r => {
//     return (filtroEstado === 'Todos' || r.estado === filtroEstado) &&
//            (filtroMes === 'Todos' || `${r.mes}-${r.anio}` === filtroMes) &&
//            (filtroMunicipio === 'Todos' || r.municipio_nombre === filtroMunicipio);
//   });

//   return (
//     <div className="flex flex-col h-auto lg:h-[calc(100vh-100px)] min-h-screen lg:min-h-0 relative p-2 md:p-4 bg-gray-50/50">
//       {cargandoDatos && (
//         <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
//           <Loader2 className="animate-spin" size={18} /> Cargando reportes y catálogos...
//         </div>
//       )}
//       {errorCarga && (
//         <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
//           <span>{errorCarga}</span>
//           <button type="button" onClick={fetchData} className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-bold hover:bg-red-100">Reintentar</button>
//         </div>
//       )}
      
//       {/* ================= MODAL REVISIÓN GLOBAL REPORTE ================= */}
//       {modalRevision.visible && (
//         <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
//               <h3 className={`font-black text-lg flex items-center gap-2 ${modalRevision.tipo === 'Aprobar' ? 'text-emerald-700' : 'text-amber-700'}`}>
//                 {modalRevision.tipo === 'Aprobar' ? <CheckCircle2 size={20}/> : <CornerUpLeft size={20}/>}
//                 {modalRevision.tipo === 'Aprobar' ? 'Aprobar Expediente' : 'Regresar Expediente'}
//               </h3>
//               <button onClick={() => setModalRevision({ visible: false, tipo: 'Aprobar', comentario: '' })} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
//             </div>
//             <form onSubmit={procesarRevisionReporte} className="p-4 md:p-6 space-y-4">
//               {modalRevision.tipo === 'Regresar' ? (
//                 <>
//                   <p className="text-sm text-gray-600">Por favor, indica el motivo por el cual regresas este reporte. El embajador podrá editarlo y volver a enviarlo.</p>
//                   <textarea required autoFocus rows={4} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none shadow-sm" placeholder="Ej. Faltan evidencias en la actividad 2..." value={modalRevision.comentario} onChange={e => setModalRevision({ ...modalRevision, comentario: e.target.value })} />
//                 </>
//               ) : (
//                 <p className="text-sm text-gray-600">¿Confirmas que el expediente cumple con todos los requisitos y evidencias? Una vez aprobado, será catalogado como válido en el sistema.</p>
//               )}
//               <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
//                 <button type="button" onClick={() => setModalRevision({ visible: false, tipo: 'Aprobar', comentario: '' })} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
//                 <button type="submit" disabled={procesandoRevision} className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-white disabled:opacity-70 ${modalRevision.tipo === 'Aprobar' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
//                   {procesandoRevision ? <Loader2 className="animate-spin" size={16} /> : null}
//                   Confirmar
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ================= MODAL ANULACIÓN ACTIVIDAD ================= */}
//       {modalAnular.visible && (
//         <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
//               <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><AlertTriangle size={20} className="text-red-600" /> Motivo de anulación</h3>
//               <button onClick={() => setModalAnular({ visible: false, actividadId: null, comentario: '' })} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
//             </div>
//             <div className="p-4 md:p-6 space-y-4">
//               <textarea autoFocus rows={4} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none shadow-sm" placeholder="Ej. Faltan evidencias claras..." value={modalAnular.comentario} onChange={e => setModalAnular({ ...modalAnular, comentario: e.target.value })} />
//               <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
//                 <button onClick={() => setModalAnular({ visible: false, actividadId: null, comentario: '' })} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
//                 <button disabled={procesandoAnulacion} onClick={() => procesarCambioEstado(modalAnular.actividadId!, 'Rechazada', modalAnular.comentario)} className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-70">
//                   {procesandoAnulacion ? <Loader2 className="animate-spin" size={16} /> : null}
//                   Confirmar
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= MODAL EDICIÓN ACTIVIDAD ================= */}
//       {actividadEnEdicion && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] mx-1 sm:mx-2 flex flex-col">
//             <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
//               <h3 className="font-black text-lg sm:text-xl text-gray-800 flex items-center gap-2"><Edit2 size={20} className="text-[#00689D]"/> Editar Actividad</h3>
//               <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={24} /></button>
//             </div>
            
//             <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300">
//               <form id="form-edicion-admin" onSubmit={guardarEdicionActividad} className="space-y-8">
                
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
                  
//                   {/* SECCIÓN EXTERNA AGREGADA */}
//                   <div className="bg-purple-50/50 p-4 border border-purple-100 rounded-xl mb-4">
//                     <label className="flex items-center gap-2 cursor-pointer mb-2">
//                       <input 
//                         type="checkbox" 
//                         name="es_externa" 
//                         checked={actividadEnEdicion.es_externa || false} 
//                         onChange={handleChangeSimple} 
//                         className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-600"
//                       />
//                       <span className="text-sm font-bold text-gray-800">
//                         ¿Fue una actividad organizada por un tercero (Escuela, Institución, Empresa)?
//                       </span>
//                     </label>
//                     {actividadEnEdicion.es_externa && (
//                       <div className="mt-3 ml-6">
//                         <label className="block text-xs font-bold text-gray-600 mb-1">Nombre del Organizador o Institución <span className="text-red-500">*</span></label>
//                         <input 
//                           required
//                           type="text" 
//                           name="organizador_externo" 
//                           value={actividadEnEdicion.organizador_externo || ''} 
//                           onChange={handleChangeSimple} 
//                           className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-purple-500"
//                         />
//                       </div>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Nombre</label>
//                       <input required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Acción Principal</label>
//                       <select name="tipo_accion_id_real" value={actividadEnEdicion.tipo_accion_id_real || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]">
//                         <option value="">-- Selecciona --</option>
//                         {accionesDB.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div><label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label><input type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('T')[0] || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
//                     <div><label className="block text-xs font-bold text-gray-600 mb-1">Inicio</label><input type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio?.slice(0,5) || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
//                     <div><label className="block text-xs font-bold text-gray-600 mb-1">Fin</label><input type="time" name="hora_fin" value={actividadEnEdicion.hora_fin?.slice(0,5) || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
//                   </div>

//                   <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
//                     <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS <span className="font-normal text-gray-500">(Máximo 4)</span></label>
//                     <div className="flex flex-wrap gap-2">
//                       {odsDB.map(ods => {
//                         const isSelected = actividadEnEdicion.ods_seleccionados?.includes(ods.id);
//                         const isPrincipal = actividadEnEdicion.ods_seleccionados?.[0] === ods.id;
//                         return (
//                           <button key={ods.id} type="button" onClick={() => toggleOds(ods.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${isSelected ? (isPrincipal ? 'bg-[#00689D] text-white' : 'bg-blue-100 text-blue-800 border-blue-300') : 'bg-white text-gray-500'}`}>
//                             <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? 'bg-white text-[#00689D]' : 'bg-gray-100'}`}>{ods.numero}</span>
//                             {ods.nombre} {isPrincipal && <span className="font-normal opacity-80">(Principal)</span>}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Ubicación</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div><label className="block text-xs font-bold text-gray-600 mb-1">Lugar <span className="text-red-500">*</span></label><input required type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"/></div>
//                     <div><label className="block text-xs font-bold text-gray-600 mb-1">Municipio <span className="text-red-500">*</span></label><select required name="municipio" value={actividadEnEdicion.domicilio?.municipio || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"><option value="">-- Selecciona --</option>{municipiosList.map(mun => <option key={mun.id} value={mun.id}>{mun.nombre}</option>)}</select></div>
//                     {/* CAMPOS DINÁMICOS COLONIA Y CALLE */}
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Colonia {!actividadEnEdicion.es_externa && <span className="text-red-500">*</span>}</label>
//                       <input required={!actividadEnEdicion.es_externa} type="text" name="colonia" value={actividadEnEdicion.domicilio?.colonia || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Calle {!actividadEnEdicion.es_externa && <span className="text-red-500">*</span>}</label>
//                       <input required={!actividadEnEdicion.es_externa} type="text" name="calle" value={actividadEnEdicion.domicilio?.calle || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"/>
//                     </div>
//                   </div>
//                 </div>

//                 {!actividadEnEdicion.es_externa && (
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     <div className="space-y-4">
                      
//                       <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">1. Beneficiarios (Edades)</h4>
//                       {categoriasDB.filter(c => c.id !== 99).map(cat => {
//                         const valH = parseInt(actividadEnEdicion.beneficiarios?.[cat.id]?.hombres || '0', 10); 
//                         const valM = parseInt(actividadEnEdicion.beneficiarios?.[cat.id]?.mujeres || '0', 10); 

//                         return (
//                           <div key={cat.id} className="flex gap-2 items-center p-2 rounded-lg border bg-gray-50 border-gray-100">
//                             <span className="w-1/3 text-[10px] leading-tight font-bold text-gray-600">{cat.nombre}</span>
//                             <input type="number" placeholder="0" value={(valH+valM)>0 ? valH+valM : ''} disabled tabIndex={-1} className="w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed bg-gray-100 text-gray-500 [appearance:textfield]" />
//                             <input type="number" placeholder="H" min="0" value={valH>0 ? valH : ''} onChange={e => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} className="w-1/5 text-center border rounded p-1 text-xs border-gray-300 focus:outline-none focus:border-[#00689D] [appearance:textfield]" />
//                             <input type="number" placeholder="M" min="0" value={valM>0 ? valM : ''} onChange={e => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} className="w-1/5 text-center border rounded p-1 text-xs border-gray-300 focus:outline-none focus:border-[#00689D] [appearance:textfield]" />
//                           </div>
//                         );
//                       })}

//                       <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 mt-6">2. Sectores Vulnerables</h4>
//                       {sectoresDB.map(sec => {
//                         const valH = parseInt((actividadEnEdicion as any).sectores?.[sec.id]?.hombres || '0', 10); 
//                         const valM = parseInt((actividadEnEdicion as any).sectores?.[sec.id]?.mujeres || '0', 10); 

//                         return (
//                           <div key={sec.id} className="flex gap-2 items-center p-2 rounded-lg border bg-gray-50 border-gray-100">
//                             <span className="w-1/3 text-[10px] leading-tight font-bold text-gray-600">{sec.nombre}</span>
//                             <input type="number" placeholder="0" value={(valH+valM)>0 ? valH+valM : ''} disabled tabIndex={-1} className="w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed bg-gray-100 text-gray-500 [appearance:textfield]" />
//                             <input type="number" placeholder="H" min="0" value={valH>0 ? valH : ''} onChange={e => handleSectorChange(sec.id, 'hombres', e.target.value)} className="w-1/5 text-center border rounded p-1 text-xs border-gray-300 focus:outline-none focus:border-[#00689D] [appearance:textfield]" />
//                             <input type="number" placeholder="M" min="0" value={valM>0 ? valM : ''} onChange={e => handleSectorChange(sec.id, 'mujeres', e.target.value)} className="w-1/5 text-center border rounded p-1 text-xs border-gray-300 focus:outline-none focus:border-[#00689D] [appearance:textfield]" />
//                           </div>
//                         );
//                       })}

//                       {(() => {
//                         let globalH = 0, globalM = 0;
//                         categoriasDB.filter(c => c.id !== 99).forEach(c => {
//                           globalH += parseInt(actividadEnEdicion.beneficiarios?.[c.id]?.hombres || '0', 10);
//                           globalM += parseInt(actividadEnEdicion.beneficiarios?.[c.id]?.mujeres || '0', 10);
//                         });

//                         return (
//                           <div className="mt-6 flex gap-2 items-center p-2 rounded-lg border bg-[#00689D]/5 border-[#00689D]/20 shadow-sm">
//                             <span className="w-1/3 text-[10px] leading-tight font-black text-[#00689D]">TOTAL BENEFICIARIOS</span>
//                             <input type="number" value={(globalH+globalM)>0 ? globalH+globalM : ''} disabled tabIndex={-1} className="w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed bg-[#00689D]/10 text-[#00689D] font-bold" />
//                             <input type="number" value={globalH>0 ? globalH : ''} disabled className="w-1/5 text-center border rounded p-1 text-xs cursor-not-allowed bg-[#00689D]/10 text-[#00689D] font-bold" />
//                             <input type="number" value={globalM>0 ? globalM : ''} disabled className="w-1/5 text-center border rounded p-1 text-xs cursor-not-allowed bg-[#00689D]/10 text-[#00689D] font-bold" />
//                           </div>
//                         );
//                       })()}

//                     </div>
                    
//                     <div className="space-y-4">
//                       <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Rango de Edad Promedio</h4>
//                       <input type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} placeholder="Ej: 15 a 18 años" className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"/>
//                     </div>
//                   </div>
//                 )}

//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción</h4>
//                   <textarea name="descripcion" required rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none"/>
//                 </div>

//               </form>
//             </div>

//             <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 shrink-0 rounded-b-2xl">
//               <button type="button" onClick={() => setActividadEnEdicion(null)} className="w-full sm:flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">Cancelar</button>
//               <button form="form-edicion-admin" type="submit" disabled={guardando} className="w-full sm:flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] flex items-center justify-center gap-2 shadow-md disabled:opacity-70 transition-colors">
//                 {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar Cambios</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= MODAL CERRAR MES ================= */}
//       {showDeshabilitarModal && (
//         <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
//               <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><Lock size={20} className="text-red-600"/> Gestión de Periodo</h3>
//               <button onClick={() => setShowDeshabilitarModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
//             </div>
            
//             <form onSubmit={handleDeshabilitarMes} className="p-4 md:p-6 space-y-5">
              
//               {/* SELECTOR DE ACCIÓN */}
//               <div className="space-y-3">
//                 <label className="block text-sm font-bold text-gray-700">¿Qué deseas hacer?</label>
//                 <div className="grid grid-cols-2 gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setAccionCierre('deshabilitar')}
//                     className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${accionCierre === 'deshabilitar' ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
//                   >
//                     <span className={`text-sm font-bold ${accionCierre === 'deshabilitar' ? 'text-amber-700' : 'text-gray-700'}`}>Deshabilitar</span>
//                     <span className="text-[10px] text-gray-500">Cierra el periodo para envíos (Borradores).</span>
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setAccionCierre('eliminar')}
//                     className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${accionCierre === 'eliminar' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
//                   >
//                     <span className={`text-sm font-bold ${accionCierre === 'eliminar' ? 'text-red-700' : 'text-gray-700'}`}>Eliminar al 100%</span>
//                     <span className="text-[10px] text-gray-500">Borra todos los registros del mes. Útil si se abrió por error.</span>
//                   </button>
//                 </div>
//               </div>

//               <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
//                 <p className="text-xs text-gray-600">
//                   {accionCierre === 'deshabilitar' 
//                     ? 'Esta acción bloqueará todos los reportes "Borrador" del periodo seleccionado. Los embajadores ya no podrán agregar ni editar información.' 
//                     : 'Esta acción ELIMINARÁ DE FORMA PERMANENTE todos los reportes del periodo seleccionado.'}
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Seleccionar Periodo</label>
//                 <select required className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-red-500 outline-none bg-white" value={mesDeshabilitar} onChange={e => setMesDeshabilitar(e.target.value)}>
//                   <option value="" disabled>-- Selecciona un periodo --</option>
//                   {mesesDisponibles.map((m, i) => <option key={i} value={`${m.mes}-${m.anio}`}>{m.nombre}</option>)}
//                 </select>
//               </div>
              
//               <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
//                 <button type="button" onClick={() => setShowDeshabilitarModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
//                 <button type="submit" disabled={procesandoDeshabilitar} className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-white disabled:opacity-70 transition-colors ${accionCierre === 'eliminar' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
//                   {procesandoDeshabilitar ? <Loader2 className="animate-spin" size={16} /> : null}
//                   {accionCierre === 'eliminar' ? 'Confirmar Eliminación' : 'Confirmar Cierre'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ================= MODAL HABILITAR MES ================= */}
//       {showHabilitarModal && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
//               <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><Calendar size={20} className="text-[#00689D]"/> Habilitar Reportes</h3>
//               <button onClick={() => setShowHabilitarModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
//             </div>
//             <form onSubmit={handleHabilitarMes} className="p-4 md:p-6 space-y-4">
//               <p className="text-sm text-gray-600">Creará registros vacíos para todos los embajadores activos.</p>
//               <div><label className="block text-sm font-bold text-gray-700 mb-1">Mes</label><select required className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={nuevoMes} onChange={e => setNuevoMes(Number(e.target.value))}>{MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}</select></div>
//               <div><label className="block text-sm font-bold text-gray-700 mb-1">Año</label><input type="number" required className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={nuevoAnio} onChange={e => setNuevoAnio(Number(e.target.value))} /></div>
//               <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
//                 <button type="button" onClick={() => setShowHabilitarModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300">Cancelar</button>
//                 <button type="submit" disabled={procesandoMes} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white bg-[#00689D] disabled:opacity-70">
//                   {procesandoMes ? <Loader2 className="animate-spin" size={16} /> : null}
//                   Habilitar Mes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ================= CABECERA Y PANEL PRINCIPAL ============ */}
//       <div className="mb-4 lg:mb-6 bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
//         <div>
//           <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2"><Inbox className="text-[#00689D]"/> Bandeja de Auditoría</h1>
//           <p className="text-xs md:text-sm text-gray-500 mt-1">Revisa los expedientes enviados por los embajadores</p>
//         </div>
//         <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto">
//           <button onClick={() => setShowDeshabilitarModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 border border-red-200"><Lock size={18} /> Cerrar Mes</button>
//           <button onClick={() => setShowHabilitarModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#00527A]"><Plus size={18} /> Habilitar Nuevo Mes</button>
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 min-h-0 overflow-y-auto lg:overflow-hidden pb-10 lg:pb-0">
        
//         {/* === IZQUIERDA: LISTA Y FILTROS === */}
//         <div className="w-full lg:w-1/3 xl:w-1/4 h-[450px] lg:h-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
//           <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
//             <h3 className="text-sm font-black text-gray-700">Expedientes</h3>
//             <span className="text-xs bg-[#00689D] text-white px-2 py-0.5 rounded-full font-bold">{reportesFiltrados.length}</span>
//           </div>

//           <div className="border-b border-gray-100 bg-white flex flex-col shrink-0">
//             <div className="flex p-2 gap-1 border-b border-gray-100 bg-gray-50/50">
//               <button onClick={() => setFiltroEstado('Todos')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Todos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Todos</button>
//               <button onClick={() => setFiltroEstado('Enviado')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Enviado' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Enviados</button>
//               <button onClick={() => setFiltroEstado('Borrador')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Borrador' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Borrador</button>
//             </div>
//             <div className="p-3 space-y-3 bg-white">
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Filtrar por Mes</label>
//                   <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded p-1.5 outline-none focus:border-[#00689D]">
//                     <option value="Todos">Todos</option>
//                     {mesesDisponibles.map((m, i) => <option key={i} value={`${m.mes}-${m.anio}`}>{m.nombre}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Municipio</label>
//                   <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)} className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded p-1.5 outline-none focus:border-[#00689D]">
//                     <option value="Todos">Todos</option>
//                     {municipiosList.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto">
//             {reportesFiltrados.length === 0 ? (
//               <div className="p-6 text-center text-gray-400 text-sm flex flex-col items-center justify-center h-full"><Filter size={32} className="mb-2 opacity-20"/> No hay expedientes.</div>
//             ) : (
//               reportesFiltrados.map(reporte => (
//                 <div key={reporte.id} onClick={() => seleccionarReporte(reporte)} className={`p-4 border-b cursor-pointer transition-colors ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
//                   <div className="flex justify-between items-start mb-1">
//                     <p className="text-[10px] font-black uppercase text-gray-400">{reporte.nombre_mes}</p>
//                     <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${reporte.estado === 'Enviado' ? 'bg-emerald-100 text-emerald-700' : reporte.estado === 'Aprobado' ? 'bg-green-600 text-white' : reporte.estado === 'Regresado' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>{reporte.estado}</span>
//                   </div>
//                   <p className={`text-sm ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold text-gray-800'}`}>{reporte.embajador.nombre}</p>
//                   <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={10}/> {reporte.municipio_nombre}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* === DERECHA: DETALLE Y PDF === */}
//         {reporteSeleccionado ? (
//           <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-w-0">
//             <div className="p-3 lg:p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
//               <h2 className="text-base lg:text-lg font-black break-words w-full"><FileText className="inline text-[#00689D] mr-2"/> {reporteSeleccionado.nombre_mes} - {reporteSeleccionado.embajador.nombre}</h2>
//               <button onClick={() => seleccionarReporte(reporteSeleccionado, true)} className="text-[#00689D] flex w-full sm:w-auto justify-center items-center gap-1.5 text-xs font-bold bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100"><RefreshCw size={14}/> Refrescar</button>
//             </div>
            
//             {categoriasDB.length === 0 ? (
//               <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
//                 <Loader2 size={48} className="animate-spin text-[#00689D] mb-4" />
//                 <p className="font-bold text-gray-600">Cargando información...</p>
//                 <p className="text-xs mt-1">Conectando con la base de datos</p>
//               </div>
//             ) : (
//               <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-y-auto lg:overflow-hidden relative">
//                 {/* VISTA PARA COMPUTADORAS */}
//                 <div className="hidden md:flex flex-1 min-w-0 h-full bg-gray-100 relative items-center justify-center border-b border-gray-200 xl:border-b-0 order-2 xl:order-1 overflow-hidden">
//                   {snapshotParaPDF ? (
//                     <VisorPDFAislado document={pdfDocument} />
//                   ) : (
//                     <div className="text-gray-400 text-sm">Esperando datos...</div>
//                   )}
//                 </div>

//                 {/* VISTA PARA CELULARES */}
//                 <div className="md:hidden flex flex-col items-center justify-center w-full min-h-[420px] bg-gray-100 p-6 text-center order-2 xl:order-1">
//                   <FileText size={64} className="text-gray-300 mb-4" />
//                   <h3 className="font-bold text-gray-700 mb-2">Previsualización no disponible en móviles</h3>
//                   <p className="text-xs text-gray-500 mb-6">Descarga el PDF para verlo en el visor de tu dispositivo.</p>
                  
//                   {pdfDocument && (
//                     <PDFDownloadLink 
//                       document={pdfDocument} 
//                       fileName={`Reporte-${reporteSeleccionado.nombre_mes}-${reporteSeleccionado.embajador.nombre}.pdf`}
//                       className="bg-[#00689D] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#00527A] flex items-center gap-2 transition-colors"
//                     >
//                       {({ loading }) => (
//                         loading ? (
//                           <><Loader2 size={18} className="animate-spin" /> Procesando...</>
//                         ) : (
//                           <><FileText size={18} /> Descargar Reporte PDF</>
//                         )
//                       )}
//                     </PDFDownloadLink>
//                   )}
//                 </div>

//                 {/* === PANEL DE OPCIONES DERECHO === */}
//                 <div className="w-full xl:w-80 bg-gray-50 border-b xl:border-b-0 xl:border-l border-gray-200 flex flex-col shrink-0 order-1 xl:order-2">
                  
//                   {reporteSeleccionado.estado === 'Enviado' && (
//                     <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-2">
//                       <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Revisión del Expediente</h4>
//                       <button onClick={() => setModalRevision({ visible: true, tipo: 'Aprobar', comentario: '' })} className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm">
//                         <CheckCircle2 size={18} /> Aprobar Reporte
//                       </button>
//                       <button onClick={() => setModalRevision({ visible: true, tipo: 'Regresar', comentario: '' })} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm">
//                         <CornerUpLeft size={18} /> Regresar al Embajador
//                       </button>
//                     </div>
//                   )}

//                   <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
//                     <div className="flex items-center gap-2"><Settings2 size={16}/><span className="text-xs font-bold">Ocultar anuladas en PDF</span></div>
//                     <button onClick={() => setOcultarAnuladasPDF(!ocultarAnuladasPDF)} className={`w-10 h-5 rounded-full relative flex items-center ${ocultarAnuladasPDF ? 'bg-[#00689D]' : 'bg-gray-300'}`}>
//                       <div className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-all ${ocultarAnuladasPDF ? 'left-[22px]' : 'left-1'}`} />
//                     </button>
//                   </div>

//                   <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] xl:max-h-none">
//                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Edición de Actividades</h4>
//                     {reporteSeleccionado.actividades && reporteSeleccionado.actividades.length === 0 ? (
//                       <div className="text-center text-sm text-gray-400 mt-4">Sin actividades en este reporte.</div>
//                     ) : (
//                       reporteSeleccionado.actividades?.map((act: Actividad, idx: number) => (
//                         <div key={act.id} className={`p-3 rounded-xl border ${act.anulada ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
//                           <p className={`text-sm font-bold truncate mb-3 ${act.anulada ? 'line-through text-red-600' : ''}`}>{idx + 1}. {act.nombre}</p>
//                           <div className="flex gap-2">
//                             <button onClick={() => abrirModalEdicion(act)} title="Editar actividad" className="flex items-center justify-center px-3 py-1.5 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700"><Edit2 size={16} /></button>
//                             <button onClick={() => toggleAnularActividad(act.id, act.anulada)} className={`flex-1 flex justify-center items-center py-1.5 text-[10px] sm:text-xs font-bold rounded-lg border transition-colors ${act.anulada ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
//                               {act.anulada ? 'Restaurar' : 'Anular Actividad'}
//                             </button>
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>

//                 {cargandoDetalle && (
//                   <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
//                     <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
//                       <Loader2 size={18} className="animate-spin text-[#00689D]" />
//                       <span className="text-sm font-bold text-gray-700">Actualizando expediente...</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="w-full lg:flex-1 bg-white rounded-2xl flex items-center justify-center flex-col text-gray-400 py-12 lg:py-0 shadow-sm border border-gray-100">
//             <FileText size={48} className="mb-4 opacity-20"/>
//             <p className="font-bold">Selecciona un expediente de la lista</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Inbox, FileText, Edit2, X, Save, Settings2, Plus, Calendar, Loader2, Filter, MapPin, Globe, AlertTriangle, RefreshCw, Lock, CheckCircle2, CornerUpLeft, Building2
} from 'lucide-react';
import { BlobProvider, PDFDownloadLink, Document } from '@react-pdf/renderer';
import { toast } from 'sonner';

// Ajusta estas rutas según la estructura de tu proyecto
import { supabase } from '../../lib/supabase'; 
import ReportePDF from '../../ReportePDF';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import type { Reporte, Actividad, CategoriaDB, AccionDB, OdsDB, MunicipioDB } from '../../types/types';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const notificationSound = typeof window !== 'undefined' ? new Audio('/notification.mp3') : null;
if (notificationSound) notificationSound.volume = 0.5;

const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  if (notificationSound) {
    notificationSound.currentTime = 0;
    notificationSound.play().catch(err => console.log('Audio bloqueado:', err));
  }
  const options = { position: 'bottom-right' as const };
  switch (type) {
    case 'success': toast.success(message, options); break;
    case 'error': toast.error(message, options); break;
    case 'warning': toast.warning(message, options); break;
    default: toast.info(message, options);
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
  useEffect(() => {
    if (url && url !== stableUrl) onNewUrl(url);
  }, [url, stableUrl, onNewUrl]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white p-6 text-center">
        <div>
          <AlertTriangle className="mx-auto mb-3 text-red-500" size={32} />
          <p className="font-bold text-gray-700">No se pudo generar el PDF</p>
          <p className="text-xs text-gray-500 mt-1">Intenta refrescar el expediente.</p>
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
    const currentUrlRef = React.useRef<string | null>(null);

    const handleNewUrl = React.useCallback((url: string) => {
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

export default function AdminReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  
  const [reporteGuardadoId, setReporteGuardadoId] = useSessionStorage<number | null>('admin_reporte_id', null);
  const [filtroEstado, setFiltroEstado] = useSessionStorage<'Todos' | 'Enviado' | 'Borrador' | 'Aprobado'>('admin_filtro_estado', 'Enviado'); 
  const [filtroMes, setFiltroMes] = useSessionStorage<string>('admin_filtro_mes', 'Todos'); 
  const [filtroMunicipio, setFiltroMunicipio] = useSessionStorage<string>('admin_filtro_mun', 'Todos');
  const [ocultarAnuladasPDF, setOcultarAnuladasPDF] = useSessionStorage<boolean>('admin_ocultar_anuladas', false);

  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Edición de actividad
  const [actividadEnEdicion, setActividadEnEdicion] = useState<any | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [isNuevaInstitucion, setIsNuevaInstitucion] = useState(false);
  
  const [modalAnular, setModalAnular] = useState<{ visible: boolean; actividadId: number | null; comentario: string }>({ visible: false, actividadId: null, comentario: '' });
  const [procesandoAnulacion, setProcesandoAnulacion] = useState(false);

  // Validación GLOBAL del Reporte
  const [modalRevision, setModalRevision] = useState<{ visible: boolean; tipo: 'Aprobar' | 'Regresar'; comentario: string }>({ visible: false, tipo: 'Aprobar', comentario: '' });
  const [procesandoRevision, setProcesandoRevision] = useState(false);

  // Catálogos
  const [categoriasDB, setCategoriasDB] = useState<CategoriaDB[]>([]);
  const [accionesDB, setAccionesDB] = useState<AccionDB[]>([]);
  const [odsDB, setOdsDB] = useState<OdsDB[]>([]); 
  const [municipiosList, setMunicipiosList] = useState<MunicipioDB[]>([]);
  const [sectoresDB, setSectoresDB] = useState<any[]>([]); 
  const [areasSostenibilidadDB, setAreasSostenibilidadDB] = useState<{ id: number; nombre: string }[]>([]);
  const [institucionesDB, setInstitucionesDB] = useState<{ id: number; nombre: string }[]>([]);
  const [mesesDisponibles, setMesesDisponibles] = useState<{mes: number, anio: number, nombre: string}[]>([]);

  const [showHabilitarModal, setShowHabilitarModal] = useState(false);
  const [nuevoMes, setNuevoMes] = useState(new Date().getMonth() + 1);
  const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear());
  const [procesandoMes, setProcesandoMes] = useState(false);
  const [showDeshabilitarModal, setShowDeshabilitarModal] = useState(false);
  const [mesDeshabilitar, setMesDeshabilitar] = useState<string>('');
  const [procesandoDeshabilitar, setProcesandoDeshabilitar] = useState(false);
  const [accionCierre, setAccionCierre] = useState<'deshabilitar' | 'eliminar'>('deshabilitar');

  useEffect(() => {
    if (showHabilitarModal || showDeshabilitarModal || modalAnular.visible || actividadEnEdicion || modalRevision.visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showHabilitarModal, showDeshabilitarModal, modalAnular.visible, actividadEnEdicion, modalRevision.visible]);

  const fetchData = async () => {
    setCargandoDatos(true);
    setErrorCarga(null);
    try {
      const [catRes, accRes, odsRes, munRes, secRes, areasRes, instRes, embRes, repRes] = await Promise.all([
        supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('ods').select('id, numero, nombre, categoria_sostenibilidad').eq('activo', true).order('numero'),
        supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
        supabase.from('sectores_poblacion').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('areas_sostenibilidad').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('instituciones').select('id, nombre').eq('activo', true).order('nombre'),
        supabase.from('embajadores').select('usuario_id, municipios(nombre)'),
        supabase.from('reportes')
          .select(`id, mes, anio, estado, usuario_id, usuarios!reportes_usuario_id_fkey(nombre, apellido)`)
          .order('anio', { ascending: false }).order('mes', { ascending: false })
      ]);

      const errores = [catRes.error, accRes.error, odsRes.error, munRes.error, secRes.error, areasRes.error, instRes.error, embRes.error, repRes.error].filter(Boolean);
      if (errores.length > 0) throw errores[0];

      if (catRes.data) setCategoriasDB([...catRes.data, { id: 99, nombre: 'Total Beneficiarios' } as any]);
      if (accRes.data) setAccionesDB(accRes.data);
      if (odsRes.data) setOdsDB(odsRes.data);
      if (munRes.data) setMunicipiosList(munRes.data);
      if (secRes.data) setSectoresDB(secRes.data);
      if (areasRes.data) setAreasSostenibilidadDB(areasRes.data);
      if (instRes.data) setInstitucionesDB(instRes.data);

      const embMap = new Map();
      // @ts-ignore
      embRes.data?.forEach(e => embMap.set(e.usuario_id, e.municipios?.nombre || 'Sin municipio'));

      if (repRes.data) {
        const formateados: Reporte[] = repRes.data.map((r: any) => ({
          ...r,
          nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`,
          embajador: { nombre: `${r.usuarios?.nombre || ''} ${r.usuarios?.apellido || ''}`.trim() || 'Sin Nombre' },
          municipio_nombre: embMap.get(r.usuario_id) || 'Desconocido',
          actividades: []
        }));
        setReportes(formateados);

        const unicos = new Map();
        repRes.data.forEach((r: any) => {
          const key = `${r.mes}-${r.anio}`;
          if (!unicos.has(key)) {
            unicos.set(key, { mes: r.mes, anio: r.anio, nombre: `${MESES[(r.mes || 1) - 1]} ${r.anio}` });
          }
        });
        setMesesDisponibles(Array.from(unicos.values()));
      }
    } catch (error: any) {
      console.error("Error cargando datos:", error);
      setErrorCarga(error?.message || 'No fue posible cargar los reportes.');
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (reportes.length > 0 && reporteGuardadoId && !reporteSeleccionado) {
      const reporteRecuperado = reportes.find(r => r.id === reporteGuardadoId);
      if (reporteRecuperado) seleccionarReporte(reporteRecuperado, true);
    }
  }, [reportes, reporteGuardadoId]);

  const seleccionarReporte = async (reporte: Reporte, forceRefresh = false) => {
    if (cargandoDetalle) return;

    const esMismoReporte = reporteSeleccionado?.id === reporte.id;

    if (!forceRefresh && esMismoReporte) {
      setReporteSeleccionado(null); 
      setReporteGuardadoId(null); 
      return; 
    }

    setReporteGuardadoId(reporte.id); 
    if (!esMismoReporte) { setCargandoDetalle(true); setReporteSeleccionado(null); }
    
    const strMes = String(reporte.mes).padStart(2, '0');
    const ultimoDia = new Date(reporte.anio, reporte.mes, 0).getDate();

    try {
      const { data, error } = await supabase.rpc('obtener_reporte_completo', {
        p_reporte_id: reporte.id,
        p_usuario_id: reporte.usuario_id,
        p_fecha_inicio: `${reporte.anio}-${strMes}-01`,
        p_fecha_fin: `${reporte.anio}-${strMes}-${ultimoDia}`
      });

      if (error) throw error;
      
      if (data) {
        let actividadesCompletas = data.actividades || [];

        // Generación de URLs firmadas
        const pathsToSign: string[] = [];
        actividadesCompletas.forEach((act: any) => {
          if (act.evidencias) {
            act.evidencias.forEach((ev: any) => {
              if (ev.url_archivo) pathsToSign.push(ev.url_archivo);
            });
          }
        });

        const signedUrlsMap = new Map<string, string>();
        if (pathsToSign.length > 0) {
          const { data: signedData, error: signedErr } = await supabase.storage
            .from('evidencias')
            .createSignedUrls(pathsToSign, 3600); 

          if (signedErr) throw signedErr;
          if (!signedData) throw new Error('No se pudieron generar las URLs de las evidencias.');

          signedData.forEach(item => {
            if (item.path && item.signedUrl) signedUrlsMap.set(item.path, item.signedUrl);
          });
        }

        actividadesCompletas = actividadesCompletas.map((act: any) => ({
          ...act,
          evidencias: act.evidencias?.map((ev: any) => ({
            ...ev,
            url: signedUrlsMap.get(ev.url_archivo) || ev.url || ''
          }))
        }));

        setReporteSeleccionado({ 
          ...reporte, 
          actividades: actividadesCompletas 
        });
      }

    } catch (err: any) {
      notifyWithSound("Error cargando detalles: " + err.message, "error");
    } finally {
      if (!esMismoReporte) setCargandoDetalle(false); 
    }
  };

  const procesarRevisionReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteSeleccionado) return;
    
    if (modalRevision.tipo === 'Regresar' && !modalRevision.comentario.trim()) {
      return notifyWithSound("Debes incluir un comentario indicando por qué regresas el reporte.", "warning");
    }
    
    setProcesandoRevision(true);
    try {
      const rpcName = modalRevision.tipo === 'Aprobar' ? 'aprobar_reporte' : 'rechazar_reporte';
      
      const { error } = await supabase.rpc(rpcName, {
        p_reporte_id: reporteSeleccionado.id,
        p_comentarios: modalRevision.comentario || null
      });
      
      if (error) throw error;
      
      notifyWithSound(`Reporte ${modalRevision.tipo === 'Aprobar' ? 'aprobado' : 'regresado'} correctamente`, 'success');
      setModalRevision({ visible: false, tipo: 'Aprobar', comentario: '' });
      fetchData(); 
      setReporteSeleccionado(prev => prev ? { ...prev, estado: modalRevision.tipo === 'Aprobar' ? 'Aprobado' : 'Regresado' } : null);
    } catch(err: any) {
       notifyWithSound("Error al actualizar: " + err.message, "error");
    } finally {
       setProcesandoRevision(false);
    }
  };

  const handleHabilitarMes = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesandoMes(true);
    try {
      const { data: existing } = await supabase.from('reportes').select('id').eq('mes', nuevoMes).eq('anio', nuevoAnio).limit(1);
      if (existing && existing.length > 0) return notifyWithSound("Este mes ya fue habilitado previamente.", "warning");
      
      const { data: embajadores } = await supabase.from('embajadores').select('usuario_id').eq('activo', true);
      if (embajadores && embajadores.length > 0) {
        const strMes = String(nuevoMes).padStart(2, '0');
        const ultimoDia = new Date(nuevoAnio, nuevoMes, 0).getDate();
        const inserts = embajadores.map((emb: any) => ({
          usuario_id: emb.usuario_id, mes: nuevoMes, anio: nuevoAnio,
          periodo_inicio: `${nuevoAnio}-${strMes}-01`, periodo_fin: `${nuevoAnio}-${strMes}-${ultimoDia}`,
          estado: 'Borrador'
        }));
        const { error } = await supabase.from('reportes').insert(inserts);
        if (error) throw error;
        
        notifyWithSound("Mes habilitado exitosamente.", "success");
        setShowHabilitarModal(false);
        fetchData();
      } else {
        notifyWithSound("No hay embajadores activos en el sistema.", "warning");
      }
    } catch (error: any) { notifyWithSound("Ocurrió un error: " + error.message, "error"); } 
    finally { setProcesandoMes(false); }
  };

  const handleDeshabilitarMes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesDeshabilitar) return notifyWithSound("Selecciona un mes de la lista", "warning");
    
    setProcesandoDeshabilitar(true);
    try {
      const [mesSeleccionado, anioSeleccionado] = mesDeshabilitar.split('-').map(Number);
      
      if (accionCierre === 'deshabilitar') {
        const { error } = await supabase.from('reportes')
          .update({ estado: 'Cerrado' }) // Usar 'Cerrado' en lugar de 'Deshabilitado'
          .eq('mes', mesSeleccionado)
          .eq('anio', anioSeleccionado)
          .in('estado', ['Borrador', 'Regresado']); 
        
        if (error) throw error;
        notifyWithSound("Mes deshabilitado con éxito.", "success");

      } else {
        const { error } = await supabase.from('reportes')
          .delete()
          .eq('mes', mesSeleccionado)
          .eq('anio', anioSeleccionado);
          
        if (error) throw error;
        notifyWithSound("Mes eliminado por completo.", "success");
        
        if (reporteSeleccionado && reporteSeleccionado.mes === mesSeleccionado && reporteSeleccionado.anio === anioSeleccionado) {
          setReporteSeleccionado(null);
        }
      }

      setShowDeshabilitarModal(false);
      setAccionCierre('deshabilitar'); 
      setMesDeshabilitar('');
      fetchData(); 

    } catch (error: any) { 
      notifyWithSound(`Error al ${accionCierre} el mes: ` + error.message, "error"); 
    } 
    finally { setProcesandoDeshabilitar(false); }
  };

  const toggleAnularActividad = (actividadId: number, anuladaActual: boolean) => {
    if (!anuladaActual) setModalAnular({ visible: true, actividadId, comentario: '' });
    else procesarCambioEstado(actividadId, 'Aprobada', null);
  };

  const procesarCambioEstado = async (actividadId: number, nuevoEstadoVal: string, comentario: string | null) => {
    if (!reporteSeleccionado) return;
    if (nuevoEstadoVal === 'Rechazada' && !comentario?.trim()) return notifyWithSound("Debes ingresar un motivo de anulación.", "warning");

    setProcesandoAnulacion(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const payload = {
        reporte_id: reporteSeleccionado.id, actividad_id: actividadId, estado_validacion: nuevoEstadoVal,
        comentarios_admin: comentario, validado_por_usuario_id: authData.user?.id, fecha_validacion: new Date().toISOString()
      };
      const { data: existente, error: consultaError } = await supabase
        .from('reporte_act')
        .select('id')
        .eq('reporte_id', reporteSeleccionado.id)
        .eq('actividad_id', actividadId)
        .maybeSingle();

      if (consultaError) throw consultaError;

      const { error } = existente
        ? await supabase.from('reporte_act').update(payload).eq('id', existente.id)
        : await supabase.from('reporte_act').insert(payload);

      if (error) throw error;

      setReporteSeleccionado({
        ...reporteSeleccionado,
        actividades: reporteSeleccionado.actividades.map(act => 
          act.id === actividadId ? { ...act, anulada: nuevoEstadoVal === 'Rechazada', motivo_anulacion: comentario || '' } : act
        )
      });
      notifyWithSound(nuevoEstadoVal === 'Rechazada' ? "Actividad anulada." : "Actividad restaurada.", "success");
      setModalAnular({ visible: false, actividadId: null, comentario: '' });
    } catch (error) { notifyWithSound("Error al actualizar el estado de la actividad.", "error"); } 
    finally { setProcesandoAnulacion(false); }
  };

  const abrirModalEdicion = (act: any) => {
    setIsNuevaInstitucion(false);
    const secObj: any = {};
    if (act.actividad_sectores) {
       act.actividad_sectores.forEach((s: any) => {
          secObj[s.sector_id] = { hombres: s.hombres, mujeres: s.mujeres, total: s.total };
       });
    }
    setActividadEnEdicion({ 
      ...act, 
      sectores: secObj,
      es_externa: act.es_externa || false,
      institucion_id: act.institucion_id || 0,
      nueva_institucion: ''
    });
  };

  const handleChangeSimple = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if(!actividadEnEdicion) return;
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setActividadEnEdicion({ ...actividadEnEdicion, [name]: val });
  };

  const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if(!actividadEnEdicion) return;
    const { name, value } = e.target;
    setActividadEnEdicion((prev: any) => prev ? ({ ...prev, domicilio: { ...prev.domicilio, [name]: name === 'municipio' ? Number(value) : value } }) : null);
  };

  const toggleOds = (odsId: number) => {
    setActividadEnEdicion((prev: any) => {
      if(!prev) return prev;
      const arr = prev.ods_seleccionados || [];
      if (arr.includes(odsId)) return { ...prev, ods_seleccionados: arr.filter((id: number) => id !== odsId) };
      if (arr.length >= 4) { notifyWithSound("Máximo 4 ODS permitidos.", "warning"); return prev; }
      return { ...prev, ods_seleccionados: [...arr, odsId] };
    });
  };

  const handleBeneficiarioChange = (categoriaId: number, campo: 'hombres' | 'mujeres', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setActividadEnEdicion((prev: any) => {
        if(!prev) return prev;
        const currentCat = prev.beneficiarios?.[categoriaId] || { hombres: '0', mujeres: '0', total: '0' };
        return {
          ...prev, 
          beneficiarios: { ...prev.beneficiarios, [categoriaId]: { ...currentCat, [campo]: value } }
        };
    });
  };

  const handleSectorChange = (sectorId: number, campo: 'hombres' | 'mujeres', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setActividadEnEdicion((prev: any) => {
      if (!prev) return prev;
      
      let totalCatSum = 0;
      if (prev.beneficiarios) {
        Object.entries(prev.beneficiarios).forEach(([id, val]: [string, any]) => {
          if (Number(id) !== 99) { 
            totalCatSum += parseInt(val[campo] || '0', 10);
          }
        });
      }

      let sumOtrosSectores = 0;
      if (prev.sectores) {
        Object.entries(prev.sectores).forEach(([id, val]: [string, any]) => {
          if (Number(id) !== sectorId) {
            sumOtrosSectores += parseInt(val[campo] || '0', 10);
          }
        });
      }

      const maxPermitido = Math.max(0, totalCatSum - sumOtrosSectores);
      let valStr = value;
      let valNum = parseInt(value || '0', 10);
      
      if (valNum > maxPermitido) {
        notifyWithSound(`Límite alcanzado: Solo tienes ${maxPermitido} ${campo} disponibles según tu registro de edades.`, 'warning');
        valStr = maxPermitido.toString();
      }

      const currentSec = prev.sectores?.[sectorId] || { hombres: '0', mujeres: '0', total: '0' };
      
      return { ...prev, sectores: { ...prev.sectores, [sectorId]: { ...currentSec, [campo]: valStr } } };
    });
  };

  const guardarEdicionActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteSeleccionado || !actividadEnEdicion) return;

    // Validar Institución Externa
    if (actividadEnEdicion.es_externa) {
      if (isNuevaInstitucion && !actividadEnEdicion.nueva_institucion?.trim()) {
        return notifyWithSound('Escribe el nombre de la nueva institución.', 'warning');
      } else if (!isNuevaInstitucion && (!actividadEnEdicion.institucion_id || actividadEnEdicion.institucion_id === 0)) {
        return notifyWithSound('Selecciona la institución del catálogo.', 'warning');
      }
    } else {
      if (!actividadEnEdicion.domicilio?.colonia?.trim() || !actividadEnEdicion.domicilio?.calle?.trim()) {
        return notifyWithSound('La colonia y la calle son obligatorias para actividades propias.', 'warning');
      }
    }

    let totalCatH = 0, totalCatM = 0;
    let totalSecH = 0, totalSecM = 0;

    if (!actividadEnEdicion.es_externa) {
      if (actividadEnEdicion.beneficiarios) {
        Object.entries(actividadEnEdicion.beneficiarios).forEach(([id, val]: [any, any]) => {
          if (Number(id) !== 99) {
            totalCatH += parseInt(val.hombres || '0', 10);
            totalCatM += parseInt(val.mujeres || '0', 10);
          }
        });
      }
      
      if (actividadEnEdicion.sectores) {
        Object.values(actividadEnEdicion.sectores).forEach((val: any) => {
          totalSecH += parseInt(val.hombres || '0', 10);
          totalSecM += parseInt(val.mujeres || '0', 10);
        });
      }

      if (totalSecH > totalCatH || totalSecM > totalCatM) {
        notifyWithSound("Error: La cantidad en Sectores supera el total de Beneficiarios.", "error");
        return;
      }
    }

    setGuardando(true);
    try {
      const actId = actividadEnEdicion.id;
      const tipoAccionIdInt = parseInt(actividadEnEdicion.tipo_accion_id_real || '0', 10);
      const tipoObj = accionesDB.find(a => a.id === tipoAccionIdInt);

      // Procesar Institución Externa (Buscar o Crear)
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

      const { error: errAct } = await supabase.from('actividades').update({
        nombre: actividadEnEdicion.nombre, 
        tipo_actividad: tipoObj?.nombre || null, 
        fecha_evento: actividadEnEdicion.fecha_evento,
        hora_inicio: actividadEnEdicion.hora_inicio || null, 
        hora_fin: actividadEnEdicion.hora_fin || null,
        lugar: actividadEnEdicion.lugar, 
        municipio_id: actividadEnEdicion.domicilio?.municipio || null,
        calle: actividadEnEdicion.domicilio?.calle || null, 
        colonia: actividadEnEdicion.domicilio?.colonia || null,
        rango_edad_beneficiarios: actividadEnEdicion.es_externa ? null : actividadEnEdicion.rango_edad, 
        descripcion: actividadEnEdicion.descripcion,
        es_externa: actividadEnEdicion.es_externa || false,
        institucion_id: finalInstId,
        organizador_externo: null, // Ya no lo usamos como texto libre
        fecha_actualizacion: new Date().toISOString()
      }).eq('id', actId);
      
      if (errAct) throw errAct;

      // Actualizar Relaciones
      const { error: benefDeleteError } = await supabase.from('actividad_beneficiarios').delete().eq('actividad_id', actId);
      if (benefDeleteError) throw benefDeleteError;
      if (!actividadEnEdicion.es_externa && actividadEnEdicion.beneficiarios) {
        const benefPayload = Object.entries(actividadEnEdicion.beneficiarios)
          .filter(([id]) => Number(id) !== 99)
          .map(([id, val]: [string, any]) => ({
            actividad_id: actId, categoria_id: Number(id),
            hombres: parseInt(val.hombres || '0', 10), mujeres: parseInt(val.mujeres || '0', 10),
            total: parseInt(val.hombres || '0', 10) + parseInt(val.mujeres || '0', 10),
            actualizado_en: new Date().toISOString()
          })).filter(b => b.total > 0);
        if (benefPayload.length > 0) {
          const { error: benefInsertError } = await supabase.from('actividad_beneficiarios').insert(benefPayload);
          if (benefInsertError) throw benefInsertError;
        }
      }

      const { error: sectorDeleteError } = await supabase.from('actividad_sectores').delete().eq('actividad_id', actId);
      if (sectorDeleteError) throw sectorDeleteError;
      if (!actividadEnEdicion.es_externa && actividadEnEdicion.sectores) {
        const secPayload = Object.entries(actividadEnEdicion.sectores)
          .map(([id, val]: [string, any]) => ({
            actividad_id: actId, sector_id: Number(id),
            hombres: parseInt(val.hombres || '0', 10),
            mujeres: parseInt(val.mujeres || '0', 10),
            total: parseInt(val.hombres || '0', 10) + parseInt(val.mujeres || '0', 10)
          })).filter(s => s.total > 0);
        if (secPayload.length > 0) {
          const { error: sectorInsertError } = await supabase.from('actividad_sectores').insert(secPayload);
          if (sectorInsertError) throw sectorInsertError;
        }
      }

      const { error: accionDeleteError } = await supabase.from('actividad_acciones').delete().eq('actividad_id', actId);
      if (accionDeleteError) throw accionDeleteError;
      if (!isNaN(tipoAccionIdInt) && tipoAccionIdInt > 0) {
        const { error: accionInsertError } = await supabase.from('actividad_acciones').insert({ actividad_id: actId, tipo_accion_id: tipoAccionIdInt, cantidad: 1, creado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() });
        if (accionInsertError) throw accionInsertError;
      }

      const areasSeleccionadas = new Set<number>();
      const normalizarArea = (nombre: string) => nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const areaEconomica = areasSostenibilidadDB.find((area) => /econ/.test(normalizarArea(area.nombre)));
      const areaSocial = areasSostenibilidadDB.find((area) => /social|sociedad/.test(normalizarArea(area.nombre)));
      const areaAmbiental = areasSostenibilidadDB.find((area) => /ambient|biosfer/.test(normalizarArea(area.nombre)));
      actividadEnEdicion.ods_seleccionados?.forEach((odsId: number) => {
        const cat = odsDB.find(o => o.id === odsId)?.categoria_sostenibilidad?.toLowerCase() || '';
        if (cat.includes('econ') && areaEconomica) areasSeleccionadas.add(areaEconomica.id);
        if ((cat.includes('social') || cat.includes('sociedad')) && areaSocial) areasSeleccionadas.add(areaSocial.id);
        if ((cat.includes('ambient') || cat.includes('biosfera')) && areaAmbiental) areasSeleccionadas.add(areaAmbiental.id);
        if (cat.includes('transversal') || cat.includes('alianza')) areasSostenibilidadDB.forEach((area) => areasSeleccionadas.add(area.id));
      });

      const { error: sostenibilidadDeleteError } = await supabase.from('actividad_sostenibilidad').delete().eq('actividad_id', actId);
      if (sostenibilidadDeleteError) throw sostenibilidadDeleteError;
      if (areasSeleccionadas.size > 0) {
        const { error: sostenibilidadInsertError } = await supabase.from('actividad_sostenibilidad').insert(Array.from(areasSeleccionadas).map(areaId => ({ actividad_id: actId, area_id: areaId, creado_en: new Date().toISOString() })));
        if (sostenibilidadInsertError) throw sostenibilidadInsertError;
      }

      const { error: odsDeleteError } = await supabase.from('actividad_ods').delete().eq('actividad_id', actId);
      if (odsDeleteError) throw odsDeleteError;
      if (actividadEnEdicion.ods_seleccionados && actividadEnEdicion.ods_seleccionados.length > 0) {
        const { error: odsInsertError } = await supabase.from('actividad_ods').insert(actividadEnEdicion.ods_seleccionados.map((odsId: number, idx: number) => ({ actividad_id: actId, ods_id: odsId, es_principal: idx === 0 })));
        if (odsInsertError) throw odsInsertError;
      }

      notifyWithSound('Actividad modificada exitosamente', 'success');
      setActividadEnEdicion(null);
      await seleccionarReporte(reporteSeleccionado, true);
      
    } catch (error: any) { 
      notifyWithSound('Error al guardar: ' + error.message, 'error'); 
    } 
    finally { setGuardando(false); }
  };

  const snapshotParaPDF = useMemo(() => {
    if (!reporteSeleccionado) return null;
    return {
      ...reporteSeleccionado,
      actividades: ocultarAnuladasPDF
        ? (reporteSeleccionado.actividades || []).filter((a) => !a.anulada)
        : (reporteSeleccionado.actividades || []),
    };
  }, [reporteSeleccionado, ocultarAnuladasPDF]);

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

  const reportesFiltrados = reportes.filter(r => {
    return (filtroEstado === 'Todos' || r.estado === filtroEstado) &&
           (filtroMes === 'Todos' || `${r.mes}-${r.anio}` === filtroMes) &&
           (filtroMunicipio === 'Todos' || r.municipio_nombre === filtroMunicipio);
  });

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-100px)] min-h-screen lg:min-h-0 relative p-2 md:p-4 bg-gray-50/50">
      {cargandoDatos && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
          <Loader2 className="animate-spin" size={18} /> Cargando reportes y catálogos...
        </div>
      )}
      {errorCarga && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{errorCarga}</span>
          <button type="button" onClick={fetchData} className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-bold hover:bg-red-100">Reintentar</button>
        </div>
      )}
      
      {/* ================= MODAL REVISIÓN GLOBAL REPORTE ================= */}
      {modalRevision.visible && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className={`font-black text-lg flex items-center gap-2 ${modalRevision.tipo === 'Aprobar' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {modalRevision.tipo === 'Aprobar' ? <CheckCircle2 size={20}/> : <CornerUpLeft size={20}/>}
                {modalRevision.tipo === 'Aprobar' ? 'Aprobar Expediente' : 'Regresar Expediente'}
              </h3>
              <button onClick={() => setModalRevision({ visible: false, tipo: 'Aprobar', comentario: '' })} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={procesarRevisionReporte} className="p-4 md:p-6 space-y-4">
              {modalRevision.tipo === 'Regresar' ? (
                <>
                  <p className="text-sm text-gray-600">Por favor, indica el motivo por el cual regresas este reporte. El embajador podrá editarlo y volver a enviarlo.</p>
                  <textarea required autoFocus rows={4} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none shadow-sm" placeholder="Ej. Faltan evidencias en la actividad 2..." value={modalRevision.comentario} onChange={e => setModalRevision({ ...modalRevision, comentario: e.target.value })} />
                </>
              ) : (
                <p className="text-sm text-gray-600">¿Confirmas que el expediente cumple con todos los requisitos y evidencias? Una vez aprobado, será catalogado como válido en el sistema.</p>
              )}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button type="button" onClick={() => setModalRevision({ visible: false, tipo: 'Aprobar', comentario: '' })} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
                <button type="submit" disabled={procesandoRevision} className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-white disabled:opacity-70 ${modalRevision.tipo === 'Aprobar' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                  {procesandoRevision ? <Loader2 className="animate-spin" size={16} /> : null}
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL ANULACIÓN ACTIVIDAD ================= */}
      {modalAnular.visible && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><AlertTriangle size={20} className="text-red-600" /> Motivo de anulación</h3>
              <button onClick={() => setModalAnular({ visible: false, actividadId: null, comentario: '' })} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <textarea autoFocus rows={4} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none shadow-sm" placeholder="Ej. Faltan evidencias claras..." value={modalAnular.comentario} onChange={e => setModalAnular({ ...modalAnular, comentario: e.target.value })} />
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button onClick={() => setModalAnular({ visible: false, actividadId: null, comentario: '' })} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
                <button disabled={procesandoAnulacion} onClick={() => procesarCambioEstado(modalAnular.actividadId!, 'Rechazada', modalAnular.comentario)} className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-70">
                  {procesandoAnulacion ? <Loader2 className="animate-spin" size={16} /> : null}
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL EDICIÓN ACTIVIDAD ================= */}
      {actividadEnEdicion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] mx-1 sm:mx-2 flex flex-col">
            <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
              <h3 className="font-black text-lg sm:text-xl text-gray-800 flex items-center gap-2"><Edit2 size={20} className="text-[#00689D]"/> Editar Actividad</h3>
              <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300">
              <form id="form-edicion-admin" onSubmit={guardarEdicionActividad} className="space-y-8">
                
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
                  
                  {/* SECCIÓN INSTITUCIÓN EXTERNA */}
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
                      <div className="mt-4 ml-6 p-4 bg-white border border-purple-100 rounded-lg shadow-sm">
                        <label className="block text-xs font-bold text-gray-600 mb-2">Institución Organizadora <span className="text-red-500">*</span></label>
                        <div className="flex gap-4 mb-3">
                          <label className="flex items-center gap-1 text-sm font-medium cursor-pointer text-gray-700">
                            <input type="radio" checked={!isNuevaInstitucion} onChange={() => setIsNuevaInstitucion(false)} className="text-purple-600" />
                            Seleccionar existente
                          </label>
                          <label className="flex items-center gap-1 text-sm font-medium cursor-pointer text-gray-700">
                            <input type="radio" checked={isNuevaInstitucion} onChange={() => setIsNuevaInstitucion(true)} className="text-purple-600" />
                            Registrar nueva
                          </label>
                        </div>
                        
                        {!isNuevaInstitucion ? (
                          <select 
                            required name="institucion_id" value={actividadEnEdicion.institucion_id || ''} 
                            onChange={(e) => setActividadEnEdicion({ ...actividadEnEdicion, institucion_id: Number(e.target.value)})} 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-purple-500"
                          >
                            <option value="">-- Selecciona del catálogo --</option>
                            {institucionesDB.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                          </select>
                        ) : (
                          <input 
                            required type="text" name="nueva_institucion" value={actividadEnEdicion.nueva_institucion || ''} 
                            onChange={handleChangeSimple} placeholder="Escribe el nombre de la institución..."
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-purple-500"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Nombre</label>
                      <input required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Acción Principal</label>
                      <select name="tipo_accion_id_real" value={actividadEnEdicion.tipo_accion_id_real || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]">
                        <option value="">-- Selecciona --</option>
                        {accionesDB.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label><input type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('T')[0] || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Inicio</label><input type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio?.slice(0,5) || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Fin</label><input type="time" name="hora_fin" value={actividadEnEdicion.hora_fin?.slice(0,5) || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
                  </div>

                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 mt-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS <span className="font-normal text-gray-500">(Máximo 4)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {odsDB.map(ods => {
                        const isSelected = actividadEnEdicion.ods_seleccionados?.includes(ods.id);
                        const isPrincipal = actividadEnEdicion.ods_seleccionados?.[0] === ods.id;
                        return (
                          <button key={ods.id} type="button" onClick={() => toggleOds(ods.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${isSelected ? (isPrincipal ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-blue-100 text-blue-800 border-blue-300') : 'bg-white text-gray-500 hover:border-blue-300'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? (isPrincipal ? 'bg-white text-[#00689D]' : 'bg-blue-200 text-blue-800') : 'bg-gray-100 text-gray-500'}`}>{ods.numero}</span>
                            {ods.nombre} {isPrincipal && <span className="font-normal opacity-80">(Principal)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Ubicación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Lugar <span className="text-red-500">*</span></label><input required type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Municipio <span className="text-red-500">*</span></label><select required name="municipio" value={actividadEnEdicion.domicilio?.municipio || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"><option value="">-- Selecciona --</option>{municipiosList.map(mun => <option key={mun.id} value={mun.id}>{mun.nombre}</option>)}</select></div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Colonia {!actividadEnEdicion.es_externa && <span className="text-red-500">*</span>}</label>
                      <input required={!actividadEnEdicion.es_externa} type="text" name="colonia" value={actividadEnEdicion.domicilio?.colonia || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Calle {!actividadEnEdicion.es_externa && <span className="text-red-500">*</span>}</label>
                      <input required={!actividadEnEdicion.es_externa} type="text" name="calle" value={actividadEnEdicion.domicilio?.calle || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"/>
                    </div>
                  </div>
                </div>

                {/* SOLO MUESTRA BENEFICIARIOS SI NO ES EXTERNA */}
                {!actividadEnEdicion.es_externa && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      
                      <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 flex justify-between">
                        1. Beneficiarios (Edades)
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
                              disabled={esFilaTotal}
                              className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
                            />
                            
                            <input 
                              type="number" min="0" placeholder="M" value={strM} 
                              onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} 
                              disabled={esFilaTotal}
                              className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 flex justify-between">
                        2. Sectores Vulnerables
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
                              className="w-1/5 text-center border rounded p-1 text-xs border-gray-300 focus:outline-none focus:border-[#00689D] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            
                            <input 
                              type="number" min="0" placeholder="M" value={strM} 
                              onChange={(e) => handleSectorChange(sec.id, 'mujeres', e.target.value)} 
                              className="w-1/5 text-center border rounded p-1 text-xs border-gray-300 focus:outline-none focus:border-[#00689D] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        );
                      })}
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2 mt-6">Rango de Edad Promedio <span className="text-red-500">*</span></h4>
                        <input required type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} placeholder="Ej: 15 a 18 años" className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D] mt-2"/>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción de la Actividad <span className="text-red-500">*</span></h4>
                  <textarea required name="descripcion" rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none" placeholder="Describe brevemente lo que hicieron..."/>
                </div>

              </form>
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setActividadEnEdicion(null)} className="w-full sm:flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button form="form-edicion-admin" type="submit" disabled={guardando} className="w-full sm:flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] flex items-center justify-center gap-2 shadow-md disabled:opacity-70 transition-colors">
                {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar Cambios</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CERRAR MES ================= */}
      {showDeshabilitarModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><Lock size={20} className="text-red-600"/> Gestión de Periodo</h3>
              <button onClick={() => setShowDeshabilitarModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleDeshabilitarMes} className="p-4 md:p-6 space-y-5">
              
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">¿Qué deseas hacer?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccionCierre('deshabilitar')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${accionCierre === 'deshabilitar' ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className={`text-sm font-bold ${accionCierre === 'deshabilitar' ? 'text-amber-700' : 'text-gray-700'}`}>Cerrar Mes</span>
                    <span className="text-[10px] text-gray-500">Nadie podrá editar borradores.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccionCierre('eliminar')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${accionCierre === 'eliminar' ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className={`text-sm font-bold ${accionCierre === 'eliminar' ? 'text-red-700' : 'text-gray-700'}`}>Eliminar al 100%</span>
                    <span className="text-[10px] text-gray-500">Borra todos los registros.</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-600">
                  {accionCierre === 'deshabilitar' 
                    ? 'Esta acción bloqueará todos los reportes "Borrador" o "Regresados" pasándolos a estado "Cerrado".' 
                    : 'Esta acción ELIMINARÁ DE FORMA PERMANENTE todos los reportes del periodo seleccionado.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Seleccionar Periodo</label>
                <select required className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-red-500 outline-none bg-white" value={mesDeshabilitar} onChange={e => setMesDeshabilitar(e.target.value)}>
                  <option value="" disabled>-- Selecciona un periodo --</option>
                  {mesesDisponibles.map((m, i) => <option key={i} value={`${m.mes}-${m.anio}`}>{m.nombre}</option>)}
                </select>
              </div>
              
              <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" onClick={() => setShowDeshabilitarModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
                <button type="submit" disabled={procesandoDeshabilitar} className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-white disabled:opacity-70 transition-colors ${accionCierre === 'eliminar' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                  {procesandoDeshabilitar ? <Loader2 className="animate-spin" size={16} /> : null}
                  {accionCierre === 'eliminar' ? 'Confirmar Eliminación' : 'Confirmar Cierre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL HABILITAR MES ================= */}
      {showHabilitarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><Calendar size={20} className="text-[#00689D]"/> Habilitar Reportes</h3>
              <button onClick={() => setShowHabilitarModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleHabilitarMes} className="p-4 md:p-6 space-y-4">
              <p className="text-sm text-gray-600">Creará registros vacíos para todos los embajadores activos.</p>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Mes</label><select required className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none" value={nuevoMes} onChange={e => setNuevoMes(Number(e.target.value))}>{MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}</select></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Año</label><input type="number" required className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none" value={nuevoAnio} onChange={e => setNuevoAnio(Number(e.target.value))} /></div>
              <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" onClick={() => setShowHabilitarModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300">Cancelar</button>
                <button type="submit" disabled={procesandoMes} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white bg-[#00689D] disabled:opacity-70">
                  {procesandoMes ? <Loader2 className="animate-spin" size={16} /> : null}
                  Habilitar Mes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CABECERA Y PANEL PRINCIPAL ============ */}
      <div className="mb-4 lg:mb-6 bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2"><Inbox className="text-[#00689D]"/> Bandeja de Auditoría</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Revisa los expedientes enviados por los embajadores</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => setShowDeshabilitarModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 border border-red-200"><Lock size={18} /> Cerrar Mes</button>
          <button onClick={() => setShowHabilitarModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#00527A]"><Plus size={18} /> Habilitar Nuevo Mes</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 min-h-0 overflow-y-auto lg:overflow-hidden pb-10 lg:pb-0">
        
        {/* === IZQUIERDA: LISTA Y FILTROS === */}
        <div className="w-full lg:w-1/3 xl:w-1/4 h-[450px] lg:h-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-black text-gray-700">Expedientes</h3>
            <span className="text-xs bg-[#00689D] text-white px-2 py-0.5 rounded-full font-bold">{reportesFiltrados.length}</span>
          </div>

          <div className="border-b border-gray-100 bg-white flex flex-col shrink-0">
            <div className="flex p-2 gap-1 border-b border-gray-100 bg-gray-50/50">
              <button onClick={() => setFiltroEstado('Todos')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Todos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Todos</button>
              <button onClick={() => setFiltroEstado('Enviado')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Enviado' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Enviados</button>
              <button onClick={() => setFiltroEstado('Borrador')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Borrador' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Borrador</button>
            </div>
            <div className="p-3 space-y-3 bg-white">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Filtrar por Mes</label>
                  <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded p-1.5 outline-none focus:border-[#00689D]">
                    <option value="Todos">Todos</option>
                    {mesesDisponibles.map((m, i) => <option key={i} value={`${m.mes}-${m.anio}`}>{m.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Municipio</label>
                  <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)} className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded p-1.5 outline-none focus:border-[#00689D]">
                    <option value="Todos">Todos</option>
                    {municipiosList.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {reportesFiltrados.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm flex flex-col items-center justify-center h-full"><Filter size={32} className="mb-2 opacity-20"/> No hay expedientes.</div>
            ) : (
              reportesFiltrados.map(reporte => (
                <div key={reporte.id} onClick={() => seleccionarReporte(reporte)} className={`p-4 border-b cursor-pointer transition-colors ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-black uppercase text-gray-400">{reporte.nombre_mes}</p>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${reporte.estado === 'Enviado' ? 'bg-emerald-100 text-emerald-700' : reporte.estado === 'Aprobado' ? 'bg-green-600 text-white' : reporte.estado === 'Regresado' ? 'bg-amber-100 text-amber-700' : reporte.estado === 'Cerrado' ? 'bg-gray-300 text-gray-800' : 'bg-gray-200 text-gray-600'}`}>
                      {reporte.estado}
                    </span>
                  </div>
                  <p className={`text-sm ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold text-gray-800'}`}>{reporte.embajador.nombre}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={10}/> {reporte.municipio_nombre}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* === DERECHA: DETALLE Y PDF === */}
        {reporteSeleccionado ? (
          <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-w-0">
            <div className="p-3 lg:p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
              <h2 className="text-base lg:text-lg font-black break-words w-full"><FileText className="inline text-[#00689D] mr-2"/> {reporteSeleccionado.nombre_mes} - {reporteSeleccionado.embajador.nombre}</h2>
              <button onClick={() => seleccionarReporte(reporteSeleccionado, true)} className="text-[#00689D] flex w-full sm:w-auto justify-center items-center gap-1.5 text-xs font-bold bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100"><RefreshCw size={14}/> Refrescar</button>
            </div>
            
            {categoriasDB.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                <Loader2 size={48} className="animate-spin text-[#00689D] mb-4" />
                <p className="font-bold text-gray-600">Cargando información...</p>
                <p className="text-xs mt-1">Conectando con la base de datos</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-y-auto lg:overflow-hidden relative">
                {/* VISTA PARA COMPUTADORAS */}
                <div className="hidden md:flex flex-1 min-w-0 h-full bg-gray-100 relative items-center justify-center border-b border-gray-200 xl:border-b-0 order-2 xl:order-1 overflow-hidden">
                  {snapshotParaPDF ? (
                    <VisorPDFAislado document={pdfDocument} />
                  ) : (
                    <div className="text-gray-400 text-sm">Esperando datos...</div>
                  )}
                </div>

                {/* VISTA PARA CELULARES */}
                <div className="md:hidden flex flex-col items-center justify-center w-full min-h-[420px] bg-gray-100 p-6 text-center order-2 xl:order-1">
                  <FileText size={64} className="text-gray-300 mb-4" />
                  <h3 className="font-bold text-gray-700 mb-2">Previsualización no disponible en móviles</h3>
                  <p className="text-xs text-gray-500 mb-6">Descarga el PDF para verlo en el visor de tu dispositivo.</p>
                  
                  {pdfDocument && (
                    <PDFDownloadLink 
                      document={pdfDocument} 
                      fileName={`Reporte-${reporteSeleccionado.nombre_mes}-${reporteSeleccionado.embajador.nombre}.pdf`}
                      className="bg-[#00689D] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#00527A] flex items-center gap-2 transition-colors"
                    >
                      {({ loading }) => (
                        loading ? (
                          <><Loader2 size={18} className="animate-spin" /> Procesando...</>
                        ) : (
                          <><FileText size={18} /> Descargar Reporte PDF</>
                        )
                      )}
                    </PDFDownloadLink>
                  )}
                </div>

                {/* === PANEL DE OPCIONES DERECHO === */}
                <div className="w-full xl:w-80 bg-gray-50 border-b xl:border-b-0 xl:border-l border-gray-200 flex flex-col shrink-0 order-1 xl:order-2">
                  
                  {reporteSeleccionado.estado === 'Enviado' && (
                    <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-2">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Revisión del Expediente</h4>
                      <button onClick={() => setModalRevision({ visible: true, tipo: 'Aprobar', comentario: '' })} className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm">
                        <CheckCircle2 size={18} /> Aprobar Reporte
                      </button>
                      <button onClick={() => setModalRevision({ visible: true, tipo: 'Regresar', comentario: '' })} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm">
                        <CornerUpLeft size={18} /> Regresar al Embajador
                      </button>
                    </div>
                  )}

                  <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Settings2 size={16}/><span className="text-xs font-bold">Ocultar anuladas en PDF</span></div>
                    <button onClick={() => setOcultarAnuladasPDF(!ocultarAnuladasPDF)} className={`w-10 h-5 rounded-full relative flex items-center ${ocultarAnuladasPDF ? 'bg-[#00689D]' : 'bg-gray-300'}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-all ${ocultarAnuladasPDF ? 'left-[22px]' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] xl:max-h-none">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Edición de Actividades</h4>
                    {reporteSeleccionado.actividades && reporteSeleccionado.actividades.length === 0 ? (
                      <div className="text-center text-sm text-gray-400 mt-4">Sin actividades en este reporte.</div>
                    ) : (
                      reporteSeleccionado.actividades?.map((act: Actividad, idx: number) => (
                        <div key={act.id} className={`p-3 rounded-xl border ${act.anulada ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                          
                          {act.es_externa && <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold uppercase mb-1 inline-block">Institucional</span>}
                          
                          <p className={`text-sm font-bold truncate mb-3 ${act.anulada ? 'line-through text-red-600' : ''}`}>{idx + 1}. {act.nombre}</p>
                          <div className="flex gap-2">
                            <button onClick={() => abrirModalEdicion(act)} title="Editar actividad" className="flex items-center justify-center px-3 py-1.5 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700"><Edit2 size={16} /></button>
                            <button onClick={() => toggleAnularActividad(act.id as number, act.anulada)} className={`flex-1 flex justify-center items-center py-1.5 text-[10px] sm:text-xs font-bold rounded-lg border transition-colors ${act.anulada ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                              {act.anulada ? 'Restaurar' : 'Anular Actividad'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {cargandoDetalle && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
                      <Loader2 size={18} className="animate-spin text-[#00689D]" />
                      <span className="text-sm font-bold text-gray-700">Actualizando expediente...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full lg:flex-1 bg-white rounded-2xl flex items-center justify-center flex-col text-gray-400 py-12 lg:py-0 shadow-sm border border-gray-100">
            <FileText size={48} className="mb-4 opacity-20"/>
            <p className="font-bold">Selecciona un expediente de la lista</p>
          </div>
        )}
      </div>
    </div>
  );
}