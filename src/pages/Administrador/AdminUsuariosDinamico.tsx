// import React, { useEffect, useRef, useState } from 'react';
// import { supabase } from '../../lib/supabase';
// import { createClient } from '@supabase/supabase-js'; 
// import { 
//   Users, PlusCircle, Search, Edit2, Trash2, X, Save, 
//   Loader2, UploadCloud, MapPin, Calendar, Mail, Phone, Shield, Folder, Lock, Clock, Key
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { differenceInYears, parseISO, format, formatDistanceToNow } from 'date-fns';
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

// // ==========================================
// // INTERFACES
// // ==========================================
// interface Rol { id: number; nombre: string; }
// interface Municipio { id: number; nombre: string; }
// interface Proyecto { id: number; nombre: string; }

// interface EmbajadorInfo {
//   municipio_id: number;
//   proyecto_social_id: number | null;
//   municipios?: Municipio;
//   proyectos_sociales?: Proyecto;
// }

// interface ActividadInfo {
//   id: number;
// }

// interface Usuario {
//   id: string;
//   nombre: string;
//   apellido: string;
//   correo: string;
//   telefono: string | null;
//   fecha_nacimiento: string | null;
//   activo: boolean;
//   ultimo_acceso: string | null;
//   usuario_roles?: { roles: Rol }[]; 
//   embajadores?: EmbajadorInfo[] | EmbajadorInfo;
//   actividades?: ActividadInfo[];
// }

// // ==========================================
// // CREDENCIALES FRONTEND
// // ==========================================
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// const PASSWORD_TEMPORAL_DEFAULT = 'Juventudes2030*26';
// const ROL_EMBAJADOR = 'Embajador';
// const ROL_ADMIN = 'Administrador';
// const ROL_PROGRAMADOR = 'Programador';

// export default function AdminUsuariosDinamico() {
//   // AHORA ES UN ARREGLO PARA SOPORTAR MÚLTIPLES ROLES DEL USUARIO ACTUAL
//   const [currentUserRole, setCurrentUserRole] = useState<string[]>([]);
  
//   const [showForm, setShowForm] = useState(false);
//   const [usuariosList, setUsuariosList] = useState<Usuario[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   // Estados Dialog (Eliminar)
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [userToDelete, setUserToDelete] = useState<string | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // Estados Cambio Contraseña Forzado
//   const [modalPassword, setModalPassword] = useState<{ visible: boolean; userId: string; userName: string }>({ visible: false, userId: '', userName: '' });
//   const [nuevaPasswordForzada, setNuevaPasswordForzada] = useState('');
//   const [isChangingPassword, setIsChangingPassword] = useState(false);

//   const [roles, setRoles] = useState<Rol[]>([]);
//   const [municipios, setMunicipios] = useState<Municipio[]>([]);
//   const [proyectos, setProyectos] = useState<Proyecto[]>([]);

//   // Filtros
//   const [filtroRol, setFiltroRol] = useState<'Todos' | typeof ROL_ADMIN | typeof ROL_EMBAJADOR>('Todos');
//   const [filtroMunicipio, setFiltroMunicipio] = useState<string>('Todos');
//   const [filtroMesCumple, setFiltroMesCumple] = useState<string>('Todos'); 

//   // Formulario
//   const [editId, setEditId] = useState<string | null>(null);
//   const [formUsuario, setFormUsuario] = useState({
//     nombre: '', apellido: '', correo: '', telefono: '', fecha_nacimiento: '', 
//     roles_ids: [] as number[], // Arreglo para soportar múltiples roles
//     activo: true, visible: true
//   });
//   const [formEmbajador, setFormEmbajador] = useState({ municipio_id: 0 });

//   // Lógica de Proyecto
//   const [tieneProyecto, setTieneProyecto] = useState(false);
//   const [crearNuevoProyecto, setCrearNuevoProyecto] = useState(false);
//   const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState(0);

//   // Logo
//   const [logoFile, setLogoFile] = useState<File | null>(null);
//   const [logoPreview, setLogoPreview] = useState<string | null>(null);
//   const logoInputRef = useRef<HTMLInputElement>(null);
//   const [formProyecto, setFormProyecto] = useState({ nombre: '', descripcion: '', activo: true });

//   const meses = [
//     { num: '01', nombre: 'Enero' }, { num: '02', nombre: 'Febrero' }, { num: '03', nombre: 'Marzo' },
//     { num: '04', nombre: 'Abril' }, { num: '05', nombre: 'Mayo' }, { num: '06', nombre: 'Junio' },
//     { num: '07', nombre: 'Julio' }, { num: '08', nombre: 'Agosto' }, { num: '09', nombre: 'Septiembre' },
//     { num: '10', nombre: 'Octubre' }, { num: '11', nombre: 'Noviembre' }, { num: '12', nombre: 'Diciembre' }
//   ];

//   const calcularEdad = (fechaNacimiento: string | null) => {
//     if (!fechaNacimiento) return 'N/A';
//     try {
//       return differenceInYears(new Date(), parseISO(fechaNacimiento));
//     } catch {
//       return 'N/A';
//     }
//   };

//   const getMesDia = (fecha: string | null) => {
//     if (!fecha) return '99-99'; 
//     try {
//       return format(parseISO(fecha), 'MM-dd');
//     } catch {
//       return '99-99';
//     }
//   };

//   const renderUltimoAcceso = (fechaStr: string | null) => {
//     if (!fechaStr) return <span className="text-gray-400 italic">Nunca</span>;
//     try {
//       return `Hace ${formatDistanceToNow(parseISO(fechaStr), { locale: es })}`;
//     } catch {
//       return 'Desconocido';
//     }
//   };

//   const processLogo = (file: File) => {
//     setLogoFile(file);
//     setLogoPreview(URL.createObjectURL(file));
//   };

//   const fetchData = async () => {
//     setLoading(true);

//     // 1. Obtener al usuario activo
//     const { data: { user } } = await supabase.auth.getUser();
    
//     // 2. Comprobar todos sus roles
//     if (user) {
//       const { data: currentUserData } = await supabase.from('usuario_roles').select('roles(nombre)').eq('usuario_id', user.id);
      
//       const rolesAsignados = currentUserData?.map((ur: any) => ur.roles?.nombre) || [];
//       setCurrentUserRole(rolesAsignados);
//     }

//     // 3. Cargar catálogos
//     const [resRoles, resMun, resProy] = await Promise.all([
//       supabase.from('roles').select('id, nombre').eq('activo', true),
//       supabase.from('municipios').select('id, nombre').eq('activo', true),
//       supabase.from('proyectos_sociales').select('id, nombre').eq('activo', true)
//     ]);

//     if (resRoles.data) setRoles(resRoles.data);
//     if (resMun.data) setMunicipios(resMun.data);
//     if (resProy.data) setProyectos(resProy.data);

//     // 4. Cargar lista de usuarios
//     const { data: usuariosData, error: usrErr } = await supabase
//       .from('usuarios')
//       .select(`
//         id, nombre, apellido, correo, telefono, fecha_nacimiento, activo, ultimo_acceso,
//         usuario_roles ( roles (id, nombre) ),
//         embajadores(
//           municipio_id, proyecto_social_id,
//           municipios(nombre),
//           proyectos_sociales(nombre)
//         ),
//         actividades!creado_por_usuario_id(id)
//       `);

//     if (!usrErr && usuariosData) {
//       setUsuariosList(usuariosData as unknown as Usuario[]);
//     }
//     setLoading(false);
//   };

//   useEffect(() => { fetchData(); }, []);

//   const handleEdit = (u: Usuario) => {
//     setEditId(u.id);
    
//     // Extraer todos los IDs de los roles actuales del usuario
//     const rolesIdsActuales = u.usuario_roles?.map(ur => ur.roles.id) || [];
    
//     // Comprobar si entre sus roles tiene el de Embajador
//     const esEmbajadorEditar = u.usuario_roles?.some(ur => ur.roles.nombre === ROL_EMBAJADOR) || false;

//     setFormUsuario({
//       nombre: u.nombre || '', 
//       apellido: u.apellido || '', 
//       correo: u.correo || '',
//       telefono: u.telefono || '', 
//       fecha_nacimiento: u.fecha_nacimiento || '',
//       roles_ids: rolesIdsActuales, 
//       activo: u.activo, 
//       visible: true
//     });

//     const emb = Array.isArray(u.embajadores) ? u.embajadores[0] : u.embajadores;

//     if (esEmbajadorEditar && emb) {
//       setFormEmbajador({ municipio_id: emb.municipio_id || 0 });
//       if (emb.proyecto_social_id) {
//         setTieneProyecto(true);
//         setProyectoSeleccionadoId(emb.proyecto_social_id);
//         setCrearNuevoProyecto(false);
//       } else {
//         setTieneProyecto(false);
//         setProyectoSeleccionadoId(0);
//       }
//     } else {
//       setFormEmbajador({ municipio_id: 0 });
//       setTieneProyecto(false);
//     }
    
//     setShowForm(true);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const confirmDelete = (id: string) => {
//     setUserToDelete(id);
//     setIsDeleteDialogOpen(true);
//   };

//   const executeDelete = async () => {
//     if (!userToDelete) return;
//     setIsDeleting(true);
    
//     try {
//       const { error } = await supabase.from('usuarios').delete().eq('id', userToDelete);
//       if (error) throw error;
      
//       toast.success("Usuario eliminado exitosamente.");
//       fetchData();
//     } catch (error: any) {
//       toast.error("No se pudo eliminar al usuario.", {
//         description: "El usuario tiene registros dependientes. Intenta desactivarlo cambiándolo a estado 'Baja'.",
//       });
//     } finally {
//       setIsDeleting(false);
//       setIsDeleteDialogOpen(false);
//       setUserToDelete(null);
//     }
//   };

//   const resetForm = () => {
//     setEditId(null);
//     setFormUsuario({ nombre: '', apellido: '', correo: '', telefono: '', fecha_nacimiento: '', roles_ids: [], activo: true, visible: true });
//     setFormEmbajador({ municipio_id: 0 });
//     setTieneProyecto(false);
//     setCrearNuevoProyecto(false);
//     setProyectoSeleccionadoId(0);
//     setFormProyecto({ nombre: '', descripcion: '', activo: true });
//     setLogoFile(null);
//     setLogoPreview(null);
//     setShowForm(false); 
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // ==========================================
//   // CAMBIO DE CONTRASEÑA FORZADO POR RPC
//   // ==========================================
//   const executeForcedPasswordChange = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (nuevaPasswordForzada.length < 6) {
//       return toast.warning("La contraseña debe tener al menos 6 caracteres.");
//     }

