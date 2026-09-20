// import { useEffect, useState } from 'react';
// import { supabase } from '../../lib/supabase';
// import { Save, Target, Globe, MapPin, FileText, List, Edit, Trash2, X, Archive, Plus, Filter, AlertCircle, Ban } from 'lucide-react';
// import { toast } from 'sonner';
// import { parseISO, format } from 'date-fns';
// import { es } from 'date-fns/locale';

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

// interface Ods { id: number; nombre: string; numero: number; }
// interface Catalogo { id: number; nombre: string; }
// interface ActividadList {
//   id: number;
//   nombre: string;
//   fecha_evento: string;
//   lugar: string;
//   estado: string;
//   municipios: { nombre: string } | null;
//   es_creador?: boolean; 
// }

// const mapearErrorAmigable = (error: any) => {
//   const msg = error?.message || '';
//   if (msg.includes('fetch')) return 'Error de conexión. Revisa tu internet.';
//   if (msg.includes('duplicate')) return 'Ya existe un registro con estos datos.';
//   return 'Ocurrió un error inesperado al procesar la solicitud.';
// };

// export default function EmbajadorActividades() {
//   const [actividades, setActividades] = useState<ActividadList[]>([]);
//   const [municipios, setMunicipios] = useState<Catalogo[]>([]);
//   const [tiposAccion, setTiposAccion] = useState<Catalogo[]>([]);
//   const [listaOds, setListaOds] = useState<Ods[]>([]);
  
//   const [loading, setLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);

//   const [showForm, setShowForm] = useState(false);
//   const [filterEstado, setFilterEstado] = useState('Todos');
//   const [filterFecha, setFilterFecha] = useState('Todos');

//   const [showDiscardDialog, setShowDiscardDialog] = useState(false);
//   const [showCancelEventDialog, setShowCancelEventDialog] = useState(false);
//   const [activityToDelete, setActivityToDelete] = useState<number | null>(null);

//   const [formData, setFormData] = useState({
//     nombre: '', descripcion: '', tipo_accion_id: 0, fecha_evento: '', hora_inicio: '', hora_fin: '',
//     municipio_id: 0, lugar: '', calle: '', colonia: '', direccion: '', estado: 'Programada'
//   });

//   const [odsSeleccionados, setOdsSeleccionados] = useState<number[]>([]);

//   const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

//   const formatearFecha = (fechaStr: string) => {
//     if (!fechaStr) return '';
//     return format(parseISO(fechaStr), "d 'de' MMMM 'del' yyyy", { locale: es });
//   };

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const { data: authData } = await supabase.auth.getUser();
//       const userId = authData.user?.id;
//       if (!userId) throw new Error("No hay usuario autenticado.");

//       const { data: actsCreadas, error: errCreadas } = await supabase
//         .from('actividades')
//         .select('id, nombre, fecha_evento, lugar, estado, creado_por_usuario_id, municipios(nombre)')
//         .is('fecha_eliminacion', null)
//         .eq('creado_por_usuario_id', userId);

//       if (errCreadas) throw errCreadas;

//       const { data: actsUnidas, error: errUnidas } = await supabase
//         .from('actividad_asistentes')
//         .select(`
//           actividad_id,
//           actividades (
//             id, nombre, fecha_evento, lugar, estado, creado_por_usuario_id, municipios(nombre), fecha_eliminacion
//           )
//         `)
//         .eq('usuario_id', userId);

//       if (errUnidas) throw errUnidas;

//       const actividadesMap = new Map<number, ActividadList>();

//       actsCreadas?.forEach(act => {
//         actividadesMap.set(act.id, {
//           id: act.id, nombre: act.nombre, fecha_evento: act.fecha_evento, lugar: act.lugar,
//           estado: act.estado || 'Programada',
//           municipios: Array.isArray(act.municipios) ? act.municipios[0] : act.municipios,
//           es_creador: true 
//         });
//       });

//       actsUnidas?.forEach((item: any) => {
//         const act = Array.isArray(item.actividades) ? item.actividades[0] : item.actividades;
//         if (act && act.fecha_eliminacion === null && !actividadesMap.has(act.id)) {
//           actividadesMap.set(act.id, {
//             id: act.id, nombre: act.nombre, fecha_evento: act.fecha_evento, lugar: act.lugar,
//             estado: act.estado || 'Programada',
//             municipios: Array.isArray(act.municipios) ? act.municipios[0] : act.municipios,
//             es_creador: act.creado_por_usuario_id === userId 
//           });
//         }
//       });
      
//       const actividadesCombinadas = Array.from(actividadesMap.values()).sort((a, b) => {
//         return new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime();
//       });

//       setActividades(actividadesCombinadas);

//       const [resMun, resOds, resTipos] = await Promise.all([
//         supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
//         supabase.from('ods').select('id, nombre, numero').eq('activo', true).order('numero', { ascending: true }),
//         supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('nombre')
//       ]);

//       if (resMun.data) setMunicipios(resMun.data);
//       if (resOds.data) setListaOds(resOds.data);
//       if (resTipos.data) setTiposAccion(resTipos.data);

//     } catch (error: any) {
//       toast.error(mapearErrorAmigable(error));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   const toggleOds = (idOds: number) => {
//     setOdsSeleccionados(prev => prev.includes(idOds) ? prev.filter(id => id !== idOds) : [...prev, idOds]);
//   };

//   const handleEdit = async (id: number) => {
//     const loadingToast = toast.loading('Cargando actividad...');
//     try {
//       const { data: act, error } = await supabase.from('actividades').select('*').eq('id', id).single();
//       if (error) throw error;

//       const { data: ods } = await supabase.from('actividad_ods').select('ods_id').eq('actividad_id', id);
//       const { data: acciones } = await supabase.from('actividad_acciones').select('tipo_accion_id').eq('actividad_id', id).maybeSingle();

//       setFormData({
//         nombre: act.nombre || '', descripcion: act.descripcion || '',
//         tipo_accion_id: acciones ? acciones.tipo_accion_id : 0,
//         fecha_evento: act.fecha_evento ? act.fecha_evento.split('T')[0] : '',
//         hora_inicio: act.hora_inicio ? act.hora_inicio.substring(0, 5) : '',
//         hora_fin: act.hora_fin ? act.hora_fin.substring(0, 5) : '',
//         municipio_id: act.municipio_id || 0, lugar: act.lugar || '',
//         calle: act.calle || '', colonia: act.colonia || '', direccion: act.direccion || '',
//         estado: act.estado || 'Programada'
//       });
      
//       setOdsSeleccionados(ods ? ods.map((o: any) => o.ods_id) : []);
//       setEditingId(id);
//       setShowForm(true); 
      
