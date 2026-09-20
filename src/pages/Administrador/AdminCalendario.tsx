// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { 
//   format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
//   startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay,
//   isBefore, startOfDay
// } from 'date-fns';
// import { es } from 'date-fns/locale'; 
// import { 
//   ChevronLeft, ChevronRight, MapPin, Clock, Calendar as CalendarIcon, 
//   Info, X, LayoutGrid, List as ListIcon, Columns, User, Users, Edit2, 
//   PlusCircle, Target, Activity as ActivityIcon, Trash2, Ban, AlertCircle, Loader2,
//   FileText, Filter, Archive, Save, Globe
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { supabase } from '../../lib/supabase';
// import { useAuth } from '../../hooks/useAuth';
// import { guardarActividadCalendario } from '../../lib/guardarActividadCalendario';

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// // ==========================================
// // INTERFACES
// // ==========================================
// interface Ods { id: number; nombre: string; numero: number; }
// interface Catalogo { id: number; nombre: string; }
// interface Actividad {
//   id: number;
//   nombre: string;
//   descripcion: string;
//   fecha_evento: string;
//   hora_inicio: string;
//   hora_fin: string;
//   municipio_id: number | null;
//   lugar: string;
//   direccion: string;
//   calle: string;
//   colonia: string;
//   estado: string;
//   creado_por_usuario_id: string;
//   municipios: { nombre: string } | null;
//   creador: { nombre: string; apellido: string };
//   actividad_asistentes: { usuario_id: string; usuarios: { nombre: string; apellido: string } }[];
//   actividad_ods: { ods_id: number; es_principal?: boolean; ods: { numero: number; nombre: string } }[];
//   actividad_acciones: { tipo_accion_id: number; cantidad: number; tipos_accion: { nombre: string } }[];
// }

// type ViewMode = 'mes' | 'semana' | 'dia';
// type MainTab = 'calendario' | 'lista';

// const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
//   const audio = new Audio('/notification.mp3');
//   audio.volume = 0.5;
//   audio.play().catch(err => console.log('Audio bloqueado:', err));
//   const options = { position: 'bottom-right' as const };
//   switch (type) {
//     case 'success': toast.success(message, options); break;
//     case 'error': toast.error(message, options); break;
//     case 'warning': toast.warning(message, options); break;
//     default: toast.info(message, options);
//   }
// };

// export default function AdminAgenda() {
//   const { usuarioDatos } = useAuth();
//   const location = useLocation(); 
  