//     setIsChangingPassword(true);
//     try {
//       const { error } = await supabase.rpc('cambiar_password_forzado', {
//         p_usuario_id: modalPassword.userId,
//         p_nueva_password: nuevaPasswordForzada
//       });

//       if (error) throw error;

//       toast.success(`Contraseña de ${modalPassword.userName} actualizada exitosamente.`);
//       setModalPassword({ visible: false, userId: '', userName: '' });
//       setNuevaPasswordForzada('');
//     } catch (error: any) {
//       toast.error("Error al actualizar contraseña", { 
//         description: error.message || "Asegúrate de tener permisos de Programador." 
//       });
//     } finally {
//       setIsChangingPassword(false);
//     }
//   };

//   // ==========================================
//   // GUARDAR USUARIO EN BD Y TABLAS RELACIONALES
//   // ==========================================
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validación: Debe tener al menos un rol
//     if (formUsuario.roles_ids.length === 0) {
//       return toast.error("Requerido", { description: "Selecciona al menos un rol para el usuario." });
//     }
    
//     // Comprobar si entre los roles seleccionados está el de Embajador
//     const rolesSeleccionadosNombres = roles.filter(r => formUsuario.roles_ids.includes(r.id)).map(r => r.nombre);
//     const incluyeRolEmbajador = rolesSeleccionadosNombres.includes(ROL_EMBAJADOR);

//     if (incluyeRolEmbajador && formEmbajador.municipio_id === 0) {
//       return toast.error("Requerido", { description: "Selecciona un municipio para el embajador." });
//     }

//     setIsSaving(true);
//     try {
//       let usuarioId = editId;

//       const payloadUsuarioInfo = {
//         nombre: formUsuario.nombre,
//         apellido: formUsuario.apellido,
//         correo: formUsuario.correo,
//         telefono: formUsuario.telefono,
//         fecha_nacimiento: formUsuario.fecha_nacimiento,
//         activo: formUsuario.activo,
//         visible: formUsuario.visible
//       };

//       if (editId) {
//         const { error: errUpdate } = await supabase.from('usuarios').update(payloadUsuarioInfo).eq('id', editId);
//         if (errUpdate) throw errUpdate;
//       } else {
//         const authClient = createClient(supabaseUrl, supabaseKey, {
//           auth: { persistSession: false, autoRefreshToken: false }
//         });

//         const { data: authData, error: authErr } = await authClient.auth.signUp({
//           email: formUsuario.correo,
//           password: PASSWORD_TEMPORAL_DEFAULT,
//         });

//         if (authErr) throw authErr;
        
//         const newUserId = authData.user?.id;
//         if (!newUserId) throw new Error("No se pudo crear la credencial de acceso.");

//         const payloadNuevoUsuario = { 
//           ...payloadUsuarioInfo, 
//           id: newUserId,
//           requiere_cambio_password: true 
//         };

//         const { error: errUsuario } = await supabase.from('usuarios').upsert([payloadNuevoUsuario]);        
//         if (errUsuario) throw errUsuario;

//         usuarioId = newUserId;
//       }

//       if (!usuarioId) throw new Error("ID de usuario no encontrado.");

//       // ACTUALIZAR MÚLTIPLES ROLES EN LA TABLA usuario_roles
//       await supabase.from('usuario_roles').delete().eq('usuario_id', usuarioId);
//       const rolesAInsertar = formUsuario.roles_ids.map(rolId => ({
//         usuario_id: usuarioId,
//         rol_id: rolId
//       }));
//       const { error: roleErr } = await supabase.from('usuario_roles').insert(rolesAInsertar);
//       if (roleErr) throw roleErr;

//       // GUARDAR DATOS DE EMBAJADOR (Si aplica)
//       if (incluyeRolEmbajador) {
//         let proyectoFinalId = null;
        
//         if (tieneProyecto) {
//           if (crearNuevoProyecto) {
//             if (!formProyecto.nombre) throw new Error("Escribe el nombre del proyecto nuevo.");
            
//             let finalLogoUrl = null;
//             if (logoFile) {
//               const fileExt = logoFile.name.split('.').pop()?.toLowerCase() || 'png';
//               const uniqueFileName = typeof crypto !== 'undefined' && crypto.randomUUID 
//                                      ? crypto.randomUUID() 
//                                      : Date.now().toString(36) + Math.random().toString(36).substring(2);
//               const fileName = `logos/logo_${uniqueFileName}.${fileExt}`;
              
//               const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, logoFile);
//               if (uploadError) throw uploadError;
              
//               finalLogoUrl = supabase.storage.from('imagenes').getPublicUrl(fileName).data.publicUrl;
//             }

//             const { data: proyCreado, error: errProy } = await supabase
//               .from('proyectos_sociales')
//               .insert([{ ...formProyecto, logo: finalLogoUrl, activo: true }])
//               .select('id')
//               .single();
              
//             if (errProy) throw errProy;
//             proyectoFinalId = proyCreado.id;

//           } else {
//             proyectoFinalId = proyectoSeleccionadoId > 0 ? proyectoSeleccionadoId : null;
//           }
//         }
        
//         const { error: errEmbajador } = await supabase.from('embajadores').upsert({
//           usuario_id: usuarioId,
//           municipio_id: formEmbajador.municipio_id,
//           proyecto_social_id: proyectoFinalId,
//           activo: true
//         }, { onConflict: 'usuario_id' });

//         if (errEmbajador) throw errEmbajador;
//       } else {
//         await supabase.from('embajadores').delete().eq('usuario_id', usuarioId);
//       }

//       toast.success(editId ? 'Registro actualizado con éxito' : 'Usuario guardado exitosamente', {
//         description: !editId ? `El usuario ya puede ingresar con su correo y la contraseña genérica.` : undefined
//       });
      
//       resetForm(); 
//       fetchData(); 
      
//     } catch (error: any) { 
//       toast.error("Ocurrió un error", { description: error.message }); 
//     } finally { 
//       setIsSaving(false); 
//     }
//   };

//   // Variables de UI
//   const rolesSeleccionadosNombres = roles.filter(r => formUsuario.roles_ids.includes(r.id)).map(r => r.nombre);
//   const incluyeRolEmbajador = rolesSeleccionadosNombres.includes(ROL_EMBAJADOR);
//   const mostrarColumnasEmbajador = filtroRol !== ROL_ADMIN;
  
//   // MODIFICACIÓN CLAVE: Buscamos dentro del arreglo de roles
//   const puedeCambiarPasswords = currentUserRole.includes(ROL_PROGRAMADOR);

//   // Filtrado de usuarios compatible con la estructura de múltiples roles
//   let usuariosFiltrados = usuariosList.filter(u => {
//     const tieneRolBuscado = filtroRol === 'Todos' 
//       ? true 
//       : u.usuario_roles?.some(ur => ur.roles.nombre === filtroRol);
    
//     if (!tieneRolBuscado) return false;

//     if (filtroMunicipio !== 'Todos') {
//       const datosEmbajador = Array.isArray(u.embajadores) ? u.embajadores[0] : u.embajadores;
//       if (datosEmbajador?.municipios?.nombre !== filtroMunicipio) return false;
//     }
//     if (filtroMesCumple !== 'Todos') {
//       if (!u.fecha_nacimiento) return false;
//       const mes = u.fecha_nacimiento.split('-')[1];
//       if (mes !== filtroMesCumple) return false;
//     }
//     return true;
//   });

//   usuariosFiltrados.sort((a, b) => getMesDia(a.fecha_nacimiento).localeCompare(getMesDia(b.fecha_nacimiento)));

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center py-20 text-gray-500">
//       <Loader2 className="animate-spin mb-4" size={40} />
//       <p className="font-medium text-lg">Cargando directorio de usuarios...</p>
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
//       {/* MODAL CAMBIO CONTRASEÑA (Solo Programador) */}
//       {modalPassword.visible && (
//         <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
//               <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><Key size={20} className="text-[#00689D]"/> Forzar Contraseña</h3>
//               <button onClick={() => setModalPassword({ visible: false, userId: '', userName: '' })} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
//             </div>
            
//             <form onSubmit={executeForcedPasswordChange} className="p-6 space-y-4">
//               <p className="text-sm text-gray-600 mb-4">
//                 Estás cambiando directamente la contraseña de acceso de <strong>{modalPassword.userName}</strong>. Esta acción es exclusiva del rol Programador.
//               </p>
//               <div>
//                 <label className="block text-xs font-bold text-gray-600 mb-1">Nueva Contraseña <span className="text-red-500">*</span></label>
//                 <input 
//                   type="text" required minLength={6} autoFocus
//                   value={nuevaPasswordForzada} onChange={(e) => setNuevaPasswordForzada(e.target.value)}
//                   className="w-full border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D]" 
//                   placeholder="Escribe la nueva contraseña..."
//                 />
//               </div>

//               <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
//                 <button type="button" onClick={() => setModalPassword({ visible: false, userId: '', userName: '' })} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
//                 <button type="submit" disabled={isChangingPassword} className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] disabled:opacity-70 shadow-md">
//                   {isChangingPassword ? <Loader2 className="animate-spin" size={16} /> : null}
//                   Aplicar Cambio
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* CABECERA */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
//             <Users className="text-[#00689D]" size={28} /> Directorio de Usuarios
//           </h1>
//           <p className="text-gray-500 mt-1 text-sm md:text-base">Administra y filtra usuarios registrados cronológicamente por mes de cumpleaños.</p>
//         </div>
//         {!showForm && (
//           <button onClick={() => setShowForm(true)} className="w-full sm:w-auto bg-[#00689D] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#00527A] transition-colors shadow-md flex items-center justify-center gap-2">
//             <PlusCircle size={20} /> Añadir Nuevo
//           </button>
//         )}
//       </div>