//       toast.dismiss(loadingToast);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     } catch (error: any) {
//       toast.error(mapearErrorAmigable(error), { id: loadingToast });
//     }
//   };

//   const confirmDelete = async () => {
//     if (!activityToDelete) return;
//     const toastId = toast.loading('Eliminando actividad...');
//     try {
//       const { data: authData } = await supabase.auth.getUser();
//       const { error } = await supabase.from('actividades')
//         .update({ fecha_eliminacion: new Date().toISOString(), actualizado_por_usuario_id: authData.user?.id })
//         .eq('id', activityToDelete);
        
//       if (error) throw error;
//       toast.success('Actividad eliminada permanentemente.', { id: toastId });
//       if (editingId === activityToDelete) resetForm();
//       fetchData();
//     } catch (error: any) {
//       toast.error(mapearErrorAmigable(error), { id: toastId });
//     } finally {
//       setActivityToDelete(null);
//     }
//   };

//   const confirmCancelEvent = async () => {
//     if (!editingId) return;
//     setIsSaving(true);
//     const toastId = toast.loading('Cancelando evento...');
//     try {
//       const { data: authData } = await supabase.auth.getUser();
//       const { error } = await supabase.from('actividades')
//         .update({ estado: 'Cancelada', actualizado_por_usuario_id: authData.user?.id })
//         .eq('id', editingId);
        