//   // ==========================================
//   // ESTADOS DE VISTA Y DATOS
//   // ==========================================
//   const [mainTab, setMainTab] = useState<MainTab>('calendario');
//   const [viewMode, setViewMode] = useState<ViewMode>('mes');
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [actividades, setActividades] = useState<Actividad[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   // Catálogos
//   const [municipiosDB, setMunicipiosDB] = useState<Catalogo[]>([]);
//   const [tiposAccionDB, setTiposAccionDB] = useState<Catalogo[]>([]);
//   const [odsDB, setOdsDB] = useState<Ods[]>([]);

//   // Filtros
//   const [filtroMunicipioGlobal, setFiltroMunicipioGlobal] = useState<string>('todos');
//   const [filterEstado, setFilterEstado] = useState('Todos');
//   const [filterFecha, setFilterFecha] = useState('Todos');

//   // ==========================================
//   // ESTADOS DEL DRAWER (Panel Lateral)
//   // ==========================================
//   const [drawerState, setDrawerState] = useState<{
//     isOpen: boolean;
//     mode: 'detalles' | 'formulario';
//   }>({ isOpen: false, mode: 'detalles' });

//   const [eventoSeleccionado, setEventoSeleccionado] = useState<Actividad | null>(null);
  
//   // Formulario
//   const [isSaving, setIsSaving] = useState(false);
//   const [formData, setFormData] = useState({
//     nombre: '', descripcion: '', tipo_accion_id: 0, fecha_evento: '', hora_inicio: '', hora_fin: '',
//     municipio_id: 0, lugar: '', calle: '', colonia: '', direccion: '', estado: 'Programada'
//   });
//   const [odsSeleccionados, setOdsSeleccionados] = useState<number[]>([]);
//   const [editingId, setEditingId] = useState<number | null>(null);

//   // ==========================================
//   // ESTADOS DEL MODAL UNIFICADO (Shadcn)
//   // ==========================================
//   const [dialogoConfirmacion, setDialogoConfirmacion] = useState<{
//     isOpen: boolean;
//     tipo: 'eliminar' | 'cancelar_evento' | 'descartar_form' | null;
//     idActividad: number | null;
//   }>({ isOpen: false, tipo: null, idActividad: null });
//   const [isProcessingAction, setIsProcessingAction] = useState(false);

//   const [espacioSuperior, setEspacioSuperior] = useState(88);

//   // ==========================================
//   // EFECTOS (Scroll y Bloqueo de body)
//   // ==========================================
//   useEffect(() => {
//     const calcularEspacio = () => {
//       const headerElement = document.querySelector('header');
//       const alturaHeader = headerElement ? headerElement.offsetHeight : 88; 
//       const scrollActual = window.scrollY;
//       setEspacioSuperior(scrollActual >= alturaHeader ? 0 : alturaHeader - scrollActual);
//     };
//     window.addEventListener('scroll', calcularEspacio);
//     setTimeout(calcularEspacio, 50);
//     return () => window.removeEventListener('scroll', calcularEspacio);
//   }, []);

//   useEffect(() => {
//     if (drawerState.isOpen || dialogoConfirmacion.isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'auto';
//     }
//     return () => { document.body.style.overflow = 'auto'; };
//   }, [drawerState.isOpen, dialogoConfirmacion.isOpen]);

//   // ==========================================
//   // CARGA CENTRALIZADA DE DATOS
//   // ==========================================
//   const fetchDatosBase = async () => {
//     if (!usuarioDatos?.id) return;
//     setLoading(true);
//     try {
//       // Obtener Catálogos (Solo una vez)
//       if (municipiosDB.length === 0) {
//         const [resMun, resOds, resTipos] = await Promise.all([
//           supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
//           supabase.from('ods').select('id, nombre, numero').eq('activo', true).order('numero', { ascending: true }),
//           supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('nombre')
//         ]);
//         if (resMun.data) setMunicipiosDB(resMun.data);
//         if (resOds.data) setOdsDB(resOds.data);
//         if (resTipos.data) setTiposAccionDB(resTipos.data);
//       }

//       // Obtener Todas las Actividades (con base en el filtro de municipio global)
//       let query = supabase
//         .from('actividades')
//         .select(`
//           id, nombre, descripcion, fecha_evento, hora_inicio, hora_fin, lugar, direccion, calle, colonia, municipio_id, estado, creado_por_usuario_id,
//           municipios(nombre), 
//           creador:usuarios!actividades_creado_por_usuario_id_fkey(nombre, apellido),
//           actividad_asistentes(usuario_id, usuarios(nombre, apellido)), 
//           actividad_ods(ods_id, es_principal, ods(numero, nombre)), 
//           actividad_acciones(tipo_accion_id, cantidad, tipos_accion(nombre))
//         `)
//         .is('fecha_eliminacion', null);

//       if (filtroMunicipioGlobal !== 'todos') {
//         query = query.or(`municipio_id.eq.${filtroMunicipioGlobal},municipio_id.is.null`);
//       }

//       const { data: acts, error } = await query;
//       if (error) throw error;
      
//       // Admin solo ve sus propios borradores (no los de los embajadores)
//       const actividadesPermitidas = (acts as any[]).filter(a => a.estado !== 'Borrador' || a.creado_por_usuario_id === usuarioDatos.id);
//       setActividades(actividadesPermitidas || []);

//       if (drawerState.isOpen && drawerState.mode === 'detalles' && eventoSeleccionado) {
//         const eventoActualizado = actividadesPermitidas.find(a => a.id === eventoSeleccionado.id);
//         setEventoSeleccionado(eventoActualizado || eventoSeleccionado);
//       }
//     } catch (error) { console.error('Error fetching data:', error); } 
//     finally { setLoading(false); }
//   };

//   useEffect(() => { fetchDatosBase(); }, [usuarioDatos, filtroMunicipioGlobal, location.key]);

//   // ==========================================
//   // FUNCIONES DE FECHAS Y ESTILOS
//   // ==========================================
//   const getFechaLocal = (fechaString: string) => {
//     if (!fechaString) return new Date();
//     const partes = fechaString.split('T')[0].split('-');
//     return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
//   };

//   const formatearFechaLarga = (fechaString: string) => {
//     if (!fechaString) return 'Fecha sin definir';
//     return `${format(getFechaLocal(fechaString), 'EEEE, d', { locale: es })} de ${format(getFechaLocal(fechaString), 'MMMM yyyy', { locale: es })}`;
//   };

//   const formatearFechaCorta = (fechaStr: string) => {
//     if (!fechaStr) return '';
//     const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
//     const [year, month, day] = fechaStr.split('T')[0].split('-');
//     return `${Number(day)} de ${meses[Number(month) - 1]} ${year}`;
//   };

//   const getActividadesDelDia = (fechaCelda: Date) => {
//     return actividades.filter(act => {
//       if (!act.fecha_evento) return false;
//       return isSameDay(getFechaLocal(act.fecha_evento), fechaCelda);
//     }).sort((a, b) => (a.hora_inicio > b.hora_inicio ? 1 : -1));
//   };

//   const obtenerEstilosUI = (act: Actividad) => {
//     const esCreador = act.creado_por_usuario_id === usuarioDatos?.id;

//     if (act.estado === 'Cancelada') {
//       return {
//         mes: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-900 cursor-pointer hover:scale-[1.02] transform transition-transform',
//         semana: 'bg-red-50 border-red-400',
//         diaMain: 'border-red-200 bg-red-50/50', diaHora: 'bg-red-50 text-red-700 border-red-200', drawerHeader: 'bg-red-600'
//       };
//     } else if (act.estado === 'Borrador') {
//       return {
//         mes: 'bg-amber-50 text-amber-700 border border-amber-300 border-dashed hover:bg-amber-100 cursor-pointer hover:scale-[1.02] transform transition-transform',
//         semana: 'bg-amber-50/50 border-amber-400 border-dashed',
//         diaMain: 'border-amber-200 border-dashed bg-white', diaHora: 'bg-amber-50 text-amber-700 border-amber-200 border-dashed', drawerHeader: 'bg-amber-600'
//       };
//     } else if (esCreador) {
//       return {
//         mes: 'bg-blue-50 text-[#00689D] border border-blue-200 hover:bg-[#00689D] hover:text-white cursor-pointer hover:scale-[1.02] transform transition-transform',
//         semana: 'bg-white border-[#00689D]',
//         diaMain: 'border-blue-100 bg-white', diaHora: 'bg-blue-50 text-[#00689D] border-blue-100', drawerHeader: 'bg-[#00689D]'
//       };
//     } else {
//       return {
//         mes: 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 cursor-pointer hover:scale-[1.02] transform transition-transform',
//         semana: 'bg-white border-slate-300',
//         diaMain: 'border-slate-200 bg-white opacity-90 hover:opacity-100', diaHora: 'bg-slate-50 text-slate-500 border-slate-200', drawerHeader: 'bg-slate-700'
//       };
//     }
//   };

//   // ==========================================
//   // HANDLERS DEL DRAWER Y FORMULARIO
//   // ==========================================
//   const abrirDetalles = (act: Actividad) => {
//     setEventoSeleccionado(act);
//     setDrawerState({ isOpen: true, mode: 'detalles' });
//   };

//   const abrirNuevoFormulario = () => {
//     setEditingId(null);
//     setFormData({
//       nombre: '', descripcion: '', tipo_accion_id: 0, fecha_evento: '', hora_inicio: '', hora_fin: '',
//       municipio_id: 0, lugar: '', calle: '', colonia: '', direccion: '', estado: 'Programada'
//     });
//     setOdsSeleccionados([]);
//     setDrawerState({ isOpen: true, mode: 'formulario' });
//   };

//   const prepararEdicion = (act: Actividad) => {
//     setFormData({
//       nombre: act.nombre || '', descripcion: act.descripcion || '',
//       tipo_accion_id: act.actividad_acciones?.[0]?.tipo_accion_id || 0,
//       fecha_evento: act.fecha_evento ? act.fecha_evento.split('T')[0] : '',
//       hora_inicio: act.hora_inicio ? act.hora_inicio.substring(0, 5) : '',
//       hora_fin: act.hora_fin ? act.hora_fin.substring(0, 5) : '',
//       municipio_id: act.municipio_id || 0, lugar: act.lugar || '',
//       calle: act.calle || '', colonia: act.colonia || '', direccion: act.direccion || '',
//       estado: act.estado || 'Programada'
//     });
//     setOdsSeleccionados(act.actividad_ods ? act.actividad_ods.map((o: any) => o.ods_id) : []);
//     setEditingId(act.id);
//     setDrawerState({ isOpen: true, mode: 'formulario' });
//   };

//   const cerrarDrawerFormularioSeguro = () => {
//     const formTieneDatos = formData.nombre.trim() !== '' || formData.descripcion.trim() !== '' || formData.tipo_accion_id !== 0 || odsSeleccionados.length > 0;
//     if (formTieneDatos) {
//       setDialogoConfirmacion({ isOpen: true, tipo: 'descartar_form', idActividad: null });
//     } else {
//       setDrawerState({ isOpen: false, mode: 'detalles' });
//     }
//   };

//   const toggleOdsForm = (idOds: number) => {
//     setOdsSeleccionados(prev => prev.includes(idOds) ? prev.filter(id => id !== idOds) : [...prev, idOds]);
//   };

//   const handleSubmitForm = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
//     const estadoGuardar = submitter?.value ? submitter.value : formData.estado;
    
//     if (formData.tipo_accion_id === 0) return toast.warning("Selecciona el Tipo de Acción Principal.");
//     if (odsSeleccionados.length === 0) return toast.warning("Debes alinear la actividad con al menos un ODS.");
//     if (!formData.calle.trim() || !formData.colonia.trim()) return toast.warning("La calle y colonia son obligatorias.");

//     setIsSaving(true);
//     const toastId = toast.loading(editingId ? 'Actualizando...' : 'Guardando...');

//     try {
//       const payload = {
//         nombre: formData.nombre.trim(), descripcion: formData.descripcion.trim(),
//         fecha_evento: formData.fecha_evento, hora_inicio: formData.hora_inicio, hora_fin: formData.hora_fin,
//         // Si municipio_id es 0, lo guardamos como null (General/Global)
//         municipio_id: formData.municipio_id === 0 ? null : formData.municipio_id, 
//         lugar: formData.lugar.trim(), calle: formData.calle.trim(), colonia: formData.colonia.trim(), direccion: formData.direccion.trim(),
//         estado: estadoGuardar, actualizado_por_usuario_id: usuarioDatos?.id 
//       };

//       await guardarActividadCalendario({
//         actividadId: editingId,
//         nombre: payload.nombre,
//         descripcion: payload.descripcion,
//         fechaEvento: payload.fecha_evento,
//         horaInicio: payload.hora_inicio,
//         horaFin: payload.hora_fin,
//         municipioId: payload.municipio_id,
//         lugar: payload.lugar,
//         calle: payload.calle,
//         colonia: payload.colonia,
//         direccion: payload.direccion,
//         estado: payload.estado,
//         tipoAccionId: formData.tipo_accion_id,
//         odsIds: odsSeleccionados,
//       });

//       await fetchDatosBase();
//       toast.success(estadoGuardar === 'Borrador' ? 'Guardado como borrador.' : 'Actividad publicada exitosamente.', { id: toastId });
//       setDrawerState({ isOpen: false, mode: 'detalles' });

//     } catch (error: any) {
//       toast.error('Error al guardar: ' + error.message, { id: toastId });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // ==========================================
//   // HANDLERS DE ACCIONES RÁPIDAS
//   // ==========================================
//   const ejecutarAccionConfirmada = async () => {
//     if (!dialogoConfirmacion.idActividad && dialogoConfirmacion.tipo !== 'descartar_form') return;
//     setIsProcessingAction(true);
//     try {
//       if (dialogoConfirmacion.tipo === 'eliminar') {
//         const { error } = await supabase.from('actividades').update({ fecha_eliminacion: new Date().toISOString() }).eq('id', dialogoConfirmacion.idActividad);
//         if (error) throw error;
//         setDrawerState({ isOpen: false, mode: 'detalles' }); 
//         notifyWithSound('Actividad eliminada permanentemente.', 'success');
//       } 
//       else if (dialogoConfirmacion.tipo === 'cancelar_evento') {
//         const { error } = await supabase.from('actividades').update({ estado: 'Cancelada' }).eq('id', dialogoConfirmacion.idActividad);
//         if (error) throw error;
//         notifyWithSound('La actividad ha sido cancelada con éxito.', 'success');
//       } 
//       else if (dialogoConfirmacion.tipo === 'descartar_form') {
//         setDrawerState({ isOpen: false, mode: 'detalles' });
//         setIsProcessingAction(false);
//         setDialogoConfirmacion({ isOpen: false, tipo: null, idActividad: null });
//         return;
//       }
      
//       await fetchDatosBase();
//     } catch (error) {
//       notifyWithSound(`Error al procesar la solicitud.`, 'error');
//     } finally {
//       setIsProcessingAction(false);
//       setDialogoConfirmacion({ isOpen: false, tipo: null, idActividad: null });
//     }
//   };

//   // ==========================================
//   // RENDERIZADO - VISTA CALENDARIO
//   // ==========================================
//   const nextPeriod = () => { viewMode === 'mes' ? setCurrentDate(addMonths(currentDate, 1)) : viewMode === 'semana' ? setCurrentDate(addWeeks(currentDate, 1)) : setCurrentDate(addDays(currentDate, 1)); };
//   const prevPeriod = () => { viewMode === 'mes' ? setCurrentDate(subMonths(currentDate, 1)) : viewMode === 'semana' ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(subDays(currentDate, 1)); };

//   const renderMonthView = () => {
//     const monthStart = startOfMonth(currentDate); 
//     const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
//     const rows = []; let days = []; let day = startOfWeek(monthStart, { weekStartsOn: 1 });
//     const hoy = startOfDay(new Date());

//     while (day <= endDate) {
//       for (let i = 0; i < 7; i++) {
//         const cloneDay = day; const acts = getActividadesDelDia(cloneDay);
//         const isPast = isBefore(cloneDay, hoy);
//         const isToday = isSameDay(cloneDay, hoy);

//         days.push(
//           <div key={day.toString()} onClick={() => { setCurrentDate(cloneDay); setViewMode('dia'); }} 
//             className={`min-h-30 p-2 border-b border-r border-gray-100 cursor-pointer group 
//               ${!isSameMonth(day, monthStart) ? 'bg-gray-50/50 text-gray-400' : isPast ? 'bg-gray-100/60 opacity-70' : 'bg-white hover:bg-blue-50/30'}`}
//           >
//             <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-[#00689D] text-white' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>
//               {format(day, 'd')}
//             </span>
//             <div className="mt-2 space-y-1">
//               {acts.slice(0, 3).map(act => {
//                 const estilos = obtenerEstilosUI(act);
//                 return (
//                   <div key={act.id} onClick={(e) => { e.stopPropagation(); abrirDetalles(act); }} className={`px-2 py-1 rounded text-xs truncate font-medium shadow-sm transition-colors ${estilos.mes}`}>
//                     {act.estado === 'Borrador' && '📝 '}{act.estado === 'Cancelada' && '🚫 '}{act.hora_inicio?.slice(0,5)} {act.nombre}
//                   </div>
//                 );
//               })}
//               {acts.length > 3 && <div className="text-xs text-gray-500 font-bold pl-1">+ {acts.length - 3} más</div>}
//             </div>
//           </div>
//         );
//         day = addDays(day, 1);
//       }
//       rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>); days = [];
//     }
//     return rows;
//   };

//   const renderWeekView = () => {
//     const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
//     const hoy = startOfDay(new Date());

//     return (
//       <div className="grid grid-cols-7">
//         {Array.from({length: 7}).map((_, i) => {
//           const cloneDay = addDays(startDate, i); const acts = getActividadesDelDia(cloneDay);
//           const isPast = isBefore(cloneDay, hoy); const isToday = isSameDay(cloneDay, hoy);

//           return (
//             <div key={i} className={`flex flex-col min-h-125 border-r border-gray-100 bg-white ${isPast ? 'opacity-70 bg-gray-100/50' : ''}`}>
//               <div onClick={() => { setCurrentDate(cloneDay); setViewMode('dia'); }} className="p-3 text-center border-b border-gray-100 cursor-pointer hover:bg-blue-50">
//                 <p className={`text-xs font-bold uppercase ${isPast ? 'text-gray-300' : 'text-gray-400'}`}>{format(cloneDay, 'EEE', { locale: es })}</p>
//                 <p className={`text-xl font-black mt-1 ${isToday ? 'text-[#00689D]' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>{format(cloneDay, 'd')}</p>
//               </div>
//               <div className="p-2 space-y-2 flex-1 bg-gray-50/30">
//                 {acts.map(act => {
//                   const estilos = obtenerEstilosUI(act);
//                   return (
//                     <div key={act.id} onClick={() => abrirDetalles(act)} className={`border-l-4 p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-all group ${estilos.semana}`}>
//                       <p className="text-xs font-bold text-gray-500">{act.estado === 'Borrador' && '📝 '}{act.estado === 'Cancelada' && '🚫 '}{act.hora_inicio?.slice(0,5)}</p>
//                       <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#00689D]">{act.nombre}</p>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )
//         })}
//       </div>
//     );
//   };

//   const renderDayView = () => {
//     const acts = getActividadesDelDia(currentDate);
//     const isPast = isBefore(currentDate, startOfDay(new Date()));

//     if (acts.length === 0) return (
//       <div className="py-24 text-center">
//         <CalendarIcon className="mx-auto h-16 w-16 text-gray-200 mb-4" />
//         <h3 className="text-xl font-bold text-gray-800">Día libre</h3>
//         <p className="text-gray-500">No hay actividades programadas para {isPast ? 'este día' : 'hoy'}.</p>
//       </div>
//     );
    
//     return (
//       <div className={`p-6 max-w-4xl mx-auto space-y-4 ${isPast ? 'opacity-80' : ''}`}>
//         {acts.map(act => {
//           const estilos = obtenerEstilosUI(act);
//           return (
//             <div key={act.id} onClick={() => abrirDetalles(act)} className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all group ${estilos.diaMain}`}>
//               <div className={`flex flex-col items-center justify-center min-w-25 h-full py-2 rounded-xl border ${estilos.diaHora}`}>
//                 <span className="font-black text-xl">{act.hora_inicio?.slice(0,5) || '--:--'}</span><span className="text-xs font-bold uppercase mt-1">Inicio</span>
//               </div>
//               <div className="flex-1">
//                 <h3 className={`text-xl font-bold transition-colors ${act.estado === 'Borrador' ? 'text-gray-700' : act.estado === 'Cancelada' ? 'text-red-700 group-hover:text-red-800' : 'text-gray-900 group-hover:text-[#00689D]'}`}>
//                   {act.estado === 'Borrador' && '📝 '} {act.estado === 'Cancelada' && '🚫 '} {act.nombre}
//                 </h3>
//                 <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 font-medium">
//                   <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400"/>{act.lugar || 'Por definir'}</span>
//                   <span className="flex items-center gap-1.5"><Info size={16} className="text-gray-400"/>{act.municipios?.nombre || 'General (Todos los municipios)'}</span>
//                 </div>
//               </div>
//               <div className="flex items-center justify-end">
//                 <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${act.estado === 'Borrador' ? 'bg-amber-50 text-amber-700 border-amber-200' : act.estado === 'Cancelada' ? 'bg-red-50 text-red-700 border-red-200' : act.estado === 'Realizada' ? 'bg-green-50 text-green-700 border-green-200' : act.estado === 'En curso' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
//                   {act.estado || 'Programada'}
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   // ==========================================
//   // RENDERIZADO - VISTA LISTA
//   // ==========================================
//   const renderListView = () => {
//     const todayStr = format(new Date(), 'yyyy-MM-dd');

//     const filtradas = actividades.filter(a => {
//       if (filterEstado !== 'Todos' && a.estado !== filterEstado) return false;
//       if (filterFecha === 'Vigentes' && a.fecha_evento < todayStr) return false;
//       if (filterFecha === 'Pasados' && a.fecha_evento >= todayStr) return false;
//       return true;
//     }).sort((a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime());

//     return (
//       <div className="animate-in fade-in duration-300">
//         <div className="bg-white p-5 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 items-end shadow-sm">
//           <div className="flex-1 w-full">
//             <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Filter size={14}/> Estado</label>
//             <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D] bg-white text-sm font-medium" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
//               <option value="Todos">Todos los estados</option>
//               <option value="Programada">Programadas / Activas</option>
//               <option value="Borrador">Borradores</option>
//               <option value="Cancelada">Canceladas</option>
//             </select>
//           </div>
//           <div className="flex-1 w-full">
//             <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Filter size={14}/> Fechas</label>
//             <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D] bg-white text-sm font-medium" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)}>
//               <option value="Todos">Todas las fechas</option>
//               <option value="Vigentes">Vigentes (Próximas y hoy)</option>
//               <option value="Pasados">Pasadas</option>
//             </select>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="bg-gray-50/50 p-6 border-b border-gray-200 flex items-center justify-between">
//             <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ListIcon className="text-[#00689D]" size={20} /> Registros del Calendario</h3>
//             <span className="bg-blue-100 text-[#00689D] text-xs font-bold px-3 py-1 rounded-full">{filtradas.length} resultados</span>
//           </div>
          
//           <div className="overflow-x-auto">
//             {filtradas.length === 0 ? (
//               <div className="p-12 text-center flex flex-col items-center justify-center">
//                 <Archive className="text-gray-300 mb-3" size={48} />
//                 <p className="text-gray-500 font-medium text-lg">No hay registros</p>
//                 <p className="text-gray-400 text-sm">Prueba ajustando los filtros de arriba.</p>
//               </div>
//             ) : (
//               <table className="w-full text-left text-sm">
//                 <thead>
//                   <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-xs uppercase tracking-wider">
//                     <th className="p-4 font-bold">Actividad</th>
//                     <th className="p-4 font-bold text-center">Rol</th>
//                     <th className="p-4 font-bold">Estado</th>
//                     <th className="p-4 font-bold">Fecha</th>
//                     <th className="p-4 font-bold text-center">Acciones</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {filtradas.map((a) => {
//                     const esCrea = a.creado_por_usuario_id === usuarioDatos?.id;
//                     return (
//                       <tr key={a.id} className="hover:bg-blue-50/50 transition-colors">
//                         <td className="p-4">
//                           <p className="font-bold text-gray-900">{a.nombre}</p>
//                           <p className="text-xs text-gray-500 mt-1">{a.municipios?.nombre || 'General'}</p>
//                         </td>
//                         <td className="p-4 text-center">
//                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${esCrea ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
//                             {esCrea ? 'Admin (Tú)' : 'Embajador'}
//                           </span>
//                         </td>
//                         <td className="p-4">
//                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${a.estado === 'Borrador' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : a.estado === 'Cancelada' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
//                             {a.estado === 'Borrador' ? 'Borrador' : a.estado === 'Cancelada' ? 'Cancelada' : 'Programada'}
//                           </span>
//                         </td>
//                         <td className="p-4 text-gray-600 font-medium">{formatearFechaCorta(a.fecha_evento)}</td>
//                         <td className="p-4 flex gap-2 justify-center items-center h-full">
//                           <button type="button" onClick={() => abrirDetalles(a)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Ver Detalles"><Info size={18} /></button>
//                           {esCrea && (
//                             <>
//                               <button type="button" onClick={() => prepararEdicion(a)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar"><Edit2 size={18} /></button>
//                               <button type="button" onClick={() => setDialogoConfirmacion({ isOpen: true, tipo: 'eliminar', idActividad: a.id })} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18} /></button>
//                             </>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ==========================================
//   // COMPONENTE PRINCIPAL RENDER
//   // ==========================================
//   return (
//     <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
//       {/* HEADER PRINCIPAL UNIFICADO */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 gap-6 relative overflow-hidden">
//         <div className="absolute -right-10 -top-10 text-blue-50 opacity-50 pointer-events-none">
//           <CalendarIcon size={200} />
//         </div>
//         <div className="relative z-10">
//           <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
//             <CalendarIcon className="text-[#00689D]" size={36} /> Agenda General
//           </h1>
//           <p className="text-gray-500 mt-2 text-base max-w-xl">
//             Supervisa las actividades de todos los embajadores o crea eventos de alcance global.
//           </p>
//         </div>
//         <div className=" flex justify-end">
//          <div className="relative w-full sm:w-72">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Filter size={18} className="text-[#00689D]" />
//             </div>
//             <select
//               value={filtroMunicipioGlobal}
//               onChange={(e) => setFiltroMunicipioGlobal(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[#00689D] font-bold focus:ring-2 focus:ring-[#00689D] shadow-sm transition-all appearance-none outline-none"
//             >
//               <option value="todos">Todos los Municipios</option>
//               {municipiosDB.map(mun => (
//                 <option key={mun.id} value={mun.id}>{mun.nombre}</option>
//               ))}
//             </select>
//           </div>
//       </div>
//         <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-3">
//           <div className="bg-gray-100 p-1 rounded-xl flex shadow-inner">
//             <button onClick={() => setMainTab('calendario')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${mainTab === 'calendario' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-700'}`}>Calendario</button>
//             <button onClick={() => setMainTab('lista')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${mainTab === 'lista' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-700'}`}>Mi Lista</button>
//           </div>
//           <button onClick={abrirNuevoFormulario} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00527A] shadow-md transition-all">
//             <PlusCircle size={20} /> Crear Actividad
//           </button>
//         </div>
//       </div>

//       {/* Selector global de municipio (Aplica a ambas pestañas) */}
      

//       {mainTab === 'calendario' ? (
//         <>
//           {/* LEYENDA VISUAL */}
//           <div className="flex flex-wrap items-center gap-4 mb-6 px-2 text-xs font-medium text-gray-600">
//             <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00689D]"></div> Creadas por Mí (Admin)</span>
//             <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Creadas por Embajadores</span>
//             <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 bg-amber-100"></div> Mis Borradores</span>
//             <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-red-300 bg-red-100 text-red-500 flex items-center justify-center font-bold text-[8px]">X</div> Cancelada</span>
//           </div>

//           {/* CONTROLES CALENDARIO */}
//           <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
//               <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
//                 <button onClick={prevPeriod} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors"><ChevronLeft size={20} /></button>
//                 <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-white rounded-lg transition-colors">Hoy</button>
//                 <button onClick={nextPeriod} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors"><ChevronRight size={20} /></button>
//               </div>
//               <h2 className="text-xl md:text-2xl font-black text-[#00689D] capitalize min-w-45 text-center md:text-left">
//                 {viewMode === 'mes' && format(currentDate, 'MMMM yyyy', { locale: es })}
//                 {viewMode === 'semana' && `Sem. del ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: es })}`}
//                 {viewMode === 'dia' && format(currentDate, 'd MMM, yyyy', { locale: es })}
//               </h2>
//             </div>
//             <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner w-full md:w-auto">
//               <button onClick={() => setViewMode('dia')} className={`flex-1 flex justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'dia' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-800'}`}><ListIcon size={16} /><span className="hidden sm:inline">Día</span></button>
//               <button onClick={() => setViewMode('semana')} className={`flex-1 flex justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'semana' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-800'}`}><Columns size={16} /><span className="hidden sm:inline">Semana</span></button>
//               <button onClick={() => setViewMode('mes')} className={`flex-1 flex justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'mes' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-800'}`}><LayoutGrid size={16} /><span className="hidden sm:inline">Mes</span></button>
//             </div>
//           </div>

//           {/* GRID CALENDARIO */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             {loading ? (
//               <div className="h-150 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#00689D]/20 border-t-[#00689D] rounded-full animate-spin"></div></div>
//             ) : (
//               <>
//                 {viewMode !== 'dia' && (
//                   <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
//                     {Array.from({ length: 7 }).map((_, i) => (
//                       <div key={i} className="text-center font-black text-xs text-gray-500 py-3 uppercase tracking-wider">{format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i), 'EEEE', { locale: es })}</div>
//                     ))}
//                   </div>
//                 )}
//                 <div className="bg-white">
//                   {viewMode === 'mes' && renderMonthView()}
//                   {viewMode === 'semana' && renderWeekView()}
//                   {viewMode === 'dia' && renderDayView()}
//                 </div>
//               </>
//             )}
//           </div>
//         </>
//       ) : (
//         renderListView()
//       )}

//       {/* ==========================================
//           DRAWER LATERAL UNIFICADO (Detalles / Formulario)
//       ========================================== */}
//       <div 
//         className={`fixed left-0 w-full bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${drawerState.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
//         style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }}
//         onClick={() => drawerState.mode === 'formulario' ? cerrarDrawerFormularioSeguro() : setDrawerState({ isOpen: false, mode: 'detalles' })} 
//       />
      
//       <div 
//         className={`fixed right-0 z-50 ${drawerState.mode === 'formulario' ? 'w-full sm:w-[650px] md:w-[750px]' : 'w-full sm:w-[500px]'} bg-white shadow-2xl flex flex-col transform transition-all duration-300 ease-in-out ${drawerState.isOpen ? 'translate-x-0' : 'translate-x-full'}`}
//         style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }}
//       >
//         {/* === VISTA DETALLES === */}
//         {drawerState.mode === 'detalles' && eventoSeleccionado && (
//           <>
//             <div className={`${obtenerEstilosUI(eventoSeleccionado).drawerHeader} p-6 text-white shrink-0 relative transition-colors`}>
//               <button onClick={() => setDrawerState({ isOpen: false, mode: 'detalles' })} className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
//               <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
//                 {eventoSeleccionado.estado === 'Borrador' ? 'Modo Borrador' : eventoSeleccionado.estado || 'Programada'}
//               </span>
//               <h2 className="text-2xl font-black leading-tight pr-8">{eventoSeleccionado.nombre}</h2>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
//               <div className="space-y-6">
//                 <div className="flex items-start gap-4">
//                   <div className={`p-3 rounded-xl shrink-0 ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#00689D]'}`}><Clock size={24} /></div>
//                   <div>
//                     <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Cuándo</p>
//                     <p className={`font-bold capitalize text-lg ${eventoSeleccionado.estado === 'Cancelada' ? 'text-red-700 line-through opacity-70' : 'text-gray-900'}`}>{formatearFechaLarga(eventoSeleccionado.fecha_evento)}</p>
//                     <p className="text-gray-600 font-medium">{eventoSeleccionado.hora_inicio?.slice(0,5) || '--:--'} hrs - {eventoSeleccionado.hora_fin ? eventoSeleccionado.hora_fin.slice(0,5) + ' hrs' : 'Fin por definir'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-4">
//                   <div className={`p-3 rounded-xl shrink-0 ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#00689D]'}`}><MapPin size={24} /></div>
//                   <div>
//                     <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Dónde</p>
//                     <p className="font-bold text-gray-900 text-lg leading-tight">{eventoSeleccionado.lugar || 'Lugar sin especificar'}</p>
//                     <div className="mt-2 space-y-1 text-sm">
//                       {eventoSeleccionado.calle && <p className="text-gray-700"><span className="font-bold">Calle:</span> {eventoSeleccionado.calle}</p>}
//                       {eventoSeleccionado.colonia && <p className="text-gray-700"><span className="font-bold">Colonia:</span> {eventoSeleccionado.colonia}</p>}
//                       {eventoSeleccionado.direccion && <p className="text-gray-600 italic"><span className="font-bold not-italic text-gray-700">Ref:</span> {eventoSeleccionado.direccion}</p>}
//                     </div>
//                     <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-800 font-bold rounded-lg text-sm border border-gray-200">
//                       📍 {eventoSeleccionado.municipios?.nombre || 'General (Todos los municipios)'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4 pt-6 border-t border-gray-100">
//                 <div className={`p-3 rounded-xl shrink-0 ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#00689D]'}`}><User size={24} /></div>
//                 <div>
//                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Organizador</p>
//                   <p className="font-bold text-gray-900 text-lg">
//                     {eventoSeleccionado.creador?.nombre} {eventoSeleccionado.creador?.apellido}
//                     {eventoSeleccionado.creado_por_usuario_id === usuarioDatos?.id && <span className={`ml-2 font-black text-sm ${eventoSeleccionado.estado === 'Cancelada' ? 'text-red-600' : 'text-[#00689D]'}`}>(TÚ / ADMIN)</span>}
//                   </p>
//                 </div>
//               </div>

//               <div className="pt-6 border-t border-gray-100">
//                 <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Target size={18} className={eventoSeleccionado.estado === 'Cancelada' ? 'text-red-600' : 'text-[#00689D]'} /> Impacto y Alineación</h3>
//                 {eventoSeleccionado.actividad_acciones && eventoSeleccionado.actividad_acciones.length > 0 && (
//                   <div className="mb-4 flex items-center gap-2">
//                     <ActivityIcon size={16} className="text-gray-400" />
//                     <span className="text-sm font-semibold text-gray-700">Tipo:</span>
//                     <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{eventoSeleccionado.actividad_acciones[0].tipos_accion?.nombre || 'Actividad'}</span>
//                   </div>
//                 )}
//                 {eventoSeleccionado.actividad_ods && eventoSeleccionado.actividad_ods.length > 0 && (
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {eventoSeleccionado.actividad_ods.map((rel, idx) => (
//                       <span key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-[#00689D]'}`}>
//                         <span className={`w-4 h-4 text-white rounded-full flex items-center justify-center text-[9px] ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-600' : 'bg-[#00689D]'}`}>{rel.ods?.numero}</span>
//                         {rel.ods?.nombre}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//                 {eventoSeleccionado.descripcion && (
//                   <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
//                     <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">Detalles Adicionales</p>
//                     <p className="text-sm text-gray-700 leading-relaxed">{eventoSeleccionado.descripcion}</p>
//                   </div>
//                 )}
//               </div>
              
//               {eventoSeleccionado.estado !== 'Borrador' && (
//                 <div className="pt-6 border-t border-gray-100">
//                   <div className="flex items-center justify-between mb-4">
//                     <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Users size={18} className={eventoSeleccionado.estado === 'Cancelada' ? 'text-red-600' : 'text-[#00689D]'} /> Embajadores Unidos</p>
//                     <span className="bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-bold">{eventoSeleccionado.actividad_asistentes?.length || 0}</span>
//                   </div>

//                   {eventoSeleccionado.actividad_asistentes?.length > 0 ? (
//                     <div className="space-y-2 mb-6 max-h-32 overflow-y-auto pr-2">
//                       {eventoSeleccionado.actividad_asistentes.map((asistente, i) => (
//                         <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-medium">
//                           <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-500' : 'bg-[#00689D]'}`}>
//                             {asistente.usuarios?.nombre?.charAt(0) || 'U'}
//                           </div>
//                           <span className="text-gray-700">{asistente.usuarios?.nombre} {asistente.usuarios?.apellido}</span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : <p className="text-sm text-gray-500 mb-6 italic">Aún no hay embajadores unidos a esta actividad.</p>}
//                 </div>
//               )}
//             </div>

//             {/* Footer Admin (Solo puede editar las que él creó) */}
//             <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 shrink-0">
//               {eventoSeleccionado.creado_por_usuario_id === usuarioDatos?.id ? (
//                 <div className="flex flex-wrap items-center justify-end gap-3">
//                   <button onClick={() => setDialogoConfirmacion({ isOpen: true, tipo: 'eliminar', idActividad: eventoSeleccionado.id })} title="Eliminar permanentemente" className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"><Trash2 size={20} /></button>
//                   {eventoSeleccionado.estado !== 'Cancelada' && (
//                     <button onClick={() => setDialogoConfirmacion({ isOpen: true, tipo: 'cancelar_evento', idActividad: eventoSeleccionado.id })} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors shadow-sm"><Ban size={16} /> Cancelar Evento</button>
//                   )}
//                   <button onClick={() => prepararEdicion(eventoSeleccionado)} className="flex items-center gap-2 px-6 py-2.5 bg-[#00689D] hover:bg-[#00527A] text-white font-bold rounded-xl transition-colors shadow-sm"><Edit2 size={16} /> Editar</button>
//                 </div>
//               ) : (
//                 <div className="flex justify-end">
//                   <button onClick={() => setDrawerState({ isOpen: false, mode: 'detalles' })} className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold rounded-xl transition-colors shadow-sm">Cerrar panel</button>
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {/* === VISTA FORMULARIO === */}
//         {drawerState.mode === 'formulario' && (
//           <div className="flex flex-col h-full bg-white">
//             <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
//               <div>
//                 <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
//                   <FileText className="text-[#00689D]" size={28} /> {editingId ? 'Editar Actividad Global' : 'Nueva Actividad Global'}
//                 </h2>
//                 <p className="text-gray-500 mt-1 text-sm">Crea actividades visibles para uno o varios municipios.</p>
//               </div>
//               <button onClick={cerrarDrawerFormularioSeguro} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6 md:p-8">
//               <form id="form-actividad-admin" onSubmit={handleSubmitForm} className="space-y-6">
                
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-bold text-[#00689D] flex items-center gap-2 border-b pb-2"><Target size={18}/> Datos Generales</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="md:col-span-2">
//                       <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Actividad <span className="text-red-500">*</span></label>
//                       <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Cumbre Climática General" />
//                     </div>
//                     <div className="md:col-span-2">
//                       <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Acción Principal <span className="text-red-500">*</span></label>
//                       <select required className="w-full p-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:border-[#00689D] text-sm" value={formData.tipo_accion_id} onChange={(e) => setFormData({...formData, tipo_accion_id: Number(e.target.value)})}>
//                         <option value="0">-- Selecciona la Acción --</option>
//                         {tiposAccionDB.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
//                       </select>
//                     </div>
//                     <div className="md:col-span-2">
//                       <label className="block text-xs font-bold text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
//                       <textarea required rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg resize-none outline-none focus:border-[#00689D] text-sm" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} placeholder="Explica el objetivo..."></textarea>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
//                   <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS <span className="text-red-500">*</span></label>
//                   <p className="text-xs text-gray-500 mb-3">El primero que selecciones se registrará como el principal.</p>
//                   <div className="flex flex-wrap gap-2">
//                     {odsDB.map(ods => {
//                       const isSelected = odsSeleccionados.includes(ods.id);
//                       return (
//                         <button key={ods.id} type="button" onClick={() => toggleOdsForm(ods.id)} className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${isSelected ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-white text-gray-600 hover:border-[#00689D]'}`}>
//                           <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isSelected ? 'bg-white text-[#00689D]' : 'bg-gray-100'}`}>{ods.numero}</span>
//                           {ods.nombre}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <h3 className="text-lg font-bold text-[#00689D] flex items-center gap-2 border-b pb-2"><MapPin size={18}/> Cuándo y Dónde</h3>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="col-span-2">
//                       <label className="block text-xs font-bold text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
//                       <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.fecha_evento} onChange={(e) => setFormData({...formData, fecha_evento: e.target.value})} />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-700 mb-1">Inicio <span className="text-red-500">*</span></label>
//                       <input type="time" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.hora_inicio} onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})} />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-700 mb-1">Fin <span className="text-red-500">*</span></label>
//                       <input type="time" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.hora_fin} onChange={(e) => setFormData({...formData, hora_fin: e.target.value})} />
//                     </div>
//                   </div>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-gray-700 mb-1">Municipio <span className="text-red-500">*</span></label>
//                       <select required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none bg-white focus:border-[#00689D] text-sm" value={formData.municipio_id} onChange={(e) => setFormData({...formData, municipio_id: Number(e.target.value)})}>
//                         <option value="0">General (Todos los municipios)</option>
//                         {municipiosDB.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-700 mb-1">Lugar Exacto <span className="text-red-500">*</span></label>
//                       <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.lugar} onChange={(e) => setFormData({...formData, lugar: e.target.value})} placeholder="Ej. Congreso del Estado" />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold text-gray-700 mb-1">Dirección Detallada <span className="text-red-500">*</span></label>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                       <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.calle} onChange={(e) => setFormData({...formData, calle: e.target.value})} placeholder="Calle y número" />
//                       <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.colonia} onChange={(e) => setFormData({...formData, colonia: e.target.value})} placeholder="Colonia" />
//                       <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} placeholder="Referencias" />
//                     </div>
//                   </div>
//                 </div>
//               </form>
//             </div>

//             <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-end gap-3 shrink-0">
//               <button type="button" onClick={cerrarDrawerFormularioSeguro} disabled={isSaving} className="w-full sm:w-auto px-6 py-2.5 font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">
//                 Cancelar
//               </button>
              
//               {editingId && formData.estado !== 'Cancelada' && (
//                 <button type="button" onClick={() => setDialogoConfirmacion({ isOpen: true, tipo: 'cancelar_evento', idActividad: editingId })} disabled={isSaving} className="w-full sm:w-auto px-6 py-2.5 font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
//                   <Ban size={16} /> Cancelar Evento
//                 </button>
//               )}

//               {(!editingId || formData.estado === 'Borrador') && (
//                 <button form="form-actividad-admin" type="submit" name="accionBoton" value="Borrador" disabled={isSaving} className="w-full sm:w-auto px-6 py-2.5 font-bold text-[#00689D] bg-blue-50 border border-[#00689D] rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
//                   <Archive size={16} /> Guardar Borrador
//                 </button>
//               )}

//               <button form="form-actividad-admin" type="submit" name="accionBoton" value="Programada" disabled={isSaving} className="w-full sm:w-auto px-8 py-2.5 font-bold text-white bg-[#00689D] rounded-xl hover:bg-[#00527A] shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
//                 <Save size={16} /> {editingId ? (formData.estado === 'Borrador' ? 'Publicar Borrador' : formData.estado === 'Cancelada' ? 'Publicar Actividad' : 'Actualizar Actividad') : 'Publicar Actividad'}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ==========================================
//           ALERT DIALOG MODAL (Acciones Críticas)
//       ========================================== */}
//       <AlertDialog open={dialogoConfirmacion.isOpen} onOpenChange={(isOpen) => !isOpen && setDialogoConfirmacion({ isOpen: false, tipo: null, idActividad: null })}>
//         <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-gray-900 font-black flex items-center gap-2">
//               <AlertCircle className="text-red-500" size={20} /> 
//               {dialogoConfirmacion.tipo === 'eliminar' ? '¿Eliminar Actividad?' : 
//                dialogoConfirmacion.tipo === 'cancelar_evento' ? '¿Cancelar Actividad?' : '¿Descartar Cambios?'}
//             </AlertDialogTitle>
//             <AlertDialogDescription className="text-gray-600">
//               {dialogoConfirmacion.tipo === 'eliminar' 
//                 ? '¿Estás seguro de que deseas eliminar permanentemente esta actividad? Esta acción no se puede deshacer.'
//                 : dialogoConfirmacion.tipo === 'cancelar_evento'
//                 ? '¿Estás seguro de que deseas marcar esta actividad como Cancelada? Los asistentes verán este cambio de estado inmediatamente.'
//                 : 'Se perderá todo el progreso y los datos que no hayas guardado en el formulario. Esta acción no se puede deshacer.'}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter className="mt-4">
//             <AlertDialogCancel disabled={isProcessingAction} className="bg-gray-100 border-none font-bold hover:bg-gray-200 text-gray-700">
//               {dialogoConfirmacion.tipo === 'descartar_form' ? 'Seguir editando' : 'Regresar'}
//             </AlertDialogCancel>
//             <AlertDialogAction 
//               onClick={(e) => { e.preventDefault(); ejecutarAccionConfirmada(); }}
//               disabled={isProcessingAction}
//               className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2"
//             >
//               {isProcessingAction && <Loader2 size={16} className="animate-spin" />}
//               {dialogoConfirmacion.tipo === 'eliminar' ? 'Sí, eliminar' : dialogoConfirmacion.tipo === 'cancelar_evento' ? 'Sí, cancelar' : 'Sí, descartar'}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay,
  isBefore, startOfDay
} from 'date-fns';
import { es } from 'date-fns/locale'; 
import { 
  ChevronLeft, ChevronRight, MapPin, Clock, Calendar as CalendarIcon, 
  Info, X, LayoutGrid, List as ListIcon, Columns, User, Users, Edit2, 
  PlusCircle, Target, Activity as ActivityIcon, Trash2, Ban, AlertCircle, Loader2,
  FileText, Filter, Archive, Save, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { guardarActividadCalendario } from '../../lib/guardarActividadCalendario';

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

// ==========================================
// INTERFACES
// ==========================================
interface Ods { id: number; nombre: string; numero: number; }
interface Catalogo { id: number; nombre: string; }
interface Institucion { id: number; nombre: string; }

interface Actividad {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  municipio_id: number | null;
  lugar: string;
  direccion: string;
  calle: string;
  colonia: string;
  estado: string;
  creado_por_usuario_id: string;
  es_externa?: boolean;
  institucion_id?: number | null;
  municipios: { nombre: string } | null;
  creador: { nombre: string; apellido: string };
  instituciones?: { nombre: string } | null;
  actividad_asistentes: { usuario_id: string; usuarios: { nombre: string; apellido: string } }[];
  actividad_ods: { ods_id: number; es_principal?: boolean; ods: { numero: number; nombre: string } }[];
  actividad_acciones: { tipo_accion_id: number; cantidad: number; tipos_accion: { nombre: string } }[];
}

type ViewMode = 'mes' | 'semana' | 'dia';
type MainTab = 'calendario' | 'lista';

const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const audio = new Audio('/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.log('Audio bloqueado:', err));
  const options = { position: 'bottom-right' as const };
  switch (type) {
    case 'success': toast.success(message, options); break;
    case 'error': toast.error(message, options); break;
    case 'warning': toast.warning(message, options); break;
    default: toast.info(message, options);
  }
};

export default function AdminAgenda() {
  const { usuarioDatos } = useAuth();
  const location = useLocation(); 
  
  // ==========================================
  // ESTADOS DE VISTA Y DATOS
  // ==========================================
  const [mainTab, setMainTab] = useState<MainTab>('calendario');
  const [viewMode, setViewMode] = useState<ViewMode>('mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Catálogos
  const [municipiosDB, setMunicipiosDB] = useState<Catalogo[]>([]);
  const [tiposAccionDB, setTiposAccionDB] = useState<Catalogo[]>([]);
  const [odsDB, setOdsDB] = useState<Ods[]>([]);
  const [institucionesDB, setInstitucionesDB] = useState<Institucion[]>([]);

  // Filtros
  const [filtroMunicipioGlobal, setFiltroMunicipioGlobal] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterFecha, setFilterFecha] = useState('Todos');

  // ==========================================
  // ESTADOS DEL DRAWER (Panel Lateral)
  // ==========================================
  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    mode: 'detalles' | 'formulario';
  }>({ isOpen: false, mode: 'detalles' });

  const [eventoSeleccionado, setEventoSeleccionado] = useState<Actividad | null>(null);
  
  // Formulario
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', tipo_accion_id: 0, fecha_evento: '', hora_inicio: '', hora_fin: '',
    municipio_id: 0, lugar: '', calle: '', colonia: '', direccion: '', estado: 'Programada',
    es_externa: false, institucion_id: 0
  });
  const [odsSeleccionados, setOdsSeleccionados] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ==========================================
  // ESTADOS DEL MODAL UNIFICADO (Shadcn)
  // ==========================================
  const [dialogoConfirmacion, setDialogoConfirmacion] = useState<{
    isOpen: boolean;
    tipo: 'eliminar' | 'cancelar_evento' | 'descartar_form' | null;
    idActividad: number | null;
  }>({ isOpen: false, tipo: null, idActividad: null });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const [espacioSuperior, setEspacioSuperior] = useState(88);

  // ==========================================
  // EFECTOS (Scroll y Bloqueo de body)
  // ==========================================
  useEffect(() => {
    const calcularEspacio = () => {
      const headerElement = document.querySelector('header');
      const alturaHeader = headerElement ? headerElement.offsetHeight : 88; 
      const scrollActual = window.scrollY;
      setEspacioSuperior(scrollActual >= alturaHeader ? 0 : alturaHeader - scrollActual);
    };
    window.addEventListener('scroll', calcularEspacio);
    setTimeout(calcularEspacio, 50);
    return () => window.removeEventListener('scroll', calcularEspacio);
  }, []);

  useEffect(() => {
    if (drawerState.isOpen || dialogoConfirmacion.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [drawerState.isOpen, dialogoConfirmacion.isOpen]);

  // ==========================================
  // CARGA CENTRALIZADA DE DATOS
  // ==========================================
  const fetchDatosBase = async () => {
    if (!usuarioDatos?.id) return;
    setLoading(true);
    try {
      // Obtener Catálogos (Solo una vez)
      if (municipiosDB.length === 0) {
        const [resMun, resOds, resTipos, resInst] = await Promise.all([
          supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
          supabase.from('ods').select('id, nombre, numero').eq('activo', true).order('numero', { ascending: true }),
          supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('nombre'),
          supabase.from('instituciones').select('id, nombre').eq('activo', true).order('nombre')
        ]);
        if (resMun.data) setMunicipiosDB(resMun.data);
        if (resOds.data) setOdsDB(resOds.data);
        if (resTipos.data) setTiposAccionDB(resTipos.data);
        if (resInst.data) setInstitucionesDB(resInst.data);
      }

      // Obtener Todas las Actividades (con base en el filtro de municipio global)
      let query = supabase
        .from('actividades')
        .select(`
          id, nombre, descripcion, fecha_evento, hora_inicio, hora_fin, lugar, direccion, calle, colonia, municipio_id, estado, creado_por_usuario_id,
          es_externa, institucion_id,
          municipios(nombre), 
          creador:usuarios!actividades_creado_por_usuario_id_fkey(nombre, apellido),
          instituciones(nombre),
          actividad_asistentes(usuario_id, usuarios(nombre, apellido)), 
          actividad_ods(ods_id, es_principal, ods(numero, nombre)), 
          actividad_acciones(tipo_accion_id, cantidad, tipos_accion(nombre))
        `)
        .is('fecha_eliminacion', null);

      if (filtroMunicipioGlobal !== 'todos') {
        query = query.or(`municipio_id.eq.${filtroMunicipioGlobal},municipio_id.is.null`);
      }

      const { data: acts, error } = await query;
      if (error) throw error;
      
      // Admin solo ve sus propios borradores (no los de los embajadores)
      const actividadesPermitidas = (acts as any[]).filter(a => a.estado !== 'Borrador' || a.creado_por_usuario_id === usuarioDatos.id);
      setActividades(actividadesPermitidas || []);

      if (drawerState.isOpen && drawerState.mode === 'detalles' && eventoSeleccionado) {
        const eventoActualizado = actividadesPermitidas.find(a => a.id === eventoSeleccionado.id);
        setEventoSeleccionado(eventoActualizado || eventoSeleccionado);
      }
    } catch (error) { console.error('Error fetching data:', error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDatosBase(); }, [usuarioDatos, filtroMunicipioGlobal, location.key]);

  // ==========================================
  // FUNCIONES DE FECHAS Y ESTILOS
  // ==========================================
  const getFechaLocal = (fechaString: string) => {
    if (!fechaString) return new Date();
    const partes = fechaString.split('T')[0].split('-');
    return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
  };

  const formatearFechaLarga = (fechaString: string) => {
    if (!fechaString) return 'Fecha sin definir';
    return `${format(getFechaLocal(fechaString), 'EEEE, d', { locale: es })} de ${format(getFechaLocal(fechaString), 'MMMM yyyy', { locale: es })}`;
  };

  const formatearFechaCorta = (fechaStr: string) => {
    if (!fechaStr) return '';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const [year, month, day] = fechaStr.split('T')[0].split('-');
    return `${Number(day)} de ${meses[Number(month) - 1]} ${year}`;
  };

  const getActividadesDelDia = (fechaCelda: Date) => {
    return actividades.filter(act => {
      if (!act.fecha_evento) return false;
      return isSameDay(getFechaLocal(act.fecha_evento), fechaCelda);
    }).sort((a, b) => (a.hora_inicio > b.hora_inicio ? 1 : -1));
  };

  const obtenerEstilosUI = (act: Actividad) => {
    const esCreador = act.creado_por_usuario_id === usuarioDatos?.id;

    if (act.estado === 'Cancelada') {
      return {
        mes: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-900 cursor-pointer hover:scale-[1.02] transform transition-transform',
        semana: 'bg-red-50 border-red-400',
        diaMain: 'border-red-200 bg-red-50/50', diaHora: 'bg-red-50 text-red-700 border-red-200', drawerHeader: 'bg-red-600'
      };
    } else if (act.estado === 'Borrador') {
      return {
        mes: 'bg-amber-50 text-amber-700 border border-amber-300 border-dashed hover:bg-amber-100 cursor-pointer hover:scale-[1.02] transform transition-transform',
        semana: 'bg-amber-50/50 border-amber-400 border-dashed',
        diaMain: 'border-amber-200 border-dashed bg-white', diaHora: 'bg-amber-50 text-amber-700 border-amber-200 border-dashed', drawerHeader: 'bg-amber-600'
      };
    } else if (esCreador) {
      return {
        mes: 'bg-blue-50 text-[#00689D] border border-blue-200 hover:bg-[#00689D] hover:text-white cursor-pointer hover:scale-[1.02] transform transition-transform',
        semana: 'bg-white border-[#00689D]',
        diaMain: 'border-blue-100 bg-white', diaHora: 'bg-blue-50 text-[#00689D] border-blue-100', drawerHeader: 'bg-[#00689D]'
      };
    } else {
      return {
        mes: 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 cursor-pointer hover:scale-[1.02] transform transition-transform',
        semana: 'bg-white border-slate-300',
        diaMain: 'border-slate-200 bg-white opacity-90 hover:opacity-100', diaHora: 'bg-slate-50 text-slate-500 border-slate-200', drawerHeader: 'bg-slate-700'
      };
    }
  };

  // ==========================================
  // HANDLERS DEL DRAWER Y FORMULARIO
  // ==========================================
  const abrirDetalles = (act: Actividad) => {
    setEventoSeleccionado(act);
    setDrawerState({ isOpen: true, mode: 'detalles' });
  };

  const abrirNuevoFormulario = () => {
    setEditingId(null);
    setFormData({
      nombre: '', descripcion: '', tipo_accion_id: 0, fecha_evento: '', hora_inicio: '', hora_fin: '',
      municipio_id: 0, lugar: '', calle: '', colonia: '', direccion: '', estado: 'Programada',
      es_externa: false, institucion_id: 0
    });
    setOdsSeleccionados([]);
    setDrawerState({ isOpen: true, mode: 'formulario' });
  };

  const prepararEdicion = (act: Actividad) => {
    setFormData({
      nombre: act.nombre || '', descripcion: act.descripcion || '',
      tipo_accion_id: act.actividad_acciones?.[0]?.tipo_accion_id || 0,
      fecha_evento: act.fecha_evento ? act.fecha_evento.split('T')[0] : '',
      hora_inicio: act.hora_inicio ? act.hora_inicio.substring(0, 5) : '',
      hora_fin: act.hora_fin ? act.hora_fin.substring(0, 5) : '',
      municipio_id: act.municipio_id || 0, lugar: act.lugar || '',
      calle: act.calle || '', colonia: act.colonia || '', direccion: act.direccion || '',
      estado: act.estado || 'Programada',
      es_externa: act.es_externa || false,
      institucion_id: act.institucion_id || 0
    });
    setOdsSeleccionados(act.actividad_ods ? act.actividad_ods.map((o: any) => o.ods_id) : []);
    setEditingId(act.id);
    setDrawerState({ isOpen: true, mode: 'formulario' });
  };

  const cerrarDrawerFormularioSeguro = () => {
    const formTieneDatos = formData.nombre.trim() !== '' || formData.descripcion.trim() !== '' || formData.tipo_accion_id !== 0 || odsSeleccionados.length > 0;
    if (formTieneDatos) {
      setDialogoConfirmacion({ isOpen: true, tipo: 'descartar_form', idActividad: null });
    } else {
      setDrawerState({ isOpen: false, mode: 'detalles' });
    }
  };

  const toggleOdsForm = (idOds: number) => {
    setOdsSeleccionados(prev => prev.includes(idOds) ? prev.filter(id => id !== idOds) : [...prev, idOds]);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const estadoGuardar = submitter?.value ? submitter.value : formData.estado;
    
    if (formData.tipo_accion_id === 0) return toast.warning("Selecciona el Tipo de Acción Principal.");
    if (odsSeleccionados.length === 0) return toast.warning("Debes alinear la actividad con al menos un ODS.");
    if (!formData.calle.trim() || !formData.colonia.trim()) return toast.warning("La calle y colonia son obligatorias.");
    
    if (formData.es_externa && formData.institucion_id === 0) {
      return toast.warning("Selecciona la Institución organizadora.");
    }

    setIsSaving(true);
    const toastId = toast.loading(editingId ? 'Actualizando...' : 'Guardando...');

    try {
      const payload = {
        nombre: formData.nombre.trim(), descripcion: formData.descripcion.trim(),
        fecha_evento: formData.fecha_evento, hora_inicio: formData.hora_inicio, hora_fin: formData.hora_fin,
        municipio_id: formData.municipio_id === 0 ? null : formData.municipio_id, 
        lugar: formData.lugar.trim(), calle: formData.calle.trim(), colonia: formData.colonia.trim(), direccion: formData.direccion.trim(),
        estado: estadoGuardar, actualizado_por_usuario_id: usuarioDatos?.id,
        es_externa: formData.es_externa,
        institucion_id: formData.es_externa ? formData.institucion_id : null
      };

      await guardarActividadCalendario({
        actividadId: editingId,
        nombre: payload.nombre,
        descripcion: payload.descripcion,
        fechaEvento: payload.fecha_evento,
        horaInicio: payload.hora_inicio,
        horaFin: payload.hora_fin,
        municipioId: payload.municipio_id,
        lugar: payload.lugar,
        calle: payload.calle,
        colonia: payload.colonia,
        direccion: payload.direccion,
        estado: payload.estado,
        tipoAccionId: formData.tipo_accion_id,
        odsIds: odsSeleccionados,
        es_externa: payload.es_externa,
        institucion_id: payload.institucion_id
      });

      await fetchDatosBase();
      toast.success(estadoGuardar === 'Borrador' ? 'Guardado como borrador.' : 'Actividad publicada exitosamente.', { id: toastId });
      setDrawerState({ isOpen: false, mode: 'detalles' });

    } catch (error: any) {
      toast.error('Error al guardar: ' + error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // HANDLERS DE ACCIONES RÁPIDAS
  // ==========================================
  const ejecutarAccionConfirmada = async () => {
    if (!dialogoConfirmacion.idActividad && dialogoConfirmacion.tipo !== 'descartar_form') return;
    setIsProcessingAction(true);
    try {
      if (dialogoConfirmacion.tipo === 'eliminar') {
        const { error } = await supabase.from('actividades').update({ fecha_eliminacion: new Date().toISOString() }).eq('id', dialogoConfirmacion.idActividad);
        if (error) throw error;
        setDrawerState({ isOpen: false, mode: 'detalles' }); 
        notifyWithSound('Actividad eliminada permanentemente.', 'success');
      } 
      else if (dialogoConfirmacion.tipo === 'cancelar_evento') {
        const { error } = await supabase.from('actividades').update({ estado: 'Cancelada' }).eq('id', dialogoConfirmacion.idActividad);
        if (error) throw error;
        notifyWithSound('La actividad ha sido cancelada con éxito.', 'success');
      } 
      else if (dialogoConfirmacion.tipo === 'descartar_form') {
        setDrawerState({ isOpen: false, mode: 'detalles' });
        setIsProcessingAction(false);
        setDialogoConfirmacion({ isOpen: false, tipo: null, idActividad: null });
        return;
      }
      
      await fetchDatosBase();
    } catch (error) {
      notifyWithSound(`Error al procesar la solicitud.`, 'error');
    } finally {
      setIsProcessingAction(false);
      setDialogoConfirmacion({ isOpen: false, tipo: null, idActividad: null });
    }
  };

  // ==========================================
  // RENDERIZADO - VISTA CALENDARIO
  // ==========================================
  const nextPeriod = () => { viewMode === 'mes' ? setCurrentDate(addMonths(currentDate, 1)) : viewMode === 'semana' ? setCurrentDate(addWeeks(currentDate, 1)) : setCurrentDate(addDays(currentDate, 1)); };
  const prevPeriod = () => { viewMode === 'mes' ? setCurrentDate(subMonths(currentDate, 1)) : viewMode === 'semana' ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(subDays(currentDate, 1)); };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate); 
    const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
    const rows = []; let days = []; let day = startOfWeek(monthStart, { weekStartsOn: 1 });
    const hoy = startOfDay(new Date());

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day; const acts = getActividadesDelDia(cloneDay);
        const isPast = isBefore(cloneDay, hoy);
        const isToday = isSameDay(cloneDay, hoy);

        days.push(
          <div key={day.toString()} onClick={() => { setCurrentDate(cloneDay); setViewMode('dia'); }} 
            className={`min-h-30 p-2 border-b border-r border-gray-100 cursor-pointer group 
              ${!isSameMonth(day, monthStart) ? 'bg-gray-50/50 text-gray-400' : isPast ? 'bg-gray-100/60 opacity-70' : 'bg-white hover:bg-blue-50/30'}`}
          >
            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-[#00689D] text-white' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>
              {format(day, 'd')}
            </span>
            <div className="mt-2 space-y-1">
              {acts.slice(0, 3).map(act => {
                const estilos = obtenerEstilosUI(act);
                return (
                  <div key={act.id} onClick={(e) => { e.stopPropagation(); abrirDetalles(act); }} className={`px-2 py-1 rounded text-xs truncate font-medium shadow-sm transition-colors ${estilos.mes}`}>
                    {act.estado === 'Borrador' && '📝 '}{act.estado === 'Cancelada' && '🚫 '}{act.hora_inicio?.slice(0,5)} {act.nombre}
                  </div>
                );
              })}
              {acts.length > 3 && <div className="text-xs text-gray-500 font-bold pl-1">+ {acts.length - 3} más</div>}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>); days = [];
    }
    return rows;
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const hoy = startOfDay(new Date());

    return (
      <div className="grid grid-cols-7">
        {Array.from({length: 7}).map((_, i) => {
          const cloneDay = addDays(startDate, i); const acts = getActividadesDelDia(cloneDay);
          const isPast = isBefore(cloneDay, hoy); const isToday = isSameDay(cloneDay, hoy);

          return (
            <div key={i} className={`flex flex-col min-h-125 border-r border-gray-100 bg-white ${isPast ? 'opacity-70 bg-gray-100/50' : ''}`}>
              <div onClick={() => { setCurrentDate(cloneDay); setViewMode('dia'); }} className="p-3 text-center border-b border-gray-100 cursor-pointer hover:bg-blue-50">
                <p className={`text-xs font-bold uppercase ${isPast ? 'text-gray-300' : 'text-gray-400'}`}>{format(cloneDay, 'EEE', { locale: es })}</p>
                <p className={`text-xl font-black mt-1 ${isToday ? 'text-[#00689D]' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>{format(cloneDay, 'd')}</p>
              </div>
              <div className="p-2 space-y-2 flex-1 bg-gray-50/30">
                {acts.map(act => {
                  const estilos = obtenerEstilosUI(act);
                  return (
                    <div key={act.id} onClick={() => abrirDetalles(act)} className={`border-l-4 p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-all group ${estilos.semana}`}>
                      <p className="text-xs font-bold text-gray-500">{act.estado === 'Borrador' && '📝 '}{act.estado === 'Cancelada' && '🚫 '}{act.hora_inicio?.slice(0,5)}</p>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#00689D]">{act.nombre}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const acts = getActividadesDelDia(currentDate);
    const isPast = isBefore(currentDate, startOfDay(new Date()));

    if (acts.length === 0) return (
      <div className="py-24 text-center">
        <CalendarIcon className="mx-auto h-16 w-16 text-gray-200 mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Día libre</h3>
        <p className="text-gray-500">No hay actividades programadas para {isPast ? 'este día' : 'hoy'}.</p>
      </div>
    );
    
    return (
      <div className={`p-6 max-w-4xl mx-auto space-y-4 ${isPast ? 'opacity-80' : ''}`}>
        {acts.map(act => {
          const estilos = obtenerEstilosUI(act);
          return (
            <div key={act.id} onClick={() => abrirDetalles(act)} className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all group ${estilos.diaMain}`}>
              <div className={`flex flex-col items-center justify-center min-w-25 h-full py-2 rounded-xl border ${estilos.diaHora}`}>
                <span className="font-black text-xl">{act.hora_inicio?.slice(0,5) || '--:--'}</span><span className="text-xs font-bold uppercase mt-1">Inicio</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold transition-colors ${act.estado === 'Borrador' ? 'text-gray-700' : act.estado === 'Cancelada' ? 'text-red-700 group-hover:text-red-800' : 'text-gray-900 group-hover:text-[#00689D]'}`}>
                  {act.estado === 'Borrador' && '📝 '} {act.estado === 'Cancelada' && '🚫 '} {act.nombre}
                </h3>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400"/>{act.lugar || 'Por definir'}</span>
                  <span className="flex items-center gap-1.5"><Info size={16} className="text-gray-400"/>{act.municipios?.nombre || 'General (Todos los municipios)'}</span>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${act.estado === 'Borrador' ? 'bg-amber-50 text-amber-700 border-amber-200' : act.estado === 'Cancelada' ? 'bg-red-50 text-red-700 border-red-200' : act.estado === 'Realizada' ? 'bg-green-50 text-green-700 border-green-200' : act.estado === 'En curso' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                  {act.estado || 'Programada'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ==========================================
  // RENDERIZADO - VISTA LISTA
  // ==========================================
  const renderListView = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const filtradas = actividades.filter(a => {
      if (filterEstado !== 'Todos' && a.estado !== filterEstado) return false;
      if (filterFecha === 'Vigentes' && a.fecha_evento < todayStr) return false;
      if (filterFecha === 'Pasados' && a.fecha_evento >= todayStr) return false;
      return true;
    }).sort((a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime());

    return (
      <div className="animate-in fade-in duration-300">
        <div className="bg-white p-5 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 items-end shadow-sm">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Filter size={14}/> Estado</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D] bg-white text-sm font-medium" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
              <option value="Todos">Todos los estados</option>
              <option value="Programada">Programadas / Activas</option>
              <option value="Borrador">Borradores</option>
              <option value="Cancelada">Canceladas</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Filter size={14}/> Fechas</label>
            <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D] bg-white text-sm font-medium" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)}>
              <option value="Todos">Todas las fechas</option>
              <option value="Vigentes">Vigentes (Próximas y hoy)</option>
              <option value="Pasados">Pasadas</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50/50 p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ListIcon className="text-[#00689D]" size={20} /> Registros del Calendario</h3>
            <span className="bg-blue-100 text-[#00689D] text-xs font-bold px-3 py-1 rounded-full">{filtradas.length} resultados</span>
          </div>
          
          <div className="overflow-x-auto">
            {filtradas.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Archive className="text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium text-lg">No hay registros</p>
                <p className="text-gray-400 text-sm">Prueba ajustando los filtros de arriba.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Actividad</th>
                    <th className="p-4 font-bold text-center">Rol</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold">Fecha</th>
                    <th className="p-4 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtradas.map((a) => {
                    const esCrea = a.creado_por_usuario_id === usuarioDatos?.id;
                    return (
                      <tr key={a.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{a.nombre}</p>
                          <p className="text-xs text-gray-500 mt-1">{a.municipios?.nombre || 'General'}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${esCrea ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                            {esCrea ? 'Admin (Tú)' : 'Embajador'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${a.estado === 'Borrador' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : a.estado === 'Cancelada' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                            {a.estado === 'Borrador' ? 'Borrador' : a.estado === 'Cancelada' ? 'Cancelada' : 'Programada'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 font-medium">{formatearFechaCorta(a.fecha_evento)}</td>
                        <td className="p-4 flex gap-2 justify-center items-center h-full">
                          <button type="button" onClick={() => abrirDetalles(a)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Ver Detalles"><Info size={18} /></button>
                          {esCrea && (
                            <>
                              <button type="button" onClick={() => prepararEdicion(a)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar"><Edit2 size={18} /></button>
                              <button type="button" onClick={() => setDialogoConfirmacion({ isOpen: true, tipo: 'eliminar', idActividad: a.id })} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // COMPONENTE PRINCIPAL RENDER
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* HEADER PRINCIPAL UNIFICADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-blue-50 opacity-50 pointer-events-none">
          <CalendarIcon size={200} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
            <CalendarIcon className="text-[#00689D]" size={36} /> Agenda General
          </h1>
          <p className="text-gray-500 mt-2 text-base max-w-xl">
            Supervisa las actividades de todos los embajadores o crea eventos de alcance global.
          </p>
        </div>
        <div className=" flex justify-end">
         <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-[#00689D]" />
            </div>
            <select
              value={filtroMunicipioGlobal}
              onChange={(e) => setFiltroMunicipioGlobal(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[#00689D] font-bold focus:ring-2 focus:ring-[#00689D] shadow-sm transition-all appearance-none outline-none"
            >
              <option value="todos">Todos los Municipios</option>
              {municipiosDB.map(mun => (
                <option key={mun.id} value={mun.id}>{mun.nombre}</option>
              ))}
            </select>
          </div>
      </div>
        <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex shadow-inner">
            <button onClick={() => setMainTab('calendario')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${mainTab === 'calendario' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-700'}`}>Calendario</button>
            <button onClick={() => setMainTab('lista')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${mainTab === 'lista' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-700'}`}>Mi Lista</button>
          </div>
          <button onClick={abrirNuevoFormulario} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00527A] shadow-md transition-all">
            <PlusCircle size={20} /> Crear Actividad
          </button>
        </div>
      </div>

      {mainTab === 'calendario' ? (
        <>
          {/* LEYENDA VISUAL */}
          <div className="flex flex-wrap items-center gap-4 mb-6 px-2 text-xs font-medium text-gray-600">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00689D]"></div> Creadas por Mí (Admin)</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Creadas por Embajadores</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 bg-amber-100"></div> Mis Borradores</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-red-300 bg-red-100 text-red-500 flex items-center justify-center font-bold text-[8px]">X</div> Cancelada</span>
          </div>

          {/* CONTROLES CALENDARIO */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
                <button onClick={prevPeriod} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors"><ChevronLeft size={20} /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-white rounded-lg transition-colors">Hoy</button>
                <button onClick={nextPeriod} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors"><ChevronRight size={20} /></button>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[#00689D] capitalize min-w-45 text-center md:text-left">
                {viewMode === 'mes' && format(currentDate, 'MMMM yyyy', { locale: es })}
                {viewMode === 'semana' && `Sem. del ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: es })}`}
                {viewMode === 'dia' && format(currentDate, 'd MMM, yyyy', { locale: es })}
              </h2>
            </div>
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner w-full md:w-auto">
              <button onClick={() => setViewMode('dia')} className={`flex-1 flex justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'dia' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-800'}`}><ListIcon size={16} /><span className="hidden sm:inline">Día</span></button>
              <button onClick={() => setViewMode('semana')} className={`flex-1 flex justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'semana' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-800'}`}><Columns size={16} /><span className="hidden sm:inline">Semana</span></button>
              <button onClick={() => setViewMode('mes')} className={`flex-1 flex justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'mes' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-800'}`}><LayoutGrid size={16} /><span className="hidden sm:inline">Mes</span></button>
            </div>
          </div>

          {/* GRID CALENDARIO */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="h-150 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#00689D]/20 border-t-[#00689D] rounded-full animate-spin"></div></div>
            ) : (
              <>
                {viewMode !== 'dia' && (
                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="text-center font-black text-xs text-gray-500 py-3 uppercase tracking-wider">{format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i), 'EEEE', { locale: es })}</div>
                    ))}
                  </div>
                )}
                <div className="bg-white">
                  {viewMode === 'mes' && renderMonthView()}
                  {viewMode === 'semana' && renderWeekView()}
                  {viewMode === 'dia' && renderDayView()}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        renderListView()
      )}

      {/* ==========================================
          DRAWER LATERAL UNIFICADO (Detalles / Formulario)
      ========================================== */}
      <div 
        className={`fixed left-0 w-full bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${drawerState.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }}
        onClick={() => drawerState.mode === 'formulario' ? cerrarDrawerFormularioSeguro() : setDrawerState({ isOpen: false, mode: 'detalles' })} 
      />
      
      <div 
        className={`fixed right-0 z-50 ${drawerState.mode === 'formulario' ? 'w-full sm:w-[650px] md:w-[750px]' : 'w-full sm:w-[500px]'} bg-white shadow-2xl flex flex-col transform transition-all duration-300 ease-in-out ${drawerState.isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }}
      >
        {/* === VISTA DETALLES === */}
        {drawerState.mode === 'detalles' && eventoSeleccionado && (
          <>
            <div className={`${obtenerEstilosUI(eventoSeleccionado).drawerHeader} p-6 text-white shrink-0 relative transition-colors`}>
              <button onClick={() => setDrawerState({ isOpen: false, mode: 'detalles' })} className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
                {eventoSeleccionado.estado === 'Borrador' ? 'Modo Borrador' : eventoSeleccionado.estado || 'Programada'}
              </span>
              <h2 className="text-2xl font-black leading-tight pr-8">{eventoSeleccionado.nombre}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#00689D]'}`}><Clock size={24} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Cuándo</p>
                    <p className={`font-bold capitalize text-lg ${eventoSeleccionado.estado === 'Cancelada' ? 'text-red-700 line-through opacity-70' : 'text-gray-900'}`}>{formatearFechaLarga(eventoSeleccionado.fecha_evento)}</p>
                    <p className="text-gray-600 font-medium">{eventoSeleccionado.hora_inicio?.slice(0,5) || '--:--'} hrs - {eventoSeleccionado.hora_fin ? eventoSeleccionado.hora_fin.slice(0,5) + ' hrs' : 'Fin por definir'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#00689D]'}`}><MapPin size={24} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Dónde</p>
                    <p className="font-bold text-gray-900 text-lg leading-tight">{eventoSeleccionado.lugar || 'Lugar sin especificar'}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      {eventoSeleccionado.calle && <p className="text-gray-700"><span className="font-bold">Calle:</span> {eventoSeleccionado.calle}</p>}
                      {eventoSeleccionado.colonia && <p className="text-gray-700"><span className="font-bold">Colonia:</span> {eventoSeleccionado.colonia}</p>}
                      {eventoSeleccionado.direccion && <p className="text-gray-600 italic"><span className="font-bold not-italic text-gray-700">Ref:</span> {eventoSeleccionado.direccion}</p>}
                    </div>
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-800 font-bold rounded-lg text-sm border border-gray-200">
                      📍 {eventoSeleccionado.municipios?.nombre || 'General (Todos los municipios)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-6 border-t border-gray-100">
                <div className={`p-3 rounded-xl shrink-0 ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#00689D]'}`}><User size={24} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Organizador</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {eventoSeleccionado.es_externa && eventoSeleccionado.instituciones?.nombre 
                      ? <span className="text-purple-600">{eventoSeleccionado.instituciones.nombre}</span> 
                      : `${eventoSeleccionado.creador?.nombre} ${eventoSeleccionado.creador?.apellido}`
                    }
                    {eventoSeleccionado.creado_por_usuario_id === usuarioDatos?.id && !eventoSeleccionado.es_externa && <span className={`ml-2 font-black text-sm ${eventoSeleccionado.estado === 'Cancelada' ? 'text-red-600' : 'text-[#00689D]'}`}>(TÚ / ADMIN)</span>}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Target size={18} className={eventoSeleccionado.estado === 'Cancelada' ? 'text-red-600' : 'text-[#00689D]'} /> Impacto y Alineación</h3>
                {eventoSeleccionado.actividad_acciones && eventoSeleccionado.actividad_acciones.length > 0 && (
                  <div className="mb-4 flex items-center gap-2">
                    <ActivityIcon size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Tipo:</span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{eventoSeleccionado.actividad_acciones[0].tipos_accion?.nombre || 'Actividad'}</span>
                  </div>
                )}
                {eventoSeleccionado.actividad_ods && eventoSeleccionado.actividad_ods.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {eventoSeleccionado.actividad_ods.map((rel, idx) => (
                      <span key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-[#00689D]'}`}>
                        <span className={`w-4 h-4 text-white rounded-full flex items-center justify-center text-[9px] ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-600' : 'bg-[#00689D]'}`}>{rel.ods?.numero}</span>
                        {rel.ods?.nombre}
                      </span>
                    ))}
                  </div>
                )}
                {eventoSeleccionado.descripcion && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">Detalles Adicionales</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{eventoSeleccionado.descripcion}</p>
                  </div>
                )}
              </div>
              
              {eventoSeleccionado.estado !== 'Borrador' && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Users size={18} className={eventoSeleccionado.estado === 'Cancelada' ? 'text-red-600' : 'text-[#00689D]'} /> Embajadores Unidos</p>
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-bold">{eventoSeleccionado.actividad_asistentes?.length || 0}</span>
                  </div>

                  {eventoSeleccionado.actividad_asistentes?.length > 0 ? (
                    <div className="space-y-2 mb-6 max-h-32 overflow-y-auto pr-2">
                      {eventoSeleccionado.actividad_asistentes.map((asistente, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-medium">
                          <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold ${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-500' : 'bg-[#00689D]'}`}>
                            {asistente.usuarios?.nombre?.charAt(0) || 'U'}
                          </div>
                          <span className="text-gray-700">{asistente.usuarios?.nombre} {asistente.usuarios?.apellido}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500 mb-6 italic">Aún no hay embajadores unidos a esta actividad.</p>}
                </div>
              )}
            </div>

            {/* Footer Admin (Solo puede editar las que él creó) */}
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              {eventoSeleccionado.creado_por_usuario_id === usuarioDatos?.id ? (
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button onClick={() => setDialogoConfirmacion({ isOpen: true, tipo: 'eliminar', idActividad: eventoSeleccionado.id })} title="Eliminar permanentemente" className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"><Trash2 size={20} /></button>
                  {eventoSeleccionado.estado !== 'Cancelada' && (
                    <button onClick={() => setDialogoConfirmacion({ isOpen: true, tipo: 'cancelar_evento', idActividad: eventoSeleccionado.id })} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors shadow-sm"><Ban size={16} /> Cancelar Evento</button>
                  )}
                  <button onClick={() => prepararEdicion(eventoSeleccionado)} className="flex items-center gap-2 px-6 py-2.5 bg-[#00689D] hover:bg-[#00527A] text-white font-bold rounded-xl transition-colors shadow-sm"><Edit2 size={16} /> Editar</button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button onClick={() => setDrawerState({ isOpen: false, mode: 'detalles' })} className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold rounded-xl transition-colors shadow-sm">Cerrar panel</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* === VISTA FORMULARIO === */}
        {drawerState.mode === 'formulario' && (
          <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                  <FileText className="text-[#00689D]" size={28} /> {editingId ? 'Editar Actividad Global' : 'Nueva Actividad Global'}
                </h2>
                <p className="text-gray-500 mt-1 text-sm">Crea actividades visibles para uno o varios municipios.</p>
              </div>
              <button onClick={cerrarDrawerFormularioSeguro} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <form id="form-actividad-admin" onSubmit={handleSubmitForm} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#00689D] flex items-center gap-2 border-b pb-2"><Target size={18}/> Datos Generales</h3>

                  {/* SECCIÓN INSTITUCIÓN EXTERNA */}
                  <div className="bg-purple-50/50 p-4 border border-purple-100 rounded-xl mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="es_externa" 
                        checked={formData.es_externa} 
                        onChange={(e) => setFormData({...formData, es_externa: e.target.checked})} 
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-600"
                      />
                      <span className="text-sm font-bold text-gray-800">
                        ¿Fue una actividad organizada por un tercero (Escuela, Institución, Empresa)?
                      </span>
                    </label>
                    {formData.es_externa && (
                      <div className="mt-3 ml-6">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Nombre de la Institución u Organizador <span className="text-red-500">*</span></label>
                        <select 
                          required
                          name="institucion_id" 
                          value={formData.institucion_id || ''} 
                          onChange={(e) => setFormData({...formData, institucion_id: Number(e.target.value)})} 
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-purple-500"
                        >
                          <option value="">-- Selecciona una Institución --</option>
                          {institucionesDB.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Actividad <span className="text-red-500">*</span></label>
                      <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Cumbre Climática General" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Acción Principal <span className="text-red-500">*</span></label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:border-[#00689D] text-sm" value={formData.tipo_accion_id} onChange={(e) => setFormData({...formData, tipo_accion_id: Number(e.target.value)})}>
                        <option value="0">-- Selecciona la Acción --</option>
                        {tiposAccionDB.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                      <textarea required rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg resize-none outline-none focus:border-[#00689D] text-sm" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} placeholder="Explica el objetivo..."></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                  <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-500 mb-3">El primero que selecciones se registrará como el principal.</p>
                  <div className="flex flex-wrap gap-2">
                    {odsDB.map(ods => {
                      const isSelected = odsSeleccionados.includes(ods.id);
                      return (
                        <button key={ods.id} type="button" onClick={() => toggleOdsForm(ods.id)} className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${isSelected ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-white text-gray-600 hover:border-[#00689D]'}`}>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${isSelected ? 'bg-white text-[#00689D]' : 'bg-gray-100'}`}>{ods.numero}</span>
                          {ods.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#00689D] flex items-center gap-2 border-b pb-2"><MapPin size={18}/> Cuándo y Dónde</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
                      <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.fecha_evento} onChange={(e) => setFormData({...formData, fecha_evento: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Inicio <span className="text-red-500">*</span></label>
                      <input type="time" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.hora_inicio} onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Fin <span className="text-red-500">*</span></label>
                      <input type="time" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.hora_fin} onChange={(e) => setFormData({...formData, hora_fin: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Municipio <span className="text-red-500">*</span></label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none bg-white focus:border-[#00689D] text-sm" value={formData.municipio_id} onChange={(e) => setFormData({...formData, municipio_id: Number(e.target.value)})}>
                        <option value="0">General (Todos los municipios)</option>
                        {municipiosDB.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Lugar Exacto <span className="text-red-500">*</span></label>
                      <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.lugar} onChange={(e) => setFormData({...formData, lugar: e.target.value})} placeholder="Ej. Congreso del Estado" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Dirección Detallada <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.calle} onChange={(e) => setFormData({...formData, calle: e.target.value})} placeholder="Calle y número" />
                      <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.colonia} onChange={(e) => setFormData({...formData, colonia: e.target.value})} placeholder="Colonia" />
                      <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#00689D] text-sm" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} placeholder="Referencias" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-end gap-3 shrink-0">
              <button type="button" onClick={cerrarDrawerFormularioSeguro} disabled={isSaving} className="w-full sm:w-auto px-6 py-2.5 font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              
              {editingId && formData.estado !== 'Cancelada' && (
                <button type="button" onClick={() => setDialogoConfirmacion({ isOpen: true, tipo: 'cancelar_evento', idActividad: editingId })} disabled={isSaving} className="w-full sm:w-auto px-6 py-2.5 font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Ban size={16} /> Cancelar Evento
                </button>
              )}

              {(!editingId || formData.estado === 'Borrador') && (
                <button form="form-actividad-admin" type="submit" name="accionBoton" value="Borrador" disabled={isSaving} className="w-full sm:w-auto px-6 py-2.5 font-bold text-[#00689D] bg-blue-50 border border-[#00689D] rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Archive size={16} /> Guardar Borrador
                </button>
              )}

              <button form="form-actividad-admin" type="submit" name="accionBoton" value="Programada" disabled={isSaving} className="w-full sm:w-auto px-8 py-2.5 font-bold text-white bg-[#00689D] rounded-xl hover:bg-[#00527A] shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={16} /> {editingId ? (formData.estado === 'Borrador' ? 'Publicar Borrador' : formData.estado === 'Cancelada' ? 'Publicar Actividad' : 'Actualizar Actividad') : 'Publicar Actividad'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          ALERT DIALOG MODAL (Acciones Críticas)
      ========================================== */}
      <AlertDialog open={dialogoConfirmacion.isOpen} onOpenChange={(isOpen) => !isOpen && setDialogoConfirmacion({ isOpen: false, tipo: null, idActividad: null })}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-black flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} /> 
              {dialogoConfirmacion.tipo === 'eliminar' ? '¿Eliminar Actividad?' : 
               dialogoConfirmacion.tipo === 'cancelar_evento' ? '¿Cancelar Actividad?' : '¿Descartar Cambios?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {dialogoConfirmacion.tipo === 'eliminar' 
                ? '¿Estás seguro de que deseas eliminar permanentemente esta actividad? Esta acción no se puede deshacer.'
                : dialogoConfirmacion.tipo === 'cancelar_evento'
                ? '¿Estás seguro de que deseas marcar esta actividad como Cancelada? Los asistentes verán este cambio de estado inmediatamente.'
                : 'Se perderá todo el progreso y los datos que no hayas guardado en el formulario. Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isProcessingAction} className="bg-gray-100 border-none font-bold hover:bg-gray-200 text-gray-700">
              {dialogoConfirmacion.tipo === 'descartar_form' ? 'Seguir editando' : 'Regresar'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); ejecutarAccionConfirmada(); }}
              disabled={isProcessingAction}
              className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2"
            >
              {isProcessingAction && <Loader2 size={16} className="animate-spin" />}
              {dialogoConfirmacion.tipo === 'eliminar' ? 'Sí, eliminar' : dialogoConfirmacion.tipo === 'cancelar_evento' ? 'Sí, cancelar' : 'Sí, descartar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}