//       {/* FORMULARIO DE ALTA/EDICIÓN */}
//       {showForm && (
//         <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border-t-4 border-[#00689D] animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
//           <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
//             <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
//               {editId ? <Edit2 className="text-blue-500" /> : <PlusCircle className="text-green-500" />}
//               {editId ? 'Editar Registro de Usuario' : 'Alta de Nuevo Usuario'}
//             </h2>
//             <button onClick={resetForm} className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-gray-50 rounded-full hover:bg-red-50">
//               <X size={24} />
//             </button>
//           </div>
          
//           <form onSubmit={handleSubmit} className="space-y-8">
//             <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
//               <h3 className="text-lg font-bold mb-6 text-[#00689D] flex items-center gap-2">
//                 <Users size={20}/> 1. Datos Personales y Acceso
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
//                   <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.nombre} onChange={e => setFormUsuario({...formUsuario, nombre: e.target.value})} placeholder="Ej. Juan" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-1">Apellido</label>
//                   <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.apellido} onChange={e => setFormUsuario({...formUsuario, apellido: e.target.value})} placeholder="Ej. Pérez" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Mail size={16}/> Correo Electrónico</label>
//                   <input type="email" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.correo} onChange={e => setFormUsuario({...formUsuario, correo: e.target.value})} placeholder="correo@ejemplo.com" />
//                 </div>
                
//                 {!editId ? (
//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Lock size={16}/> Contraseña Generada</label>
//                     <input type="text" disabled className="w-full p-3 border border-gray-200 rounded-lg bg-gray-200 text-gray-600 font-mono font-bold cursor-not-allowed select-all" value={PASSWORD_TEMPORAL_DEFAULT} />
//                     <p className="text-xs text-[#00689D] font-medium mt-1">El usuario deberá cambiarla obligatoriamente al iniciar sesión.</p>
//                   </div>
//                 ) : (
//                   <div>
//                     <label className="block text-sm font-bold text-gray-400 mb-1 flex items-center gap-1"><Lock size={16}/> Contraseña</label>
//                     <input type="text" disabled className="w-full p-3 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed" value="••••••••" />
//                     <p className="text-xs text-gray-400 mt-1">Usa el botón de llave en la tabla principal para forzar una nueva contraseña.</p>
//                   </div>
//                 )}

//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Phone size={16}/> Teléfono</label>
//                   <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.telefono || ''} onChange={e => setFormUsuario({...formUsuario, telefono: e.target.value})} placeholder="10 dígitos" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Calendar size={16}/> Fecha de Nacimiento</label>
//                   <input type="date" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.fecha_nacimiento || ''} onChange={e => setFormUsuario({...formUsuario, fecha_nacimiento: e.target.value})} />
//                 </div>
                
//                 <div className="md:col-span-2 border-t border-gray-200 mt-2 pt-4">
//                   <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
//                     <Shield size={16}/> Asignar Roles
//                   </label>
//                   <div className="flex flex-wrap gap-4 mt-2">
//                     {roles.map(r => (
//                       <label key={r.id} className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
//                         <input
//                           type="checkbox"
//                           className="w-4 h-4 text-[#00689D] rounded border-gray-300 focus:ring-[#00689D]"
//                           checked={formUsuario.roles_ids.includes(r.id)}
//                           onChange={(e) => {
//                             if (e.target.checked) {
//                               setFormUsuario({ ...formUsuario, roles_ids: [...formUsuario.roles_ids, r.id] });
//                             } else {
//                               setFormUsuario({ ...formUsuario, roles_ids: formUsuario.roles_ids.filter(id => id !== r.id) });
//                             }
//                           }}
//                         />
//                         <span className="text-sm font-semibold text-gray-700">{r.nombre}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {incluyeRolEmbajador && (
//               <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-200 animate-in fade-in slide-in-from-bottom-4">
//                 <h3 className="text-lg font-bold mb-6 text-[#00689D] flex items-center gap-2">
//                   <MapPin size={20}/> 2. Perfil de Embajador
//                 </h3>
//                 <div className="mb-6">
//                   <label className="block text-sm font-bold text-gray-700 mb-1">Municipio de Operación</label>
//                   <select required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none bg-white" value={formEmbajador.municipio_id} onChange={e => setFormEmbajador({...formEmbajador, municipio_id: Number(e.target.value)})}>
//                     <option value="0">-- Selecciona Municipio --</option>
//                     {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
//                   </select>
//                 </div>

//                 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
//                   <label className="flex items-center space-x-3 cursor-pointer mb-5">
//                     <input type="checkbox" className="w-5 h-5 text-[#00689D] border-gray-300 rounded focus:ring-[#00689D]" checked={tieneProyecto} onChange={e => setTieneProyecto(e.target.checked)} />
//                     <span className="font-bold text-gray-800 text-base">¿Tiene un Proyecto Social asignado?</span>
//                   </label>

//                   {tieneProyecto && (
//                     <div className="pl-8 space-y-5 border-l-2 border-blue-200 ml-2 animate-in fade-in">
//                       <div className="flex flex-wrap gap-3">
//                         <button type="button" onClick={() => setCrearNuevoProyecto(false)} className={`px-5 py-2 text-sm font-bold rounded-md transition-colors ${!crearNuevoProyecto ? 'bg-[#00689D] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Buscar Existente</button>
//                         <button type="button" onClick={() => setCrearNuevoProyecto(true)} className={`px-5 py-2 text-sm font-bold rounded-md transition-colors ${crearNuevoProyecto ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>+ Crear Nuevo</button>
//                       </div>

//                       {!crearNuevoProyecto ? (
//                         <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] bg-gray-50 outline-none" value={proyectoSeleccionadoId} onChange={e => setProyectoSeleccionadoId(Number(e.target.value))}>
//                           <option value="0">-- Buscar Proyecto en Catálogo --</option>
//                           {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
//                         </select>
//                       ) : (
//                         <div className="grid grid-cols-1 gap-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
//                           <div>
//                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Proyecto</label>
//                             <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formProyecto.nombre} onChange={e => setFormProyecto({...formProyecto, nombre: e.target.value})} placeholder="Nombre de la iniciativa..." />
//                           </div>
//                           <div>
//                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
//                             <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none" rows={3} value={formProyecto.descripcion} onChange={e => setFormProyecto({...formProyecto, descripcion: e.target.value})} placeholder="Breve descripción del proyecto..."></textarea>
//                           </div>
//                           <div>
//                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logotipo</label>
//                             <div 
//                               onDragOver={(e) => e.preventDefault()} 
//                               onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) processLogo(e.dataTransfer.files[0]); }} 
//                               onClick={() => logoInputRef.current?.click()} 
//                               className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:bg-green-50 hover:border-green-500 transition-colors cursor-pointer group"
//                             >
//                               <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={(e) => { if (e.target.files?.[0]) processLogo(e.target.files[0]); }} />
//                               {logoPreview ? (
//                                 <div className="relative flex flex-col items-center">
//                                   <img src={logoPreview} alt="Preview" className="h-24 object-contain rounded-md shadow-sm" />
//                                 </div>
//                               ) : (
//                                 <div className="text-center flex flex-col items-center">
//                                   <UploadCloud size={24} className="text-gray-400 mb-2"/>
//                                   <p className="text-sm text-gray-700 font-semibold">Arrastra o haz clic</p>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col-reverse sm:flex-row justify-end pt-6 border-t border-gray-200 gap-3">
//               <button type="button" onClick={resetForm} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors">
//                 <X size={18} /> Cancelar
//               </button>
//               <button type="submit" disabled={isSaving} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#00527A] disabled:bg-gray-400 transition-colors shadow-md">
//                 {isSaving ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={18}/> {editId ? 'Actualizar Registro' : 'Guardar Usuario'}</>}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* BARRA DE FILTROS */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//         <div className="flex space-x-2 mb-6 border-b border-gray-100 pb-5 overflow-x-auto scrollbar-hide">
//           <button onClick={() => setFiltroRol('Todos')} className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filtroRol === 'Todos' ? 'bg-[#00689D] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todos</button>
//           <button onClick={() => setFiltroRol(ROL_ADMIN)} className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filtroRol === ROL_ADMIN ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Administradores</button>
//           <button onClick={() => setFiltroRol(ROL_EMBAJADOR)} className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filtroRol === ROL_EMBAJADOR ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Embajadores</button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//           <div>
//             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Filtrar Municipio</label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin size={16} className="text-gray-400" /></div>
//               <select className="w-full pl-9 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00689D] outline-none appearance-none disabled:opacity-50 transition-colors" value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)} disabled={filtroRol === ROL_ADMIN}>
//                 <option value="Todos">Cualquier Municipio</option>
//                 {municipios.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
//               </select>
//             </div>
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mes de Cumpleaños</label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar size={16} className="text-gray-400" /></div>
//               <select className="w-full pl-9 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00689D] outline-none appearance-none transition-colors" value={filtroMesCumple} onChange={e => setFiltroMesCumple(e.target.value)}>
//                 <option value="Todos">Cualquier mes</option>
//                 {meses.map(m => <option key={m.num} value={m.num}>{m.nombre}</option>)}
//               </select>
//             </div>
//           </div>
//           <div className="flex items-end">
//             <button onClick={() => { setFiltroRol('Todos'); setFiltroMunicipio('Todos'); setFiltroMesCumple('Todos'); }} className="w-full bg-white border border-gray-300 text-gray-700 font-bold p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
//               <Search size={18} /> Limpiar Filtros
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* TABLA DE USUARIOS */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
//           <h3 className="font-bold text-gray-700 text-sm md:text-base">Resultados de búsqueda</h3>
//           <span className="bg-[#00689D]/10 text-[#00689D] px-3 py-1 rounded-full text-xs font-bold border border-[#00689D]/20">
//             {usuariosFiltrados.length} usuarios encontrados
//           </span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full text-left border-collapse text-sm">
//             <thead>
//               <tr className="bg-white text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider">
//                 <th className="p-4 font-bold text-center w-12">#</th>
//                 <th className="p-4 font-bold whitespace-nowrap">Nombre Completo</th>
//                 <th className="p-4 font-bold text-center">Edad</th>
//                 <th className="p-4 font-bold whitespace-nowrap">Fecha Nac.</th>
//                 <th className="p-4 font-bold">Contacto</th>
//                 <th className="p-4 font-bold">Roles</th>
//                 {mostrarColumnasEmbajador && <th className="p-4 font-bold">Municipio / Proyecto</th>}
//                 {mostrarColumnasEmbajador && <th className="p-4 font-bold text-center">Actividades</th>}
//                 <th className="p-4 font-bold text-center">Estado</th>
//                 <th className="p-4 font-bold text-center whitespace-nowrap">Última Conexión</th>
//                 <th className="p-4 font-bold text-center">Acciones</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 bg-white">
//               {usuariosFiltrados.length === 0 ? (
//                 <tr>
//                   <td colSpan={mostrarColumnasEmbajador ? 11 : 9} className="p-12 text-center text-gray-500">
//                     <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
//                     <p className="font-medium text-lg">No se encontraron usuarios</p>
//                   </td>
//                 </tr>
//               ) : (
//                 usuariosFiltrados.map((u, index) => {
//                   const tieneRolEmbajador = u.usuario_roles?.some(ur => ur.roles.nombre === ROL_EMBAJADOR);
//                   const datosEmbajador = Array.isArray(u.embajadores) ? u.embajadores[0] : u.embajadores;
//                   const cantActividades = u.actividades ? u.actividades.length : 0;
//                   const edadCalculada = calcularEdad(u.fecha_nacimiento);