//       if (error) throw error;
//       toast.success('El evento ha sido cancelado exitosamente.', { id: toastId });
//       resetForm();
//       fetchData();
//     } catch (error: any) {
//       toast.error(mapearErrorAmigable(error), { id: toastId });
//     } finally {
//       setIsSaving(false);
//       setShowCancelEventDialog(false);
//     }
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setFormData({
//       nombre: '', descripcion: '', tipo_accion_id: 0, fecha_evento: '', hora_inicio: '', hora_fin: '',
//       municipio_id: 0, lugar: '', calle: '', colonia: '', direccion: '', estado: 'Programada'
//     });
//     setOdsSeleccionados([]);
//     setShowForm(false); 
//   };

//   const handleDiscardClick = () => {
//     const formTieneDatos = formData.nombre.trim() !== '' || formData.descripcion.trim() !== '' || formData.tipo_accion_id !== 0 || odsSeleccionados.length > 0;
//     if (!formTieneDatos) {
//       resetForm();
//     } else {
//       setShowDiscardDialog(true);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
//     const estadoGuardar = submitter?.value ? submitter.value : formData.estado;
    
//     if (formData.municipio_id === 0) return toast.warning("Selecciona un municipio.");
//     if (formData.tipo_accion_id === 0) return toast.warning("Selecciona el Tipo de Acción Principal.");
//     if (odsSeleccionados.length === 0) return toast.warning("Debes alinear la actividad con al menos un ODS.");
//     if (!formData.calle.trim() || !formData.colonia.trim()) return toast.warning("La calle y colonia son obligatorias.");

//     setIsSaving(true);
//     const toastId = toast.loading(editingId ? 'Procesando cambios...' : 'Guardando actividad...');

//     try {
//       const { data: authData } = await supabase.auth.getUser();
//       const userId = authData.user?.id;

//       const payloadActividad = {
//         nombre: formData.nombre.trim(), descripcion: formData.descripcion.trim(),
//         fecha_evento: formData.fecha_evento, hora_inicio: formData.hora_inicio, hora_fin: formData.hora_fin,
//         municipio_id: formData.municipio_id, lugar: formData.lugar.trim(),
//         calle: formData.calle.trim(), colonia: formData.colonia.trim(), direccion: formData.direccion.trim(),
//         estado: estadoGuardar, actualizado_por_usuario_id: userId 
//       };

//       let actividadId = editingId;

//       if (editingId) {
//         const { error: errAct } = await supabase.from('actividades').update(payloadActividad).eq('id', editingId);
//         if (errAct) throw errAct;
//         await supabase.from('actividad_ods').delete().eq('actividad_id', editingId);
//         await supabase.from('actividad_acciones').delete().eq('actividad_id', editingId);
//       } else {
//         const { data: nuevaActividad, error: errAct } = await supabase.from('actividades').insert([{ ...payloadActividad, creado_por_usuario_id: userId }]).select('id').single();
//         if (errAct || !nuevaActividad) throw errAct;
//         actividadId = nuevaActividad.id;
//         await supabase.from('actividad_asistentes').insert([{ actividad_id: actividadId, usuario_id: userId }]);
//       }

//       await supabase.from('actividad_ods').insert(odsSeleccionados.map((ods_id, idx) => ({ actividad_id: actividadId, ods_id: ods_id, es_principal: idx === 0 })));
//       await supabase.from('actividad_acciones').insert([{ actividad_id: actividadId, tipo_accion_id: formData.tipo_accion_id, cantidad: 1 }]);

//       resetForm();
//       fetchData();
//       toast.success(`¡Actividad ${estadoGuardar === 'Borrador' ? 'guardada como borrador' : 'publicada'}!`, { id: toastId });

//     } catch (error: any) {
//       toast.error(mapearErrorAmigable(error), { id: toastId });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const todayStr = getTodayStr();
//   const actividadesFiltradas = actividades.filter(a => {
//     if (filterEstado !== 'Todos' && a.estado !== filterEstado) return false;
//     if (filterFecha === 'Vigentes' && a.fecha_evento < todayStr) return false;
//     if (filterFecha === 'Pasados' && a.fecha_evento >= todayStr) return false;
//     return true;
//   });

//   return (
//     <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 relative">
//       <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
//         <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-gray-900 font-black">¿Descartar cambios?</AlertDialogTitle>
//             <AlertDialogDescription className="text-gray-600">Se perderá todo el progreso no guardado.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter className="mt-4">
//             <AlertDialogCancel className="bg-gray-100 font-bold hover:bg-gray-200 text-gray-700">Seguir editando</AlertDialogCancel>
//             <AlertDialogAction onClick={() => { resetForm(); setShowDiscardDialog(false); }} className="bg-red-600 hover:bg-red-700 text-white font-bold">Sí, descartar</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <AlertDialog open={activityToDelete !== null} onOpenChange={(isOpen) => !isOpen && setActivityToDelete(null)}>
//         <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-gray-900 font-black flex items-center gap-2"><Trash2 className="text-red-500" size={20} /> ¿Eliminar esta actividad?</AlertDialogTitle>
//             <AlertDialogDescription className="text-gray-600">Esta acción removerá la actividad de forma permanente.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter className="mt-4">
//             <AlertDialogCancel onClick={() => setActivityToDelete(null)} className="bg-gray-100 font-bold hover:bg-gray-200 text-gray-700">Conservar</AlertDialogCancel>
//             <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold">Sí, eliminar</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <AlertDialog open={showCancelEventDialog} onOpenChange={setShowCancelEventDialog}>
//         <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-gray-900 font-black flex items-center gap-2"><Ban className="text-red-500" size={20} /> ¿Cancelar el evento?</AlertDialogTitle>
//             <AlertDialogDescription className="text-gray-600">La actividad cambiará su estado a Cancelada.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter className="mt-4">
//             <AlertDialogCancel className="bg-gray-100 font-bold hover:bg-gray-200 text-gray-700">Mantener evento</AlertDialogCancel>
//             <AlertDialogAction onClick={confirmCancelEvent} className="bg-red-600 hover:bg-red-700 text-white font-bold">Sí, cancelar</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {!showForm ? (
//         <>
//           <div className="bg-white rounded-2xl shadow-md border-t-4 border-[#00689D] p-6 md:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
//             <div>
//               <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3"><FileText className="text-[#00689D]" size={32} /> Mis Actividades</h2>
//               <p className="text-gray-500 mt-2">Gestiona las actividades que coordinas o en las que participas.</p>
//             </div>
//             <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-[#00689D] rounded-xl hover:bg-[#00527A] shadow-md transition-all flex items-center justify-center gap-2">
//               <Plus size={20} /> Añadir Actividad
//             </button>
//           </div>

//           <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 items-end">
//             <div className="flex-1 w-full">
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Filter size={14}/> Estado</label>
//               <select className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D] bg-white text-sm font-medium" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
//                 <option value="Todos">Todos los estados</option>
//                 <option value="Programada">Programadas / Activas</option>
//                 <option value="Borrador">Borradores</option>
//                 <option value="Cancelada">Canceladas</option>
//               </select>
//             </div>
//             <div className="flex-1 w-full">
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Filter size={14}/> Fechas</label>
//               <select className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D] bg-white text-sm font-medium" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)}>
//                 <option value="Todos">Todas las fechas</option>
//                 <option value="Vigentes">Vigentes (Próximas y hoy)</option>
//                 <option value="Pasados">Pasadas</option>
//               </select>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
//             <div className="bg-gray-50/50 p-6 border-b border-gray-200 flex items-center justify-between">
//               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><List className="text-[#00689D]" size={24} /> Registros </h3>
//               <span className="bg-blue-100 text-[#00689D] text-xs font-bold px-3 py-1 rounded-full">{actividadesFiltradas.length} resultados</span>
//             </div>
            
//             <div className="overflow-x-auto">
//               {loading ? (
//                 <div className="p-8 text-center text-gray-500 animate-pulse">Cargando actividades...</div>
//               ) : actividadesFiltradas.length === 0 ? (
//                 <div className="p-12 text-center flex flex-col items-center justify-center">
//                   <Archive className="text-gray-300 mb-3" size={48} />
//                   <p className="text-gray-500 font-medium text-lg">No se encontraron actividades</p>
//                 </div>
//               ) : (
//                 <table className="w-full text-left text-sm">
//                   <thead>
//                     <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
//                       <th className="p-4 font-bold">Actividad</th>
//                       <th className="p-4 font-bold text-center">Tu Rol</th>
//                       <th className="p-4 font-bold">Estado</th>
//                       <th className="p-4 font-bold">Fecha</th>
//                       <th className="p-4 font-bold">Municipio</th>
//                       <th className="p-4 font-bold text-center">Acciones</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {actividadesFiltradas.map((a) => (
//                       <tr key={a.id} className="hover:bg-blue-50/50 transition-colors">
//                         <td className="p-4 font-medium text-gray-900">{a.nombre}</td>
//                         <td className="p-4 text-center">
//                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${a.es_creador ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{a.es_creador ? 'Creador' : 'Participante'}</span>
//                         </td>
//                         <td className="p-4">
//                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${a.estado === 'Borrador' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : a.estado === 'Cancelada' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
//                             {a.estado}
//                           </span>
//                         </td>
//                         <td className="p-4 text-gray-600">{formatearFecha(a.fecha_evento)}</td>
//                         <td className="p-4">
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
//                             {a.municipios?.nombre || 'Sin asignar'}
//                           </span>
//                         </td>
//                         <td className="p-4 flex gap-2 justify-center items-center h-full">
//                           {a.es_creador ? (
//                             <>
//                               <button type="button" onClick={() => handleEdit(a.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar"><Edit size={18} /></button>
//                               <button type="button" onClick={() => setActivityToDelete(a.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18} /></button>
//                             </>
//                           ) : (
//                             <span className="text-[11px] text-gray-400 italic px-2 py-1 flex items-center gap-1">{a.estado === 'Cancelada' && <AlertCircle size={12}/>} Solo lectura</span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         </>
//       ) : (
//         <div className="bg-white rounded-2xl shadow-md border-t-4 border-[#00689D] p-6 md:p-8 mb-8 animate-in slide-in-from-bottom-4 duration-500">
//           <div className="mb-8 border-b border-gray-100 pb-4 flex justify-between items-start">
//             <div>
//               <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3"><FileText className="text-[#00689D]" size={32} /> {editingId ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
//               <p className="text-gray-500 mt-2">Completa la información para registrar esta actividad en tu municipio.</p>
//             </div>
//             <button type="button" onClick={handleDiscardClick} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-8">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-200">
//               <h3 className="md:col-span-2 text-lg font-bold text-[#00689D] flex items-center gap-2"><Target size={18}/> Datos Generales</h3>
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
//                 <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Taller de Reforestación" />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Acción <span className="text-red-500">*</span></label>
//                 <select required className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.tipo_accion_id} onChange={(e) => setFormData({...formData, tipo_accion_id: Number(e.target.value)})}>
//                   <option value="0">-- Selecciona --</option>
//                   {tiposAccion.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
//                 </select>
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
//                 <textarea required rows={3} className="w-full p-3 border border-gray-300 rounded-lg resize-none outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} placeholder="Explica la dinámica..."></textarea>
//               </div>
//             </div>

//             <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100">
//               <h3 className="font-bold text-[#00689D] mb-1 flex items-center gap-2"><Globe size={18}/> Alineación ODS <span className="text-red-500">*</span></h3>
//               <div className="flex flex-wrap gap-2 mt-4">
//                 {listaOds.map(ods => {
//                   const isSelected = odsSeleccionados.includes(ods.id);
//                   return (
//                     <button key={ods.id} type="button" onClick={() => toggleOds(ods.id)} className={`px-3 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all ${isSelected ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-white text-gray-600 hover:border-[#00689D]'}`}>
//                       <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isSelected ? 'bg-white text-[#00689D]' : 'bg-gray-100'}`}>{ods.numero}</span>
//                       {ods.nombre}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-200">
//               <h3 className="md:col-span-3 text-lg font-bold text-[#00689D] flex items-center gap-2"><MapPin size={18}/> Cuándo y Dónde</h3>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
//                 <input type="date" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.fecha_evento} onChange={(e) => setFormData({...formData, fecha_evento: e.target.value})} />
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Hora Inicio <span className="text-red-500">*</span></label>
//                 <input type="time" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.hora_inicio} onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})} />
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Hora Fin <span className="text-red-500">*</span></label>
//                 <input type="time" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.hora_fin} onChange={(e) => setFormData({...formData, hora_fin: e.target.value})} />
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Municipio <span className="text-red-500">*</span></label>
//                 <select required className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#00689D]" value={formData.municipio_id} onChange={(e) => setFormData({...formData, municipio_id: Number(e.target.value)})}>
//                   <option value="0">-- Selecciona --</option>
//                   {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
//                 </select>
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Lugar Exacto <span className="text-red-500">*</span></label>
//                 <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.lugar} onChange={(e) => setFormData({...formData, lugar: e.target.value})} />
//               </div>
//               <div className="md:col-span-3 pt-2">
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Dirección <span className="text-red-500">*</span></label>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                   <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.calle} onChange={(e) => setFormData({...formData, calle: e.target.value})} placeholder="Calle" />
//                   <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.colonia} onChange={(e) => setFormData({...formData, colonia: e.target.value})} placeholder="Colonia" />
//                   <input type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} placeholder="Referencias" />
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-gray-100">
//               <button type="button" onClick={handleDiscardClick} disabled={isSaving} className="w-full sm:w-auto px-6 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 border transition-all disabled:opacity-50 flex gap-2"><X size={18} /> Cancelar edición</button>
//               {editingId && formData.estado !== 'Cancelada' && (
//                 <button type="button" onClick={() => setShowCancelEventDialog(true)} disabled={isSaving} className="w-full sm:w-auto px-6 py-3 font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 flex gap-2"><Ban size={18} /> Cancelar Evento</button>
//               )}
//               {(!editingId || formData.estado === 'Borrador') && (
//                 <button type="submit" name="accionBoton" value="Borrador" disabled={isSaving} className="w-full sm:w-auto px-6 py-3 font-bold text-[#00689D] bg-blue-50 border border-[#00689D] rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50 flex gap-2"><Archive size={18} /> Guardar Borrador</button>
//               )}
//               <button type="submit" name="accionBoton" value="Programada" disabled={isSaving} className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-[#00689D] rounded-xl hover:bg-[#00527A] shadow-md transition-all disabled:opacity-50 flex gap-2"><Save size={18} /> Publicar</button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Save,
  Target,
  Globe,
  MapPin,
  FileText,
  List,
  Edit,
  Trash2,
  X,
  Archive,
  Plus,
  Filter,
  AlertCircle,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';
import { parseISO, format, isValid } from 'date-fns';
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
} from '@/components/ui/alert-dialog';

