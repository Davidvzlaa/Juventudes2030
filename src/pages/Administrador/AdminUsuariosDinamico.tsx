import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js'; 
import { 
  Users, PlusCircle, Search, Edit2, Trash2, X, Save, 
  Loader2, UploadCloud, MapPin, Calendar, Mail, Phone, Shield, Folder, Lock, Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Importaciones de date-fns para un manejo de fechas robusto y amigable
import { differenceInYears, parseISO, format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Importaciones de shadcn/ui
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
// INTERFACES (TypeScript estricto)
// ==========================================
interface Rol { id: number; nombre: string; }
interface Municipio { id: number; nombre: string; }
interface Proyecto { id: number; nombre: string; }

interface EmbajadorInfo {
  municipio_id: number;
  proyecto_social_id: number | null;
  municipios?: Municipio;
  proyectos_sociales?: Proyecto;
}

interface ActividadInfo {
  id: number;
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  activo: boolean;
  ultimo_acceso: string | null; // <-- NUEVA COLUMNA
  roles: Rol | null;
  embajadores?: EmbajadorInfo[] | EmbajadorInfo;
  actividades?: ActividadInfo[];
}

// Obtenemos las credenciales de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ==========================================
// CONSTANTES GLOBALES
// ==========================================
const PASSWORD_TEMPORAL_DEFAULT = 'Juventudes2030*26';
const ROL_EMBAJADOR = 'Embajador';
const ROL_ADMIN = 'Administrador';

export default function AdminUsuariosDinamico() {
  const [showForm, setShowForm] = useState(false);
  const [usuariosList, setUsuariosList] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para Alert Dialog (Eliminar)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [roles, setRoles] = useState<Rol[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

  // Filtros
  const [filtroRol, setFiltroRol] = useState<'Todos' | typeof ROL_ADMIN | typeof ROL_EMBAJADOR>('Todos');
  const [filtroMunicipio, setFiltroMunicipio] = useState<string>('Todos');
  const [filtroMesCumple, setFiltroMesCumple] = useState<string>('Todos'); 

  // Formulario
  const [editId, setEditId] = useState<string | null>(null);
  const [formUsuario, setFormUsuario] = useState({
    nombre: '', apellido: '', correo: '', telefono: '', fecha_nacimiento: '', rol_id: 0, activo: true, visible: true
  });
  const [formEmbajador, setFormEmbajador] = useState({ municipio_id: 0 });

  // Lógica de Proyecto
  const [tieneProyecto, setTieneProyecto] = useState(false);
  const [crearNuevoProyecto, setCrearNuevoProyecto] = useState(false);
  const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState(0);

  // Logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [formProyecto, setFormProyecto] = useState({ nombre: '', descripcion: '', activo: true });

  const meses = [
    { num: '01', nombre: 'Enero' }, { num: '02', nombre: 'Febrero' }, { num: '03', nombre: 'Marzo' },
    { num: '04', nombre: 'Abril' }, { num: '05', nombre: 'Mayo' }, { num: '06', nombre: 'Junio' },
    { num: '07', nombre: 'Julio' }, { num: '08', nombre: 'Agosto' }, { num: '09', nombre: 'Septiembre' },
    { num: '10', nombre: 'Octubre' }, { num: '11', nombre: 'Noviembre' }, { num: '12', nombre: 'Diciembre' }
  ];

  // Cálculo seguro usando date-fns
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

  // Función amigable para el último acceso
  const renderUltimoAcceso = (fechaStr: string | null) => {
    if (!fechaStr) return <span className="text-gray-400 italic">Nunca</span>;
    try {
      return `Hace ${formatDistanceToNow(parseISO(fechaStr), { locale: es })}`;
    } catch {
      return 'Desconocido';
    }
  };

  const processLogo = (file: File) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const fetchData = async () => {
    setLoading(true);
    const [resRoles, resMun, resProy] = await Promise.all([
      supabase.from('roles').select('id, nombre').eq('activo', true),
      supabase.from('municipios').select('id, nombre').eq('activo', true),
      supabase.from('proyectos_sociales').select('id, nombre').eq('activo', true)
    ]);

    if (resRoles.data) setRoles(resRoles.data);
    if (resMun.data) setMunicipios(resMun.data);
    if (resProy.data) setProyectos(resProy.data);

    // Consulta principal agregando ultimo_acceso
    const { data: usuariosData, error: usrErr } = await supabase
      .from('usuarios')
      .select(`
        id, nombre, apellido, correo, telefono, fecha_nacimiento, activo, ultimo_acceso,
        roles(id, nombre),
        embajadores(
          municipio_id, proyecto_social_id,
          municipios(nombre),
          proyectos_sociales(nombre)
        ),
        actividades!creado_por_usuario_id(id)
      `);

    if (!usrErr && usuariosData) {
      setUsuariosList(usuariosData as unknown as Usuario[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (u: Usuario) => {
    setEditId(u.id);
    setFormUsuario({
      nombre: u.nombre || '', apellido: u.apellido || '', correo: u.correo || '',
      telefono: u.telefono || '', fecha_nacimiento: u.fecha_nacimiento || '',
      rol_id: u.roles?.id || 0, activo: u.activo, visible: true
    });

    const esEmbajadorEditar = u.roles?.nombre === ROL_EMBAJADOR;
    const emb = Array.isArray(u.embajadores) ? u.embajadores[0] : u.embajadores;

    if (esEmbajadorEditar && emb) {
      setFormEmbajador({ municipio_id: emb.municipio_id || 0 });
      if (emb.proyecto_social_id) {
        setTieneProyecto(true);
        setProyectoSeleccionadoId(emb.proyecto_social_id);
        setCrearNuevoProyecto(false);
      } else {
        setTieneProyecto(false);
        setProyectoSeleccionadoId(0);
      }
    } else {
      setFormEmbajador({ municipio_id: 0 });
      setTieneProyecto(false);
    }
    
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (id: string) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', userToDelete);
      if (error) throw error;
      
      toast.success("Usuario eliminado exitosamente.");
      fetchData();
    } catch (error: any) {
      toast.error("No se pudo eliminar al usuario.", {
        description: "Sugerencia: Intenta desactivarlo cambiando su estado desde 'Editar'.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormUsuario({ nombre: '', apellido: '', correo: '', telefono: '', fecha_nacimiento: '', rol_id: 0, activo: true, visible: true });
    setFormEmbajador({ municipio_id: 0 });
    setTieneProyecto(false);
    setCrearNuevoProyecto(false);
    setProyectoSeleccionadoId(0);
    setFormProyecto({ nombre: '', descripcion: '', activo: true });
    setLogoFile(null);
    setLogoPreview(null);
    setShowForm(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let usuariosFiltrados = usuariosList.filter(u => {
    const nombreRol = u.roles?.nombre;
    if (filtroRol !== 'Todos' && nombreRol !== filtroRol) return false;
    if (filtroMunicipio !== 'Todos') {
      const datosEmbajador = Array.isArray(u.embajadores) ? u.embajadores[0] : u.embajadores;
      if (datosEmbajador?.municipios?.nombre !== filtroMunicipio) return false;
    }
    if (filtroMesCumple !== 'Todos') {
      if (!u.fecha_nacimiento) return false;
      const mes = u.fecha_nacimiento.split('-')[1];
      if (mes !== filtroMesCumple) return false;
    }
    return true;
  });

  usuariosFiltrados.sort((a, b) => getMesDia(a.fecha_nacimiento).localeCompare(getMesDia(b.fecha_nacimiento)));

  const rolSeleccionado = roles.find(r => r.id === formUsuario.rol_id);
  const esEmbajador = rolSeleccionado?.nombre === ROL_EMBAJADOR;

  const mostrarColumnasEmbajador = filtroRol !== ROL_ADMIN;

  // ==========================================
  // GUARDAR (CREAR EN AUTH + PERFIL)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formUsuario.rol_id === 0) return toast.error("Requerido", { description: "Selecciona un rol para el usuario." });
    if (esEmbajador && formEmbajador.municipio_id === 0) return toast.error("Requerido", { description: "Selecciona un municipio para el embajador." });

    setIsSaving(true);
    try {
      let usuarioId = editId;

      if (editId) {
        const { error: errUpdate } = await supabase.from('usuarios').update(formUsuario).eq('id', editId);
        if (errUpdate) throw errUpdate;
      } else {
        const authClient = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });

        const { data: authData, error: authErr } = await authClient.auth.signUp({
          email: formUsuario.correo,
          password: PASSWORD_TEMPORAL_DEFAULT,
        });

        if (authErr) throw authErr;
        
        const newUserId = authData.user?.id;
        if (!newUserId) throw new Error("No se pudo crear la credencial de acceso. Verifica que el correo no esté ya registrado.");

        const payloadNuevoUsuario = { 
          ...formUsuario, 
          id: newUserId,
          requiere_cambio_password: true 
        };

        const { error: errUsuario } = await supabase.from('usuarios').upsert([payloadNuevoUsuario]);        
        if (errUsuario) throw errUsuario;

        usuarioId = newUserId;
      }

      if (esEmbajador && usuarioId) {
        let proyectoFinalId = null;
        
        if (tieneProyecto) {
          if (crearNuevoProyecto) {
            if (!formProyecto.nombre) throw new Error("Escribe el nombre del proyecto nuevo.");
            
            let finalLogoUrl = null;
            if (logoFile) {
              const fileExt = logoFile.name.split('.').pop()?.toLowerCase() || 'png';
              const uniqueFileName = typeof crypto !== 'undefined' && crypto.randomUUID 
                                     ? crypto.randomUUID() 
                                     : Date.now().toString(36) + Math.random().toString(36).substring(2);
              const fileName = `logo_${uniqueFileName}.${fileExt}`;
              
              const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, logoFile);
              if (uploadError) throw uploadError;
              
              finalLogoUrl = supabase.storage.from('imagenes').getPublicUrl(fileName).data.publicUrl;
            }

            const { data: proyCreado, error: errProy } = await supabase
              .from('proyectos_sociales')
              .insert([{ ...formProyecto, logo: finalLogoUrl, activo: true }])
              .select('id')
              .single();
              
            if (errProy) throw errProy;
            proyectoFinalId = proyCreado.id;

          } else {
            proyectoFinalId = proyectoSeleccionadoId > 0 ? proyectoSeleccionadoId : null;
          }
        }
        
        const { error: errEmbajador } = await supabase.from('embajadores').upsert({
          usuario_id: usuarioId,
          municipio_id: formEmbajador.municipio_id,
          proyecto_social_id: proyectoFinalId,
          activo: true
        }, { onConflict: 'usuario_id' });

        if (errEmbajador) throw errEmbajador;
      }

      toast.success(editId ? 'Registro actualizado con éxito' : 'Usuario guardado exitosamente', {
        description: !editId ? `El usuario ya puede ingresar con su correo y la contraseña genérica.` : undefined
      });
      
      resetForm(); 
      fetchData(); 
      
    } catch (error: any) { 
      toast.error("Ocurrió un error", { description: error.message }); 
    } finally { 
      setIsSaving(false); 
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-medium text-lg">Cargando directorio de usuarios...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-[#00689D]" size={28} /> Directorio de Usuarios
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Administra y filtra usuarios registrados cronológicamente por mes de cumpleaños.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="w-full sm:w-auto bg-[#00689D] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#00527A] transition-colors shadow-md flex items-center justify-center gap-2">
            <PlusCircle size={20} /> Añadir Nuevo
          </button>
        )}
      </div>

      {/* FORMULARIO DE ALTA/EDICIÓN */}
      {showForm && (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border-t-4 border-[#00689D] animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              {editId ? <Edit2 className="text-blue-500" /> : <PlusCircle className="text-green-500" />}
              {editId ? 'Editar Registro de Usuario' : 'Alta de Nuevo Usuario'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-gray-50 rounded-full hover:bg-red-50">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold mb-6 text-[#00689D] flex items-center gap-2">
                <Users size={20}/> 1. Datos Personales y Acceso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                  <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.nombre} onChange={e => setFormUsuario({...formUsuario, nombre: e.target.value})} placeholder="Ej. Juan" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Apellido</label>
                  <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.apellido} onChange={e => setFormUsuario({...formUsuario, apellido: e.target.value})} placeholder="Ej. Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Mail size={16}/> Correo Electrónico (Para Iniciar Sesión)</label>
                  <input type="email" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.correo} onChange={e => setFormUsuario({...formUsuario, correo: e.target.value})} placeholder="correo@ejemplo.com" />
                </div>
                
                {!editId ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Lock size={16}/> Contraseña Generada</label>
                    <input 
                      type="text" 
                      disabled 
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-200 text-gray-600 font-mono font-bold cursor-not-allowed select-all" 
                      value={PASSWORD_TEMPORAL_DEFAULT} 
                    />
                    <p className="text-xs text-[#00689D] font-medium mt-1">El usuario deberá cambiarla obligatoriamente al iniciar sesión por primera vez.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1 flex items-center gap-1"><Lock size={16}/> Contraseña</label>
                    <input type="text" disabled className="w-full p-3 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed" value="••••••••" />
                    <p className="text-xs text-gray-400 mt-1">La contraseña solo puede cambiarla el propio usuario.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Phone size={16}/> Teléfono</label>
                  <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.telefono} onChange={e => setFormUsuario({...formUsuario, telefono: e.target.value})} placeholder="10 dígitos" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Calendar size={16}/> Fecha de Nacimiento</label>
                  <input type="date" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all" value={formUsuario.fecha_nacimiento} onChange={e => setFormUsuario({...formUsuario, fecha_nacimiento: e.target.value})} />
                </div>
                <div className="md:col-span-2 border-t border-gray-200 mt-2 pt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1"><Shield size={16}/> Asignar Rol en la Plataforma</label>
                  <select required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all bg-white" value={formUsuario.rol_id} onChange={e => setFormUsuario({...formUsuario, rol_id: Number(e.target.value)})}>
                    <option value="0">-- Selecciona un Rol --</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PERFIL DE EMBAJADOR */}
            {esEmbajador && (
              <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-200 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold mb-6 text-[#00689D] flex items-center gap-2">
                  <MapPin size={20}/> 2. Perfil de Embajador
                </h3>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Municipio de Operación</label>
                  <select required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none bg-white" value={formEmbajador.municipio_id} onChange={e => setFormEmbajador({...formEmbajador, municipio_id: Number(e.target.value)})}>
                    <option value="0">-- Selecciona Municipio --</option>
                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>

                {/* SECCIÓN 3: PROYECTO SOCIAL */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="flex items-center space-x-3 cursor-pointer mb-5">
                    <input type="checkbox" className="w-5 h-5 text-[#00689D] border-gray-300 rounded focus:ring-[#00689D]" checked={tieneProyecto} onChange={e => setTieneProyecto(e.target.checked)} />
                    <span className="font-bold text-gray-800 text-base">¿Tiene un Proyecto Social asignado?</span>
                  </label>

                  {tieneProyecto && (
                    <div className="pl-8 space-y-5 border-l-2 border-blue-200 ml-2 animate-in fade-in">
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => setCrearNuevoProyecto(false)} className={`px-5 py-2 text-sm font-bold rounded-md transition-colors ${!crearNuevoProyecto ? 'bg-[#00689D] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Buscar Existente</button>
                        <button type="button" onClick={() => setCrearNuevoProyecto(true)} className={`px-5 py-2 text-sm font-bold rounded-md transition-colors ${crearNuevoProyecto ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>+ Crear Nuevo</button>
                      </div>

                      {!crearNuevoProyecto ? (
                        <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] bg-gray-50 outline-none" value={proyectoSeleccionadoId} onChange={e => setProyectoSeleccionadoId(Number(e.target.value))}>
                          <option value="0">-- Buscar Proyecto en Catálogo --</option>
                          {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                      ) : (
                        <div className="grid grid-cols-1 gap-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Proyecto</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formProyecto.nombre} onChange={e => setFormProyecto({...formProyecto, nombre: e.target.value})} placeholder="Nombre de la iniciativa..." />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none" rows={3} value={formProyecto.descripcion} onChange={e => setFormProyecto({...formProyecto, descripcion: e.target.value})} placeholder="Breve descripción del proyecto..."></textarea>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logotipo del Proyecto</label>
                            <div 
                              onDragOver={(e) => e.preventDefault()} 
                              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) processLogo(e.dataTransfer.files[0]); }} 
                              onClick={() => logoInputRef.current?.click()} 
                              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:bg-green-50 hover:border-green-500 transition-colors cursor-pointer group"
                            >
                              <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={(e) => { if (e.target.files?.[0]) processLogo(e.target.files[0]); }} />
                              {logoPreview ? (
                                <div className="relative flex flex-col items-center">
                                  <img src={logoPreview} alt="Preview" className="h-24 object-contain rounded-md shadow-sm" />
                                  <p className="text-xs text-center mt-2 text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Clic para cambiar</p>
                                </div>
                              ) : (
                                <div className="text-center flex flex-col items-center">
                                  <div className="bg-gray-100 p-3 rounded-full text-gray-400 group-hover:bg-green-500 group-hover:text-white transition-colors mb-2">
                                    <UploadCloud size={24} />
                                  </div>
                                  <p className="text-sm text-gray-700 font-semibold">Arrastra el logo aquí</p>
                                  <p className="text-xs text-gray-400">PNG o JPG</p>
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

            <div className="flex flex-col-reverse sm:flex-row justify-end pt-6 border-t border-gray-200 gap-3">
              <button type="button" onClick={resetForm} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                <X size={18} /> Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#00527A] disabled:bg-gray-400 transition-colors shadow-md">
                {isSaving ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={18}/> {editId ? 'Actualizar Registro' : 'Guardar Usuario'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          BARRA DE FILTROS 
      ========================================== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex space-x-2 mb-6 border-b border-gray-100 pb-5 overflow-x-auto scrollbar-hide">
          <button onClick={() => setFiltroRol('Todos')} className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filtroRol === 'Todos' ? 'bg-[#00689D] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todos los Usuarios</button>
          <button onClick={() => setFiltroRol(ROL_ADMIN)} className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filtroRol === ROL_ADMIN ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Administradores</button>
          <button onClick={() => setFiltroRol(ROL_EMBAJADOR)} className={`px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filtroRol === ROL_EMBAJADOR ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Embajadores</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Filtrar Municipio</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <select className="w-full pl-9 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00689D] outline-none appearance-none disabled:opacity-50 transition-colors" value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)} disabled={filtroRol === ROL_ADMIN}>
                <option value="Todos">Cualquier Municipio</option>
                {municipios.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mes de Cumpleaños</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <select className="w-full pl-9 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#00689D] outline-none appearance-none transition-colors" value={filtroMesCumple} onChange={e => setFiltroMesCumple(e.target.value)}>
                <option value="Todos">Cualquier mes</option>
                {meses.map(m => <option key={m.num} value={m.num}>{m.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setFiltroRol('Todos'); setFiltroMunicipio('Todos'); setFiltroMesCumple('Todos'); }} className="w-full bg-white border border-gray-300 text-gray-700 font-bold p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Search size={18} /> Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          TABLA 
      ========================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-sm md:text-base">Resultados de búsqueda</h3>
          <span className="bg-[#00689D]/10 text-[#00689D] px-3 py-1 rounded-full text-xs font-bold border border-[#00689D]/20">
            {usuariosFiltrados.length} usuarios encontrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold text-center w-12">#</th>
                <th className="p-4 font-bold whitespace-nowrap">Nombre Completo</th>
                
                {/* NUEVA COLUMNA: ÚLTIMA CONEXIÓN */}
                
                
                <th className="p-4 font-bold text-center">Edad</th>
                <th className="p-4 font-bold whitespace-nowrap">Fecha Nac.</th>
                <th className="p-4 font-bold">Contacto</th>
                <th className="p-4 font-bold">Rol</th>
                
                {mostrarColumnasEmbajador && <th className="p-4 font-bold">Municipio / Proyecto</th>}
                {mostrarColumnasEmbajador && <th className="p-4 font-bold text-center">Actividades</th>}
                
                <th className="p-4 font-bold text-center">Estado</th>
                <th className="p-4 font-bold text-center whitespace-nowrap">Última Conexión</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={mostrarColumnasEmbajador ? 11 : 9} className="p-12 text-center text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="font-medium text-lg">No se encontraron usuarios</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u, index) => {
                  const esRolEmbajador = u.roles?.nombre === ROL_EMBAJADOR;
                  const datosEmbajador = Array.isArray(u.embajadores) ? u.embajadores[0] : u.embajadores;
                  const cantActividades = u.actividades ? u.actividades.length : 0;
                  const edadCalculada = calcularEdad(u.fecha_nacimiento);

                  return (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900 whitespace-nowrap">{u.nombre} {u.apellido}</div>
                      </td>
                      
                     

                      <td className="p-4 text-center">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-bold text-xs">
                          {edadCalculada !== 'N/A' ? `${edadCalculada}` : '-'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap text-xs font-medium">{u.fecha_nacimiento || '-'}</td>
                      
                      <td className="p-4">
                        <div className="text-gray-900 font-medium text-xs">{u.correo}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{u.telefono || 'Sin teléfono'}</div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                          esRolEmbajador ? 'bg-green-50 text-green-700 border-green-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {u.roles?.nombre || 'Sin rol'}
                        </span>
                      </td>

                      {mostrarColumnasEmbajador && (
                        <td className="p-4">
                          {esRolEmbajador ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-700 flex items-center gap-1"><MapPin size={12}/> {datosEmbajador?.municipios?.nombre || 'Sin Asignar'}</span>
                              <span className="text-xs text-[#00689D] font-medium truncate max-w-[150px] mt-0.5 flex items-center gap-1"><Folder size={12}/> {datosEmbajador?.proyectos_sociales?.nombre || 'Sin Proyecto'}</span>
                            </div>
                          ) : <span className="text-gray-300">-</span>}
                        </td>
                      )}

                      {mostrarColumnasEmbajador && (
                        <td className="p-4 text-center">
                          {esRolEmbajador ? <span className="font-bold text-gray-700">{cantActividades}</span> : <span className="text-gray-300">-</span>}
                        </td>
                      )}
                      
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center w-2.5 h-2.5 rounded-full mr-1.5 ${u.activo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs font-medium text-gray-700">{u.activo ? 'Activo' : 'Baja'}</span>
                      </td>
                       {/* CELDA: ÚLTIMA CONEXIÓN */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00689D] bg-[#00689D]/10 px-2.5 py-1 rounded-md border border-[#00689D]/20 whitespace-nowrap">
                          <Clock size={12} />
                          {renderUltimoAcceso(u.ultimo_acceso)}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(u)} className="text-[#00689D] hover:bg-blue-50 p-2 rounded-md transition-colors" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => confirmDelete(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
      ========================================== */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará de forma permanente al usuario del sistema. Si el usuario tiene actividades registradas, te recomendamos mejor cambiar su estado a "Baja" desde el botón editar para mantener el historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}