//                   return (
//                     <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
//                       <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
//                       <td className="p-4">
//                         <div className="font-bold text-gray-900 whitespace-nowrap">{u.nombre} {u.apellido}</div>
//                       </td>
//                       <td className="p-4 text-center">
//                         <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-bold text-xs">
//                           {edadCalculada !== 'N/A' ? `${edadCalculada}` : '-'}
//                         </span>
//                       </td>
//                       <td className="p-4 text-gray-600 whitespace-nowrap text-xs font-medium">{u.fecha_nacimiento || '-'}</td>
                      
//                       <td className="p-4">
//                         <div className="text-gray-900 font-medium text-xs">{u.correo}</div>
//                         <div className="text-gray-500 text-xs mt-0.5">{u.telefono || 'Sin teléfono'}</div>
//                       </td>

//                       <td className="p-4">
//                         <div className="flex flex-wrap gap-1">
//                           {u.usuario_roles && u.usuario_roles.length > 0 ? (
//                             u.usuario_roles.map((ur, i) => (
//                               <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
//                                 ur.roles.nombre === ROL_EMBAJADOR ? 'bg-green-50 text-green-700 border-green-200' :
//                                 ur.roles.nombre === ROL_ADMIN ? 'bg-purple-50 text-purple-700 border-purple-200' :
//                                 ur.roles.nombre === ROL_PROGRAMADOR ? 'bg-blue-50 text-blue-700 border-blue-200' :
//                                 'bg-gray-50 text-gray-700 border-gray-200'
//                               }`}>
//                                 {ur.roles.nombre}
//                               </span>
//                             ))
//                           ) : (
//                             <span className="text-gray-400 text-xs">Sin rol</span>
//                           )}
//                         </div>
//                       </td>

//                       {mostrarColumnasEmbajador && (
//                         <td className="p-4">
//                           {tieneRolEmbajador ? (
//                             <div className="flex flex-col">
//                               <span className="text-xs font-bold text-gray-700 flex items-center gap-1"><MapPin size={12}/> {datosEmbajador?.municipios?.nombre || 'Sin Asignar'}</span>
//                               <span className="text-xs text-[#00689D] font-medium truncate max-w-[150px] mt-0.5 flex items-center gap-1"><Folder size={12}/> {datosEmbajador?.proyectos_sociales?.nombre || 'Sin Proyecto'}</span>
//                             </div>
//                           ) : <span className="text-gray-300">-</span>}
//                         </td>
//                       )}

//                       {mostrarColumnasEmbajador && (
//                         <td className="p-4 text-center">
//                           {tieneRolEmbajador ? <span className="font-bold text-gray-700">{cantActividades}</span> : <span className="text-gray-300">-</span>}
//                         </td>
//                       )}
                      
//                       <td className="p-4 text-center">
//                         <span className={`inline-flex items-center w-2.5 h-2.5 rounded-full mr-1.5 ${u.activo ? 'bg-green-500' : 'bg-red-500'}`}></span>
//                         <span className="text-xs font-medium text-gray-700">{u.activo ? 'Activo' : 'Baja'}</span>
//                       </td>
                      
//                       <td className="p-4 text-center">
//                         <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00689D] bg-[#00689D]/10 px-2.5 py-1 rounded-md border border-[#00689D]/20 whitespace-nowrap">
//                           <Clock size={12} />
//                           {renderUltimoAcceso(u.ultimo_acceso)}
//                         </span>
//                       </td>
                      
//                       <td className="p-4">
//                         <div className="flex items-center justify-center gap-1">
//                           {puedeCambiarPasswords && (
//                             <button 
//                               onClick={() => setModalPassword({ visible: true, userId: u.id, userName: `${u.nombre} ${u.apellido}` })} 
//                               className="text-amber-500 hover:bg-amber-50 p-2 rounded-md transition-colors" 
//                               title="Forzar Contraseña"
//                             >
//                               <Key size={16} />
//                             </button>
//                           )}
//                           <button onClick={() => handleEdit(u)} className="text-[#00689D] hover:bg-blue-50 p-2 rounded-md transition-colors" title="Editar">
//                             <Edit2 size={16} />
//                           </button>
//                           <button onClick={() => confirmDelete(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors" title="Eliminar">
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>¿Estás seguro de eliminar este usuario?</AlertDialogTitle>
//             <AlertDialogDescription>
//               Esta acción eliminará de forma permanente al usuario del sistema. Si el usuario tiene actividades registradas, te recomendamos mejor cambiar su estado a "Baja" desde el botón editar para mantener el historial.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
//             <AlertDialogAction 
//               onClick={executeDelete} 
//               disabled={isDeleting}
//               className="bg-red-600 hover:bg-red-700 text-white"
//             >
//               {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

import {
  Users,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  UploadCloud,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Shield,
  Folder,
  Lock,
  Clock,
  Key,
} from 'lucide-react';

import { toast } from 'sonner';
import {
  differenceInYears,
  parseISO,
  format,
  formatDistanceToNow,
} from 'date-fns';
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

// ======================================================
// TIPOS
// ======================================================

interface Rol {
  id: number;
  nombre: string;
}

interface Municipio {
  id: number;
  nombre: string;
}

interface Proyecto {
  id: number;
  nombre: string;
}

interface EmbajadorInfo {
  municipio_id: number;
  proyecto_social_id: number | null;
  activo?: boolean;
  municipios?: Municipio | null;
  proyectos_sociales?: Proyecto | null;
}

interface ActividadInfo {
  id: number;
}

interface UsuarioRol {
  rol_id?: number;
  roles: Rol;
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  activo: boolean;
  visible?: boolean;
  ultimo_acceso: string | null;

  usuario_roles?: UsuarioRol[];

  embajadores?: EmbajadorInfo[] | EmbajadorInfo | null;

  actividades?: ActividadInfo[];
}

// ======================================================
// CONFIGURACIÓN
// ======================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const PASSWORD_TEMPORAL_DEFAULT = 'Juventudes2030*26';

const ROL_EMBAJADOR = 'Embajador';
const ROL_ADMIN = 'Administrador';
const ROL_PROGRAMADOR = 'Programador';

// ======================================================
// COMPONENTE
// ======================================================