interface Ods {
  id: number;
  nombre: string;
  numero: number;
}

interface Catalogo {
  id: number;
  nombre: string;
}

interface ActividadList {
  id: number;
  nombre: string;
  fecha_evento: string;
  lugar: string;
  estado: string;
  municipios: { nombre: string } | null;
  es_creador?: boolean;
}

type FormDataActividad = {
  nombre: string;
  descripcion: string;
  tipo_accion_id: number;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  municipio_id: number;
  lugar: string;
  calle: string;
  colonia: string;
  direccion: string;
  estado: string;
};

const mapearErrorAmigable = (error: any) => {
  const msg = String(error?.message || '').toLowerCase();

  if (
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('failed to fetch')
  ) {
    return 'Error de conexión. Revisa tu internet e inténtalo nuevamente.';
  }

  if (
    msg.includes('duplicate') ||
    msg.includes('unique constraint') ||
    msg.includes('23505')
  ) {
    return 'Ya existe un registro con estos datos.';
  }

  if (
    msg.includes('row-level security') ||
    msg.includes('rls') ||
    msg.includes('permission denied') ||
    msg.includes('42501')
  ) {
    return 'No tienes permisos para realizar esta operación.';
  }

  if (
    msg.includes('foreign key') ||
    msg.includes('23503')
  ) {
    return 'No se puede realizar la operación porque existen datos relacionados.';
  }

  if (
    msg.includes('not-null') ||
    msg.includes('23502')
  ) {
    return 'Faltan datos obligatorios para completar la operación.';
  }

  return error?.message || 'Ocurrió un error inesperado al procesar la solicitud.';
};

const FORMULARIO_INICIAL: FormDataActividad = {
  nombre: '',
  descripcion: '',
  tipo_accion_id: 0,
  fecha_evento: '',
  hora_inicio: '',
  hora_fin: '',
  municipio_id: 0,
  lugar: '',
  calle: '',
  colonia: '',
  direccion: '',
  estado: 'Programada',
};

export default function EmbajadorActividades() {
  const [actividades, setActividades] = useState<ActividadList[]>([]);
  const [municipios, setMunicipios] = useState<Catalogo[]>([]);
  const [tiposAccion, setTiposAccion] = useState<Catalogo[]>([]);
  const [listaOds, setListaOds] = useState<Ods[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterFecha, setFilterFecha] = useState('Todos');

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showCancelEventDialog, setShowCancelEventDialog] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);

  const [formData, setFormData] =
    useState<FormDataActividad>(FORMULARIO_INICIAL);

  const [odsSeleccionados, setOdsSeleccionados] = useState<number[]>([]);

  const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '';

    const fecha = parseISO(fechaStr);

    if (!isValid(fecha)) {
      return 'Fecha inválida';
    }

    return format(fecha, "d 'de' MMMM 'del' yyyy", {
      locale: es,
    });
  };

  /**
   * Carga todas las actividades relacionadas con el usuario:
   * - actividades creadas por él
   * - actividades donde participa como asistente
   */
  const fetchData = async () => {
    setLoading(true);

    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (!userId) {
        throw new Error('No hay usuario autenticado.');
      }

      const [
        resCreadas,
        resUnidas,
        resMun,
        resOds,
        resTipos,
      ] = await Promise.all([
        supabase
          .from('actividades')
          .select(`
            id,
            nombre,
            fecha_evento,
            lugar,
            estado,
            creado_por_usuario_id,
            municipios(nombre)
          `)
          .is('fecha_eliminacion', null)
          .eq('creado_por_usuario_id', userId),

        supabase
          .from('actividad_asistentes')
          .select(`
            actividad_id,
            actividades (
              id,
              nombre,
              fecha_evento,
              lugar,
              estado,
              creado_por_usuario_id,
              municipios(nombre),
              fecha_eliminacion
            )
          `)
          .eq('usuario_id', userId),

        supabase
          .from('municipios')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre'),

        supabase
          .from('ods')
          .select('id, nombre, numero')
          .eq('activo', true)
          .order('numero', { ascending: true }),

        supabase
          .from('tipos_accion')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre'),
      ]);

      if (resCreadas.error) throw resCreadas.error;
      if (resUnidas.error) throw resUnidas.error;
      if (resMun.error) throw resMun.error;
      if (resOds.error) throw resOds.error;
      if (resTipos.error) throw resTipos.error;

      const actividadesMap = new Map<number, ActividadList>();

      /**
       * Actividades creadas por el usuario.
       */
      resCreadas.data?.forEach((act: any) => {
        const municipio = Array.isArray(act.municipios)
          ? act.municipios[0] ?? null
          : act.municipios ?? null;

        actividadesMap.set(act.id, {
          id: act.id,
          nombre: act.nombre,
          fecha_evento: act.fecha_evento,
          lugar: act.lugar,
          estado: act.estado || 'Programada',
          municipios: municipio,
          es_creador: true,
        });
      });

      /**
       * Actividades donde participa.
       */
      resUnidas.data?.forEach((item: any) => {
        const act = Array.isArray(item.actividades)
          ? item.actividades[0]
          : item.actividades;

        if (
          !act ||
          act.fecha_eliminacion !== null ||
          actividadesMap.has(act.id)
        ) {
          return;
        }

        const municipio = Array.isArray(act.municipios)
          ? act.municipios[0] ?? null
          : act.municipios ?? null;

        actividadesMap.set(act.id, {
          id: act.id,
          nombre: act.nombre,
          fecha_evento: act.fecha_evento,
          lugar: act.lugar,
          estado: act.estado || 'Programada',
          municipios: municipio,
          es_creador: act.creado_por_usuario_id === userId,
        });
      });

      const actividadesCombinadas = Array.from(
        actividadesMap.values()
      ).sort((a, b) => {
        return (
          new Date(b.fecha_evento).getTime() -
          new Date(a.fecha_evento).getTime()
        );
      });

      setActividades(actividadesCombinadas);
      setMunicipios(resMun.data ?? []);
      setListaOds(resOds.data ?? []);
      setTiposAccion(resTipos.data ?? []);
    } catch (error: any) {
      toast.error(mapearErrorAmigable(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleOds = (idOds: number) => {
    setOdsSeleccionados((prev) =>
      prev.includes(idOds)
        ? prev.filter((id) => id !== idOds)
        : [...prev, idOds]
    );
  };

  /**
   * Abre una actividad para edición.
   *
   * Importante:
   * Solo puede editarse una actividad que realmente pertenezca
   * al usuario actual.
   */
  const handleEdit = async (id: number) => {
    const loadingToast = toast.loading('Cargando actividad...');

    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (!userId) {
        throw new Error('No hay usuario autenticado.');
      }

      const actividadLocal = actividades.find((a) => a.id === id);

      if (!actividadLocal?.es_creador) {
        throw new Error(
          'Esta actividad pertenece a otro usuario y solo puede consultarse en modo lectura.'
        );
      }

      const {
        data: act,
        error,
      } = await supabase
        .from('actividades')
        .select('*')
        .eq('id', id)
        .eq('creado_por_usuario_id', userId)
        .is('fecha_eliminacion', null)
        .maybeSingle();

      if (error) throw error;

      if (!act) {
        throw new Error(
          'La actividad no existe o no tienes permisos para editarla.'
        );
      }

      if (act.estado === 'Cancelada') {
        throw new Error(
          'Una actividad cancelada no puede volver a editarse.'
        );
      }

      const [
        { data: ods, error: odsError },
        { data: acciones, error: accionesError },
      ] = await Promise.all([
        supabase
          .from('actividad_ods')
          .select('ods_id')
          .eq('actividad_id', id),

        supabase
          .from('actividad_acciones')
          .select('tipo_accion_id')
          .eq('actividad_id', id)
          .maybeSingle(),
      ]);

      if (odsError) throw odsError;
      if (accionesError) throw accionesError;

      setFormData({
        nombre: act.nombre || '',
        descripcion: act.descripcion || '',
        tipo_accion_id: acciones?.tipo_accion_id ?? 0,
        fecha_evento: act.fecha_evento
          ? act.fecha_evento.split('T')[0]
          : '',
        hora_inicio: act.hora_inicio
          ? String(act.hora_inicio).substring(0, 5)
          : '',
        hora_fin: act.hora_fin
          ? String(act.hora_fin).substring(0, 5)
          : '',
        municipio_id: act.municipio_id || 0,
        lugar: act.lugar || '',
        calle: act.calle || '',
        colonia: act.colonia || '',
        direccion: act.direccion || '',
        estado: act.estado || 'Programada',
      });

      setOdsSeleccionados(
        ods?.map((o: any) => Number(o.ods_id)) ?? []
      );

      setEditingId(id);
      setShowForm(true);

      toast.dismiss(loadingToast);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error: any) {
      toast.error(mapearErrorAmigable(error), {
        id: loadingToast,
      });
    }
  };

  /**
   * Eliminación lógica.
   *
   * No se elimina físicamente el registro:
   * se establece fecha_eliminacion.
   */
  const confirmDelete = async () => {
    if (activityToDelete === null) return;

    const toastId = toast.loading('Eliminando actividad...');

    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (!userId) {
        throw new Error('No hay usuario autenticado.');
      }

      const actividad = actividades.find(
        (a) => a.id === activityToDelete
      );

      if (!actividad?.es_creador) {
        throw new Error(
          'Solo el creador puede eliminar esta actividad.'
        );
      }

      if (actividad.estado === 'Cancelada') {
        throw new Error(
          'La actividad ya se encuentra cancelada.'
        );
      }

      const { error } = await supabase
        .from('actividades')
        .update({
          fecha_eliminacion: new Date().toISOString(),
          actualizado_por_usuario_id: userId,
        })
        .eq('id', activityToDelete)
        .eq('creado_por_usuario_id', userId)
        .is('fecha_eliminacion', null);

      if (error) throw error;

      toast.success(
        'Actividad eliminada correctamente.',
        { id: toastId }
      );

      if (editingId === activityToDelete) {
        resetForm();
      }

      await fetchData();
    } catch (error: any) {
      toast.error(mapearErrorAmigable(error), {
        id: toastId,
      });
    } finally {
      setActivityToDelete(null);
    }
  };

  /**
   * Cancelación del evento.
   */
  const confirmCancelEvent = async () => {
    if (editingId === null) return;

    setIsSaving(true);

    const toastId = toast.loading('Cancelando evento...');

    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (!userId) {
        throw new Error('No hay usuario autenticado.');
      }

      const actividad = actividades.find(
        (a) => a.id === editingId
      );

      if (!actividad?.es_creador) {
        throw new Error(
          'Solo el creador puede cancelar esta actividad.'
        );
      }

      if (actividad.estado === 'Cancelada') {
        throw new Error(
          'La actividad ya se encuentra cancelada.'
        );
      }

      const { error } = await supabase
        .from('actividades')
        .update({
          estado: 'Cancelada',
          actualizado_por_usuario_id: userId,
        })
        .eq('id', editingId)
        .eq('creado_por_usuario_id', userId)
        .is('fecha_eliminacion', null);

      if (error) throw error;

      toast.success(
        'El evento ha sido cancelado exitosamente.',
        { id: toastId }
      );

      resetForm();
      await fetchData();
    } catch (error: any) {
      toast.error(mapearErrorAmigable(error), {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
      setShowCancelEventDialog(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(FORMULARIO_INICIAL);
    setOdsSeleccionados([]);
    setShowForm(false);
  };

  const handleDiscardClick = () => {
    if (isSaving) return;

    const formTieneDatos =
      formData.nombre.trim() !== '' ||
      formData.descripcion.trim() !== '' ||
      formData.tipo_accion_id !== 0 ||
      formData.fecha_evento !== '' ||
      formData.hora_inicio !== '' ||
      formData.hora_fin !== '' ||
      formData.municipio_id !== 0 ||
      formData.lugar.trim() !== '' ||
      formData.calle.trim() !== '' ||
      formData.colonia.trim() !== '' ||
      formData.direccion.trim() !== '' ||
      odsSeleccionados.length > 0;

    if (!formTieneDatos) {
      resetForm();
    } else {
      setShowDiscardDialog(true);
    }
  };

  /**
   * Validaciones antes de enviar.
   */
  const validarFormulario = () => {
    const nombre = formData.nombre.trim();
    const descripcion = formData.descripcion.trim();
    const lugar = formData.lugar.trim();
    const calle = formData.calle.trim();
    const colonia = formData.colonia.trim();

    if (!nombre) {
      toast.warning('Escribe el nombre de la actividad.');
      return false;
    }

    if (nombre.length < 5) {
      toast.warning(
        'El nombre de la actividad debe ser más descriptivo.'
      );
      return false;
    }

    if (!descripcion) {
      toast.warning('Escribe una descripción de la actividad.');
      return false;
    }

    if (formData.municipio_id === 0) {
      toast.warning('Selecciona un municipio.');
      return false;
    }

    if (formData.tipo_accion_id === 0) {
      toast.warning(
        'Selecciona el Tipo de Acción Principal.'
      );
      return false;
    }

    if (odsSeleccionados.length === 0) {
      toast.warning(
        'Debes alinear la actividad con al menos un ODS.'
      );
      return false;
    }

    if (!formData.fecha_evento) {
      toast.warning('Selecciona la fecha de la actividad.');
      return false;
    }

    if (!formData.hora_inicio || !formData.hora_fin) {
      toast.warning(
        'Indica la hora de inicio y la hora de finalización.'
      );
      return false;
    }

    if (formData.hora_fin <= formData.hora_inicio) {
      toast.warning(
        'La hora de finalización debe ser posterior a la hora de inicio.'
      );
      return false;
    }

    if (!lugar) {
      toast.warning('Escribe el lugar exacto de la actividad.');
      return false;
    }

    if (!calle || !colonia) {
      toast.warning(
        'La calle y colonia son obligatorias.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    const submitter = (
      e.nativeEvent as SubmitEvent
    ).submitter as HTMLButtonElement | null;

    const estadoGuardar =
      submitter?.value || formData.estado;

    if (!validarFormulario()) return;

    setIsSaving(true);

    const toastId = toast.loading(
      editingId
        ? 'Procesando cambios...'
        : 'Guardando actividad...'
    );

    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (!userId) {
        throw new Error('No hay usuario autenticado.');
      }

      /**
       * Si estamos editando, volvemos a comprobar que
       * la actividad pertenece al usuario.
       */
      if (editingId !== null) {
        const { data: actividadActual, error: actividadError } =
          await supabase
            .from('actividades')
            .select(
              'id, creado_por_usuario_id, estado, fecha_eliminacion'
            )
            .eq('id', editingId)
            .maybeSingle();

        if (actividadError) throw actividadError;

        if (!actividadActual) {
          throw new Error(
            'La actividad ya no existe.'
          );
        }

        if (
          actividadActual.creado_por_usuario_id !== userId
        ) {
          throw new Error(
            'No tienes permisos para editar esta actividad.'
          );
        }

        if (actividadActual.fecha_eliminacion !== null) {
          throw new Error(
            'La actividad ya fue eliminada.'
          );
        }

        if (actividadActual.estado === 'Cancelada') {
          throw new Error(
            'Una actividad cancelada no puede modificarse.'
          );
        }
      }

      const payloadActividad = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        fecha_evento: formData.fecha_evento,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        municipio_id: formData.municipio_id,
        lugar: formData.lugar.trim(),
        calle: formData.calle.trim(),
        colonia: formData.colonia.trim(),
        direccion: formData.direccion.trim(),
        estado: estadoGuardar,
        actualizado_por_usuario_id: userId,
      };

      let actividadId = editingId;

      /**
       * EDICIÓN
       */
      if (editingId !== null) {
        const {
          error: errAct,
        } = await supabase
          .from('actividades')
          .update(payloadActividad)
          .eq('id', editingId)
          .eq('creado_por_usuario_id', userId)
          .is('fecha_eliminacion', null);

        if (errAct) throw errAct;

        /**
         * Las relaciones anteriores se sustituyen por
         * las seleccionadas actualmente.
         */
        const {
          error: errorOdsDelete,
        } = await supabase
          .from('actividad_ods')
          .delete()
          .eq('actividad_id', editingId);

        if (errorOdsDelete) {
          throw errorOdsDelete;
        }

        const {
          error: errorAccionesDelete,
        } = await supabase
          .from('actividad_acciones')
          .delete()
          .eq('actividad_id', editingId);

        if (errorAccionesDelete) {
          throw errorAccionesDelete;
        }
      }

      /**
       * CREACIÓN
       */
      else {
        const {
          data: nuevaActividad,
          error: errAct,
        } = await supabase
          .from('actividades')
          .insert([
            {
              ...payloadActividad,
              creado_por_usuario_id: userId,
            },
          ])
          .select('id')
          .single();

        if (errAct) throw errAct;

        if (!nuevaActividad?.id) {
          throw new Error(
            'No se pudo obtener el identificador de la nueva actividad.'
          );
        }

        actividadId = nuevaActividad.id;

        /**
         * El creador también queda registrado como
         * participante de la actividad.
         */
        const {
          error: errorAsistente,
        } = await supabase
          .from('actividad_asistentes')
          .insert([
            {
              actividad_id: actividadId,
              usuario_id: userId,
            },
          ]);

        if (errorAsistente) {
          throw errorAsistente;
        }
      }

      if (actividadId === null) {
        throw new Error(
          'No se pudo determinar el identificador de la actividad.'
        );
      }

      /**
       * Guardar ODS.
       */
      const {
        error: errorOdsInsert,
      } = await supabase
        .from('actividad_ods')
        .insert(
          odsSeleccionados.map((ods_id, idx) => ({
            actividad_id: actividadId,
            ods_id,
            es_principal: idx === 0,
          }))
        );

      if (errorOdsInsert) {
        throw errorOdsInsert;
      }

      /**
       * Guardar tipo de acción.
       */
      const {
        error: errorAccionInsert,
      } = await supabase
        .from('actividad_acciones')
        .insert([
          {
            actividad_id: actividadId,
            tipo_accion_id: formData.tipo_accion_id,
            cantidad: 1,
          },
        ]);

      if (errorAccionInsert) {
        throw errorAccionInsert;
      }

      resetForm();

      await fetchData();

      toast.success(
        `¡Actividad ${
          estadoGuardar === 'Borrador'
            ? 'guardada como borrador'
            : 'publicada'
        }!`,
        { id: toastId }
      );
    } catch (error: any) {
      toast.error(mapearErrorAmigable(error), {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const todayStr = getTodayStr();

  const actividadesFiltradas = actividades.filter((a) => {
    if (
      filterEstado !== 'Todos' &&
      a.estado !== filterEstado
    ) {
      return false;
    }

    const fechaActividad =
      a.fecha_evento?.split('T')[0] || '';

    if (
      filterFecha === 'Vigentes' &&
      fechaActividad < todayStr
    ) {
      return false;
    }

    if (
      filterFecha === 'Pasados' &&
      fechaActividad >= todayStr
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500 relative">

      {/* =====================================================
          DIALOG: DESCARTAR CAMBIOS
      ====================================================== */}

      <AlertDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
      >
        <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-black">
              ¿Descartar cambios?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-gray-600">
              Se perderá todo el progreso no guardado.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              disabled={isSaving}
              className="bg-gray-100 font-bold hover:bg-gray-200 text-gray-700"
            >
              Seguir editando
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isSaving}
              onClick={() => {
                resetForm();
                setShowDiscardDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Sí, descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* =====================================================
          DIALOG: ELIMINAR
      ====================================================== */}

      <AlertDialog
        open={activityToDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setActivityToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-black flex items-center gap-2">
              <Trash2 className="text-red-500" size={20} />
              ¿Eliminar esta actividad?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-gray-600">
              La actividad dejará de aparecer en tus registros activos.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              className="bg-gray-100 font-bold hover:bg-gray-200 text-gray-700"
            >
              Conservar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* =====================================================
          DIALOG: CANCELAR EVENTO
      ====================================================== */}

      <AlertDialog
        open={showCancelEventDialog}
        onOpenChange={setShowCancelEventDialog}
      >
        <AlertDialogContent className="bg-white border border-gray-200 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-black flex items-center gap-2">
              <Ban className="text-red-500" size={20} />
              ¿Cancelar el evento?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-gray-600">
              La actividad cambiará su estado a Cancelada y ya no podrá
              modificarse posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              disabled={isSaving}
              className="bg-gray-100 font-bold hover:bg-gray-200 text-gray-700"
            >
              Mantener evento
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isSaving}
              onClick={(event) => {
                event.preventDefault();
                confirmCancelEvent();
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* =====================================================
          LISTADO
      ====================================================== */}

      {!showForm ? (
        <>
          <div className="bg-white rounded-2xl shadow-md border-t-4 border-[#00689D] p-6 md:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <FileText
                  className="text-[#00689D]"
                  size={32}
                />
                Mis Actividades
              </h2>

              <p className="text-gray-500 mt-2">
                Gestiona las actividades que coordinas o en las que
                participas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-[#00689D] rounded-xl hover:bg-[#00527A] shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Añadir Actividad
            </button>
          </div>

          {/* FILTROS */}

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Filter size={14} />
                Estado
              </label>

              <select
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D] bg-white text-sm font-medium"
                value={filterEstado}
                onChange={(e) =>
                  setFilterEstado(e.target.value)
                }
              >
                <option value="Todos">
                  Todos los estados
                </option>
                <option value="Programada">
                  Programadas / Activas
                </option>
                <option value="Borrador">
                  Borradores
                </option>
                <option value="Cancelada">
                  Canceladas
                </option>
              </select>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Filter size={14} />
                Fechas
              </label>

              <select
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D] bg-white text-sm font-medium"
                value={filterFecha}
                onChange={(e) =>
                  setFilterFecha(e.target.value)
                }
              >
                <option value="Todos">
                  Todas las fechas
                </option>

                <option value="Vigentes">
                  Vigentes (Próximas y hoy)
                </option>

                <option value="Pasados">
                  Pasadas
                </option>
              </select>
            </div>
          </div>

          {/* TABLA */}

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50/50 p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <List
                  className="text-[#00689D]"
                  size={24}
                />
                Registros
              </h3>

              <span className="bg-blue-100 text-[#00689D] text-xs font-bold px-3 py-1 rounded-full">
                {actividadesFiltradas.length} resultados
              </span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500 animate-pulse">
                  Cargando actividades...
                </div>
              ) : actividadesFiltradas.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <Archive
                    className="text-gray-300 mb-3"
                    size={48}
                  />

                  <p className="text-gray-500 font-medium text-lg">
                    No se encontraron actividades
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <th className="p-4 font-bold">
                        Actividad
                      </th>

                      <th className="p-4 font-bold text-center">
                        Tu Rol
                      </th>

                      <th className="p-4 font-bold">
                        Estado
                      </th>

                      <th className="p-4 font-bold">
                        Fecha
                      </th>

                      <th className="p-4 font-bold">
                        Municipio
                      </th>

                      <th className="p-4 font-bold text-center">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {actividadesFiltradas.map((a) => (
                      <tr
                        key={a.id}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="p-4 font-medium text-gray-900">
                          {a.nombre}
                        </td>

                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${
                              a.es_creador
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {a.es_creador
                              ? 'Creador'
                              : 'Participante'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              a.estado === 'Borrador'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : a.estado === 'Cancelada'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                          >
                            {a.estado}
                          </span>
                        </td>

                        <td className="p-4 text-gray-600">
                          {formatearFecha(
                            a.fecha_evento
                          )}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {a.municipios?.nombre ||
                              'Sin asignar'}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2 justify-center items-center">
                            {a.es_creador &&
                            a.estado !== 'Cancelada' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(a.id)
                                  }
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit size={18} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setActivityToDelete(
                                      a.id
                                    )
                                  }
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic px-2 py-1 flex items-center gap-1">
                                {a.estado ===
                                  'Cancelada' && (
                                  <AlertCircle
                                    size={12}
                                  />
                                )}
                                Solo lectura
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      ) : (
        /* =====================================================
           FORMULARIO
        ====================================================== */

        <div className="bg-white rounded-2xl shadow-md border-t-4 border-[#00689D] p-6 md:p-8 mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 border-b border-gray-100 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <FileText
                  className="text-[#00689D]"
                  size={32}
                />

                {editingId
                  ? 'Editar Actividad'
                  : 'Nueva Actividad'}
              </h2>

              <p className="text-gray-500 mt-2">
                Completa la información para registrar esta
                actividad en tu municipio.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDiscardClick}
              disabled={isSaving}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Cerrar"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* DATOS GENERALES */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-200">
              <h3 className="md:col-span-2 text-lg font-bold text-[#00689D] flex items-center gap-2">
                <Target size={18} />
                Datos Generales
              </h3>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nombre{' '}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  required
                  maxLength={180}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Ej. Taller de Reforestación"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Tipo de Acción{' '}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#00689D]"
                  value={formData.tipo_accion_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo_accion_id: Number(
                        e.target.value
                      ),
                    })
                  }
                >
                  <option value="0">
                    -- Selecciona --
                  </option>

                  {tiposAccion.map((tipo) => (
                    <option
                      key={tipo.id}
                      value={tipo.id}
                    >
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Descripción{' '}
                  <span className="text-red-500">*</span>
                </label>

                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none outline-none focus:ring-2 focus:ring-[#00689D]"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Explica la dinámica, objetivo y principales actividades realizadas..."
                />

                <p className="text-right text-xs text-gray-400 mt-1">
                  {formData.descripcion.length}/2000
                </p>
              </div>
            </div>

            {/* ODS */}

            <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100">
              <h3 className="font-bold text-[#00689D] mb-1 flex items-center gap-2">
                <Globe size={18} />
                Alineación ODS{' '}
                <span className="text-red-500">*</span>
              </h3>

              <p className="text-xs text-gray-500 mb-4">
                Selecciona los Objetivos de Desarrollo
                Sostenible relacionados con la actividad.
              </p>

              <div className="flex flex-wrap gap-2">
                {listaOds.map((ods) => {
                  const isSelected =
                    odsSeleccionados.includes(ods.id);

                  return (
                    <button
                      key={ods.id}
                      type="button"
                      onClick={() =>
                        toggleOds(ods.id)
                      }
                      className={`px-3 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-[#00689D] text-white border-[#00689D]'
                          : 'bg-white text-gray-600 hover:border-[#00689D]'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isSelected
                            ? 'bg-white text-[#00689D]'
                            : 'bg-gray-100'
                        }`}
                      >
                        {ods.numero}
                      </span>

                      {ods.nombre}
                    </button>
                  );
                })}
              </div>

              {odsSeleccionados.length === 0 && (
                <p className="text-xs text-red-500 mt-3 font-medium">
                  Debes seleccionar al menos un ODS.
                </p>
              )}
            </div>

            {/* FECHA Y UBICACIÓN */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-200">
              <h3 className="md:col-span-3 text-lg font-bold text-[#00689D] flex items-center gap-2">
                <MapPin size={18} />
                Cuándo y Dónde
              </h3>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Fecha{' '}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]"
                  value={formData.fecha_evento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fecha_evento: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Hora Inicio{' '}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="time"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]"
                  value={formData.hora_inicio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hora_inicio: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Hora Fin{' '}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="time"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]"
                  value={formData.hora_fin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hora_fin: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Municipio{' '}
                  <span className="text-red-500">*</span>
                </label>

                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#00689D]"
                  value={formData.municipio_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      municipio_id: Number(
                        e.target.value
                      ),
                    })
                  }
                >
                  <option value="0">
                    -- Selecciona --
                  </option>

                  {municipios.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                    >
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Lugar Exacto{' '}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  required
                  maxLength={200}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]"
                  value={formData.lugar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lugar: e.target.value,
                    })
                  }
                  placeholder="Ej. Parque, escuela, centro comunitario..."
                />
              </div>

              <div className="md:col-span-3 pt-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Dirección{' '}
                  <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    maxLength={150}
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]"
                    value={formData.calle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        calle: e.target.value,
                      })
                    }
                    placeholder="Calle"
                  />

                  <input
                    type="text"
                    required
                    maxLength={150}
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]"
                    value={formData.colonia}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        colonia: e.target.value,
                      })
                    }
                    placeholder="Colonia"
                  />

                  <input
                    type="text"
                    maxLength={300}
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]"
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        direccion: e.target.value,
                      })
                    }
                    placeholder="Referencias"
                  />
                </div>
              </div>
            </div>

            {/* ACCIONES */}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleDiscardClick}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 border transition-all disabled:opacity-50 flex gap-2 items-center justify-center"
              >
                <X size={18} />
                Cancelar edición
              </button>

              {editingId !== null &&
                formData.estado !== 'Cancelada' && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowCancelEventDialog(true)
                    }
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-3 font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 flex gap-2 items-center justify-center"
                  >
                    <Ban size={18} />
                    Cancelar Evento
                  </button>
                )}

              {(!editingId ||
                formData.estado === 'Borrador') && (
                <button
                  type="submit"
                  name="accionBoton"
                  value="Borrador"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-3 font-bold text-[#00689D] bg-blue-50 border border-[#00689D] rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50 flex gap-2 items-center justify-center"
                >
                  <Archive size={18} />
                  {isSaving
                    ? 'Guardando...'
                    : 'Guardar Borrador'}
                </button>
              )}

              <button
                type="submit"
                name="accionBoton"
                value="Programada"
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-[#00689D] rounded-xl hover:bg-[#00527A] shadow-md transition-all disabled:opacity-50 flex gap-2 items-center justify-center"
              >
                <Save size={18} />
                {isSaving
                  ? 'Procesando...'
                  : editingId
                  ? 'Guardar Cambios'
                  : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}