export default function AdminUsuariosDinamico() {
  // ----------------------------------------------------
  // USUARIO ACTUAL
  // ----------------------------------------------------

  const [currentUserRole, setCurrentUserRole] = useState<string[]>([]);

  // ----------------------------------------------------
  // LISTADO
  // ----------------------------------------------------

  const [usuariosList, setUsuariosList] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // FORMULARIO
  // ----------------------------------------------------

  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);

  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    fecha_nacimiento: '',
    roles_ids: [] as number[],
    activo: true,
    visible: true,
  });

  // ----------------------------------------------------
  // EMBAJADOR
  // ----------------------------------------------------

  const [formEmbajador, setFormEmbajador] = useState({
    municipio_id: 0,
  });

  const [tieneProyecto, setTieneProyecto] = useState(false);
  const [crearNuevoProyecto, setCrearNuevoProyecto] = useState(false);
  const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState(0);

  // ----------------------------------------------------
  // PROYECTO
  // ----------------------------------------------------

  const [formProyecto, setFormProyecto] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // CATÁLOGOS
  // ----------------------------------------------------

  const [roles, setRoles] = useState<Rol[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

  // ----------------------------------------------------
  // FILTROS
  // ----------------------------------------------------

  const [filtroRol, setFiltroRol] = useState<
    'Todos' | typeof ROL_ADMIN | typeof ROL_EMBAJADOR
  >('Todos');

  const [filtroMunicipio, setFiltroMunicipio] = useState('Todos');
  const [filtroMesCumple, setFiltroMesCumple] = useState('Todos');

  // ----------------------------------------------------
  // ELIMINACIÓN
  // ----------------------------------------------------

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ----------------------------------------------------
  // CAMBIO DE CONTRASEÑA
  // ----------------------------------------------------

  const [modalPassword, setModalPassword] = useState<{
    visible: boolean;
    userId: string;
    userName: string;
  }>({
    visible: false,
    userId: '',
    userName: '',
  });

  const [nuevaPasswordForzada, setNuevaPasswordForzada] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ----------------------------------------------------
  // MESES
  // ----------------------------------------------------

  const meses = [
    { num: '01', nombre: 'Enero' },
    { num: '02', nombre: 'Febrero' },
    { num: '03', nombre: 'Marzo' },
    { num: '04', nombre: 'Abril' },
    { num: '05', nombre: 'Mayo' },
    { num: '06', nombre: 'Junio' },
    { num: '07', nombre: 'Julio' },
    { num: '08', nombre: 'Agosto' },
    { num: '09', nombre: 'Septiembre' },
    { num: '10', nombre: 'Octubre' },
    { num: '11', nombre: 'Noviembre' },
    { num: '12', nombre: 'Diciembre' },
  ];

  // ======================================================
  // HELPERS
  // ======================================================

  const calcularEdad = (fechaNacimiento: string | null) => {
    if (!fechaNacimiento) return 'N/A';

    try {
      return differenceInYears(new Date(), parseISO(fechaNacimiento));
    } catch {
      return 'N/A';
    }
  };

  const getMesDia = (fecha: string | null) => {
    if (!fecha) return '99-99';

    try {
      return format(parseISO(fecha), 'MM-dd');
    } catch {
      return '99-99';
    }
  };

  const renderUltimoAcceso = (fechaStr: string | null) => {
    if (!fechaStr) {
      return (
        <span className="text-gray-400 italic">
          Nunca
        </span>
      );
    }

    try {
      return `Hace ${formatDistanceToNow(parseISO(fechaStr), {
        locale: es,
      })}`;
    } catch {
      return 'Desconocido';
    }
  };

  const getEmbajador = (
    usuario: Usuario
  ): EmbajadorInfo | undefined => {
    if (Array.isArray(usuario.embajadores)) {
      return usuario.embajadores[0];
    }

    return usuario.embajadores || undefined;
  };

  const usuarioTieneRol = (
    usuario: Usuario,
    nombreRol: string
  ) => {
    return (
      usuario.usuario_roles?.some(
        (ur) => ur.roles?.nombre === nombreRol
      ) ?? false
    );
  };

  // ======================================================
  // LOGO
  // ======================================================

  const processLogo = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Archivo no válido', {
        description: 'Selecciona una imagen válida.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagen demasiado grande', {
        description: 'El logotipo no debe superar los 5 MB.',
      });
      return;
    }

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setLogoFile(file);
    setLogoPreview(previewUrl);
  };

  // ======================================================
  // CARGAR DATOS
  // ======================================================

  const fetchData = async () => {
    setLoading(true);

    try {
      // --------------------------------------------------
      // 1. USUARIO AUTENTICADO
      // --------------------------------------------------

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error(
          'No se encontró una sesión autenticada.'
        );
      }

      // --------------------------------------------------
      // 2. ROLES DEL USUARIO ACTUAL
      //
      // IMPORTANTE:
      // Ya NO se consulta usuarios.rol_id.
      // El rol vive en usuario_roles.
      // --------------------------------------------------

      const {
        data: currentUserData,
        error: currentRoleError,
      } = await supabase
        .from('usuario_roles')
        .select(`
          rol_id,
          roles (
            id,
            nombre
          )
        `)
        .eq('usuario_id', user.id);

      if (currentRoleError) {
        console.error(
          'Error obteniendo roles actuales:',
          currentRoleError
        );
      }

      const rolesAsignados =
        currentUserData
          ?.map((ur: any) => ur.roles?.nombre)
          .filter(Boolean) || [];

      setCurrentUserRole(rolesAsignados);

      // --------------------------------------------------
      // 3. CATÁLOGOS
      // --------------------------------------------------

      const [
        resRoles,
        resMunicipios,
        resProyectos,
      ] = await Promise.all([
        supabase
          .from('roles')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre'),

        supabase
          .from('municipios')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre'),

        supabase
          .from('proyectos_sociales')
          .select('id, nombre')
          .eq('activo', true)
          .order('nombre'),
      ]);

      if (resRoles.error) {
        console.error(
          'Error cargando roles:',
          resRoles.error
        );
      } else {
        setRoles((resRoles.data || []) as Rol[]);
      }

      if (resMunicipios.error) {
        console.error(
          'Error cargando municipios:',
          resMunicipios.error
        );
      } else {
        setMunicipios(
          (resMunicipios.data || []) as Municipio[]
        );
      }

      if (resProyectos.error) {
        console.error(
          'Error cargando proyectos:',
          resProyectos.error
        );
      } else {
        setProyectos(
          (resProyectos.data || []) as Proyecto[]
        );
      }

      // --------------------------------------------------
      // 4. USUARIOS
      //
      // Esta pantalla es administrativa.
      // Por ello se consulta la tabla usuarios directamente,
      // no usuarios_publico.
      //
      // Los roles se obtienen mediante:
      // usuarios -> usuario_roles -> roles
      // --------------------------------------------------

      const {
        data: usuariosData,
        error: usuariosError,
      } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          apellido,
          correo,
          telefono,
          fecha_nacimiento,
          activo,
          visible,
          ultimo_acceso,

          usuario_roles (
            rol_id,
            roles (
              id,
              nombre
            )
          ),

          embajadores (
            municipio_id,
            proyecto_social_id,
            activo,
            municipios (
              id,
              nombre
            ),
            proyectos_sociales (
              id,
              nombre
            )
          ),

          actividades!creado_por_usuario_id (
            id
          )
        `)
        .order('nombre', { ascending: true });

      if (usuariosError) {
        console.error(
          'Error cargando usuarios:',
          usuariosError
        );

        throw new Error(
          usuariosError.message ||
            'No se pudieron cargar los usuarios.'
        );
      }

      setUsuariosList(
        (usuariosData || []) as unknown as Usuario[]
      );
    } catch (error: any) {
      console.error('Error general:', error);

      toast.error('No se pudo cargar el directorio', {
        description:
          error?.message ||
          'Ocurrió un error al consultar la información.',
      });

      setUsuariosList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, []);

  // ======================================================
  // EDITAR
  // ======================================================

  const handleEdit = (usuario: Usuario) => {
    setEditId(usuario.id);

    const rolesIdsActuales =
      usuario.usuario_roles
        ?.map((ur) => ur.roles?.id)
        .filter(Boolean) as number[] || [];

    const esEmbajadorEditar =
      usuarioTieneRol(usuario, ROL_EMBAJADOR);

    setFormUsuario({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      correo: usuario.correo || '',
      telefono: usuario.telefono || '',
      fecha_nacimiento:
        usuario.fecha_nacimiento || '',
      roles_ids: rolesIdsActuales,
      activo: usuario.activo,
      visible:
        typeof usuario.visible === 'boolean'
          ? usuario.visible
          : true,
    });

    const embajador = getEmbajador(usuario);

    if (esEmbajadorEditar && embajador) {
      setFormEmbajador({
        municipio_id: embajador.municipio_id || 0,
      });

      if (embajador.proyecto_social_id) {
        setTieneProyecto(true);
        setProyectoSeleccionadoId(
          embajador.proyecto_social_id
        );
        setCrearNuevoProyecto(false);
      } else {
        setTieneProyecto(false);
        setProyectoSeleccionadoId(0);
        setCrearNuevoProyecto(false);
      }
    } else {
      setFormEmbajador({
        municipio_id: 0,
      });

      setTieneProyecto(false);
      setCrearNuevoProyecto(false);
      setProyectoSeleccionadoId(0);
    }

    setFormProyecto({
      nombre: '',
      descripcion: '',
      activo: true,
    });

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
    setLogoPreview(null);

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ======================================================
  // ELIMINAR
  // ======================================================

  const confirmDelete = (id: string) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      const { data: desactivado, error } = await supabase.rpc('desactivar_usuario', {
        p_usuario_id: userToDelete,
      });

      if (error || !desactivado) {
        throw error;
      }

      toast.success(
        'Usuario eliminado exitosamente.'
      );

      await fetchData();
    } catch (error: any) {
      console.error(
        'Error eliminando usuario:',
        error
      );

      toast.error(
        'No se pudo eliminar al usuario.',
        {
          description:
            error?.message ||
            'El usuario puede tener registros dependientes. Si deseas conservar su historial, utiliza el estado "Baja".',
        }
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = () => {
    setEditId(null);

    setFormUsuario({
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      fecha_nacimiento: '',
      roles_ids: [],
      activo: true,
      visible: true,
    });

    setFormEmbajador({
      municipio_id: 0,
    });

    setTieneProyecto(false);
    setCrearNuevoProyecto(false);
    setProyectoSeleccionadoId(0);

    setFormProyecto({
      nombre: '',
      descripcion: '',
      activo: true,
    });

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
    setLogoPreview(null);

    setShowForm(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ======================================================
  // CAMBIO FORZADO DE CONTRASEÑA
  // ======================================================

  const executeForcedPasswordChange = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const password =
      nuevaPasswordForzada.trim();

    if (password.length < 8) {
      toast.warning(
        'La contraseña debe tener al menos 8 caracteres.'
      );
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.rpc(
        'cambiar_password_forzado',
        {
          p_usuario_id: modalPassword.userId,
          p_nueva_password: password,
        }
      );

      if (error) {
        throw error;
      }

      toast.success(
        `Contraseña de ${modalPassword.userName} actualizada exitosamente.`
      );

      setModalPassword({
        visible: false,
        userId: '',
        userName: '',
      });

      setNuevaPasswordForzada('');
    } catch (error: any) {
      console.error(
        'Error cambiando contraseña:',
        error
      );

      toast.error(
        'Error al actualizar contraseña',
        {
          description:
            error?.message ||
            'No fue posible realizar el cambio.',
        }
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ======================================================
  // GUARDAR USUARIO
  // ======================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!formUsuario.nombre.trim()) {
      toast.error(
        'El nombre es obligatorio.'
      );
      return;
    }

    if (!formUsuario.correo.trim()) {
      toast.error(
        'El correo electrónico es obligatorio.'
      );
      return;
    }

    if (!formUsuario.telefono.trim()) {
      toast.error(
        'El teléfono es obligatorio.'
      );
      return;
    }

    if (formUsuario.roles_ids.length === 0) {
      toast.error(
        'Selecciona al menos un rol para el usuario.'
      );
      return;
    }

    // --------------------------------------------------
    // ROLES SELECCIONADOS
    // --------------------------------------------------

    const rolesSeleccionadosNombres =
      roles
        .filter((rol) =>
          formUsuario.roles_ids.includes(rol.id)
        )
        .map((rol) => rol.nombre);

    const incluyeRolEmbajador =
      rolesSeleccionadosNombres.includes(
        ROL_EMBAJADOR
      );

    if (
      incluyeRolEmbajador &&
      formEmbajador.municipio_id === 0
    ) {
      toast.error(
        'Selecciona un municipio para el embajador.'
      );
      return;
    }

    if (
      incluyeRolEmbajador &&
      tieneProyecto &&
      crearNuevoProyecto &&
      !formProyecto.nombre.trim()
    ) {
      toast.error(
        'Escribe el nombre del nuevo proyecto.'
      );
      return;
    }

    if (
      incluyeRolEmbajador &&
      tieneProyecto &&
      !crearNuevoProyecto &&
      proyectoSeleccionadoId === 0
    ) {
      toast.error(
        'Selecciona un proyecto del catálogo.'
      );
      return;
    }

    setIsSaving(true);

    try {
      let usuarioId = editId;

      // --------------------------------------------------
      // INFORMACIÓN DEL USUARIO
      // --------------------------------------------------

      const payloadUsuarioInfo = {
        nombre: formUsuario.nombre.trim(),
        apellido: formUsuario.apellido.trim() || null,
        correo: formUsuario.correo.trim().toLowerCase(),
        telefono:
          formUsuario.telefono.trim() || null,
        fecha_nacimiento:
          formUsuario.fecha_nacimiento || null,
        activo: formUsuario.activo,
        visible: formUsuario.visible,
      };

      // --------------------------------------------------
      // EDITAR USUARIO EXISTENTE
      // --------------------------------------------------

      if (editId) {
        const {
          error: errUpdate,
        } = await supabase
          .from('usuarios')
          .update(payloadUsuarioInfo)
          .eq('id', editId);

        if (errUpdate) {
          throw errUpdate;
        }
      }

      // --------------------------------------------------
      // CREAR NUEVO USUARIO
      // --------------------------------------------------

      else {
        if (!supabaseUrl || !supabaseKey) {
          throw new Error(
            'No están configuradas las variables de Supabase.'
          );
        }

        /*
         * Cliente independiente para que signUp no sustituya
         * la sesión del administrador actual.
         */
        const authClient = createClient(
          supabaseUrl,
          supabaseKey,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          }
        );

        const {
          data: authData,
          error: authError,
        } =
          await authClient.auth.signUp({
            email:
              payloadUsuarioInfo.correo,
            password:
              PASSWORD_TEMPORAL_DEFAULT,
          });

        if (authError) {
          throw authError;
        }

        const newUserId =
          authData.user?.id;

        if (!newUserId) {
          throw new Error(
            'Supabase no devolvió el ID del nuevo usuario.'
          );
        }

        const payloadNuevoUsuario = {
          ...payloadUsuarioInfo,
          id: newUserId,
          requiere_cambio_password: true,
        };

        const {
          error: errUsuario,
        } = await supabase
          .from('usuarios')
          .upsert(
            payloadNuevoUsuario,
            {
              onConflict: 'id',
            }
          );

        if (errUsuario) {
          throw errUsuario;
        }

        usuarioId = newUserId;
      }

      if (!usuarioId) {
        throw new Error(
          'No se pudo determinar el ID del usuario.'
        );
      }

      // --------------------------------------------------
      // ROLES
      //
      // La relación correcta es:
      // usuario_roles(usuario_id, rol_id)
      // --------------------------------------------------

      const {
        error: deleteRolesError,
      } = await supabase
        .from('usuario_roles')
        .delete()
        .eq('usuario_id', usuarioId);

      if (deleteRolesError) {
        throw deleteRolesError;
      }

      const rolesAInsertar =
        formUsuario.roles_ids.map(
          (rolId) => ({
            usuario_id: usuarioId,
            rol_id: rolId,
          })
        );

      const {
        error: roleInsertError,
      } = await supabase
        .from('usuario_roles')
        .insert(rolesAInsertar);

      if (roleInsertError) {
        throw roleInsertError;
      }

      // --------------------------------------------------
      // PERFIL DE EMBAJADOR
      // --------------------------------------------------

      if (incluyeRolEmbajador) {
        let proyectoFinalId:
          number | null = null;

        // ----------------------------------------------
        // CREAR NUEVO PROYECTO
        // ----------------------------------------------

        if (
          tieneProyecto &&
          crearNuevoProyecto
        ) {
          let finalLogoUrl:
            string | null = null;
          let uploadedLogoPath: string | null = null;

          if (logoFile) {
            const extension =
              logoFile.name
                .split('.')
                .pop()
                ?.toLowerCase() ||
              'png';

            const uniqueFileName =
              typeof crypto !==
                'undefined' &&
              typeof crypto.randomUUID ===
                'function'
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}`;

            const fileName =
              `logos/${usuarioId}/logo_${uniqueFileName}.${extension}`;
            uploadedLogoPath = fileName;

            const {
              error: uploadError,
            } =
              await supabase.storage
                .from('imagenes')
                .upload(
                  fileName,
                  logoFile,
                  {
                    upsert: false,
                    contentType:
                      logoFile.type,
                  }
                );

            if (uploadError) {
              throw uploadError;
            }

            const {
              data: publicUrlData,
            } =
              supabase.storage
                .from('imagenes')
                .getPublicUrl(
                  fileName
                );

            finalLogoUrl =
              publicUrlData.publicUrl;
          }

          const {
            data: proyectoCreado,
            error: proyectoError,
          } = await supabase
            .from(
              'proyectos_sociales'
            )
            .insert({
              nombre:
                formProyecto.nombre.trim(),
              descripcion:
                formProyecto.descripcion.trim() ||
                null,
              logo: finalLogoUrl,
              activo: true,
            })
            .select('id')
            .single();

          if (proyectoError) {
            if (uploadedLogoPath) {
              await supabase.storage.from('imagenes').remove([uploadedLogoPath]);
            }
            throw proyectoError;
          }

          proyectoFinalId =
            proyectoCreado.id;
        }

        // ----------------------------------------------
        // PROYECTO EXISTENTE
        // ----------------------------------------------

        else if (
          tieneProyecto &&
          !crearNuevoProyecto
        ) {
          proyectoFinalId =
            proyectoSeleccionadoId > 0
              ? proyectoSeleccionadoId
              : null;
        }

        // ----------------------------------------------
        // UPSERT EMBAJADOR
        // ----------------------------------------------

        const {
          error: embajadorError,
        } = await supabase
          .from('embajadores')
          .upsert(
            {
              usuario_id: usuarioId,
              municipio_id:
                formEmbajador.municipio_id,
              proyecto_social_id:
                proyectoFinalId,
              activo: true,
            },
            {
              onConflict:
                'usuario_id',
            }
          );

        if (embajadorError) {
          throw embajadorError;
        }
      }

      // --------------------------------------------------
      // SI DEJA DE SER EMBAJADOR
      // --------------------------------------------------

      else {
        const {
          error: removeEmbajadorError,
        } = await supabase
          .from('embajadores')
          .delete()
          .eq(
            'usuario_id',
            usuarioId
          );

        if (removeEmbajadorError) {
          throw removeEmbajadorError;
        }
      }

      // --------------------------------------------------
      // ÉXITO
      // --------------------------------------------------

      toast.success(
        editId
          ? 'Registro actualizado con éxito'
          : 'Usuario guardado exitosamente',
        {
          description:
            !editId
              ? 'El usuario fue creado con la contraseña temporal configurada.'
              : undefined,
        }
      );

      resetForm();

      await fetchData();
    } catch (error: any) {
      console.error(
        'Error guardando usuario:',
        error
      );

      toast.error(
        'Ocurrió un error',
        {
          description:
            error?.message ||
            'No fue posible guardar los cambios.',
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ======================================================
  // VARIABLES DERIVADAS
  // ======================================================

  const rolesSeleccionadosNombres =
    roles
      .filter((rol) =>
        formUsuario.roles_ids.includes(
          rol.id
        )
      )
      .map((rol) => rol.nombre);

  const incluyeRolEmbajador =
    rolesSeleccionadosNombres.includes(
      ROL_EMBAJADOR
    );

  const mostrarColumnasEmbajador =
    filtroRol !== ROL_ADMIN;

  const puedeCambiarPasswords =
    currentUserRole.includes(
      ROL_PROGRAMADOR
    );

  // ======================================================
  // FILTROS
  // ======================================================

  let usuariosFiltrados =
    usuariosList.filter((usuario) => {
      const tieneRolBuscado =
        filtroRol === 'Todos'
          ? true
          : usuarioTieneRol(
              usuario,
              filtroRol
            );

      if (!tieneRolBuscado) {
        return false;
      }

      if (
        filtroMunicipio !== 'Todos'
      ) {
        const embajador =
          getEmbajador(usuario);

        if (
          embajador?.municipios
            ?.nombre !==
          filtroMunicipio
        ) {
          return false;
        }
      }

      if (
        filtroMesCumple !== 'Todos'
      ) {
        if (
          !usuario.fecha_nacimiento
        ) {
          return false;
        }

        const mes =
          usuario.fecha_nacimiento.split(
            '-'
          )[1];

        if (
          mes !== filtroMesCumple
        ) {
          return false;
        }
      }

      return true;
    });

  usuariosFiltrados =
    usuariosFiltrados.sort(
      (a, b) =>
        getMesDia(
          a.fecha_nacimiento
        ).localeCompare(
          getMesDia(
            b.fecha_nacimiento
          )
        )
    );

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2
          className="animate-spin mb-4"
          size={40}
        />

        <p className="font-medium text-lg">
          Cargando directorio de usuarios...
        </p>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* ==================================================
          MODAL CAMBIO CONTRASEÑA
      ================================================== */}

      {modalPassword.visible && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 overflow-hidden">

            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
                <Key
                  size={20}
                  className="text-[#00689D]"
                />
                Forzar Contraseña
              </h3>

              <button
                type="button"
                onClick={() =>
                  setModalPassword({
                    visible: false,
                    userId: '',
                    userName: '',
                  })
                }
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={
                executeForcedPasswordChange
              }
              className="p-6 space-y-4"
            >
              <p className="text-sm text-gray-600">
                Estás cambiando directamente la contraseña de{' '}
                <strong>
                  {modalPassword.userName}
                </strong>
                .
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Nueva Contraseña{' '}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  autoFocus
                  value={
                    nuevaPasswordForzada
                  }
                  onChange={(e) =>
                    setNuevaPasswordForzada(
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D]"
                  placeholder="Escribe la nueva contraseña..."
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setModalPassword({
                      visible: false,
                      userId: '',
                      userName: '',
                    })
                  }
                  className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    isChangingPassword
                  }
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] disabled:opacity-70 shadow-md"
                >
                  {isChangingPassword && (
                    <Loader2
                      className="animate-spin"
                      size={16}
                    />
                  )}

                  Aplicar Cambio
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          CABECERA
      ================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users
              className="text-[#00689D]"
              size={28}
            />

            Directorio de Usuarios
          </h1>

          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Administra y filtra los usuarios registrados.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() =>
              setShowForm(true)
            }
            className="w-full sm:w-auto bg-[#00689D] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#00527A] transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} />
            Añadir Nuevo
          </button>
        )}

      </div>

      {/* ==================================================
          FORMULARIO
      ================================================== */}

      {showForm && (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border-t-4 border-[#00689D] animate-in fade-in slide-in-from-top-4 relative overflow-hidden">

          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">

            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              {editId ? (
                <Edit2 className="text-blue-500" />
              ) : (
                <PlusCircle className="text-green-500" />
              )}

              {editId
                ? 'Editar Registro de Usuario'
                : 'Alta de Nuevo Usuario'}
            </h2>

            <button
              type="button"
              onClick={resetForm}
              className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-gray-50 rounded-full hover:bg-red-50"
            >
              <X size={24} />
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8"
          >

            {/* ------------------------------------------
                DATOS PERSONALES
            ------------------------------------------ */}

            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">

              <h3 className="text-lg font-bold mb-6 text-[#00689D] flex items-center gap-2">
                <Users size={20} />
                1. Datos Personales y Acceso
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nombre
                  </label>

                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none"
                    value={
                      formUsuario.nombre
                    }
                    onChange={(e) =>
                      setFormUsuario({
                        ...formUsuario,
                        nombre:
                          e.target.value,
                      })
                    }
                    placeholder="Ej. Juan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Apellido
                  </label>

                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none"
                    value={
                      formUsuario.apellido
                    }
                    onChange={(e) =>
                      setFormUsuario({
                        ...formUsuario,
                        apellido:
                          e.target.value,
                      })
                    }
                    placeholder="Ej. Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Mail size={16} />
                    Correo Electrónico
                  </label>

                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none"
                    value={
                      formUsuario.correo
                    }
                    onChange={(e) =>
                      setFormUsuario({
                        ...formUsuario,
                        correo:
                          e.target.value,
                      })
                    }
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                {!editId ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Lock size={16} />
                      Contraseña Temporal
                    </label>

                    <input
                      type="text"
                      disabled
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-200 text-gray-600 font-mono font-bold cursor-not-allowed select-all"
                      value={
                        PASSWORD_TEMPORAL_DEFAULT
                      }
                    />

                    <p className="text-xs text-[#00689D] font-medium mt-1">
                      El usuario deberá cambiarla al iniciar sesión.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <Lock size={16} />
                      Contraseña
                    </label>

                    <input
                      type="text"
                      disabled
                      className="w-full p-3 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
                      value="••••••••"
                    />

                    <p className="text-xs text-gray-400 mt-1">
                      Usa el botón de llave para forzar una nueva contraseña.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Phone size={16} />
                    Teléfono
                  </label>

                  <input
                    type="tel"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none"
                    value={
                      formUsuario.telefono
                    }
                    onChange={(e) =>
                      setFormUsuario({
                        ...formUsuario,
                        telefono:
                          e.target.value,
                      })
                    }
                    placeholder="10 dígitos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar size={16} />
                    Fecha de Nacimiento
                  </label>

                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none"
                    value={
                      formUsuario.fecha_nacimiento
                    }
                    onChange={(e) =>
                      setFormUsuario({
                        ...formUsuario,
                        fecha_nacimiento:
                          e.target.value,
                      })
                    }
                  />
                </div>

                {/* ROLES */}

                <div className="md:col-span-2 border-t border-gray-200 mt-2 pt-4">

                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Shield size={16} />
                    Asignar Roles
                  </label>

                  <div className="flex flex-wrap gap-4 mt-2">

                    {roles.map((rol) => (
                      <label
                        key={rol.id}
                        className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                      >

                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#00689D] rounded border-gray-300 focus:ring-[#00689D]"
                          checked={formUsuario.roles_ids.includes(
                            rol.id
                          )}
                          onChange={(e) => {

                            if (
                              e.target.checked
                            ) {
                              setFormUsuario({
                                ...formUsuario,
                                roles_ids: [
                                  ...formUsuario.roles_ids,
                                  rol.id,
                                ],
                              });
                            } else {
                              setFormUsuario({
                                ...formUsuario,
                                roles_ids:
                                  formUsuario.roles_ids.filter(
                                    (id) =>
                                      id !==
                                      rol.id
                                  ),
                              });
                            }

                          }}
                        />

                        <span className="text-sm font-semibold text-gray-700">
                          {rol.nombre}
                        </span>

                      </label>
                    ))}

                  </div>
                </div>

              </div>
            </div>

            {/* ==================================================
                PERFIL EMBAJADOR
            ================================================== */}

            {incluyeRolEmbajador && (
              <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-200 animate-in fade-in slide-in-from-bottom-4">

                <h3 className="text-lg font-bold mb-6 text-[#00689D] flex items-center gap-2">
                  <MapPin size={20} />
                  2. Perfil de Embajador
                </h3>

                <div className="mb-6">

                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Municipio de Operación
                  </label>

                  <select
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none bg-white"
                    value={
                      formEmbajador.municipio_id
                    }
                    onChange={(e) =>
                      setFormEmbajador({
                        municipio_id:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                  >
                    <option value="0">
                      -- Selecciona Municipio --
                    </option>

                    {municipios.map(
                      (municipio) => (
                        <option
                          key={
                            municipio.id
                          }
                          value={
                            municipio.id
                          }
                        >
                          {municipio.nombre}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* PROYECTO */}

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">

                  <label className="flex items-center space-x-3 cursor-pointer mb-5">

                    <input
                      type="checkbox"
                      className="w-5 h-5 text-[#00689D] border-gray-300 rounded focus:ring-[#00689D]"
                      checked={
                        tieneProyecto
                      }
                      onChange={(e) => {
                        setTieneProyecto(
                          e.target.checked
                        );

                        if (
                          !e.target.checked
                        ) {
                          setProyectoSeleccionadoId(
                            0
                          );
                          setCrearNuevoProyecto(
                            false
                          );
                        }
                      }}
                    />

                    <span className="font-bold text-gray-800 text-base">
                      ¿Tiene un Proyecto Social asignado?
                    </span>

                  </label>

                  {tieneProyecto && (
                    <div className="pl-8 space-y-5 border-l-2 border-blue-200 ml-2 animate-in fade-in">

                      <div className="flex flex-wrap gap-3">

                        <button
                          type="button"
                          onClick={() => {
                            setCrearNuevoProyecto(
                              false
                            );
                            setFormProyecto({
                              nombre: '',
                              descripcion: '',
                              activo: true,
                            });
                          }}
                          className={`px-5 py-2 text-sm font-bold rounded-md transition-colors ${
                            !crearNuevoProyecto
                              ? 'bg-[#00689D] text-white shadow'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Buscar Existente
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCrearNuevoProyecto(
                              true
                            );
                            setProyectoSeleccionadoId(
                              0
                            );
                          }}
                          className={`px-5 py-2 text-sm font-bold rounded-md transition-colors ${
                            crearNuevoProyecto
                              ? 'bg-green-600 text-white shadow'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          + Crear Nuevo
                        </button>

                      </div>

                      {!crearNuevoProyecto ? (
                        <select
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] bg-gray-50 outline-none"
                          value={
                            proyectoSeleccionadoId
                          }
                          onChange={(e) =>
                            setProyectoSeleccionadoId(
                              Number(
                                e.target.value
                              )
                            )
                          }
                        >
                          <option value="0">
                            -- Buscar Proyecto en Catálogo --
                          </option>

                          {proyectos.map(
                            (proyecto) => (
                              <option
                                key={
                                  proyecto.id
                                }
                                value={
                                  proyecto.id
                                }
                              >
                                {
                                  proyecto.nombre
                                }
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <div className="grid grid-cols-1 gap-5 bg-gray-50 p-5 rounded-xl border border-gray-200">

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                              Nombre del Proyecto
                            </label>

                            <input
                              type="text"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                              value={
                                formProyecto.nombre
                              }
                              onChange={(e) =>
                                setFormProyecto({
                                  ...formProyecto,
                                  nombre:
                                    e.target.value,
                                })
                              }
                              placeholder="Nombre de la iniciativa..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                              Descripción
                            </label>

                            <textarea
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                              rows={3}
                              value={
                                formProyecto.descripcion
                              }
                              onChange={(e) =>
                                setFormProyecto({
                                  ...formProyecto,
                                  descripcion:
                                    e.target.value,
                                })
                              }
                              placeholder="Breve descripción del proyecto..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                              Logotipo
                            </label>

                            <div
                              onDragOver={(e) =>
                                e.preventDefault()
                              }
                              onDrop={(e) => {
                                e.preventDefault();

                                const file =
                                  e.dataTransfer
                                    .files?.[0];

                                if (file) {
                                  processLogo(
                                    file
                                  );
                                }
                              }}
                              onClick={() =>
                                logoInputRef.current?.click()
                              }
                              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:bg-green-50 hover:border-green-500 transition-colors cursor-pointer"
                            >

                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                className="hidden"
                                ref={
                                  logoInputRef
                                }
                                onChange={(e) => {
                                  const file =
                                    e.target.files?.[0];

                                  if (file) {
                                    processLogo(
                                      file
                                    );
                                  }
                                }}
                              />

                              {logoPreview ? (
                                <div className="relative flex flex-col items-center">

                                  <img
                                    src={
                                      logoPreview
                                    }
                                    alt="Vista previa del logotipo"
                                    className="h-24 max-w-full object-contain rounded-md shadow-sm"
                                  />

                                  <p className="text-xs text-gray-500 mt-2">
                                    Haz clic para cambiar
                                  </p>

                                </div>
                              ) : (
                                <div className="text-center flex flex-col items-center">

                                  <UploadCloud
                                    size={24}
                                    className="text-gray-400 mb-2"
                                  />

                                  <p className="text-sm text-gray-700 font-semibold">
                                    Arrastra o haz clic
                                  </p>

                                  <p className="text-xs text-gray-400 mt-1">
                                    PNG, JPG, WEBP o SVG · Máx. 5 MB
                                  </p>

                                </div>
                              )}

                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ==================================================
                BOTONES
            ================================================== */}

            <div className="flex flex-col-reverse sm:flex-row justify-end pt-6 border-t border-gray-200 gap-3">

              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#00527A] disabled:bg-gray-400 transition-colors shadow-md"
              >

                {isSaving ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {editId
                      ? 'Actualizar Registro'
                      : 'Guardar Usuario'}
                  </>
                )}

              </button>

            </div>

          </form>
        </div>
      )}

      {/* ==================================================
          FILTROS
      ================================================== */}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">

        <div className="flex space-x-2 mb-6 border-b border-gray-100 pb-5 overflow-x-auto scrollbar-hide">

          <button
            type="button"
            onClick={() =>
              setFiltroRol('Todos')
            }
            className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              filtroRol === 'Todos'
                ? 'bg-[#00689D] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>

          <button
            type="button"
            onClick={() =>
              setFiltroRol(
                ROL_ADMIN
              )
            }
            className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              filtroRol === ROL_ADMIN
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Administradores
          </button>

          <button
            type="button"
            onClick={() =>
              setFiltroRol(
                ROL_EMBAJADOR
              )
            }
            className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              filtroRol ===
              ROL_EMBAJADOR
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Embajadores
          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Filtrar Municipio
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin
                  size={16}
                  className="text-gray-400"
                />
              </div>

              <select
                className="w-full pl-9 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00689D] outline-none appearance-none disabled:opacity-50 transition-colors"
                value={
                  filtroMunicipio
                }
                onChange={(e) =>
                  setFiltroMunicipio(
                    e.target.value
                  )
                }
                disabled={
                  filtroRol ===
                  ROL_ADMIN
                }
              >
                <option value="Todos">
                  Cualquier Municipio
                </option>

                {municipios.map(
                  (municipio) => (
                    <option
                      key={
                        municipio.id
                      }
                      value={
                        municipio.nombre
                      }
                    >
                      {
                        municipio.nombre
                      }
                    </option>
                  )
                )}
              </select>

            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Mes de Cumpleaños
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar
                  size={16}
                  className="text-gray-400"
                />
              </div>

              <select
                className="w-full pl-9 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00689D] outline-none appearance-none transition-colors"
                value={
                  filtroMesCumple
                }
                onChange={(e) =>
                  setFiltroMesCumple(
                    e.target.value
                  )
                }
              >
                <option value="Todos">
                  Cualquier mes
                </option>

                {meses.map(
                  (mes) => (
                    <option
                      key={mes.num}
                      value={mes.num}
                    >
                      {mes.nombre}
                    </option>
                  )
                )}
              </select>

            </div>
          </div>

          <div className="flex items-end">

            <button
              type="button"
              onClick={() => {
                setFiltroRol('Todos');
                setFiltroMunicipio(
                  'Todos'
                );
                setFiltroMesCumple(
                  'Todos'
                );
              }}
              className="w-full bg-white border border-gray-300 text-gray-700 font-bold p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Limpiar Filtros
            </button>

          </div>

        </div>
      </div>

      {/* ==================================================
          TABLA
      ================================================== */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">

          <h3 className="font-bold text-gray-700 text-sm md:text-base">
            Resultados de búsqueda
          </h3>

          <span className="bg-[#00689D]/10 text-[#00689D] px-3 py-1 rounded-full text-xs font-bold border border-[#00689D]/20">
            {usuariosFiltrados.length}{' '}
            usuarios encontrados
          </span>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full text-left border-collapse text-sm">

            <thead>
              <tr className="bg-white text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider">

                <th className="p-4 font-bold text-center w-12">
                  #
                </th>

                <th className="p-4 font-bold whitespace-nowrap">
                  Nombre Completo
                </th>

                <th className="p-4 font-bold text-center">
                  Edad
                </th>

                <th className="p-4 font-bold whitespace-nowrap">
                  Fecha Nac.
                </th>

                <th className="p-4 font-bold">
                  Contacto
                </th>

                <th className="p-4 font-bold">
                  Roles
                </th>

                {mostrarColumnasEmbajador && (
                  <th className="p-4 font-bold">
                    Municipio / Proyecto
                  </th>
                )}

                {mostrarColumnasEmbajador && (
                  <th className="p-4 font-bold text-center">
                    Actividades
                  </th>
                )}

                <th className="p-4 font-bold text-center">
                  Estado
                </th>

                <th className="p-4 font-bold text-center whitespace-nowrap">
                  Última Conexión
                </th>

                <th className="p-4 font-bold text-center">
                  Acciones
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">

              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      mostrarColumnasEmbajador
                        ? 11
                        : 9
                    }
                    className="p-12 text-center text-gray-500"
                  >
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />

                    <p className="font-medium text-lg">
                      No se encontraron usuarios
                    </p>
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map(
                  (usuario, index) => {
                    const tieneRolEmbajador =
                      usuarioTieneRol(
                        usuario,
                        ROL_EMBAJADOR
                      );

                    const embajador =
                      getEmbajador(
                        usuario
                      );

                    const cantidadActividades =
                      usuario
                        .actividades
                        ?.length ||
                      0;

                    const edad =
                      calcularEdad(
                        usuario.fecha_nacimiento
                      );

                    return (
                      <tr
                        key={usuario.id}
                        className="hover:bg-blue-50/30 transition-colors"
                      >

                        <td className="p-4 text-center font-bold text-gray-400">
                          {index + 1}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-gray-900 whitespace-nowrap">
                            {usuario.nombre}{' '}
                            {usuario.apellido}
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-bold text-xs">
                            {edad !== 'N/A'
                              ? edad
                              : '-'}
                          </span>
                        </td>

                        <td className="p-4 text-gray-600 whitespace-nowrap text-xs font-medium">
                          {usuario.fecha_nacimiento ||
                            '-'}
                        </td>

                        <td className="p-4">
                          <div className="text-gray-900 font-medium text-xs">
                            {usuario.correo}
                          </div>

                          <div className="text-gray-500 text-xs mt-0.5">
                            {usuario.telefono ||
                              'Sin teléfono'}
                          </div>
                        </td>

                        {/* ROLES */}

                        <td className="p-4">

                          <div className="flex flex-wrap gap-1">

                            {usuario.usuario_roles &&
                            usuario.usuario_roles
                              .length >
                              0 ? (
                              usuario.usuario_roles.map(
                                (
                                  usuarioRol,
                                  i
                                ) => {

                                  const nombreRol =
                                    usuarioRol
                                      .roles
                                      ?.nombre ||
                                    'Sin rol';

                                  return (
                                    <span
                                      key={`${usuario.id}-rol-${i}`}
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                        nombreRol ===
                                        ROL_EMBAJADOR
                                          ? 'bg-green-50 text-green-700 border-green-200'
                                          : nombreRol ===
                                            ROL_ADMIN
                                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                                          : nombreRol ===
                                            ROL_PROGRAMADOR
                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                          : 'bg-gray-50 text-gray-700 border-gray-200'
                                      }`}
                                    >
                                      {
                                        nombreRol
                                      }
                                    </span>
                                  );
                                }
                              )
                            ) : (
                              <span className="text-gray-400 text-xs">
                                Sin rol
                              </span>
                            )}

                          </div>
                        </td>

                        {/* MUNICIPIO / PROYECTO */}

                        {mostrarColumnasEmbajador && (
                          <td className="p-4">

                            {tieneRolEmbajador ? (
                              <div className="flex flex-col">

                                <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                  <MapPin
                                    size={12}
                                  />

                                  {embajador
                                    ?.municipios
                                    ?.nombre ||
                                    'Sin Asignar'}
                                </span>

                                <span className="text-xs text-[#00689D] font-medium truncate max-w-[150px] mt-0.5 flex items-center gap-1">
                                  <Folder
                                    size={12}
                                  />

                                  {embajador
                                    ?.proyectos_sociales
                                    ?.nombre ||
                                    'Sin Proyecto'}
                                </span>

                              </div>
                            ) : (
                              <span className="text-gray-300">
                                -
                              </span>
                            )}

                          </td>
                        )}

                        {/* ACTIVIDADES */}

                        {mostrarColumnasEmbajador && (
                          <td className="p-4 text-center">

                            {tieneRolEmbajador ? (
                              <span className="font-bold text-gray-700">
                                {
                                  cantidadActividades
                                }
                              </span>
                            ) : (
                              <span className="text-gray-300">
                                -
                              </span>
                            )}

                          </td>
                        )}

                        {/* ESTADO */}

                        <td className="p-4 text-center">

                          <span
                            className={`inline-flex items-center w-2.5 h-2.5 rounded-full mr-1.5 ${
                              usuario.activo
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          />

                          <span className="text-xs font-medium text-gray-700">
                            {usuario.activo
                              ? 'Activo'
                              : 'Baja'}
                          </span>

                        </td>

                        {/* ÚLTIMO ACCESO */}

                        <td className="p-4 text-center">

                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00689D] bg-[#00689D]/10 px-2.5 py-1 rounded-md border border-[#00689D]/20 whitespace-nowrap">

                            <Clock size={12} />

                            {renderUltimoAcceso(
                              usuario.ultimo_acceso
                            )}

                          </span>

                        </td>

                        {/* ACCIONES */}

                        <td className="p-4">

                          <div className="flex items-center justify-center gap-1">

                            {puedeCambiarPasswords && (
                              <button
                                type="button"
                                onClick={() =>
                                  setModalPassword(
                                    {
                                      visible: true,
                                      userId:
                                        usuario.id,
                                      userName:
                                        `${usuario.nombre} ${usuario.apellido}`,
                                    }
                                  )
                                }
                                className="text-amber-500 hover:bg-amber-50 p-2 rounded-md transition-colors"
                                title="Forzar Contraseña"
                              >
                                <Key
                                  size={16}
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  usuario
                                )
                              }
                              className="text-[#00689D] hover:bg-blue-50 p-2 rounded-md transition-colors"
                              title="Editar"
                            >
                              <Edit2
                                size={16}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                confirmDelete(
                                  usuario.id
                                )
                              }
                              className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"
                              title="Eliminar"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================
          CONFIRMACIÓN DE ELIMINACIÓN
      ================================================== */}

      <AlertDialog
        open={
          isDeleteDialogOpen
        }
        onOpenChange={
          setIsDeleteDialogOpen
        }
      >

        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle>
              ¿Estás seguro de eliminar este usuario?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Esta acción eliminará de forma permanente el registro del usuario en la tabla de usuarios. Si tiene actividades, reportes u otros registros relacionados, la base de datos puede impedir la eliminación. En ese caso, es recomendable cambiar su estado a "Baja".
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={
                executeDelete
              }
              disabled={
                isDeleting
              }
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting
                ? 'Eliminando...'
                : 'Sí, eliminar'}
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  );
}